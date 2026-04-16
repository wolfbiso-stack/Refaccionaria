import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle, CheckCircle, MoveUp, MoveDown, Trash2 } from 'lucide-react';

interface Banner {
  id: string;
  url: string;
}

export function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'homepage_banners')
        .single();

      if (fetchError) throw fetchError;
      if (data?.value) {
        setBanners(data.value as Banner[]);
      }
    } catch (err: any) {
      console.error('Error fetching banners:', err);
      setError('No se pudieron cargar los banners actuales.');
    }
  };

  const saveBanners = async (newBanners: Banner[]) => {
    setIsSaving(true);
    setError(null);
    try {
      const { error: saveError } = await supabase
        .from('site_settings')
        .update({ value: newBanners, updated_at: new Date().toISOString() })
        .eq('key', 'homepage_banners');

      if (saveError) throw saveError;
      setBanners(newBanners);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving banners:', err);
      setError('Error al guardar los cambios en la base de datos.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (banners.length >= 5) {
      setError('Máximo 5 banners permitidos.');
      return;
    }

    const file = files[0];
    
    // Validar tamaño (máximo 10MB sugerido, pero avisar si es > 2MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande (máximo 10MB).');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      if (file.size > 2 * 1024 * 1024) {
        console.warn('Imagen pesada detectada:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      }
      const extension = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${extension}`;
      const filePath = `banners/${fileName}`; // Usar la carpeta 'banners' dentro del bucket

      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('productos')
        .getPublicUrl(filePath);

      const newBanner = { id: crypto.randomUUID(), url: publicUrl };
      const updatedBanners = [...banners, newBanner];
      await saveBanners(updatedBanners);
    } catch (err: any) {
      console.error('Error uploading banner:', err);
      setError('Error al subir la imagen. Asegúrate de que el bucket "banners" sea público.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeBanner = async (id: string) => {
    const updatedBanners = banners.filter(b => b.id !== id);
    await saveBanners(updatedBanners);
  };

  const moveBanner = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;

    const updatedBanners = [...banners];
    const [moved] = updatedBanners.splice(index, 1);
    updatedBanners.splice(newIndex, 0, moved);
    await saveBanners(updatedBanners);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900">Banners de Inicio</h2>
          <p className="text-sm text-gray-500 font-medium">Gestiona las imágenes promocionales (Máx. 5)</p>
        </div>
        <div className="text-xs font-black px-3 py-1 bg-gray-100 rounded-full text-gray-500">
          {banners.length} / 5
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-bold animate-in fade-in zoom-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          Configuración actualizada correctamente
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {banners.map((banner, index) => (
          <div key={banner.id} className="group relative bg-white border border-gray-100 rounded-[1.5rem] p-4 flex items-center gap-6 hover:shadow-lg transition-all">
            <div className="w-48 h-24 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
              <img src={banner.url} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Banner #{index + 1}</p>
              <p className="text-sm font-mono text-gray-500 truncate max-w-xs">{banner.url}</p>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => moveBanner(index, 'up')}
                disabled={index === 0 || isSaving}
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 disabled:opacity-30"
              >
                <MoveUp className="w-4 h-4" />
              </button>
              <button 
                onClick={() => moveBanner(index, 'down')}
                disabled={index === banners.length - 1 || isSaving}
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 disabled:opacity-30"
              >
                <MoveDown className="w-4 h-4" />
              </button>
              <button 
                onClick={() => removeBanner(banner.id)}
                disabled={isSaving}
                className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {banners.length < 5 && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-200 
              rounded-[2rem] cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center group
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleUpload} 
              accept="image/*" 
              className="hidden" 
            />
            {isUploading ? (
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            ) : (
              <div className="bg-gray-50 p-4 rounded-full text-gray-300 mb-4 group-hover:scale-110 group-hover:text-blue-500 transition-all shadow-inner">
                <Upload className="w-8 h-8" />
              </div>
            )}
            <h3 className="text-lg font-black text-gray-900 mb-1">Cargar nuevo banner</h3>
            <p className="text-gray-400 font-medium text-xs uppercase tracking-widest">Dimensiones recomendadas: 1200x400px</p>
          </div>
        )}

        {banners.length === 0 && !isUploading && (
          <div className="text-center py-10 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
            <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold italic">No hay banners configurados. Se mostrará el texto de bienvenida por defecto.</p>
          </div>
        )}
      </div>
    </div>
  );
}
