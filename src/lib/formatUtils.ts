/**
 * Format Date to standard DD.MM.YYYY format
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Format Date & Time to standard DD.MM.YYYY HH:mm format
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Generates an official unique ID in the format: ytch-xxxx-xx (or uppercase YTCH-XXXX-XX)
 */
export function formatUserCode(id: string | null | undefined, uppercase = false): string {
  if (!id) return uppercase ? "YTCH-0000-00" : "ytch-0000-00";

  // If already prefixed with ytch-
  const match = id.match(/ytch-([a-z0-9]{4})-([a-z0-9]{2})/i);
  if (match) {
    const res = `ytch-${match[1]}-${match[2]}`;
    return uppercase ? res.toUpperCase() : res.toLowerCase();
  }

  // Generate deterministic 6-character hex from uuid/string
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  let part1 = "0000";
  let part2 = "00";

  if (clean.length >= 6) {
    part1 = clean.slice(0, 4);
    part2 = clean.slice(4, 6);
  } else if (clean.length > 0) {
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      hash = (hash << 5) - hash + clean.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(6, "0");
    part1 = hex.slice(0, 4);
    part2 = hex.slice(4, 6);
  }

  const res = `ytch-${part1}-${part2}`;
  return uppercase ? res.toUpperCase() : res.toLowerCase();
}
