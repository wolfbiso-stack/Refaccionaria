import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import { Upload, AlertCircle, CheckCircle, Settings as SettingsIcon, FileSpreadsheet, Loader2, ArrowLeft, MapPin, Database, Layout, Image as ImageIcon } from 'lucide-react';
import { BannerManager } from './BannerManager';
import { BulkImageUploader } from './BulkImageUploader';

interface DbProduct {
    id: string;
    sku: string;
    name: string;
    stock: number;
    price: number;
}

interface ExcelRow {
    sku: string;
    stock: number;
    price: number;
    originalRow: any;
}

interface UpdateItem {
    id: string;
    name: string;
    sku: string;
    oldStock: number;
    newStock: number;
    oldPrice: number;
    newPrice: number;
}

interface InsertItem {
    id: string; // ID falso para las claves de React
    name: string;
    description?: string;
    sku: string;
    stock: number;
    price: number;
    slug: string;
    user_id?: string;
}

interface SyncPreview {
    toUpdate: UpdateItem[];
    toInsert: InsertItem[];
    ignoredNoChange: DbProduct[];
    ignoredNotInExcel: DbProduct[];
}

interface ZipCodeRow {
    codigo_postal: string;
    estado: string;
    municipio: string;
    colonia: string;
}

const generateSlug = (name: string, sku: string) => {
    return `${name}-${sku}`.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

export function SystemSettings() {
    const [activeModule, setActiveModule] = useState<'menu' | 'inventory' | 'zipcodes' | 'page_config' | 'image_sync'>('menu');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cpFileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<'upload' | 'preview' | 'processing' | 'success'>('upload');
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [progress, setProgress] = useState(0);

    // Estado de Sincronización de Inventario
    const [preview, setPreview] = useState<SyncPreview>({
        toUpdate: [],
        toInsert: [],
        ignoredNoChange: [],
        ignoredNotInExcel: []
    });

    // Estado de Código Postal
    const [zipCodesToInsert, setZipCodesToInsert] = useState<ZipCodeRow[]>([]);

    const resetState = () => {
        setStep('upload');
        setError(null);
        setFileName('');
        setPreview({ toUpdate: [], toInsert: [], ignoredNoChange: [], ignoredNotInExcel: [] });
        setZipCodesToInsert([]);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cpFileInputRef.current) cpFileInputRef.current.value = '';
    };

    // --- LÓGICA DE SINCRONIZACIÓN DE INVENTARIO ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setError(null);
        setStep('processing');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUserId = session?.user?.id;

            let rawDbProducts: any[] = [];
            let hasMore = true;
            let start = 0;
            const limit = 1000;
            
            while (hasMore) {
                const { data, error: dbError } = await supabase
                    .from('products')
                    .select('id, name, sku, stock, slug, price')
                    .range(start, start + limit - 1);
                    
                if (dbError) throw dbError;
                
                if (data && data.length > 0) {
                    rawDbProducts = [...rawDbProducts, ...data];
                    if (data.length < limit) hasMore = false; else start += limit;
                } else {
                    hasMore = false;
                }
            }

            const dbProducts = rawDbProducts.filter(p => !!p.sku) as (DbProduct & { slug?: string })[];
            const dbSlugSet = new Set(rawDbProducts.map(p => p.slug).filter(Boolean));

            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rawAoA = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            
            const headerRowIndex = (rawAoA as any[][]).findIndex((row) => {
                const rowStr = row.map(cell => String(cell).toUpperCase()).join(' ');
                return (rowStr.includes('SKU') || rowStr.includes('CODIGO') || rowStr.includes('CLAVE')) && 
                       (rowStr.includes('CANTIDAD') || rowStr.includes('STOCK') || rowStr.includes('EXIS'));
            });

            const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex >= 0 ? headerRowIndex : 0, defval: "" });
            if (jsonRows.length === 0) throw new Error("El archivo Excel parece estar vacío.");

            const excelSkuMap = new Map<string, ExcelRow>();
            jsonRows.forEach(row => {
                let rawSku = '', rawStock = 0, rawPrice = 0;
                for (const [key, val] of Object.entries(row)) {
                    const upperKey = key.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                    if (upperKey === 'SKU' || upperKey === 'CODIGO' || upperKey === 'CLAVE') {
                        if (!rawSku) rawSku = String(val).trim(); // Solo asigna si está vacío para evitar sobreescribir con otras columnas por si acaso
                    }
                    else if (upperKey.includes('CANTIDAD') || upperKey.includes('STOCK') || upperKey.includes('EXIS')) {
                        rawStock = typeof val === 'number' ? val : parseInt(String(val).replace(/[^0-9.-]/g, ''), 10) || 0;
                    }
                    else if (upperKey === 'PRECIO 1') {
                        rawPrice = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, '')) || 0;
                    }
                }
                if (rawSku !== "") {
                    const skuUpper = rawSku.toUpperCase();
                    if (excelSkuMap.has(skuUpper)) {
                        excelSkuMap.get(skuUpper)!.stock += rawStock;
                        // Opcional: ¿sumar el precio o mantener el primero? Mantendremos el primero o el mayor
                        if (rawPrice > excelSkuMap.get(skuUpper)!.price) {
                            excelSkuMap.get(skuUpper)!.price = rawPrice;
                        }
                    }
                    else excelSkuMap.set(skuUpper, { sku: rawSku, stock: rawStock, price: rawPrice, originalRow: row });
                }
            });

            const toUpdate: UpdateItem[] = [];
            const toInsert: InsertItem[] = [];
            const ignoredNoChange: DbProduct[] = [];
            const ignoredNotInExcel: DbProduct[] = [];

            dbProducts.forEach(dbProd => {
                const excelMatch = excelSkuMap.get(dbProd.sku.toUpperCase());
                if (excelMatch) {
                    if (excelMatch.stock !== dbProd.stock || excelMatch.price !== (dbProd.price || 0)) {
                        toUpdate.push({ id: dbProd.id, name: dbProd.name, sku: dbProd.sku, oldStock: dbProd.stock, newStock: excelMatch.stock, oldPrice: dbProd.price || 0, newPrice: excelMatch.price || 0 });
                    }
                    else ignoredNoChange.push(dbProd);
                } else ignoredNotInExcel.push(dbProd);
            });

            const dbSkuUpperSet = new Set(dbProducts.map(p => p.sku.toUpperCase()));
            excelSkuMap.forEach((ex, skuUpper) => {
                if (!dbSkuUpperSet.has(skuUpper)) {
                    let nameVal = '', descVal = '';
                    for (const [key, val] of Object.entries(ex.originalRow)) {
                        const upperKey = key.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        if (upperKey.includes('NOMBRE') || upperKey.includes('PRODUCTO') || upperKey.includes('DESCRIP')) nameVal = descVal = String(val).trim();
                    }
                    if (!nameVal) nameVal = descVal = `Producto ${ex.sku}`;
                    let slugVal = generateSlug(nameVal, ex.sku), attempt = 1;
                    while (dbSlugSet.has(slugVal)) { slugVal = `${generateSlug(nameVal, ex.sku)}-${attempt}`; attempt++; }
                    dbSlugSet.add(slugVal);
                    toInsert.push({ id: `new-${toInsert.length}`, name: nameVal, description: descVal, sku: ex.sku, stock: ex.stock, price: ex.price, slug: slugVal, user_id: currentUserId });
                }
            });

            setPreview({ toUpdate, toInsert, ignoredNoChange, ignoredNotInExcel });
            setStep('preview');
        } catch (err: any) {
            setError(err.message || 'Error analizando el archivo Excel.');
            setStep('upload');
        }
    };

    const confirmSync = async () => {
        setStep('processing'); setProgress(0);
        try {
            const updates = preview.toUpdate;
            const totalOperations = updates.length + preview.toInsert.length;
            let completed = 0;
            for (let i = 0; i < updates.length; i += 15) {
                const chunk = updates.slice(i, i + 15);
                await Promise.all(chunk.map(item => supabase.from('products').update({ stock: item.newStock, price: item.newPrice }).eq('id', item.id)));
                completed += chunk.length; setProgress(Math.round((completed / totalOperations) * 100));
            }
            const inserts = preview.toInsert.map(({ id, ...rest }) => rest);
            for (let i = 0; i < inserts.length; i += 50) {
                const chunk = inserts.slice(i, i + 50);
                const { error } = await supabase.from('products').insert(chunk);
                if (error) throw error;
                completed += chunk.length; setProgress(Math.round((completed / totalOperations) * 100));
            }
            setStep('success');
        } catch (err: any) { setError(err.message); setStep('preview'); }
    };

    // --- LÓGICA DE CÓDIGOS POSTALES ---
    const handleZipCodeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setError(null);
        setStep('processing');

        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });
            const allRows: ZipCodeRow[] = [];

            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                data.forEach((row: any) => {
                    const cp = row["Codigo Postal"] || row["CP"] || row["d_codigo"] || row["codigo_postal"];
                    const municipio = row["Municipio"] || row["D_mnpio"] || row["municipio"];
                    const colonia = row["Colonia"] || row["Asentamiento"] || row["d_asenta"] || row["colonia"];

                    if (cp) {
                        allRows.push({
                            codigo_postal: String(cp).trim(),
                            estado: sheetName.trim(),
                            municipio: municipio ? String(municipio).trim() : 'N/A',
                            colonia: colonia ? String(colonia).trim() : 'N/A'
                        });
                    }
                });
            });

            if (allRows.length === 0) throw new Error("No se detectaron códigos postales en el archivo.");
            setZipCodesToInsert(allRows);
            setStep('preview');
        } catch (err: any) {
            setError(err.message);
            setStep('upload');
        }
    };

    const confirmZipImport = async () => {
        setStep('processing'); setProgress(0);
        try {
            const batchSize = 100;
            for (let i = 0; i < zipCodesToInsert.length; i += batchSize) {
                const chunk = zipCodesToInsert.slice(i, i + batchSize);
                const { error } = await supabase.from('codigos_postales').insert(chunk);
                if (error) throw error;
                setProgress(Math.round(((i + chunk.length) / zipCodesToInsert.length) * 100));
            }
            setStep('success');
        } catch (err: any) { setError(err.message); setStep('preview'); }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg">
                        <SettingsIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Configuración del Sistema</h1>
                        <p className="text-gray-500 text-sm font-medium">Herramientas administrativas y gestión de datos</p>
                    </div>
                </div>
                {activeModule !== 'menu' && (
                    <button 
                        onClick={() => { setActiveModule('menu'); resetState(); }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver al menú
                    </button>
                )}
            </div>

            {activeModule === 'menu' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Módulo 1: Inventario */}
                    <button 
                        onClick={() => setActiveModule('inventory')}
                        className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all text-left group"
                    >
                        <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-inner">
                            <FileSpreadsheet className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-3">Inventario Masivo</h2>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Sincroniza existencias y agrega nuevos productos mediante archivos Excel de tu punto de venta.
                        </p>
                    </button>

                    {/* Módulo 2: Códigos Postales (Oculto según lo solicitado) */}
                    {/* 
                    <button 
                        onClick={() => setActiveModule('zipcodes')}
                        className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all text-left group"
                    >
                        <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
                            <MapPin className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-3">Códigos Postales</h2>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Importa la base de datos de correos electrónicos y códigos postales de México por estados.
                        </p>
                    </button>
                    */}

                    {/* Módulo 3: Configuración de Página (Banners) */}
                    <button 
                        onClick={() => setActiveModule('page_config')}
                        className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all text-left group"
                    >
                        <div className="bg-amber-100 w-16 h-16 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors shadow-inner">
                            <Layout className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-3">Configuración de Página</h2>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Gestiona los banners promocionales y otros elementos visuales de la página principal.
                        </p>
                    </button>

                    {/* Módulo 4: Sincronización de Imágenes */}
                    <button 
                        onClick={() => setActiveModule('image_sync')}
                        className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all text-left group"
                    >
                        <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-inner">
                            <ImageIcon className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-3">Imágenes Masivas</h2>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Sube cientos de imágenes y asígnalas automáticamente a tus productos mediante la clave del archivo.
                        </p>
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${
                            activeModule === 'inventory' ? 'bg-emerald-50 text-emerald-600' : 
                            activeModule === 'zipcodes' ? 'bg-blue-50 text-blue-600' : 
                            activeModule === 'image_sync' ? 'bg-purple-50 text-purple-600' :
                            'bg-amber-50 text-amber-600'
                        }`}>
                            {activeModule === 'inventory' ? <FileSpreadsheet className="w-6 h-6" /> : 
                             activeModule === 'zipcodes' ? <MapPin className="w-6 h-6" /> : 
                             activeModule === 'image_sync' ? <ImageIcon className="w-6 h-6" /> :
                             <Layout className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {activeModule === 'inventory' ? 'Sincronización de Inventario' : 
                                 activeModule === 'zipcodes' ? 'Importación de Códigos Postales' : 
                                 activeModule === 'image_sync' ? 'Subida Masiva de Imágenes' :
                                 'Configuración de Banners'}
                            </h2>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                                {activeModule === 'page_config' ? 'Gestión Dinámica de Banners' : 
                                 activeModule === 'image_sync' ? 'Carga de Archivos' :
                                 (fileName || 'Esperando archivo...')}
                            </p>
                        </div>
                    </div>

                    <div className="p-10">
                        {error && (
                            <div className="mb-8 bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-start gap-4">
                                <AlertCircle className="w-6 h-6 shrink-0" />
                                <p className="font-bold">{error}</p>
                            </div>
                        )}

                        {activeModule === 'page_config' ? (
                            <BannerManager />
                        ) : activeModule === 'image_sync' ? (
                            <BulkImageUploader />
                        ) : (
                            <>
                                {step === 'upload' && (
                            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-gray-100 hover:border-blue-400 hover:bg-blue-50/30 rounded-[2rem] transition-all group cursor-pointer relative">
                                <input
                                    type="file"
                                    ref={activeModule === 'inventory' ? fileInputRef : cpFileInputRef}
                                    accept=".xlsx, .xls"
                                    onChange={activeModule === 'inventory' ? handleFileUpload : handleZipCodeUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="bg-gray-50 p-6 rounded-full text-gray-300 mb-6 group-hover:scale-110 group-hover:text-blue-500 transition-all shadow-inner">
                                    <Upload className="w-12 h-12" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Haz clic para cargar Excel</h3>
                                <p className="text-gray-400 font-medium max-w-sm text-center">
                                    {activeModule === 'inventory' 
                                        ? 'Selecciona el archivo de Existencias de tu punto de venta.' 
                                        : 'Selecciona el archivo codigos_postales.xlsx con múltiples estados.'}
                                </p>
                            </div>
                        )}

                        {step === 'processing' && (
                            <div className="flex flex-col items-center justify-center py-20 space-y-6">
                                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-gray-900">Procesando información</h3>
                                    <p className="text-gray-500 font-medium mt-1">{progress > 0 ? `Subiendo a la nube: ${progress}%` : 'Leyendo y validando el archivo...'}</p>
                                </div>
                                <div className="w-full max-w-md h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 transition-all duration-300 shadow-lg" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        )}

                        {step === 'preview' && (
                            <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                                {activeModule === 'inventory' ? (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                                                <p className="text-xs font-black text-emerald-600 uppercase mb-1">Nuevos</p>
                                                <p className="text-3xl font-black text-emerald-900">{preview.toInsert.length}</p>
                                            </div>
                                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                                <p className="text-xs font-black text-blue-600 uppercase mb-1">Actualizar</p>
                                                <p className="text-3xl font-black text-blue-900">{preview.toUpdate.length}</p>
                                            </div>
                                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                                <p className="text-xs font-black text-gray-500 uppercase mb-1">Sin Cambios</p>
                                                <p className="text-3xl font-black text-gray-900">{preview.ignoredNoChange.length}</p>
                                            </div>
                                            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                                                <p className="text-xs font-black text-amber-600 uppercase mb-1">Inactivos</p>
                                                <p className="text-3xl font-black text-amber-900">{preview.ignoredNotInExcel.length}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={confirmSync}
                                            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-lg shadow-xl shadow-blue-100 transition-all"
                                        >
                                            Confirmar Sincronización Masiva
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="bg-blue-50 p-10 rounded-[2rem] border border-blue-100 text-center">
                                            <Database className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                                            <h3 className="text-3xl font-black text-blue-900">
                                                {zipCodesToInsert.length.toLocaleString()} Registros
                                            </h3>
                                            <p className="text-blue-600 font-bold mt-2 uppercase tracking-widest text-sm">Detectados en el archivo</p>
                                        </div>
                                        <button 
                                            onClick={confirmZipImport}
                                            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-lg shadow-xl shadow-blue-100 transition-all"
                                        >
                                            Comenzar Importación de Códigos Postales
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-500">
                                <div className="bg-emerald-100 p-6 rounded-full text-emerald-600 mb-6 shadow-inner">
                                    <CheckCircle className="w-16 h-16" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 mb-2">¡Proceso Exitoso!</h3>
                                <p className="text-gray-500 font-medium max-w-sm mb-10">La base de datos se ha actualizado correctamente con la nueva información.</p>
                                <button
                                    onClick={resetState}
                                    className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-lg"
                                >
                                    Realizar otra operación
                                </button>
                            </div>
                        )}
                    </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
