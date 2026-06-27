import type { LpkStudentRecord } from "@/types/lpk-student";
import { getDummyLpkStudents } from "@/data/dummy-lpk-students";

const STORAGE_KEY = "flora_lpk_mitra_students_v1";
const SEED_FLAG_KEY = "flora_lpk_mitra_seeded_v5";
const SEED_VERSION = "8";

export function loadLpkStudents(): LpkStudentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LpkStudentRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLpkStudents(students: LpkStudentRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

export function upsertLpkStudent(student: LpkStudentRecord) {
  const list = loadLpkStudents();
  const idx = list.findIndex((s) => s.id === student.id);
  if (idx >= 0) list[idx] = student;
  else list.push(student);
  saveLpkStudents(list);
  return list;
}

export function deleteLpkStudent(id: string) {
  const list = loadLpkStudents().filter((s) => s.id !== id);
  saveLpkStudents(list);
  return list;
}

export function getLpkStudentById(id: string): LpkStudentRecord | undefined {
  return loadLpkStudents().find((s) => s.id === id);
}

/** URL halaman CV + dokumen siswa (FTI admin). */
export function ftiStudentProfileUrl(studentId: string): string {
  return `/fti/siswa/${studentId}`;
}

/** URL halaman CV siswa (portal YS). */
export function ysStudentCvUrl(studentId: string): string {
  return `/ys/siswa/${studentId}`;
}

/** URL bagian sertifikat pada halaman siswa YS. */
export function ysStudentSertifikatUrl(studentId: string): string {
  return `/ys/siswa/${studentId}#sertifikat`;
}

/** Isi / perbarui localStorage dengan data dummy (FE demo). */
export function seedLpkStudentsIfEmpty(): LpkStudentRecord[] {
  if (typeof window === "undefined") return [];
  const version = localStorage.getItem(SEED_FLAG_KEY);
  if (version === SEED_VERSION) {
    const existing = loadLpkStudents();
    if (existing.length > 0) return existing;
  }
  const seeded = getDummyLpkStudents();
  saveLpkStudents(seeded);
  localStorage.setItem(SEED_FLAG_KEY, SEED_VERSION);
  return seeded;
}

export function nextNoPeserta(): string {
  const year = new Date().getFullYear();
  const list = loadLpkStudents();
  const nums = list
    .map((s) => {
      const m = s.no_peserta.match(new RegExp(`FTI-${year}-(\\d+)`));
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `FTI-${year}-${String(next).padStart(3, "0")}`;
}
