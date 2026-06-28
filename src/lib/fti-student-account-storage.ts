import type { StudentAccount } from "@/types/student-account";
import { getDummyFtiStudentAccounts } from "@/data/dummy-fti-student-accounts";
import { getKelasNameById, seedKelasIfEmpty } from "@/lib/fti-kelas-storage";

const STORAGE_KEY = "flora_fti_student_accounts_v1";
const ID_COUNTER_KEY = "flora_fti_student_id_counter";
const SEED_FLAG = "flora_fti_student_accounts_seeded_v1";
const MIN_DUMMY_STUDENTS = 5;

function loadRaw(): StudentAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StudentAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRaw(list: StudentAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function nextUserId(): number {
  if (typeof window === "undefined") return Date.now();
  const current = Number(localStorage.getItem(ID_COUNTER_KEY) || "1000");
  const next = current + 1;
  localStorage.setItem(ID_COUNTER_KEY, String(next));
  return next;
}

function withKelasLabel(u: StudentAccount): StudentAccount {
  return {
    ...u,
    kelas: getKelasNameById(u.id_kelas) ?? u.kelas ?? null,
  };
}

function countStudents(list: StudentAccount[]) {
  return list.filter((u) => Number(u.is_admin) === 0).length;
}

/** Isi akun siswa dummy jika belum ada minimal 5 siswa (demo FE). */
export function seedStudentAccountsIfEmpty(): StudentAccount[] {
  if (typeof window === "undefined") return [];
  seedKelasIfEmpty();

  let list = loadRaw();
  if (countStudents(list) >= MIN_DUMMY_STUDENTS) {
    return list;
  }

  const existingNames = new Set(list.map((u) => u.user_name.toUpperCase()));
  let maxId = list.reduce((max, u) => Math.max(max, u.user_id), 1000);

  for (const dummy of getDummyFtiStudentAccounts()) {
    if (existingNames.has(dummy.user_name.toUpperCase())) continue;
    maxId += 1;
    list.push({
      ...dummy,
      user_id: maxId,
      kelas: getKelasNameById(dummy.id_kelas) ?? dummy.kelas ?? null,
    });
    existingNames.add(dummy.user_name.toUpperCase());
  }

  localStorage.setItem(ID_COUNTER_KEY, String(maxId + 1));
  saveRaw(list);
  localStorage.setItem(SEED_FLAG, "1");
  return list;
}

export function loadAllStudents(): StudentAccount[] {
  seedKelasIfEmpty();
  seedStudentAccountsIfEmpty();
  return loadRaw()
    .filter((u) => Number(u.is_admin) === 0)
    .map(withKelasLabel);
}

export function loadActiveStudents(): StudentAccount[] {
  return loadAllStudents().filter((u) => Number(u.is_active) === 1);
}

export function loadInactiveStudents(): StudentAccount[] {
  return loadAllStudents()
    .filter((u) => Number(u.is_active) === 0)
    .map((u) => ({ ...u, id_kelas: null, kelas: null }));
}

export function createStudentBatch(
  rows: Array<{ name: string; user_name: string; user_password: string; is_admin?: number }>,
): number {
  const list = loadRaw();
  const existingNames = new Set(list.map((u) => u.user_name.toUpperCase()));
  let created = 0;

  for (const row of rows) {
    const user_name = row.user_name.trim().toUpperCase();
    if (!user_name || existingNames.has(user_name)) continue;
    list.push({
      user_id: nextUserId(),
      name: row.name.trim().toUpperCase(),
      user_name,
      password: row.user_password,
      is_admin: row.is_admin ?? 0,
      is_active: 1,
      id_kelas: null,
      kelas: null,
    });
    existingNames.add(user_name);
    created++;
  }

  saveRaw(list);
  return created;
}

export function updateStudentPassword(user_id: number, password: string) {
  const list = loadRaw();
  const idx = list.findIndex((u) => u.user_id === user_id);
  if (idx < 0) return false;
  list[idx].password = password;
  saveRaw(list);
  return true;
}

export function updateStudentName(user_id: number, name: string) {
  const list = loadRaw();
  const idx = list.findIndex((u) => u.user_id === user_id);
  if (idx < 0) return false;
  list[idx].name = name.trim().toUpperCase();
  saveRaw(list);
  return true;
}

export function setStudentActive(user_id: number, is_active: number) {
  const list = loadRaw();
  const idx = list.findIndex((u) => u.user_id === user_id);
  if (idx < 0) return false;
  list[idx].is_active = is_active;
  if (is_active === 0) {
    list[idx].id_kelas = null;
    list[idx].kelas = null;
  }
  saveRaw(list);
  return true;
}

export function hardDeleteStudent(user_id: number) {
  saveRaw(loadRaw().filter((u) => u.user_id !== user_id));
}

export function assignStudentKelas(user_id: number, id_kelas: number | null) {
  const list = loadRaw();
  const idx = list.findIndex((u) => u.user_id === user_id);
  if (idx < 0) return false;
  list[idx].id_kelas = id_kelas;
  list[idx].kelas = getKelasNameById(id_kelas);
  saveRaw(list);
  return true;
}

export function bulkAssignKelas(user_ids: number[], id_kelas: number | null) {
  const list = loadRaw();
  const idSet = new Set(user_ids);
  for (const u of list) {
    if (!idSet.has(u.user_id)) continue;
    u.id_kelas = id_kelas;
    u.kelas = getKelasNameById(id_kelas);
  }
  saveRaw(list);
}

/** Snapshot untuk preview NIM — semua siswa (aktif + nonaktif). */
export function loadStudentUserNameSnapshot(): Array<{ user_name?: string; is_admin?: number }> {
  return loadRaw().map((u) => ({ user_name: u.user_name, is_admin: u.is_admin }));
}
