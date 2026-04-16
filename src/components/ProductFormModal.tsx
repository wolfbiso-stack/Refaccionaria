import React, { useState, useEffect } from 'react';
import { X, Save, PackagePlus, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductImageManager } from './ProductImageManager';

interface Product {
  id?: string;
  name: string;
  brand?: string;
  sku?: string;
  slug?: string;
  description: string;
  stock: number;
  image_url?: string;
  images?: string[];
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialProduct?: Product | null;
}

export function ProductFormModal({ isOpen, onClose, onSuccess, initialProduct }: ProductFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    sku: '',
    description: '',
    stock: 0,
    images: [] as string[],
  });

  useEffect(() => {
    if (isOpen) {
      if (initialProduct) {
        // Migration: If we have image_url but no images array, put it in the array
        const initialImages = initialProduct.images || (initialProduct.image_url ? [initialProduct.image_url] : []);
        
        setFormData({
          name: initialProduct.name,
          brand: initialProduct.brand || '',
          sku: initialProduct.sku || '',
          description: initialProduct.description || '',
          stock: initialProduct.stock,
          images: initialImages,
        });
      } else {
        setFormData({ name: '', brand: '', sku: '', description: '', stock: 0, images: [] });
      }
      setError(null);
    }
  }, [isOpen, initialProduct]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.name.trim()) {
      setError('El nombre del producto es obligatorio.');
      setLoading(false);
      return;
    }
    if (!formData.sku.trim()) {
      setError('El SKU del producto es obligatorio para generar la URL.');
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const generateSlug = (name: string, sku: string) => {
        const base = `${name}-${sku}`;
        return base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      };

      const slug = generateSlug(formData.name, formData.sku);

      const productPayload = {
        name: formData.name,
        brand: formData.brand || null,
        sku: formData.sku,
        slug: slug,
        description: formData.description || null,
        stock: Number(formData.stock) || 0,
        images: formData.images,
        // Mantener image_url para compatibilidad con vistas viejas (usamos la primera imagen)
        image_url: formData.images.length > 0 ? formData.images[0] : null,
      };

      if (initialProduct && initialProduct.id) {
        const { error: supabaseError } = await supabase
          .from('products')
          .update({ ...productPayload, ...(user && { updated_by: user.id }) })
          .eq('id', initialProduct.id);

        if (supabaseError) throw supabaseError;
      } else {
        const { error: supabaseError } = await supabase
          .from('products')
          .insert([{ ...productPayload, ...(user && { user_id: user.id }) }]);

        if (supabaseError) throw supabaseError;
      }

      // Success
      setFormData({ name: '', brand: '', sku: '', description: '', stock: 0, images: [] });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al guardar el producto:', err);
      setError(err.message || 'Ocurrió un error al intentar guardar el producto en la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200 flex flex-col">
        {/* Header - Fixed */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-2 text-gray-800">
            <PackagePlus className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold">
              {initialProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1">
          {/* Scrollable Content Area */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg flex items-start gap-2 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Producto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                  placeholder="Ej: Balatas Delanteras Vento"
                  required
                />
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Marca <span className="text-gray-400 font-normal">(Opcional para búsqueda)</span>
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                  placeholder="Ej: Bosch, Fritec, OEM..."
                />
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                  SKU / Número de Parte <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                  placeholder="Ej: BVS-9921"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category field removed */}

                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Inicial <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm resize-none"
                  placeholder="Detalles adicionales o compatibilidad..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del Producto
                </label>
                <ProductImageManager 
                  sku={formData.sku}
                  name={formData.name}
                  brand={formData.brand}
                  currentImages={formData.images}
                  onImagesChanged={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
                />
              </div>
            </div> {/* End of space-y-4 */}
          </div> {/* End of scrollable content */}

          {/* Footer - Fixed at bottom */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>{initialProduct ? 'Actualizando...' : 'Guardando...'}</>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {initialProduct ? 'Actualizar Producto' : 'Guardar Producto'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
