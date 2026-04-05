import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { validarRFC } from '../utils/validarRFC';

interface InputRFCProps {
    value: string;
    onValidationChange: (valido: boolean, rfc: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
}

export function InputRFC({ 
    value, 
    onValidationChange, 
    placeholder = "Ingresa tu RFC", 
    required = false,
    className = "",
    disabled = false
}: InputRFCProps) {
    const [localValue, setLocalValue] = useState(value || '');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const debounceTimer = useRef<any>(null);

    // Sync with external value (important for initial load)
    useEffect(() => {
        if (value !== localValue) {
            setLocalValue(value);
            performValidation(value);
        }
    }, [value]);

    const performValidation = (val: string) => {
        if (!val) {
            setStatus('idle');
            setErrorMsg('');
            onValidationChange(!required, val);
            return;
        }

        const result = validarRFC(val);
        if (result.valido) {
            setStatus('success');
            setErrorMsg('');
            onValidationChange(true, val);
        } else {
            setStatus('error');
            setErrorMsg(result.error || 'RFC inválido');
            onValidationChange(false, val);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase().replace(/\s/g, ''); // Sin espacios
        setLocalValue(val);
        setStatus('loading');

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        
        debounceTimer.current = setTimeout(() => {
            performValidation(val);
        }, 300);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    maxLength={13}
                    value={localValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full px-5 py-4 bg-white border rounded-2xl outline-none transition-all font-bold tracking-wider placeholder:font-normal placeholder:tracking-normal
                        ${status === 'error' ? 'border-red-400 bg-red-50/10 focus:border-red-500' : ''}
                        ${status === 'success' ? 'border-emerald-400 bg-emerald-50/10 focus:border-emerald-500' : ''}
                        ${status === 'idle' || status === 'loading' ? 'border-gray-200 focus:border-blue-500' : ''}
                        ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
                    `}
                />
                
                {/* Status Icons */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                    {status === 'loading' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                    {status === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                    {status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                </div>
            </div>

            {/* Error Message */}
            {status === 'error' && errorMsg && (
                <p className="text-xs text-red-500 font-bold ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    {errorMsg}
                </p>
            )}

            {/* Success Message */}
            {status === 'success' && (
                <p className="text-xs text-emerald-600 font-bold ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    Formato de RFC correcto
                </p>
            )}
        </div>
    );
}
