/**
 * utils/formatters.ts
 * 
 * Central formatters for items, measurement units, and text consistency across CounterPress POS.
 */

/**
 * Normalizes item names to strictly UPPERCASE across the entire system.
 * e.g. "Basmati Rice" -> "BASMATI RICE"
 */
export function formatItemName(name?: string | null): string {
  if (!name) return '';
  return name.trim().toUpperCase();
}

/**
 * Standardizes customer names to clean Title-Casing (e.g. "basir khan" -> "Basir Khan").
 */
export function formatCustomerName(name?: string | null): string {
  if (!name) return '';
  return name.trim().replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Standardizes measurement units to clean Title-Casing (e.g. KG -> Kg, PCS -> Pcs).
 * Special handling:
 * - Volume: "L", "Ml"
 * - Weight: "Kg", "Gm", "G", "Ton", "Qtl"
 * - Count: "Pcs", "Pkt", "Doz", "Box", "Bag", "Btl", "Tin", "Can", "Ctn", "Roll", "Set", "Pr"
 */
export function formatUnit(unit?: string | null): string {
  if (!unit) return '';
  const trimmed = unit.trim();
  const upper = trimmed.toUpperCase();

  switch (upper) {
    case 'KG':
    case 'KGS':
    case 'KILOGRAM':
      return 'Kg';
    case 'GM':
    case 'GMS':
    case 'GRAM':
    case 'GRAMS':
      return 'Gm';
    case 'G':
      return 'G';
    case 'L':
    case 'LTR':
    case 'LITRE':
    case 'LITER':
      return 'L';
    case 'ML':
    case 'MILLILITRE':
    case 'MILLILITER':
      return 'Ml';
    case 'PCS':
    case 'PC':
    case 'PIECE':
    case 'PIECES':
      return 'Pcs';
    case 'PKT':
    case 'PACKET':
    case 'PACKETS':
      return 'Pkt';
    case 'DZ':
    case 'DOZ':
    case 'DOZEN':
      return 'Doz';
    case 'BOX':
    case 'BOXES':
      return 'Box';
    case 'BAG':
    case 'BAGS':
      return 'Bag';
    case 'BTL':
    case 'BOTTLE':
    case 'BOTTLES':
      return 'Btl';
    case 'TIN':
    case 'TINS':
      return 'Tin';
    case 'CAN':
    case 'CANS':
      return 'Can';
    case 'CTN':
    case 'CARTON':
      return 'Ctn';
    case 'ROLL':
    case 'ROLLS':
      return 'Roll';
    case 'QTL':
    case 'QUINTAL':
      return 'Qtl';
    case 'TON':
    case 'TONS':
      return 'Ton';
    case 'PLT':
    case 'PLATE':
      return 'Plt';
    case 'CUP':
    case 'CUPS':
      return 'Cup';
    case 'PR':
    case 'PAIR':
    case 'PAIRS':
      return 'Pr';
    case 'SET':
    case 'SETS':
      return 'Set';
    case 'M':
    case 'METER':
    case 'METERS':
      return 'M';
    case 'SQFT':
    case 'SQ FT':
      return 'Sqft';
    default:
      if (upper.length === 1) return upper;
      return upper.charAt(0) + upper.slice(1).toLowerCase();
  }
}

