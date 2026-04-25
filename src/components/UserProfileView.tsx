import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, MapPin, Package, FileText, Save, Loader2, CheckCircle, AlertCircle, Construction, ArrowLeft, Edit3, Plus, Trash2, Home, Phone, Calendar, ClipboardCheck, Building2, Briefcase, Search, Hash, ChevronRight, Filter, X as CloseIcon, FileDown, Lock, Key, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { generateQuotationPDF } from '../lib/pdfGenerator';
import { InputRFC } from './InputRFC';

type Section = 'perfil' | 'direcciones' | 'pedidos' | 'cotizaciones' | 'seguridad';

interface Address {
    id?: string;
    pais: string;
    codigo_postal: string;
    estado: string;
    municipio: string;
    colonia: string;
    calle: string;
    num_exterior: string;
    num_interior: string;
    es_principal: boolean;
}

interface UserProfile {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender: string;
    birth_date: string;
    is_corporate: boolean;
    corporate_name: string;
    rfc: string;
    corporate_phone: string;
    is_rfc_valid?: boolean;
}

interface CotizacionItem {
    id: string;
    sku: string;
    name: string;
    quantity: number;
    product_id: string;
}

interface Cotizacion {
    id: string;
    folio: string;
    created_at: string;
    total_items: number;
    items?: CotizacionItem[];
}

