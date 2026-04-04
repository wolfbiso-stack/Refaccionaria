import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import { Upload, AlertCircle, CheckCircle, Info, Settings as SettingsIcon, FileSpreadsheet, Loader2, ArrowLeft } from 'lucide-react';

interface DbProduct {
    id: string;
    sku: string;
    name: string;
    stock: number;
}

interface ExcelRow {
    sku: string;
    stock: number;
    originalRow: any;
}

interface UpdateItem {
    id: string;
    name: string;
    sku: string;
    oldStock: number;
    newStock: number;
}

interface InsertItem {
    id: string; // Fake ID for react keys
    name: string;
    description?: string;
    sku: string;
    stock: number;
    category: string;
    slug: string;
    user_id?: string;
}

interface SyncPreview {
    toUpdate: UpdateItem[];
    toInsert: InsertItem[];
    ignoredNoChange: DbProduct[];
    ignoredNotInExcel: DbProduct[];
}

const generateSlug = (name: string, sku: string) => {
    return `${name}-${sku}`.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

export function SystemSettings() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<'upload' | 'preview' | 'processing' | 'success'>('upload');
    const [error, setError] = useState<string | null>(null);

    const [fileName, setFileName] = useState<string>('');
    const [preview, setPreview] = useState<SyncPreview>({
        toUpdate: [],
        toInsert: [],
        ignoredNoChange: [],
        ignoredNotInExcel: []
    });

    const [progress, setProgress] = useState(0);

    const resetState = () => {
        setStep('upload');
        setError(null);
        setFileName('');
        setPreview({ toUpdate: [], toInsert: [], ignoredNoChange: [], ignoredNotInExcel: [] });
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setError(null);
        setStep('processing');

        try {
            // 1. Get current user
            const { data: { session } } = await supabase.auth.getSession();
            const currentUserId = session?.user?.id;

            // 2. Fetch ALL DB Products (handling 1000 row limit)
            let rawDbProducts: any[] = [];
            let hasMore = true;
            let start = 0;
            const limit = 1000;
            
            while (hasMore) {
                const { data, error: dbError } = await supabase
                    .from('products')
                    .select('id, name, sku, stock, slug')
                    .range(start, start + limit - 1);
                    
                if (dbError) throw dbError;
                
                if (data && data.length > 0) {
                    rawDbProducts = [...rawDbProducts, ...data];
                    if (data.length < limit) {
                        hasMore = false;
                    } else {
                        start += limit;
                    }
                } else {
                    hasMore = false;
                }
            }

            const dbProducts = rawDbProducts.filter(p => !!p.sku) as (DbProduct & { slug?: string })[];
            const dbSlugSet = new Set(rawDbProducts.map(p => p.slug).filter(Boolean));

            // 3. Read Excel
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to array of arrays to find header row dynamically
            const rawAoA = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            
            // Find header row: looking for a row that has columns similar to SKU/Clave and Stock/Exis
            const headerRowIndex = (rawAoA as any[][]).findIndex((row) => {
                const rowStr = row.map(cell => String(cell).toUpperCase()).join(' ');
                const hasSkuCol = rowStr.includes('SKU') || rowStr.includes('CODIGO') || rowStr.includes('CLAVE');
                const hasStockCol = rowStr.includes('CANTIDAD') || rowStr.includes('STOCK') || rowStr.includes('EXIS');
                return hasSkuCol && hasStockCol;
            });

            // Parse json starting from the detected header row or beginning if not found
            const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { 
                range: headerRowIndex >= 0 ? headerRowIndex : 0, 
                defval: "" 
            });

            if (jsonRows.length === 0) throw new Error("El archivo Excel parece estar vacío.");

            // 4. Detect column names intelligently
            const firstRowKeys = Object.keys(jsonRows[0] || {});
            const skuKey = firstRowKeys.find(key => {
                const upperKey = key.toUpperCase();
                return upperKey.includes('SKU') || upperKey === 'CODIGO' || upperKey.includes('CLAVE');
            }) || 'SKU';

            if (!firstRowKeys.includes(skuKey) && !firstRowKeys.some(k => k.toUpperCase().includes('SKU') || k.toUpperCase() === 'CODIGO' || k.toUpperCase().includes('CLAVE'))) {
                throw new Error("No se pudo detectar una columna de identificador (ej: 'SKU', 'Codigo', 'Clave') en tu archivo Excel.");
            }

            // 5. Map Excel rows and aggregate by SKU
            const excelSkuMap = new Map<string, ExcelRow>();
            
            jsonRows.forEach(row => {
                let rawSku = '';
                let rawStock = 0;

                for (const [key, val] of Object.entries(row)) {
                    const upperKey = key.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    if (upperKey.includes('SKU') || upperKey === 'CODIGO' || upperKey.includes('CLAVE')) {
                        rawSku = String(val).trim();
                    } else if (upperKey.includes('CANTIDAD') || upperKey.includes('STOCK') || upperKey.includes('EXIS')) {
                        if (typeof val === 'number') {
                            rawStock = val;
                        } else {
                            rawStock = parseInt(String(val).replace(/[^0-9.-]/g, ''), 10) || 0;
                        }
                    }
                }

                if (rawSku !== "") {
                    const skuUpper = rawSku.toUpperCase();
                    if (excelSkuMap.has(skuUpper)) {
                        excelSkuMap.get(skuUpper)!.stock += rawStock;
                    } else {
                        excelSkuMap.set(skuUpper, {
                            sku: rawSku,
                            stock: rawStock,
                            originalRow: row
                        });
                    }
                }
            });

            const excelData: ExcelRow[] = Array.from(excelSkuMap.values());

            // 6. Compare and categorize
            const toUpdate: UpdateItem[] = [];
            const toInsert: InsertItem[] = [];
            const ignoredNoChange: DbProduct[] = [];
            const ignoredNotInExcel: DbProduct[] = [];

            dbProducts.forEach(dbProd => {
                const dbSkuUpper = dbProd.sku.toUpperCase();
                const excelMatch = excelSkuMap.get(dbSkuUpper);

                if (excelMatch) {
                    if (excelMatch.stock !== dbProd.stock) {
                        toUpdate.push({
                            id: dbProd.id,
                            name: dbProd.name,
                            sku: dbProd.sku,
                            oldStock: dbProd.stock,
                            newStock: excelMatch.stock
                        });
                    } else {
                        ignoredNoChange.push(dbProd);
                    }
                } else {
                    ignoredNotInExcel.push(dbProd);
                }
            });

            // Find Excel rows not in DB (To Insert)
            const dbSkuUpperSet = new Set(dbProducts.map(p => p.sku.toUpperCase()));
            const rowsToInsert = excelData.filter(ex => !dbSkuUpperSet.has(ex.sku.toUpperCase()));

            rowsToInsert.forEach((ex, idx) => {
                let nameVal = '';
                let descVal = '';
                let catVal = 'Sin Categoría';

                for (const [key, val] of Object.entries(ex.originalRow)) {
                    const upperKey = key.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    if (upperKey.includes('NOMBRE') || upperKey.includes('PRODUCTO') || upperKey.includes('DESCRIPCION')) {
                        nameVal = String(val).trim();
                        descVal = String(val).trim();
                    } else if (upperKey.includes('CATEGOR') || upperKey.includes('FAMILIA')) {
                        catVal = String(val).trim() || 'Sin Categoría';
                    }
                }

                if (!nameVal) {
                    nameVal = `Producto ${ex.sku}`;
                    descVal = `Producto ${ex.sku}`;
                }
                
                let slugVal = generateSlug(nameVal, ex.sku);
                let attempt = 1;
                while (dbSlugSet.has(slugVal)) {
                    slugVal = `${generateSlug(nameVal, ex.sku)}-${attempt}`;
                    attempt++;
                }
                dbSlugSet.add(slugVal);

                toInsert.push({
                    id: `new-${idx}`,
                    name: nameVal,
                    description: descVal,
                    sku: ex.sku,
                    stock: ex.stock,
                    category: catVal,
                    slug: slugVal,
                    user_id: currentUserId
                });
            });

            setPreview({ toUpdate, toInsert, ignoredNoChange, ignoredNotInExcel });
            setStep('preview');

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error analizando el archivo Excel.');
            setStep('upload');
        }
    };

    const confirmSync = async () => {
        if (preview.toUpdate.length === 0 && preview.toInsert.length === 0) {
            setStep('success');
            return;
        }

        setStep('processing');
        setProgress(0);
        setError(null);

        try {
            const updateChunkSize = 15;
            const updates = preview.toUpdate;

            const totalOperations = updates.length + preview.toInsert.length;
            let completedOperations = 0;

            for (let i = 0; i < updates.length; i += updateChunkSize) {
                const chunk = updates.slice(i, i + updateChunkSize);

                await Promise.all(chunk.map(item =>
                    supabase.from('products').update({ stock: item.newStock }).eq('id', item.id)
                ));

                completedOperations += chunk.length;
                setProgress(Math.round((completedOperations / totalOperations) * 100));
            }

            const insertChunkSize = 50;
            const inserts = preview.toInsert.map(item => {
                const { id, ...dbModel } = item;
                return dbModel;
            });

            for (let i = 0; i < inserts.length; i += insertChunkSize) {
                const chunk = inserts.slice(i, i + insertChunkSize);

                const { error: insertError } = await supabase.from('products').insert(chunk);
                if (insertError) throw insertError;

                completedOperations += chunk.length;
                setProgress(Math.round((completedOperations / totalOperations) * 100));
            }

            setStep('success');
        } catch (err: any) {
            console.error("Batch update error:", err);
            setError("Hubo un error al guardar los cambios en la base de datos de manera parcial. " + err.message);
            setStep('preview');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">

            <div className="flex items-center gap-3 mb-8">
                <div className="bg-gray-100 p-3 rounded-full text-gray-600">
                    <SettingsIcon className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
                    <p className="text-gray-500 text-sm">Sincronización masiva de inventario y herramientas de importación</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 p-6 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-gray-800">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-lg font-bold">Importar Inventario desde Excel</h2>
                    </div>
                    {step !== 'upload' && step !== 'processing' && (
                        <button
                            onClick={resetState}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" /> Importar otro archivo
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm border border-red-100">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">Error de Procesamiento</p>
                                <p className="mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {step === 'upload' && (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-2xl transition-all group">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="excel-upload"
                            />
                            <label htmlFor="excel-upload" className="flex flex-col items-center cursor-pointer text-center w-full">
                                <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Cargar Archivo Excel</h3>
                                <p className="text-gray-500 text-sm max-w-sm mb-6">
                                    Sube un archivo .xlsx o .csv que contenga las columnas "SKU" y "Cantidad" (o "Clave" y "Exis"). Si el identificador es nuevo, tomaremos los datos complementarios para registrarlo.
                                </p>
                                <span className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 shadow-sm transition-colors">
                                    Explorar Archivos
                                </span>
                            </label>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-24 space-y-4">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                            <h3 className="text-xl font-bold text-gray-900">Procesando Sincronización</h3>
                            <p className="text-gray-500">{progress > 0 ? `Insertando a base de datos... ${progress}%` : `Analizando el archivo y cruzando datos con base de datos...`}</p>
                            {progress > 0 && (
                                <div className="w-64 h-2 bg-gray-200 justify-start rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-8 animate-in fade-in duration-500">

                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-gray-400" />
                                    Resultados del Análisis ("{fileName}")
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nuevos</p>
                                        <p className="text-2xl font-black text-emerald-700 mt-1">{preview.toInsert.length}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">A Actualizar</p>
                                        <p className="text-2xl font-black text-blue-700 mt-1">{preview.toUpdate.length}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-2 h-full bg-gray-300"></div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sin Cambios</p>
                                        <p className="text-2xl font-black text-gray-700 mt-1">{preview.ignoredNoChange.length}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-amber-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Solo en Sistema</p>
                                        <p className="text-2xl font-black text-amber-700 mt-1">{preview.ignoredNotInExcel.length}</p>
                                    </div>
                                </div>
                            </div>

                            {preview.toUpdate.length > 0 || preview.toInsert.length > 0 ? (
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        Visualización de Cambios a Efectuar
                                    </h4>
                                    <div className="max-h-[350px] overflow-y-auto border border-gray-100 rounded-xl shadow-inner scrollbar-thin">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-white sticky top-0 z-10 shadow-sm">
                                                <tr>
                                                    <th className="px-4 py-3 text-gray-500 font-semibold border-b border-gray-100 w-1/4">Acción</th>
                                                    <th className="px-4 py-3 text-gray-500 font-semibold border-b border-gray-100 w-1/6">SKU</th>
                                                    <th className="px-4 py-3 text-gray-500 font-semibold border-b border-gray-100 w-1/3">Producto</th>
                                                    <th className="px-4 py-3 text-gray-500 font-semibold border-b border-gray-100">Stock Ant.</th>
                                                    <th className="px-4 py-3 text-gray-500 font-semibold border-b border-gray-100">Stock Nuevo</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {preview.toInsert.map(item => (
                                                    <tr key={item.id} className="hover:bg-emerald-50/30">
                                                        <td className="px-4 py-3 font-medium text-emerald-600">
                                                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
                                                                + Nuevo Registro
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 font-mono text-xs text-gray-900">{item.sku}</td>
                                                        <td className="px-4 py-3 font-medium text-gray-800 line-clamp-1">{item.name}</td>
                                                        <td className="px-4 py-3 text-gray-400 italic">No Existía</td>
                                                        <td className="px-4 py-3 text-emerald-700 font-bold">{item.stock}</td>
                                                    </tr>
                                                ))}
                                                {preview.toUpdate.map(item => (
                                                    <tr key={item.id} className="hover:bg-blue-50/30">
                                                        <td className="px-4 py-3 font-medium text-blue-600">
                                                            <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
                                                                ~ Actualización
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 font-mono text-xs text-gray-900">{item.sku}</td>
                                                        <td className="px-4 py-3 font-medium text-gray-800 line-clamp-1">{item.name}</td>
                                                        <td className="px-4 py-3 text-gray-500 line-through decoration-red-400 decoration-2">{item.oldStock}</td>
                                                        <td className="px-4 py-3 text-blue-700 font-bold">{item.newStock}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
                                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                    <h4 className="text-lg font-bold text-gray-900">Inventario Sincronizado</h4>
                                    <p className="text-gray-500">Ningún producto del Excel requiere actualización o creación.</p>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button
                                    onClick={confirmSync}
                                    disabled={preview.toUpdate.length === 0 && preview.toInsert.length === 0}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-sm transition-colors flex items-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    {(preview.toUpdate.length === 0 && preview.toInsert.length === 0) ? 'Sin Cambios que Aplicar' : `Aplicar ${preview.toUpdate.length + preview.toInsert.length} Operaciones`}
                                </button>
                            </div>

                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex flex-col items-center justify-center p-12 text-center animate-in zoom-in duration-300">
                            <div className="bg-emerald-100 p-6 rounded-full text-emerald-600 mb-6 shadow-sm">
                                <CheckCircle className="w-16 h-16" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Sincronización Completada!</h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-8">
                                El inventario de la base de datos se ha actualizado exitosamente utilizando las cantidades detectadas en tu archivo Excel.
                            </p>
                            <button
                                onClick={resetState}
                                className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 shadow-sm transition-colors"
                            >
                                Volver a Importar
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
