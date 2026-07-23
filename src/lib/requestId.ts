/**
 * Generates a human-readable request ID.
 * Format: NI-YYMMDD-XXXX (e.g. NI-250517-0012)
 */
export function generateRequestNumber(): string {
  const now = new Date();
  const year = String(now.getFullYear()).slice(2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `NI-${year}${month}${day}-${random}`;
}
