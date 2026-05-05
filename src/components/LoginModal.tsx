import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, LogIn, AlertCircle, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TurnstileWidget } from './TurnstileWidget';
interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialMode?: 'login' | 'signup';
}

export function LoginModal({ isOpen, onClose, onSuccess, initialMode = 'login' }: LoginModalProps) {
    const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode || 'login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [turnstileToken, setTurnstileToken] = useState<string>('');
    const [honeypot, setHoneypot] = useState('');
    const loadTime = useRef(Date.now());
    const [widgetKey, setWidgetKey] = useState(0);

    const handleTurnstileVerify = useCallback((token: string) => {
        setTurnstileToken(token);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode || 'login');
            setError(null);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setTurnstileToken('');
            setHoneypot('');
            loadTime.current = Date.now();
            setWidgetKey(prev => prev + 1);
        }
    }, [isOpen, initialMode]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (honeypot) {
            onClose();
            return;
        }

        const timeElapsed = Date.now() - loadTime.current;
        if (timeElapsed < 3000) {
            setError('Por favor, tómate un momento antes de enviar el formulario.');
            return;
        }

        if (!turnstileToken) {
            setError('Por favor, completa la verificación de seguridad.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Por favor, ingresa un correo electrónico válido.');
            return;
        }

        if (mode !== 'reset' && password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        setError(null);

        if (!email.trim() || (mode !== 'reset' && !password.trim())) {
            setError('Por favor, ingresa los datos requeridos.');
            setLoading(false);
            return;
        }

        if (mode === 'signup' && password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            const { data: turnstileData, error: turnstileError } = await supabase.functions.invoke('verify-turnstile', {
                body: { token: turnstileToken }
            });

            if (turnstileError || !turnstileData?.success) {
                setError('Verificación de seguridad fallida, intenta nuevamente.');
                setTurnstileToken('');
                setWidgetKey(prev => prev + 1);
                setLoading(false);
                return;
            }
            if (mode === 'reset') {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/callback?next=/perfil`
                });
                if (resetError) throw resetError;
                setError('¡Enlace enviado! Revisa tu correo electrónico.');
                setLoading(false);
                return;
            }

            if (mode === 'signup') {
                // Registrar nuevo usuario en Supabase Auth
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: window.location.origin,
                        data: {
                            role: 'usuario'
                        }
                    }
                });

                if (signUpError) throw signUpError;

                if (data.user) {
                    // Intentamos crear/actualizar el perfil, pero no bloqueamos si falla 
                    // (el disparador de base de datos debería encargarse)
                    try {
                        const { error: profileError } = await supabase
                            .from('user_profiles')
                            .upsert([
                                {
                                    id: data.user.id,
                                    email: email,
                                    role: 'usuario'
                                }
                            ], { onConflict: 'id' });

                        if (profileError) {
                            console.warn('Nota: El perfil no se pudo actualizar manualmente, se confiará en el trigger de la BD:', profileError.message);
                        }
                    } catch (e) {
                        console.warn('Error silencioso en upsert de perfil:', e);
                    }
                }
                
                // Si llegamos aquí, el registro de Auth fue exitoso
                setError('¡Cuenta creada! Revisa tu correo o intenta iniciar sesión.');
                setMode('login');
            } else {
                // Iniciar sesión
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;

                onSuccess();
                onClose();
            }
        } catch (err: any) {
            console.error('Error detallado en autenticación:', err);
            if (err.message?.includes('already registered')) {
                setError('Este correo ya está registrado.');
            } else if (err.message?.includes('at least 6 characters')) {
                setError('La contraseña debe tener al menos 6 caracteres.');
            } else {
                // Mostrar el mensaje real de error para diagnóstico
                setError(err.message || 'Error de conexión o credenciales inválidas.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-6 border-b border-gray-100 flex flex-col items-center justify-center bg-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-2 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <img src="/logo.png" alt="Logo" className="h-12 w-auto mb-3 object-contain" />
                    <h3 className="text-[16px] font-black text-gray-900 tracking-widest uppercase">
                        {mode === 'signup' ? 'Crear Cuenta' : mode === 'reset' ? 'Recuperar Acceso' : 'Iniciar Sesión'}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <input 
                        type="text" 
                        name="website_url" 
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        style={{ display: 'none' }} 
                        tabIndex={-1} 
                        autoComplete="off" 
                    />
                    {error && (
                        <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-sm ${error.includes('¡Cuenta creada!') || error.includes('¡Enlace enviado!') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdc401] focus:border-[#fdc401] outline-none transition-all shadow-sm"
                                placeholder="usuario@ejemplo.com"
                                required
                            />
                        </div>


                        {mode !== 'reset' && (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Contraseña
                                    </label>
                                    {mode === 'login' && (
                                        <button 
                                            type="button" 
                                            onClick={() => { setMode('reset'); setError(null); }}
                                            className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdc401] focus:border-[#fdc401] outline-none transition-all shadow-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        )}

                        {mode === 'signup' && (
                            <div className="animate-in slide-in-from-top-2 duration-200">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Verificar Contraseña
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fdc401] focus:border-[#fdc401] outline-none transition-all shadow-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <TurnstileWidget 
                        key={widgetKey}
                        onVerify={handleTurnstileVerify} 
                        action={mode} 
                    />

                    <div className="mt-6 space-y-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-black text-black bg-[#fdc401] border border-transparent rounded-lg hover:bg-[#cc9e01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fdc401] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                        >
                            {loading ? (
                                <>{mode === 'signup' ? 'Creando cuenta...' : mode === 'reset' ? 'Enviando...' : 'Iniciando sesión...'}</>
                            ) : (
                                <>
                                    {mode === 'signup' ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                                    {mode === 'signup' ? 'Registrarse' : mode === 'reset' ? 'Enviar Enlace' : 'Entrar'}
                                </>
                            )}
                        </button>

                        <div className="text-center flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setMode(mode === 'login' ? 'signup' : 'login');
                                    setError(null);
                                }}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                {mode === 'signup' ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Crea una'}
                            </button>
                            {mode === 'reset' && (
                                <button
                                    type="button"
                                    onClick={() => { setMode('login'); setError(null); }}
                                    className="text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Volver al inicio
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
