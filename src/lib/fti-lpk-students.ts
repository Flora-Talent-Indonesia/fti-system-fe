import { LPK_PARTNERS } from "@/data/mock";
import { getDummyLpkStudents } from "@/data/dummy-lpk-students";
import type { LpkStudentRecord } from "@/types/lpk-student";

export function getLpkPartnerById(id: string) {
  return LPK_PARTNERS.find((l) => l.id === id);
}

export function filterStudentsByLpkName(
  students: LpkStudentRecord[],
  lpkName: string
): LpkStudentRecord[] {
  return students.filter((s) => s.asal_lpk === lpkName);
}

/** Hitung siswa dummy per LPK (untuk kartu daftar). */
export function countDummyStudentsByLpkId(lpkId: string): number {
  const lpk = getLpkPartnerById(lpkId);
  if (!lpk) return 0;
  return getDummyLpkStudents().filter((s) => s.asal_lpk === lpk.name).length;
}

export function totalDummyStudents(): number {
  return getDummyLpkStudents().length;
}
