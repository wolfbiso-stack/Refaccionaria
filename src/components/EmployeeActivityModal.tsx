import React, { useState, useEffect } from 'react';
import { X, Activity, Package, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from './EmployeeManagement';

interface EmployeeActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: UserProfile | null;
}

interface ProductActivity {
    id: string;
    name: string;
    sku: string;
    created_at: string;
    user_id?: string;
    updated_by?: string;
}

export function EmployeeActivityModal({ isOpen, onClose, employee }: EmployeeActivityModalProps) {
    const [loading, setLoading] = useState(false);
    const [createdProducts, setCreatedProducts] = useState<ProductActivity[]>([]);
    const [editedProducts, setEditedProducts] = useState<ProductActivity[]>([]);

    useEffect(() => {
        if (isOpen && employee) {
            const fetchActivity = async () => {
                setLoading(true);
                try {
                    const { data, error } = await supabase
                        .from('products')
                        .select('id, name, sku, created_at, user_id, updated_by')
                        .or(`user_id.eq.${employee.id},updated_by.eq.${employee.id}`)
                        .order('created_at', { ascending: false });

                    if (error) throw error;

                    const created = data.filter(p => p.user_id === employee.id);
                    const edited = data.filter(p => p.updated_by === employee.id);

                    setCreatedProducts(created);
                    setEditedProducts(edited);
                } catch (err) {
                    console.error("Error fetching activity:", err);
                } finally {
                    setLoading(false);
                }
            };

            fetchActivity();
        } else {
            setCreatedProducts([]);
            setEditedProducts([]);
        }
    }, [isOpen, employee]);

    if (!isOpen || !employee) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col relative z-10 animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <div className="flex items-center gap-2 text-gray-800">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-bold truncate pr-4">Actividad: {employee.first_name || employee.last_name ? `${employee.first_name || ''} ${employee.last_name || ''}` : employee.email}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors shrink-0">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            {/* Creados */}
                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-4 text-blue-800 font-semibold border-b border-blue-100 pb-2">
                                    <Package className="h-4 w-4" />
                                    <h4>Productos Creados Originalmente ({createdProducts.length})</h4>
                                </div>
                                {createdProducts.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Este usuario no ha dado de alta ningún producto.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {createdProducts.map(p => (
                                            <li key={`cr-${p.id}`} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                                                    <p className="text-xs text-gray-500 font-mono mt-0.5">SKU: {p.sku || 'N/A'}</p>
                                                </div>
                                                <span className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Editados */}
                            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-4 text-amber-800 font-semibold border-b border-amber-100 pb-2">
                                    <Clock className="h-4 w-4" />
                                    <h4>Productos Editados por última vez ({editedProducts.length})</h4>
                                </div>
                                {editedProducts.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Este usuario no figura como el último editor de ningún producto.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {editedProducts.map(p => (
                                            <li key={`ed-${p.id}`} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                                                    <p className="text-xs text-gray-500 font-mono mt-0.5">SKU: {p.sku || 'N/A'}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
