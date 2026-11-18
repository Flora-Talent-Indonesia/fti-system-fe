import type { LpkStudentRecord } from "@/types/lpk-student";
import { getDummyLpkStudents } from "@/data/dummy-lpk-students";
import { nextFtiStudentId } from "@/lib/participant-id";

const STORAGE_KEY = "flora_lpk_mitra_students_v1";
const SEED_FLAG_KEY = "flora_lpk_mitra_seeded_v5";
const SEED_VERSION = "17";

export function loadLpkStudents(): LpkStudentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LpkStudentRecord[];
    if (!Array.isArray(parsed)) return [];
    let stripped = false;
    for (const student of parsed) {
      if ("nama_so" in student) {
        delete (student as { nama_so?: string }).nama_so;
        stripped = true;
      }
    }
    if (stripped) saveLpkStudents(parsed);
    return parsed;
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
  return deleteLpkStudents([id]);
}

export function deleteLpkStudents(ids: string[]) {
  const drop = new Set(ids);
  const list = loadLpkStudents().filter((student) => !drop.has(student.id));
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

function withAlumniExamples(list: LpkStudentRecord[]): LpkStudentRecord[] {
  const ids = new Set(list.map((student) => student.id));
  const missing = getDummyLpkStudents().filter((student) => student.id.startsWith("alumni-") && !ids.has(student.id));
  if (!missing.length) return list;
  const next = [...list, ...missing];
  saveLpkStudents(next);
  return next;
}

/** Isi / perbarui localStorage dengan data dummy (FE demo). */
export function seedLpkStudentsIfEmpty(): LpkStudentRecord[] {
  if (typeof window === "undefined") return [];
  const version = localStorage.getItem(SEED_FLAG_KEY);
  if (version === SEED_VERSION) {
    const existing = loadLpkStudents();
    if (existing.length > 0) return withAlumniExamples(existing);
  }
  const seeded = withAlumniExamples(getDummyLpkStudents());
  saveLpkStudents(seeded);
  localStorage.setItem(SEED_FLAG_KEY, SEED_VERSION);
  return seeded;
}

function existingParticipantIds(): string[] {
  const ids = loadLpkStudents().map((student) => student.no_peserta);
  if (typeof window === "undefined") return ids;
  try {
    const registry = localStorage.getItem("flora_fti_data_siswa_registry_v1");
    const entries = registry ? (JSON.parse(registry) as Array<{ id?: string; cv?: { informasi_dasar?: { no_peserta?: string } } }>) : [];
    if (Array.isArray(entries)) {
      for (const entry of entries) {
        if (entry.id) ids.push(entry.id);
        const no = entry.cv?.informasi_dasar?.no_peserta;
        if (no) ids.push(no);
      }
    }
  } catch {
    /* abaikan data rusak */
  }
  try {
    const accounts = localStorage.getItem("flora_fti_student_accounts_v1");
    const rows = accounts ? (JSON.parse(accounts) as Array<{ user_name?: string }>) : [];
    if (Array.isArray(rows)) {
      for (const row of rows) if (row.user_name) ids.push(row.user_name);
    }
  } catch {
    /* abaikan data rusak */
  }
  return ids;
}

export function nextNoPeserta(): string {
  const cohort = String(new Date().getFullYear()).slice(-2);
  return nextFtiStudentId(cohort, existingParticipantIds());
}
