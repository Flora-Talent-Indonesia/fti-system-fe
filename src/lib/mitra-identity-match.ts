import { loadLpkStudents } from "@/lib/lpk-student-storage";
import type { LpkStudentRecord } from "@/types/lpk-student";

export type MitraIdentityMatch = {
  student: LpkStudentRecord;
  lpkName: string;
};

export function normalizePersonName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("id");
}

/** Samakan tanggal lahir ke YYYY-MM-DD supaya "2002-03-12" dan "12/03/2002" bertemu. */
export function normalizeBirthDate(value: string): string {
  const raw = value.trim();
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = raw.match(/^(\d{1,2})[/. -](\d{1,2})[/. -](\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  return raw;
}

export function findMitraIdentityMatch(
  namaAlphabet: string,
  tanggalLahir: string,
): MitraIdentityMatch | null {
  const name = normalizePersonName(namaAlphabet);
  const birth = normalizeBirthDate(tanggalLahir);
  if (!name || !birth) return null;

  const student = loadLpkStudents().find(
    (item) =>
      normalizePersonName(item.nama_lengkap) === name &&
      normalizeBirthDate(item.tanggal_lahir) === birth,
  );
  if (!student) return null;

  return {
    student,
    lpkName: student.asal_lpk?.trim() || "LPK Mitra",
  };
}

export function mitraIdentityWarning(match: MitraIdentityMatch): string {
  return `Siswa ini terdaftar di ${match.lpkName}. Data FTI tetap bisa disimpan. ID Peserta FTI terpisah dari data mitra.`;
}
