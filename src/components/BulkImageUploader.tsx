import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, Loader2, Image as ImageIcon, Database, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FileUploadTask {
    file: File;
    productKey: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    errorMessage?: string;
}

export function BulkImageUploader() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [step, setStep] = useState<'upload' | 'preview' | 'processing' | 'success'>('upload');
    const [tasks, setTasks] = useState<FileUploadTask[]>([]);
    const [unmatchedKeys, setUnmatchedKeys] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({ total: 0, current: 0, success: 0, errors: 0 });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setStep('processing');
        setError(null);

        try {
            const fileMap = new Map<string, File>();

            // Process files and find unique keys
            Array.from(files).forEach(file => {
                const namePart = file.name.split('_')[0];
                if (namePart) {
                    // Extraer clave: antes de "_" y quitar "S" o "s" final si está presente
                    const rawKey = namePart.toUpperCase();
                    const productKey = rawKey.endsWith('S') ? rawKey.slice(0, -1) : rawKey;
                    
                    if (productKey && !fileMap.has(productKey)) {
                        fileMap.set(productKey, file);
                    }
                }
            });

            if (fileMap.size === 0) {
                throw new Error('No se encontraron imágenes con el formato esperado (CLAVE_...).');
            }

            const uniqueKeys = Array.from(fileMap.keys());
            
            // Fetch all products to do a case-insensitive match and get exact DB SKU
            let rawDbProducts: any[] = [];
            let hasMore = true;
            let start = 0;
            const limit = 1000;
            
            while (hasMore) {
                const { data, error: dbError } = await supabase
                    .from('products')
                    .select('sku')
                    .range(start, start + limit - 1);
                    
                if (dbError) throw dbError;
                
                if (data && data.length > 0) {
                    rawDbProducts = [...rawDbProducts, ...data];
                    if (data.length < limit) hasMore = false; 
                    else start += limit;
                } else {
                    hasMore = false;
                }
            }

            const dbSkuMap = new Map<string, string>();
            rawDbProducts.forEach(item => {
                if (item.sku) {
                    dbSkuMap.set(item.sku.toUpperCase(), item.sku);
                }
            });

            const finalTasks: FileUploadTask[] = [];
            const missingKeys: string[] = [];
            
            fileMap.forEach((file, key) => {
                const exactDbSku = dbSkuMap.get(key);
                if (exactDbSku) {
                    finalTasks.push({
                        file,
                        productKey: exactDbSku, // Use exact case from DB
                        status: 'pending'
                    });
                } else {
                    missingKeys.push(key);
                }
            });

            setTasks(finalTasks);
            setUnmatchedKeys(missingKeys);
            
            if (finalTasks.length === 0) {
                throw new Error(`Ninguna de las imágenes seleccionadas coincide con los SKUs de la base de datos. Se intentaron buscar ${missingKeys.length} claves únicas.`);
            }

            setStep('preview');
        } catch (err: any) {
            setError(err.message || 'Error al procesar las imágenes.');
            setStep('upload');
        }
    };

    const startUpload = async () => {
        setStep('processing');
        setStats({ total: tasks.length, current: 0, success: 0, errors: 0 });

        let currentSuccess = 0;
        let currentErrors = 0;

        // Procesar secuencialmente o en lotes pequeños para evitar sobrecargar el navegador/red
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            setStats(prev => ({ ...prev, current: i + 1 }));

            try {
                // Upload to Supabase Storage
                const extension = task.file.name.split('.').pop() || 'jpg';
                const cleanSku = task.productKey.replace(/[^a-zA-Z0-9]/g, '-');
                const fileName = `${cleanSku}-bulk-${Date.now()}.${extension}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('productos')
                    .upload(fileName, task.file, {
                        upsert: true,
                        contentType: task.file.type
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('productos')
                    .getPublicUrl(fileName);

                // Fetch current product to check existing images array if needed
                const { data: productData } = await supabase
                    .from('products')
                    .select('images')
                    .eq('sku', task.productKey)
                    .single();

                const currentImages = productData?.images || [];
                const newImages = currentImages.includes(publicUrl) 
                    ? currentImages 
                    : [...currentImages, publicUrl];

                // Update product record
                const { error: updateError } = await supabase
                    .from('products')
                    .update({ 
                        image_url: publicUrl,
                        images: newImages
                    })
                    .eq('sku', task.productKey);

                if (updateError) throw updateError;

                currentSuccess++;
            } catch (err) {
                console.error(`Error uploading image for ${task.productKey}:`, err);
                currentErrors++;
            }
            
            setStats(prev => ({ ...prev, success: currentSuccess, errors: currentErrors }));
        }

        setStep('success');
    };

    const resetState = () => {
        setStep('upload');
        setError(null);
        setTasks([]);
        setUnmatchedKeys([]);
        setStats({ total: 0, current: 0, success: 0, errors: 0 });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="animate-in fade-in duration-300">
            {error && (
                <div className="mb-8 bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 shrink-0" />
                    <p className="font-bold">{error}</p>
                </div>
            )}

            {step === 'upload' && (
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-[2rem] transition-all group cursor-pointer relative">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="bg-gray-50 p-6 rounded-full text-gray-400 mb-6 group-hover:scale-110 group-hover:text-blue-500 transition-all shadow-inner">
                        <ImageIcon className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2 text-center">Seleccionar múltiples imágenes</h3>
                    <p className="text-gray-500 font-medium max-w-md text-center">
                        Selecciona todas las fotos. El nombre debe contener la clave antes de un guion bajo (_). 
                        Si termina en "S" antes del guion, se ignorará automáticamente.
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg font-medium">
                        <Info className="w-4 h-4" />
                        Ejemplo: "12345S_foto1.jpg" se asignará al SKU "12345"
                    </div>
                </div>
            )}

            {step === 'processing' && stats.total > 0 && (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                    <div className="text-center w-full max-w-md">
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Subiendo Imágenes</h3>
                        <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
                            <span>{stats.current} de {stats.total} procesadas</span>
                            <span>{Math.round((stats.current / stats.total) * 100)}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-600 transition-all duration-300 shadow-lg" 
                                style={{ width: `${(stats.current / stats.total) * 100}%` }}
                            ></div>
                        </div>
                        <div className="mt-4 flex gap-4 justify-center text-sm">
                            <span className="text-emerald-600 font-bold">{stats.success} exitosas</span>
                            {stats.errors > 0 && <span className="text-red-500 font-bold">{stats.errors} errores</span>}
                        </div>
                    </div>
                </div>
            )}

            {step === 'processing' && stats.total === 0 && (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                    <div className="text-center">
                        <h3 className="text-2xl font-black text-gray-900">Analizando archivos</h3>
                        <p className="text-gray-500 font-medium mt-1">Extrayendo claves y validando con la base de datos...</p>
                    </div>
                </div>
            )}

            {step === 'preview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 text-center">
                            <Database className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                            <h3 className="text-3xl font-black text-blue-900">
                                {tasks.length.toLocaleString()} Listas
                            </h3>
                            <p className="text-blue-600 font-bold mt-2 uppercase tracking-widest text-xs">Imágenes para subir</p>
                        </div>
                        <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 text-center">
                            <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                            <h3 className="text-3xl font-black text-amber-900">
                                {unmatchedKeys.length.toLocaleString()} Ignoradas
                            </h3>
                            <p className="text-amber-600 font-bold mt-2 uppercase tracking-widest text-xs">SKUs no encontrados en BD</p>
                        </div>
                    </div>

                    {unmatchedKeys.length > 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-sm text-gray-600">
                            <p className="font-bold mb-2">Ejemplos de SKUs no encontrados (no se subirán):</p>
                            <div className="flex flex-wrap gap-2">
                                {unmatchedKeys.slice(0, 15).map(key => (
                                    <span key={key} className="bg-white border border-gray-200 px-3 py-1 rounded-lg font-mono text-xs">{key}</span>
                                ))}
                                {unmatchedKeys.length > 15 && <span className="px-2 py-1 text-gray-400">+{unmatchedKeys.length - 15} más</span>}
                            </div>
                        </div>
                    )}
                    
                    <button 
                        onClick={startUpload}
                        className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-lg shadow-xl shadow-blue-100 transition-all flex justify-center gap-3 items-center"
                    >
                        <Upload className="w-6 h-6" />
                        Comenzar Subida Masiva
                    </button>
                    <button 
                        onClick={resetState}
                        className="w-full py-4 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-2xl text-md border border-gray-200 transition-all"
                    >
                        Cancelar
                    </button>
                </div>
            )}

            {step === 'success' && (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-500">
                    <div className="bg-emerald-100 p-6 rounded-full text-emerald-600 mb-6 shadow-inner">
                        <CheckCircle className="w-16 h-16" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-2">¡Carga Completada!</h3>
                    <p className="text-gray-500 font-medium max-w-sm mb-6">
                        Se han subido y asignado las imágenes a sus respectivos productos.
                    </p>
                    
                    <div className="flex gap-6 mb-10 text-sm">
                        <div className="bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
                            <span className="block text-xl font-black text-emerald-700">{stats.success}</span>
                            <span className="text-emerald-600 font-semibold uppercase text-xs">Exitosas</span>
                        </div>
                        <div className="bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                            <span className="block text-xl font-black text-red-700">{stats.errors}</span>
                            <span className="text-red-600 font-semibold uppercase text-xs">Errores</span>
                        </div>
                    </div>

                    <button
                        onClick={resetState}
                        className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-lg"
                    >
                        Subir más imágenes
                    </button>
                </div>
            )}
        </div>
    );
}
