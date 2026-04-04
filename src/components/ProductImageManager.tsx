import React, { useState, useRef } from 'react';
import { Search, Clipboard, Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProductImageManagerProps {
  sku: string;
  name: string;
  brand?: string;
  currentImages?: string[];
  onImagesChanged: (urls: string[]) => void;
}

export function ProductImageManager({
  sku,
  name,
  brand,
  currentImages = [],
  onImagesChanged
}: ProductImageManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanSku = sku.trim().replace(/[^a-zA-Z0-9]/g, '-');

  const handleSearchOnGoogle = () => {
    if (!name.trim()) {
      setError('Escribe el nombre del producto para buscar.');
      return;
    }
    const query = `${name} ${brand || ''} ${sku}`.trim().replace(/\s+/g, '+');
    window.open(`https://www.google.com/search?tbm=isch&q=${query}`, '_blank');
  };

  const uploadToSupabase = async (file: File | Blob) => {
    if (!sku.trim()) {
      setError('El SKU es obligatorio para guardar la imagen.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Determine file extension
      let extension = 'png'; 
      if (file instanceof File) {
        extension = file.name.split('.').pop() || 'png';
      }

      // Unique name based on SKU + current length/timestamp
      const index = currentImages.length + 1;
      const fileName = `${cleanSku}-${index}-${Date.now()}.${extension}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('productos')
        .getPublicUrl(filePath);

      const finalUrl = `${publicUrl}?t=${Date.now()}`;
      
      const newImages = [...currentImages, finalUrl];
      onImagesChanged(newImages);
      setActiveImageIndex(newImages.length - 1);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Error al subir la imagen.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaste = async () => {
    try {
      setError(null);
      const clipboardItems = await navigator.clipboard.read();
      let foundImage = false;

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            await uploadToSupabase(blob);
            foundImage = true;
            break;
          }
        }
        if (foundImage) break;
      }

      if (!foundImage) {
        setError('No se detectó ninguna imagen en el portapapeles.');
      }
    } catch (err: any) {
      console.error('Clipboard error:', err);
      setError('Permiso denegado o error al leer el portapapeles.');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newImages = currentImages.filter((_, i) => i !== indexToRemove);
    onImagesChanged(newImages);
    if (activeImageIndex >= newImages.length) {
      setActiveImageIndex(Math.max(0, newImages.length - 1));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => uploadToSupabase(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          uploadToSupabase(file);
        }
      });
    }
  };

  const currentActiveUrl = currentImages[activeImageIndex];

  return (
    <div className="space-y-4">
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative group h-64 rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center
          ${currentActiveUrl ? 'border-blue-200 bg-blue-50/10' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        {currentActiveUrl ? (
          <>
            <img 
              src={currentActiveUrl} 
              alt="Preview" 
              className="w-full h-full object-contain p-2 transition-transform group-hover:scale-105"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                type="button"
                onClick={() => handleRemoveImage(activeImageIndex)}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                title="Eliminar actual"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center px-4">
            <div className="bg-white p-3 rounded-full shadow-sm mb-3 mx-auto w-12 h-12 flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">
              Suelte imágenes o use los botones
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Escanea, pega o arrastra varias fotos
            </p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Subiendo...</span>
          </div>
        )}
      </div>

      {/* Thumbnails list */}
      {currentImages.length > 0 && (
        <div className="flex gap-2 p-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
          {currentImages.map((url, idx) => (
            <div 
              key={`${url}-${idx}`}
              className={`relative shrink-0 w-16 h-16 rounded-lg border-2 cursor-pointer transition-all overflow-hidden
                ${activeImageIndex === idx ? 'border-blue-600 shadow-md ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'}
              `}
              onClick={() => setActiveImageIndex(idx)}
            >
              <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors bg-gray-50"
          >
            <Upload className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSearchOnGoogle}
          className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-all active:scale-95"
        >
          <Search className="h-4 w-4" />
          Buscar en Google
        </button>
        
        <button
          type="button"
          onClick={handlePaste}
          disabled={isUploading}
          className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all active:scale-95"
        >
          <Clipboard className="h-4 w-4" />
          Pegar Captura
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start gap-2 text-sm animate-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
}
