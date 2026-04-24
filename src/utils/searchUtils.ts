
/**
 * Generates an optimized search filter string for Supabase .or() method.
 * It handles Spanish plural/singular variations and searches across name and sku.
 */
export function getSearchFilterString(searchQuery: string): string {
  if (!searchQuery || !searchQuery.trim()) return '';

  const cleanQuery = searchQuery.trim();
  const words = cleanQuery.split(/\s+/);
  const conditions: string[] = [];

  // 1. Add the full query as wfts (Web Full Text Search)
  // This is the most powerful as it handles stemming if the DB is configured for it.
  // We use the full query here.
  conditions.push(`name.wfts.${cleanQuery}`);

  // 2. Add individual word variations for better matching
  words.forEach(word => {
    // Remove characters that might break the .or() syntax
    const safeWord = word.replace(/[(),]/g, '');
    if (!safeWord) return;

    // Standard ilike matches
    conditions.push(`name.ilike.%${safeWord}%`);
    conditions.push(`sku.ilike.%${safeWord}%`);

    // Spanish plural handling: 'llantas' -> 'llanta'
    if (safeWord.toLowerCase().endsWith('s') && safeWord.length > 3) {
      const singular = safeWord.slice(0, -1);
      conditions.push(`name.ilike.%${singular}%`);
    }

    // Spanish plural handling: 'motores' -> 'motor'
    if (safeWord.toLowerCase().endsWith('es') && safeWord.length > 4) {
      const singular = safeWord.slice(0, -2);
      conditions.push(`name.ilike.%${singular}%`);
    }
  });

  // Remove duplicates and join
  return [...new Set(conditions)].join(',');
}
