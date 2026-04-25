
/**
 * Generates an optimized search filter string for Supabase .or() method.
 * It handles Spanish plural/singular variations and searches across name and sku.
 */
export function getSearchFilterString(searchQuery: string): string {
  if (!searchQuery || !searchQuery.trim()) return '';

  const cleanQuery = searchQuery.trim();
  const words = cleanQuery.split(/\s+/);
  const conditions: string[] = [];

  // 1. Agregar la consulta completa como wfts (Búsqueda de Texto Completo en Web)
  // Esto es lo más poderoso ya que maneja la derivación si la base de datos está configurada para ello.
  // Usamos la consulta completa aquí.
  conditions.push(`name.wfts.${cleanQuery}`);

  // 2. Agregar variaciones de palabras individuales para una mejor coincidencia
  words.forEach(word => {
    // Remover caracteres que podrían romper la sintaxis de .or()
    const safeWord = word.replace(/[(),]/g, '');
    if (!safeWord) return;

    // Coincidencias estándar ilike
    conditions.push(`name.ilike.%${safeWord}%`);
    conditions.push(`sku.ilike.%${safeWord}%`);

    // Manejo de plurales en español: 'llantas' -> 'llanta'
    if (safeWord.toLowerCase().endsWith('s') && safeWord.length > 3) {
      const singular = safeWord.slice(0, -1);
      conditions.push(`name.ilike.%${singular}%`);
    }

    // Manejo de plurales en español: 'motores' -> 'motor'
    if (safeWord.toLowerCase().endsWith('es') && safeWord.length > 4) {
      const singular = safeWord.slice(0, -2);
      conditions.push(`name.ilike.%${singular}%`);
    }
  });

  // Remover duplicados y unir
  return [...new Set(conditions)].join(',');
}
