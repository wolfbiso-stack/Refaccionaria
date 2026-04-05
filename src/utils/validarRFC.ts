/**
 * Validador de RFC Mexicano
 * Soporta Personas Físicas (13 chars) y Morales (12 chars)
 * 
 * Reglas:
 * - Física: 4 letras [A-ZÑ&], 6 números [YYMMDD], 3 caracteres [A-Z0-9]
 * - Moral: 3 letras [A-ZÑ&], 6 números [YYMMDD], 3 caracteres [A-Z0-9]
 */

export interface ValidationRFCResult {
    valido: boolean;
    error?: string;
}

export function validarRFC(rfc: string): ValidationRFCResult {
    const rawValue = rfc.trim().toUpperCase();

    if (!rawValue) return { valido: false, error: "El RFC es obligatorio" };

    // 1. Validar formato general con Regex
    // Física: [A-Z]{4}YYMMDD[A-Z\d]{3}
    // Moral: [A-Z]{3}YYMMDD[A-Z\d]{3}
    const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-V\d]{3}$/i;
    if (!rfcRegex.test(rawValue)) {
        return { valido: false, error: "Formato inválido (letras o longitud incorrecta)" };
    }

    // 2. Extraer componentes (dependiendo de la longitud)
    const isMoral = rawValue.length === 12;
    const dateStr = isMoral ? rawValue.substring(3, 9) : rawValue.substring(4, 10);
    
    const year = parseInt(dateStr.substring(0, 2), 10);
    const month = parseInt(dateStr.substring(2, 4), 10);
    const day = parseInt(dateStr.substring(4, 6), 10);

    // 3. Validar Mes
    if (month < 1 || month > 12) {
        return { valido: false, error: "Mes inválido en el RFC (01-12)" };
    }

    // 4. Validar Día considerando Febrero y Años Bisiestos
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    if (month === 2) {
        const fullYear = year + (year < 50 ? 2000 : 1900);
        const isLeap = (fullYear % 4 === 0 && fullYear % 100 !== 0) || (fullYear % 400 === 0);
        if (isLeap) daysInMonth[1] = 29;
    }

    if (day < 1 || day > daysInMonth[month - 1]) {
        return { valido: false, error: `El día ${day} no existe para el mes ${month}` };
    }

    // 5. Validar Dígito Verificador (Algoritmo Oficial SAT)
    // El RFC para el cálculo se ajusta a 13 posiciones (Persona Moral lleva espacio al inicio)
    const rfcToValidate = isMoral ? ` ${rawValue}` : rawValue;
    const dictionary = "0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ Ñ";
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const char = rfcToValidate.charAt(i);
        const code = dictionary.indexOf(char);
        if (code === -1) continue; // No debería pasar por el regex previo
        sum += code * (13 - i);
    }

    const reminder = sum % 11;
    const expectedDigitCode = 11 - reminder;
    let expectedDigit = "";

    if (expectedDigitCode === 11) {
        expectedDigit = "0";
    } else if (expectedDigitCode === 10) {
        expectedDigit = "A";
    } else {
        expectedDigit = expectedDigitCode.toString();
    }

    const actualDigit = rawValue.charAt(rawValue.length - 1);
    if (actualDigit !== expectedDigit) {
        return { valido: false, error: "El dígito verificador es incorrecto" };
    }

    return { valido: true };
}
