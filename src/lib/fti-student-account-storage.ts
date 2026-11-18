import type { KelasCabang, StudentAccount } from "@/types/student-account";
import { LPK_PARTNERS } from "@/data/mock";
import { getDummyFtiStudentAccounts } from "@/data/dummy-fti-student-accounts";
import { buildFtiDummyProfiles } from "@/data/dummy-fti-students";
import { findKelasId, getKelasNameById, seedKelasIfEmpty } from "@/lib/fti-kelas-storage";
import { seedLpkStudentsIfEmpty } from "@/lib/lpk-student-storage";
import { isAlumniByEntry } from "@/lib/placement";

const STORAGE_KEY = "flora_fti_student_accounts_v1";
const ID_COUNTER_KEY = "flora_fti_student_id_counter";
const SEED_FLAG = "flora_fti_student_accounts_seeded_v1";
const SEED_VERSION = "3";
const MIN_DUMMY_STUDENTS = 5;

/** Akun contoh lama memakai ID putus-putus. Pindahkan ke ID Peserta yang sama dengan data siswa. */
function migrateCollidingDemoAccounts(list: StudentAccount[]): StudentAccount[] {
  if (typeof window === "undefined") return list;
  if (localStorage.getItem(SEED_FLAG) === SEED_VERSION) return list;

  const targetByName = new Map(
    getDummyFtiStudentAccounts().map((account) => [account.name.toUpperCase(), account.user_name])
  );
  let changed = false;
  const next = list.map((account) => {
    const target = targetByName.get(account.name.toUpperCase());
    if (!target || account.user_name.toUpperCase() === target.toUpperCase()) return account;
    if (!/^FTI-\d{4}-\d+$/i.test(account.user_name)) return account;
    changed = true;
    return { ...account, user_name: target };
  });

  if (changed) saveRaw(next);
  if (countStudents(next) >= MIN_DUMMY_STUDENTS) {
    localStorage.setItem(SEED_FLAG, SEED_VERSION);
  }
  return next;
}

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

const LPK_PARTNER_NAMES = new Set(LPK_PARTNERS.map((partner) => partner.name));

/** Siswa LPK Mitra yang masih belajar mendapat akun, supaya bisa masuk kelas yang sama dengan siswa FTI. */
function ensureLpkMitraAccounts(list: StudentAccount[]): StudentAccount[] {
  if (typeof window === "undefined") return list;
  const existing = new Set(list.map((account) => account.user_name.toUpperCase()));
  let maxId = list.reduce((max, account) => Math.max(max, account.user_id), 1000);
  let changed = false;
  const next = [...list];

  for (const student of seedLpkStudentsIfEmpty()) {
    if (!LPK_PARTNER_NAMES.has(student.asal_lpk) || isAlumniByEntry(student)) continue;
    const user_name = student.no_peserta.trim().toUpperCase();
    if (!user_name) continue;
    const legacy = next.find(
      (account) =>
        account.name.trim().toUpperCase() === student.nama_lengkap.trim().toUpperCase() &&
        /^(FTI-\d{4}-\d+|LPK-|ALM-)/i.test(account.user_name),
    );
    if (legacy && legacy.user_name.toUpperCase() !== user_name) {
      existing.delete(legacy.user_name.toUpperCase());
      legacy.user_name = user_name;
      existing.add(user_name);
      changed = true;
      continue;
    }
    if (existing.has(user_name)) continue;
    maxId += 1;
    next.push({
      user_id: maxId,
      name: student.nama_lengkap.trim(),
      user_name,
      password: "Lpk2026!",
      is_admin: 0,
      is_active: 1,
      id_kelas: null,
      kelas: null,
    });
    existing.add(user_name);
    changed = true;
  }

  if (!changed) return list;
  localStorage.setItem(ID_COUNTER_KEY, String(maxId + 1));
  saveRaw(next);
  return next;
}

/** Isi akun siswa dummy jika belum ada minimal 5 siswa (demo FE). */
export function seedStudentAccountsIfEmpty(): StudentAccount[] {
  if (typeof window === "undefined") return [];
  seedKelasIfEmpty();

  let list = migrateCollidingDemoAccounts(loadRaw());
  const existingNames = new Set(list.map((u) => u.user_name.toUpperCase()));
  let maxId = list.reduce((max, u) => Math.max(max, u.user_id), 1000);
  let changed = false;

  const roster: StudentAccount[] = buildFtiDummyProfiles().map((profile, index) => {
    const cabang: KelasCabang = index < 15 ? "Bogor" : "Jakarta";
    const id_kelas = findKelasId(cabang, profile.kelas);
    return {
      user_id: 0,
      name: profile.nama,
      user_name: profile.no,
      password: "Fti2026!",
      is_admin: 0,
      is_active: 1,
      id_kelas,
      kelas: profile.kelas,
    };
  });

  for (const dummy of roster) {
    if (existingNames.has(dummy.user_name.toUpperCase())) continue;
    maxId += 1;
    list.push({
      ...dummy,
      user_id: maxId,
      kelas: getKelasNameById(dummy.id_kelas) ?? dummy.kelas ?? null,
    });
    existingNames.add(dummy.user_name.toUpperCase());
    changed = true;
  }

  if (!changed) return list;
  localStorage.setItem(ID_COUNTER_KEY, String(maxId + 1));
  saveRaw(list);
  localStorage.setItem(SEED_FLAG, SEED_VERSION);
  return list;
}

export function loadAllStudents(): StudentAccount[] {
  if (typeof window === "undefined") return [];
  seedKelasIfEmpty();
  seedStudentAccountsIfEmpty();
  return ensureLpkMitraAccounts(loadRaw())
    .filter((u) => Number(u.is_admin) === 0)
    .map(withKelasLabel);
}

export function loadActiveStudents(): StudentAccount[] {
  return loadAllStudents().filter((u) => Number(u.is_active) === 1);
}

export function loadInactiveStudents(): StudentAccount[] {
  return loadAllStudents().filter((u) => Number(u.is_active) === 0);
}

export function inactiveAccountNumbers(): Set<string> {
  return new Set(
    loadAllStudents()
      .filter((account) => Number(account.is_active) === 0)
      .map((account) => account.user_name.trim().toUpperCase())
      .filter(Boolean),
  );
}

export function isInactiveAccountNumber(no: string | null | undefined): boolean {
  const key = (no || "").trim().toUpperCase();
  return key.length > 0 && inactiveAccountNumbers().has(key);
}

/** Sembunyikan siswa yang akunnya nonaktif. Rekaman aslinya tidak dihapus. */
export function omitInactiveAccounts<T extends { no_peserta?: string | null }>(students: T[]): T[] {
  return omitInactiveByNumber(students, (student) => student.no_peserta);
}

export function omitInactiveByNumber<T>(rows: T[], numberOf: (row: T) => string | null | undefined): T[] {
  const hidden = inactiveAccountNumbers();
  if (hidden.size === 0) return rows;
  return rows.filter((row) => !hidden.has((numberOf(row) || "").trim().toUpperCase()));
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

/** Snapshot untuk preview ID Peserta — semua siswa (aktif + nonaktif). */
export function loadStudentUserNameSnapshot(): Array<{ user_name?: string; is_admin?: number }> {
  return loadRaw().map((u) => ({ user_name: u.user_name, is_admin: u.is_admin }));
}
