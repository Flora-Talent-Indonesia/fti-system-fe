/** Angka urut: lebar minimum, lalu tembus tanpa dipotong (99 → 100 → 1000). */
export function runningDigits(n: number, minWidth: number): string {
  const value = Math.max(1, Math.floor(Number.isFinite(n) ? n : 1));
  const raw = String(value);
  return raw.length >= minWidth ? raw : raw.padStart(minWidth, "0");
}

/** Route daftar siswa: lpk-01, lpk-100, lpk-1000. */
export function lpkRouteId(order: number): string {
  return `lpk-${runningDigits(order, 2)}`;
}

/** Kode mitra yang tampil: MFTI01, MFTI100. */
export function lpkPublicId(order: number): string {
  return `MFTI${runningDigits(order, 2)}`;
}

/** ID peserta mitra: MFTI01001, MFTI011000. */
export function mitraStudentId(lpkCode: string, order: number): string {
  return `${lpkCode}${runningDigits(order, 3)}`;
}

/** ID peserta FTI: FTI05001. Angkatan selalu 2 digit terakhir. */
export function ftiStudentId(angkatan: string, order: number): string {
  const digits = String(angkatan || "").replace(/\D/g, "");
  const cohort = digits.length > 2 ? digits.slice(-2) : runningDigits(Number(digits || "5"), 2);
  return `FTI${cohort}${runningDigits(order, 3)}`;
}

export function nextSequence(ids: string[], prefix: string): number {
  const head = prefix.toUpperCase();
  let max = 0;
  for (const id of ids) {
    const value = id.trim().toUpperCase();
    if (!value.startsWith(head)) continue;
    const tail = value.slice(head.length);
    if (!/^\d+$/.test(tail)) continue;
    max = Math.max(max, Number(tail));
  }
  return max + 1;
}

export function nextMitraStudentId(lpkCode: string, existing: string[]): string {
  return mitraStudentId(lpkCode, nextSequence(existing, lpkCode));
}

export function ftiCohortPrefix(angkatan: string): string {
  return ftiStudentId(angkatan, 1).slice(0, -3);
}

export function nextFtiStudentId(angkatan: string, existing: string[]): string {
  return ftiStudentId(angkatan, nextSequence(existing, ftiCohortPrefix(angkatan)));
}

export function lpkOrderOf(id: string, code?: string): number {
  const fromCode = code?.match(/^MFTI(\d+)$/i);
  if (fromCode) return Number(fromCode[1]);
  const fromRoute = id.match(/^lpk-(\d+)$/i);
  return fromRoute ? Number(fromRoute[1]) : 0;
}
