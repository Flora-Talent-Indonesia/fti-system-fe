/**
 * Libur nasional Indonesia 2026 yang dipakai untuk jatuh tempo cicilan.
 * Tanggal keagamaan mengikuti kalender yang umum dipakai untuk tahun 2026.
 * Finance tetap bisa mengisi tanggal jatuh tempo sendiri saat membuat invoice.
 */
const HOLIDAYS_2026 = new Set([
  "2026-01-01",
  "2026-01-16",
  "2026-02-17",
  "2026-03-19",
  "2026-03-20",
  "2026-03-21",
  "2026-04-03",
  "2026-05-01",
  "2026-05-14",
  "2026-05-27",
  "2026-05-28",
  "2026-06-01",
  "2026-06-16",
  "2026-08-17",
  "2026-08-25",
  "2026-12-25",
]);

function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isIndonesianBusinessDay(date: Date): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  return !HOLIDAYS_2026.has(isoDate(date));
}

/** Tanggal 1, digeser ke hari kerja berikutnya bila jatuh pada akhir pekan atau libur Indonesia. */
export function firstBusinessDayOfMonth(year: number, monthIndex: number): string {
  const date = new Date(year, monthIndex, 1);
  while (!isIndonesianBusinessDay(date)) {
    date.setDate(date.getDate() + 1);
  }
  return isoDate(date);
}

export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1 + months, d);
  return isoDate(date);
}