export function UserProfileView() {
    const [activeSection, setActiveSection] = useState<Section>('perfil');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Estado del Perfil
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: '',
        birth_date: '',
        is_corporate: false,
        corporate_name: '',
        rfc: '',
        corporate_phone: ''
    });
    const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);

    // Estado de Direcciones
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [addressForm, setAddressForm] = useState<Address>({
        pais: 'México',
        codigo_postal: '',
        estado: '',
        municipio: '',
        colonia: '',
        calle: '',
        num_exterior: '',
        num_interior: '',
        es_principal: false
    });

    // Estado de Cotizaciones
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
    const [selectedCotizacion, setSelectedCotizacion] = useState<Cotizacion | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    
    // Estado de Seguridad
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    
    // Estados de Visibilidad
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([
            fetchProfile(),
            fetchAddresses(),
            fetchCotizaciones()
        ]);
        setLoading(false);
    };

    const fetchCotizaciones = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data, error } = await supabase
                .from('cotizaciones')
                .select(`
                    *,
                    items:cotizaciones_items(*)
                `)
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCotizaciones(data || []);
        } catch (err) {
            console.error('Error fetching cotizaciones:', err);
        }
    };

    const handleDownloadPDF = async (cot: Cotizacion) => {
        const pdfItems = cot.items?.map(item => ({
            sku: item.sku,
            name: item.name,
            quantity: item.quantity
        })) || [];

        const dateStr = new Date(cot.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        await generateQuotationPDF(cot.folio, pdfItems, profile, dateStr);
    };

    const fetchProfile = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.warn('Error fetching profile data:', error.message);
            }

            console.log('Profile data from DB:', data);

            if (data) {
                const fetched: UserProfile = {
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    email: data.email || session.user.email || '',
                    phone: data.phone || '',
                    gender: data.gender || '',
                    birth_date: data.birth_date || '',
                    is_corporate: data.is_corporate || false,
                    corporate_name: data.corporate_name || '',
                    rfc: data.rfc || '',
                    corporate_phone: data.corporate_phone || ''
                };
                setProfile(fetched);
                setOriginalProfile({ ...fetched });
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const fetchAddresses = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data, error } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAddresses(data || []);
        } catch (err) {
            console.error('Error fetching addresses:', err);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación manual para Teléfono (10 dígitos)
        if (profile.phone && !/^[0-9]{10}$/.test(profile.phone)) {
            setMessage({ type: 'error', text: 'El teléfono debe tener exactamente 10 dígitos.' });
            return;
        }

        // Validación manual para Teléfono Corporativo (10 dígitos)
        if (profile.is_corporate && profile.corporate_phone && !/^[0-9]{10}$/.test(profile.corporate_phone)) {
            setMessage({ type: 'error', text: 'El teléfono corporativo debe tener exactamente 10 dígitos.' });
            return;
        }

        // Validación manual para RFC si la opción corporativa está habilitada
        if (profile.is_corporate && !profile.is_rfc_valid) {
            setMessage({ type: 'error', text: 'El RFC es inválido o obligatorio para personas jurídicas.' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error("Sesión no encontrada");

            console.log('Sending data to update:', {
                id: session.user.id,
                phone: profile.phone,
                gender: profile.gender,
                birth_date: profile.birth_date
            });

            const { data: updateData, error } = await supabase
                .from('user_profiles')
                .update({
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    phone: profile.phone || null,
                    gender: profile.gender || null,
                    birth_date: profile.birth_date || null,
                    is_corporate: profile.is_corporate,
                    corporate_name: profile.corporate_name,
                    rfc: profile.rfc,
                    corporate_phone: profile.corporate_phone
                })
                .eq('id', session.user.id)
                .select();

            console.log('Update response:', { updateData, error });

            if (error) throw error;

            setOriginalProfile({ ...profile });
            setIsEditing(false);
            setMessage({ type: 'success', text: '¡Perfil actualizado con éxito!' });
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setMessage({ type: 'error', text: 'Error al actualizar el perfil: ' + (err.message || 'Error desconocido') });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setSaving(true);

        if (newPassword !== confirmNewPassword) {
            setMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
            setSaving(false);
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
            setSaving(false);
            return;
        }

        try {
            // Verificamos la contraseña actual re-autenticando
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: profile.email,
                password: currentPassword,
            });

            if (signInError) {
                throw new Error('La contraseña actual es incorrecta.');
            }

            // Si la autenticación es correcta, actualizamos la contraseña
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) throw updateError;

            setMessage({ type: 'success', text: '¡Contraseña actualizada con éxito!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err: any) {
            console.error('Error al cambiar contraseña:', err);
            setMessage({ type: 'error', text: err.message || 'Error al actualizar la contraseña.' });
        } finally {
            setSaving(false);
        }
    };

    const handleCPLookup = async (cp: string) => {
        setAddressForm(prev => ({ ...prev, codigo_postal: cp }));

        if (cp.length === 5) {
            setLookupLoading(true);
            try {
                const { data, error } = await supabase
                    .from('codigos_postales')
                    .select('estado, municipio, colonia')
                    .eq('codigo_postal', cp)
                    .limit(1)
                    .single();

                if (error) {
                    console.warn('CP no encontrado');
                } else if (data) {
                    const cleanEstado = data.estado ? data.estado.replace(/_/g, ' ') : '';
                    const cleanMunicipio = data.municipio ? data.municipio.replace(/_/g, ' ') : cleanEstado;
                    const cleanColonia = data.colonia ? data.colonia.replace(/_/g, ' ') : '';

                    setAddressForm(prev => ({
                        ...prev,
                        estado: cleanEstado,
                        municipio: cleanMunicipio,
                        colonia: cleanColonia
                    }));
                }
            } catch (err) {
                console.error('Error lookup CP:', err);
            } finally {
                setLookupLoading(false);
            }
        } else {
            setAddressForm(prev => ({ ...prev, estado: '', municipio: '', colonia: '' }));
        }
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error("Sesión no encontrada");

            const { error } = await supabase
                .from('user_addresses')
                .insert({ ...addressForm, user_id: session.user.id });

            if (error) throw error;

            await fetchAddresses();
            setIsAddingAddress(false);
            setAddressForm({ pais: 'México', codigo_postal: '', estado: '', municipio: '', colonia: '', calle: '', num_exterior: '', num_interior: '', es_principal: false });
            setMessage({ type: 'success', text: '¡Dirección guardada correctamente!' });
        } catch (err: any) {
            console.error('Error saving address:', err);
            setMessage({ type: 'error', text: err.message || 'Error al guardar dirección' });
        } finally {
            setSaving(false);
        }
    };

    const deleteAddress = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta dirección?')) return;
        try {
            const { error } = await supabase.from('user_addresses').delete().eq('id', id);
            if (error) throw error;
            setAddresses(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error('Error deleting address:', err);
        }
    };

    const hasChanges = JSON.stringify({ ...profile, is_rfc_valid: undefined }) !== 
                       JSON.stringify({ ...originalProfile, is_rfc_valid: undefined });

    const menuItems = [
        { id: 'perfil', label: 'Mi Perfil', icon: User },
        { id: 'direcciones', label: 'Direcciones', icon: MapPin },
        { id: 'pedidos', label: 'Mis Pedidos', icon: Package },
        { id: 'cotizaciones', label: 'Cotizaciones', icon: FileText },
        { id: 'seguridad', label: 'Seguridad', icon: Lock },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto py-10 px-6 lg:px-12">
            <div className="flex flex-col md:flex-row items-start md:gap-x-20 lg:gap-x-32">

                {/* Sidebar */}
                <aside className="w-full md:w-64 lg:w-72 shrink-0 mb-10 md:mb-0">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                        <div className="p-8 bg-amber-500 text-amber-950 relative">
                            <div className="relative z-10">
                                <h2 className="text-xl font-bold tracking-tight">Menú de Cuenta</h2>
                                <p className="text-amber-900 text-xs mt-1 truncate opacity-70">{profile.email}</p>
                            </div>
                        </div>
                        <nav className="p-4 space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveSection(item.id as Section);
                                        setMessage(null);
                                        setIsEditing(false);
                                        setIsAddingAddress(false);
                                    }}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all
                                        ${activeSection === item.id
                                            ? 'bg-amber-50 text-amber-700 shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-amber-600' : 'text-gray-400'}`} />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                <main className="flex-1 max-w-5xl min-w-0">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 lg:p-12 min-h-[650px]">

                        {/* --- PERFIL --- */}
                        {activeSection === 'perfil' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center justify-between gap-4 mb-10 border-b border-gray-50 pb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-amber-50 p-3.5 rounded-2xl text-amber-600">
                                            <User className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-black text-gray-900">Configuración de Cuenta</h1>
                                            <p className="text-gray-400 text-sm mt-0.5">Gestiona tus datos personales y corporativos</p>
                                        </div>
                                    </div>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Editar Datos
                                        </button>
                                    )}
                                </div>

                                {message && activeSection === 'perfil' && (
                                    <div className={`mb-8 p-5 rounded-2xl flex items-center gap-4 text-sm font-bold border
                                        ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}
                                    `}>
                                        {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                                        <p>{message.text}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSaveProfile} className="space-y-12">
                                    {/* Sección de Datos Personales */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nombre(s)</label>
                                            {isEditing ? (
                                                <input type="text" value={profile.first_name} onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white outline-none transition-all font-medium" required />
                                            ) : (
                                                <p className="px-1 text-xl font-bold text-gray-800">{profile.first_name || 'Sin nombre'}</p>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Apellidos</label>
                                            {isEditing ? (
                                                <input type="text" value={profile.last_name} onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white outline-none transition-all font-medium" required />
                                            ) : (
                                                <p className="px-1 text-xl font-bold text-gray-800">{profile.last_name || 'Sin apellidos'}</p>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Teléfono</label>
                                            {isEditing ? (
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input 
                                                        type="tel" 
                                                        maxLength={10}
                                                        value={profile.phone} 
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                                            if (val.length <= 10) setProfile(prev => ({ ...prev, phone: val }));
                                                        }} 
                                                        className={`w-full pl-12 pr-5 py-4 bg-gray-50 border rounded-2xl outline-none font-medium transition-all ${profile.phone && profile.phone.length !== 10 ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200 focus:bg-white'}`} 
                                                        placeholder="Ej. 9241234567" 
                                                    />
                                                    {profile.phone && profile.phone.length > 0 && profile.phone.length < 10 && (
                                                        <p className="text-[10px] text-amber-600 font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">Faltan {10 - profile.phone.length} dígitos</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="px-1 text-lg font-bold text-gray-800">{profile.phone || 'No especificado'}</p>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                            <p className="px-1 text-lg font-medium text-gray-500">{profile.email}</p>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Género</label>
                                            {isEditing ? (
                                                <select value={profile.gender} onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-medium appearance-none">
                                                    <option value="">Seleccionar (Opcional)</option>
                                                    <option value="Masculino">Masculino</option>
                                                    <option value="Femenino">Femenino</option>
                                                    <option value="Otro">Otro</option>
                                                </select>
                                            ) : (
                                                <p className="px-1 text-lg font-bold text-gray-800">{profile.gender || 'No especificado'}</p>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Fecha de Nacimiento</label>
                                            {isEditing ? (
                                                <div className="relative">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input type="date" value={profile.birth_date} onChange={(e) => setProfile(prev => ({ ...prev, birth_date: e.target.value }))} className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-medium" />
                                                </div>
                                            ) : (
                                                <p className="px-1 text-lg font-bold text-gray-800">{profile.birth_date || 'No especificada'}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sección Corporativa (Persona Jurídica) */}
                                    {(isEditing || profile.is_corporate) && (
                                        <div className="pt-10 border-t border-gray-100">
                                            {!profile.is_corporate && isEditing ? (
                                                <button type="button" onClick={() => setProfile(p => ({ ...p, is_corporate: true }))} className="inline-flex items-center gap-3 px-8 py-5 border-2 border-dashed border-gray-200 rounded-3xl text-gray-500 font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all group w-full justify-center">
                                                    <Building2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                    Añadir datos de persona Jurídica
                                                </button>
                                            ) : (
                                                profile.is_corporate && (
                                                    <div className={`space-y-8 p-8 rounded-[2rem] border ${isEditing ? 'bg-blue-50/30 border-blue-100' : 'bg-gray-50/10 border-gray-100'}`}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <ClipboardCheck className={`w-6 h-6 ${isEditing ? 'text-blue-600' : 'text-gray-400'}`} />
                                                                <h3 className="text-xl font-black text-gray-900">Datos de Persona Jurídica</h3>
                                                            </div>
                                                            {isEditing && (
                                                                <button type="button" onClick={() => setProfile(p => ({ ...p, is_corporate: false, rfc: '', corporate_name: '', corporate_phone: '' }))} className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-100 transition-all">
                                                                    Quitar Datos
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 animate-in fade-in zoom-in duration-300">
                                                            <div className="space-y-3">
                                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Corporativo</label>
                                                                {isEditing ? (
                                                                    <input type="text" value={profile.corporate_name} onChange={(e) => setProfile(prev => ({ ...prev, corporate_name: e.target.value }))} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none font-medium" placeholder="Opcional" />
                                                                ) : (
                                                                    <p className="px-1 text-lg font-bold text-gray-800">{profile.corporate_name || 'No especificado'}</p>
                                                                )}
                                                            </div>
                                                            <div className="space-y-3">
                                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">RFC <span className="text-red-500">*</span></label>
                                                                {isEditing ? (
                                                                    <InputRFC 
                                                                        value={profile.rfc} 
                                                                        onValidationChange={(isValid, rfc) => setProfile(prev => ({ ...prev, rfc, is_rfc_valid: isValid }))}
                                                                        required={profile.is_corporate}
                                                                    />
                                                                ) : (
                                                                    <p className="px-1 text-lg font-black text-blue-700">{profile.rfc || 'No especificado'}</p>
                                                                )}
                                                            </div>
                                                            <div className="space-y-3 sm:col-span-2">
                                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Teléfono Corporativo</label>
                                                                {isEditing ? (
                                                                    <div className="relative max-w-sm">
                                                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                                        <input 
                                                                            type="tel" 
                                                                            maxLength={10}
                                                                            value={profile.corporate_phone} 
                                                                            onChange={(e) => {
                                                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                                                if (val.length <= 10) setProfile(prev => ({ ...prev, corporate_phone: val }));
                                                                            }} 
                                                                            className={`w-full pl-12 pr-5 py-4 bg-white border rounded-2xl outline-none font-medium transition-all ${profile.corporate_phone && profile.corporate_phone.length !== 10 ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200 focus:bg-white'}`} 
                                                                            placeholder="Ej. 9241234567" 
                                                                        />
                                                                        {profile.corporate_phone && profile.corporate_phone.length > 0 && profile.corporate_phone.length < 10 && (
                                                                            <p className="text-[10px] text-amber-600 font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">Faltan {10 - profile.corporate_phone.length} dígitos</p>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <p className="px-1 text-lg font-bold text-gray-800">{profile.corporate_phone || 'No especificado'}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}

                                    {isEditing && (
                                        <div className="pt-10 border-t border-gray-100 flex items-center gap-6">
                                            <button type="submit" disabled={saving || !hasChanges} className={`px-12 py-5 text-amber-950 font-black rounded-2xl shadow-xl transition-all active:scale-95 ${hasChanges ? 'bg-amber-500 shadow-amber-100 hover:bg-amber-600 outline-none ring-2 ring-amber-600/20' : 'bg-gray-300'}`}>
                                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                                Guardar Cambios
                                            </button>
                                            <button type="button" onClick={() => { setIsEditing(false); setProfile({ ...originalProfile! }); }} className="px-8 py-5 text-gray-500 font-bold hover:text-red-500 transition-colors">
                                                Cancelar
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {/* --- DIRECCIONES --- */}
                        {activeSection === 'direcciones' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center justify-between gap-4 mb-10 border-b border-gray-50 pb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-emerald-50 p-3.5 rounded-2xl text-emerald-600">
                                            <MapPin className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-black text-gray-900">Mis Direcciones</h1>
                                            <p className="text-gray-400 text-sm mt-0.5">Direcciones de envío y facturación</p>
                                        </div>
                                    </div>
                                    {!isAddingAddress && (
                                        <button onClick={() => setIsAddingAddress(true)} className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all shadow-lg shadow-emerald-100">
                                            <Plus className="w-5 h-5" />
                                            Añadir Dirección
                                        </button>
                                    )}
                                </div>

                                {message && activeSection === 'direcciones' && (
                                    <div className={`mb-8 p-5 rounded-2xl flex items-center gap-4 text-sm font-bold border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                        {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                                        <p>{message.text}</p>
                                    </div>
                                )}

                                {isAddingAddress ? (
                                    <form onSubmit={handleSaveAddress} className="space-y-8 animate-in zoom-in duration-300 text-left">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">País</label>
                                                    <input type="text" value="México" disabled className="w-full px-5 py-4 bg-gray-100 border border-transparent rounded-2xl text-gray-500 font-bold cursor-not-allowed" />
                                                </div>
                                                <div className="space-y-2 relative">
                                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Código Postal (CP)</label>
                                                    <div className="relative">
                                                        <input type="text" maxLength={5} value={addressForm.codigo_postal} onChange={(e) => handleCPLookup(e.target.value.replace(/[^0-9]/g, ''))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white outline-none transition-all font-bold text-lg" placeholder="Ej. 06700" required autoFocus />
                                                        {lookupLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600 animate-spin" />}
                                                    </div>
                                                    {!addressForm.estado && addressForm.codigo_postal.length === 5 && !lookupLoading && (
                                                        <p className="text-xs text-amber-600 font-bold mt-2 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" /> CP no encontrado. Verifica los 5 dígitos.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {addressForm.estado && (
                                                <div className="md:contents space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                                    <div className="space-y-6">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Estado</label>
                                                                <input type="text" value={addressForm.estado} readOnly className="w-full px-5 py-4 bg-amber-50/50 border border-transparent rounded-2xl text-amber-800 font-bold" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Municipio</label>
                                                                <input type="text" value={addressForm.municipio} readOnly className="w-full px-5 py-4 bg-amber-50/50 border border-transparent rounded-2xl text-amber-800 font-bold" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Colonia / Asentamiento</label>
                                                            <input type="text" value={addressForm.colonia} onChange={(e) => setAddressForm(p => ({ ...p, colonia: e.target.value }))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white outline-none transition-all font-medium" placeholder="Ej. Roma Norte" required />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-6">
                                                        <div className="space-y-2">
                                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Calle</label>
                                                            <input type="text" value={addressForm.calle} onChange={(e) => setAddressForm(p => ({ ...p, calle: e.target.value }))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white outline-none transition-all font-medium" placeholder="Nombre de la calle" required />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Núm Exterior</label>
                                                                <input type="text" value={addressForm.num_exterior} onChange={(e) => setAddressForm(p => ({ ...p, num_exterior: e.target.value }))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white outline-none transition-all font-medium" required />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Núm Interior</label>
                                                                <input type="text" value={addressForm.num_interior} onChange={(e) => setAddressForm(p => ({ ...p, num_interior: e.target.value }))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white outline-none transition-all font-medium" placeholder="Opcional" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-4 bg-amber-50/30 rounded-2xl border border-amber-100">
                                                            <input type="checkbox" id="es_principal_addr" checked={addressForm.es_principal} onChange={(e) => setAddressForm(p => ({ ...p, es_principal: e.target.checked }))} className="w-5 h-5 text-amber-600 rounded-lg" />
                                                            <label htmlFor="es_principal_addr" className="text-sm font-bold text-gray-700 cursor-pointer">Definir como principal</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="pt-8 border-t border-gray-100 flex items-center gap-4">
                                            {addressForm.estado && (
                                                <button type="submit" disabled={saving || !addressForm.calle} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl transition-all flex items-center gap-2">
                                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                                    Guardar Dirección
                                                </button>
                                            )}
                                            <button type="button" onClick={() => setIsAddingAddress(false)} className="px-8 py-4 text-gray-400 font-bold hover:text-red-500 transition-colors">
                                                {addressForm.estado ? 'Cancelar' : 'Cancelar'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        {addresses.length > 0 ? (
                                            addresses.map((addr) => (
                                                <div key={addr.id} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative group">
                                                    <div className="flex items-start justify-between">
                                                        <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 mb-4">
                                                            <Home className="w-6 h-6" />
                                                        </div>
                                                        <button onClick={() => deleteAddress(addr.id!)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-black text-gray-900 line-clamp-1">{addr.calle} #{addr.num_exterior}</p>
                                                        <p className="text-gray-500 text-sm font-medium">{addr.colonia}, {addr.codigo_postal}</p>
                                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{addr.municipio}, {addr.estado}</p>
                                                    </div>
                                                    {addr.es_principal && (
                                                        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                                            Principal
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                                                <div className="bg-white p-6 rounded-full shadow-sm text-gray-300 mb-4">
                                                    <MapPin className="w-10 h-10" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">No tienes direcciones guardadas</h3>
                                                <p className="text-gray-500 mt-1">Añade una dirección para agilizar tus pedidos y cotizaciones.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- COTIZACIONES --- */}
                        {activeSection === 'cotizaciones' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 border-b border-gray-50 pb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-amber-50 p-3.5 rounded-2xl text-amber-600">
                                            <FileText className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-black text-gray-900">Mis Cotizaciones</h1>
                                            <p className="text-gray-400 text-sm mt-0.5">Consulta y descarga tus presupuestos previos</p>
                                        </div>
                                    </div>

                                    {/* Filters */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative group">
                                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                            <input 
                                                type="text" 
                                                placeholder="Part Number o Folio..." 
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all w-full sm:w-64"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input 
                                                type="date" 
                                                value={dateFilter}
                                                onChange={(e) => setDateFilter(e.target.value)}
                                                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {selectedCotizacion ? (
                                    <div className="animate-in zoom-in duration-300">
                                        <button 
                                            onClick={() => setSelectedCotizacion(null)}
                                            className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-amber-600 transition-colors"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Volver al listado
                                        </button>
                                        
                                        <div className="bg-gray-50/50 rounded-3xl border border-gray-100 p-8">
                                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                                                <div>
                                                    <h2 className="text-3xl font-black text-gray-900 mb-2">{selectedCotizacion.folio}</h2>
                                                    <p className="text-gray-500 font-medium flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        Emisión: {new Date(selectedCotizacion.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                                <table className="w-full text-left">
                                                    <thead className="bg-gray-50 border-b border-gray-100">
                                                        <tr>
                                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">SKU / Parte</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Cant.</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {selectedCotizacion.items?.map((item) => (
                                                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                                <td className="px-6 py-4 text-sm font-mono font-bold text-blue-600">{item.sku}</td>
                                                                <td className="px-6 py-4 text-sm font-bold text-gray-700">{item.name}</td>
                                                                <td className="px-6 py-4 text-sm font-black text-gray-900 text-center">{item.quantity}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cotizaciones
                                            .filter(c => {
                                                const matchesSearch = c.folio.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                                    c.items?.some(i => i.sku.toLowerCase().includes(searchTerm.toLowerCase()) || i.name.toLowerCase().includes(searchTerm.toLowerCase()));
                                                const matchesDate = !dateFilter || c.created_at.startsWith(dateFilter);
                                                return matchesSearch && matchesDate;
                                            })
                                            .map((cot) => (
                                                <div 
                                                    key={cot.id}
                                                    onClick={() => setSelectedCotizacion(cot)}
                                                    className="group bg-white border border-gray-100 p-6 rounded-3xl hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 transition-all cursor-pointer flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className="bg-amber-50 p-4 rounded-2xl text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                                            <Hash className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xl font-black text-gray-900 mb-0.5">{cot.folio}</p>
                                                            <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                    {new Date(cot.created_at).toLocaleDateString('es-MX')}
                                                                </span>
                                                                <span className="flex items-center gap-1.5">
                                                                    <Package className="w-3.5 h-3.5" />
                                                                    {cot.total_items} articulos
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownloadPDF(cot);
                                                            }}
                                                            title="Descargar PDF"
                                                            className="p-3 bg-gray-50 text-gray-400 hover:bg-amber-500 hover:text-white rounded-xl transition-all"
                                                        >
                                                            <FileDown className="w-5 h-5" />
                                                        </button>
                                                        <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </div>
                                            ))
                                        }

                                        {cotizaciones.length === 0 && !loading && (
                                            <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                                                <div className="bg-white p-6 rounded-full shadow-sm text-gray-300 mb-4">
                                                    <FileText className="w-10 h-10" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">No tienes cotizaciones guardadas</h3>
                                                <p className="text-gray-500 mt-1">Tus presupuestos generados en el cotizador aparecerán aquí automáticamente.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* --- SEGURIDAD --- */}
                        {activeSection === 'seguridad' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center justify-between gap-4 mb-10 border-b border-gray-50 pb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-red-50 p-3.5 rounded-2xl text-red-600">
                                            <Lock className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-black text-gray-900">Seguridad de la Cuenta</h1>
                                            <p className="text-gray-400 text-sm mt-0.5">Protege tu cuenta actualizando tu contraseña periódicamente</p>
                                        </div>
                                    </div>
                                </div>

                                {message && activeSection === 'seguridad' && (
                                    <div className={`mb-8 p-5 rounded-2xl flex items-center gap-4 text-sm font-bold border
                                        ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}
                                    `}>
                                        {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <ShieldCheck className="w-5 h-5 shrink-0" />}
                                        <p>{message.text}</p>
                                    </div>
                                )}

                                <div className="max-w-xl">
                                    <form onSubmit={handleChangePassword} className="space-y-8">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Contraseña Actual</label>
                                                <div className="relative">
                                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input 
                                                        type={showCurrentPassword ? "text" : "password"} 
                                                        value={currentPassword} 
                                                        onChange={(e) => setCurrentPassword(e.target.value)} 
                                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium" 
                                                        placeholder="••••••••"
                                                        required 
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-amber-500 transition-colors"
                                                    >
                                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2 pt-4 border-t border-gray-50">
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input 
                                                        type={showNewPassword ? "text" : "password"} 
                                                        value={newPassword} 
                                                        onChange={(e) => setNewPassword(e.target.value)} 
                                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium" 
                                                        placeholder="Mínimo 6 caracteres"
                                                        required 
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-amber-500 transition-colors"
                                                    >
                                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Confirmar Nueva Contraseña</label>
                                                <div className="relative">
                                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input 
                                                        type={showConfirmPassword ? "text" : "password"} 
                                                        value={confirmNewPassword} 
                                                        onChange={(e) => setConfirmNewPassword(e.target.value)} 
                                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium" 
                                                        placeholder="Repite tu nueva contraseña"
                                                        required 
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-amber-500 transition-colors"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button 
                                                type="submit" 
                                                disabled={saving || !currentPassword || !newPassword || !confirmNewPassword} 
                                                className={`w-full sm:w-auto px-12 py-5 text-amber-950 font-black rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3
                                                    ${(!saving && currentPassword && newPassword && confirmNewPassword) 
                                                        ? 'bg-amber-500 shadow-amber-100 hover:bg-amber-600' 
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}
                                                `}
                                            >
                                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                                Actualizar Contraseña
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* --- OTROS --- */}
                        {activeSection === 'pedidos' && (
                            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
                                <div className="bg-amber-50 p-8 rounded-full mb-8 border border-amber-100 text-amber-500">
                                    <Construction className="h-16 w-16" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase">Módulo en Desarrollo</h2>
                                <button onClick={() => setActiveSection('perfil')} className="flex items-center gap-2 px-8 py-3 border border-gray-200 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 transition-colors">
                                    <ArrowLeft className="w-5 h-5" /> Regresar
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
