export function darkenColor(hex: string, amount: number): string {
    // Remove the hash if it's there
    const cleanHex = hex.replace('#', '');
  
    // Parse the red, green, and blue values
    const r = Math.max(0, Math.min(255, parseInt(cleanHex.substring(0, 2), 16) - amount));
    const g = Math.max(0, Math.min(255, parseInt(cleanHex.substring(2, 4), 16) - amount));
    const b = Math.max(0, Math.min(255, parseInt(cleanHex.substring(4, 6), 16) - amount));
  
    // Convert back to hex and pad with zeros if necessary
    const darkerHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  
    return darkerHex;
  }
  