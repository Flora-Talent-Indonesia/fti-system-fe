import type { KelasRecord } from "@/types/student-account";

const STORAGE_KEY = "flora_fti_kelas_v1";
const SEED_FLAG = "flora_fti_kelas_seeded_v1";
const ADMIN_LABEL = "Admin FTI";

function nowIso() {
  return new Date().toISOString();
}

export function loadKelasList(): KelasRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as KelasRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveKelasList(list: KelasRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function seedKelasIfEmpty(): KelasRecord[] {
  if (typeof window === "undefined") return [];
  if (localStorage.getItem(SEED_FLAG) === "1") {
    const existing = loadKelasList();
    if (existing.length > 0) return existing;
  }
  const base = nowIso();
  const seeded: KelasRecord[] = [
    {
      id_kelas: 1,
      nama_kelas: "Kelas A",
      is_active: 1,
      created_at: base,
      created_by: ADMIN_LABEL,
      edit_at: null,
      edit_by: null,
      delete_at: null,
      delete_by: null,
    },
    {
      id_kelas: 2,
      nama_kelas: "Kelas N4 Sore",
      is_active: 1,
      created_at: base,
      created_by: ADMIN_LABEL,
      edit_at: null,
      edit_by: null,
      delete_at: null,
      delete_by: null,
    },
  ];
  saveKelasList(seeded);
  localStorage.setItem(SEED_FLAG, "1");
  return seeded;
}

function nextKelasId(list: KelasRecord[]) {
  return list.length ? Math.max(...list.map((k) => k.id_kelas)) + 1 : 1;
}

export function createKelas(nama_kelas: string): KelasRecord {
  const list = loadKelasList();
  const row: KelasRecord = {
    id_kelas: nextKelasId(list),
    nama_kelas: nama_kelas.trim(),
    is_active: 1,
    created_at: nowIso(),
    created_by: ADMIN_LABEL,
    edit_at: null,
    edit_by: null,
    delete_at: null,
    delete_by: null,
  };
  saveKelasList([...list, row]);
  return row;
}

export function updateKelas(id_kelas: number, nama_kelas: string) {
  const list = loadKelasList();
  const idx = list.findIndex((k) => k.id_kelas === id_kelas);
  if (idx < 0) return null;
  list[idx] = {
    ...list[idx],
    nama_kelas: nama_kelas.trim(),
    edit_at: nowIso(),
    edit_by: ADMIN_LABEL,
  };
  saveKelasList(list);
  return list[idx];
}

export function deactivateKelas(id_kelas: number) {
  const list = loadKelasList();
  const idx = list.findIndex((k) => k.id_kelas === id_kelas);
  if (idx < 0) return null;
  list[idx] = {
    ...list[idx],
    is_active: 0,
    delete_at: nowIso(),
    delete_by: ADMIN_LABEL,
  };
  saveKelasList(list);
  return list[idx];
}

export function activateKelas(id_kelas: number) {
  const list = loadKelasList();
  const idx = list.findIndex((k) => k.id_kelas === id_kelas);
  if (idx < 0) return null;
  list[idx] = {
    ...list[idx],
    is_active: 1,
    edit_at: nowIso(),
    edit_by: ADMIN_LABEL,
    delete_at: null,
    delete_by: null,
  };
  saveKelasList(list);
  return list[idx];
}

export function hardDeleteKelas(id_kelas: number) {
  const list = loadKelasList().filter((k) => k.id_kelas !== id_kelas);
  saveKelasList(list);
}

export function getKelasNameById(id_kelas: number | null | undefined): string | null {
  if (id_kelas == null) return null;
  return loadKelasList().find((k) => k.id_kelas === id_kelas)?.nama_kelas ?? null;
}
