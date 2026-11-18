import type { KelasCabang, KelasJalur, KelasRecord } from "@/types/student-account";

export const KELAS_CABANG: KelasCabang[] = ["Bogor", "Jakarta"];
export const KELAS_JALUR: { id: KelasJalur; label: string }[] = [
  { id: "magang", label: "Magang" },
  { id: "tg", label: "Flora Ikusei" },
  { id: "reguler", label: "Reguler" },
  { id: "job_matching", label: "Job Matching Driver" },
];

export function jalurLabel(jalur: KelasJalur | null | undefined) {
  return KELAS_JALUR.find((item) => item.id === jalur)?.label ?? "Belum diisi";
}

export const PERTEMUAN_RULES: Record<
  "magang" | "tg",
  { defaultSessions: number; min: number; max: number; hint: string }
> = {
  magang: { defaultSessions: 80, min: 10, max: 200, hint: "Default 80 pertemuan. Bisa diubah." },
  tg: { defaultSessions: 160, min: 160, max: 200, hint: "160–200 pertemuan." },
};

/** Reguler memakai aturan pertemuan yang sama dengan Flora Ikusei. */
export function pertemuanFamily(jalur: KelasJalur | "" | null | undefined): "magang" | "tg" | null {
  if (jalur === "magang") return "magang";
  if (jalur === "tg" || jalur === "reguler") return "tg";
  return null;
}

export function pertemuanRule(jalur: KelasJalur | "" | null | undefined) {
  const family = pertemuanFamily(jalur);
  return family ? PERTEMUAN_RULES[family] : null;
}

export function clampPertemuan(jalur: KelasJalur | "" | null | undefined, value: number) {
  const family = pertemuanFamily(jalur);
  const rule = family ? PERTEMUAN_RULES[family] : PERTEMUAN_RULES.magang;
  if (!Number.isFinite(value)) return rule.defaultSessions;
  return Math.min(rule.max, Math.max(rule.min, Math.round(value)));
}

/** Jumlah kolom absensi untuk jalur ini. Kelas yang cocok dengan filter dipakai; kalau tidak ada, ambil yang terpanjang di jalur itu. */
export function meetingCountForTrack(
  list: KelasRecord[],
  jalur: "magang" | "tg",
  pusat: string,
  kelasName: string,
) {
  const rule = PERTEMUAN_RULES[jalur];
  const active = list.filter((row) => row.is_active === 1 && pertemuanFamily(row.jalur) === jalur);
  const narrowed = active.filter((row) => {
    if (pusat !== "Semua" && row.cabang !== pusat) return false;
    if (kelasName !== "Semua" && row.nama_kelas !== kelasName) return false;
    return true;
  });
  const pool = narrowed.length > 0 ? narrowed : active;
  const numbers = pool.map((row) =>
    typeof row.pertemuan === "number" ? clampPertemuan(jalur, row.pertemuan) : rule.defaultSessions,
  );
  if (numbers.length === 0) return rule.defaultSessions;
  return Math.max(...numbers);
}

export function guruJalurMode(jalur: KelasJalur | null | undefined): "magang" | "tg" | "driver" {
  if (jalur === "tg" || jalur === "reguler") return "tg";
  if (jalur === "job_matching") return "driver";
  return "magang";
}

export function attendanceTrackForJalur(jalur: KelasJalur | null | undefined): "magang" | "ikusei" | "driver" {
  if (jalur === "tg" || jalur === "reguler") return "ikusei";
  if (jalur === "job_matching") return "driver";
  return "magang";
}

/** Kelas aktif di TC yang sedang dipilih. TC Semua menampilkan kedua pusat. */
export function visibleKelas(list: KelasRecord[], pusat: string) {
  return list
    .filter((row) => row.is_active === 1 && (pusat === "Semua" || row.cabang === pusat))
    .sort((left, right) => {
      const cabang = (left.cabang || "").localeCompare(right.cabang || "", "id");
      if (cabang !== 0) return cabang;
      return left.nama_kelas.localeCompare(right.nama_kelas, "id");
    });
}

export function kelasSelectLabel(kelas: KelasRecord, options: KelasRecord[]) {
  const duplicated = options.filter((row) => row.nama_kelas === kelas.nama_kelas).length > 1;
  if (duplicated && kelas.cabang) return `${kelas.cabang} · ${kelas.nama_kelas}`;
  return kelas.nama_kelas;
}

/** Siswa roster ikut nama kelas dan TC. Semua hanya menggabungkan kelas pada jalur yang sedang terbuka. */
export function studentMatchesOpenKelas(
  list: KelasRecord[],
  student: { kelas: string; pusat: string },
  pusat: string,
  jalur: KelasJalur,
  pick: string,
) {
  if (!pick.startsWith("id:")) return false;
  if (pusat !== "Semua" && student.pusat !== pusat) return false;
  const kelas = list.find((row) => row.is_active === 1 && String(row.id_kelas) === pick.slice(3));
  if (!kelas || kelas.jalur !== jalur) return false;
  return student.kelas === kelas.nama_kelas && student.pusat === kelas.cabang;
}

export function kelasPlacementLabel(kelas: Pick<KelasRecord, "cabang" | "nama_kelas" | "jalur">) {
  return `${kelas.cabang || "Belum diisi"} · ${kelas.nama_kelas} · ${jalurLabel(kelas.jalur)}`;
}

const STORAGE_KEY = "flora_fti_kelas_v1";
const SEED_FLAG = "flora_fti_kelas_seeded_v1";
const ADMIN_LABEL = "Admin FTI";

/** Satu kelas Magang, TG, dan Driver di tiap TC. */
export const DUMMY_KELAS_SPEC: Array<{
  id_kelas: number;
  nama_kelas: string;
  cabang: KelasCabang;
  jalur: KelasJalur;
}> = [
  { id_kelas: 1, nama_kelas: "Kelas Magang 1", cabang: "Bogor", jalur: "magang" },
  { id_kelas: 2, nama_kelas: "Kelas TG 1", cabang: "Bogor", jalur: "tg" },
  { id_kelas: 3, nama_kelas: "Kelas Driver 1", cabang: "Bogor", jalur: "job_matching" },
  { id_kelas: 4, nama_kelas: "Kelas Magang 1", cabang: "Jakarta", jalur: "magang" },
  { id_kelas: 5, nama_kelas: "Kelas TG 1", cabang: "Jakarta", jalur: "tg" },
  { id_kelas: 6, nama_kelas: "Kelas Driver 1", cabang: "Jakarta", jalur: "job_matching" },
];

const LEGACY_RENAME: Record<string, { nama_kelas: string; jalur: KelasJalur }> = {
  "Bogor::kelas a": { nama_kelas: "Kelas Magang 1", jalur: "magang" },
  "Bogor::kelas n5 pagi": { nama_kelas: "Kelas TG 1", jalur: "tg" },
  "Bogor::kelas driver": { nama_kelas: "Kelas Driver 1", jalur: "job_matching" },
  "Jakarta::kelas a": { nama_kelas: "Kelas Magang 1", jalur: "magang" },
  "Jakarta::kelas n5 sore": { nama_kelas: "Kelas TG 1", jalur: "tg" },
  "Jakarta::kelas driver": { nama_kelas: "Kelas Driver 1", jalur: "job_matching" },
};

const LEGACY_RETIRE = new Set([
  "Bogor::kelas b",
  "Bogor::kelas c",
  "Bogor::kelas n4 pagi",
  "Jakarta::kelas b",
  "Jakarta::kelas c",
  "Jakarta::kelas n4 sore",
]);

function nowIso() {
  return new Date().toISOString();
}

function examplePlacement(row: KelasRecord): KelasRecord {
  if (row.cabang && row.jalur) return row;
  if (row.nama_kelas === "Kelas A") {
    return { ...row, cabang: row.cabang ?? "Bogor", jalur: row.jalur ?? "magang" };
  }
  if (row.nama_kelas === "Kelas N4 Sore") {
    return { ...row, cabang: row.cabang ?? "Jakarta", jalur: row.jalur ?? "tg" };
  }
  return row;
}

function kelasKey(cabang: string | null | undefined, nama: string) {
  return `${cabang || ""}::${nama.trim().toLowerCase()}`;
}

function legacyMeetingDefaults(): { magang: number; tg: number } {
  const base = {
    magang: PERTEMUAN_RULES.magang.defaultSessions,
    tg: PERTEMUAN_RULES.tg.defaultSessions,
  };
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem("guru-dashboard-absensi");
    if (!raw) return base;
    const parsed = JSON.parse(raw) as { counts?: { magang?: number; ikusei?: number } };
    return {
      magang: clampPertemuan("magang", typeof parsed.counts?.magang === "number" ? parsed.counts.magang : base.magang),
      tg: clampPertemuan("tg", typeof parsed.counts?.ikusei === "number" ? parsed.counts.ikusei : base.tg),
    };
  } catch {
    return base;
  }
}

function withPertemuan(row: KelasRecord, legacy: { magang: number; tg: number }): KelasRecord {
  const family = pertemuanFamily(row.jalur);
  if (!family) {
    return row.pertemuan == null ? row : { ...row, pertemuan: null };
  }
  if (typeof row.pertemuan === "number" && Number.isFinite(row.pertemuan)) {
    const clamped = clampPertemuan(row.jalur, row.pertemuan);
    return clamped === row.pertemuan ? row : { ...row, pertemuan: clamped };
  }
  return { ...row, pertemuan: legacy[family] };
}

function blankKelas(
  spec: (typeof DUMMY_KELAS_SPEC)[number],
  id_kelas: number,
  created_at: string,
  pertemuan?: number | null,
): KelasRecord {
  const rule = pertemuanRule(spec.jalur);
  return {
    id_kelas,
    nama_kelas: spec.nama_kelas,
    cabang: spec.cabang,
    jalur: spec.jalur,
    pertemuan: rule ? (pertemuan ?? rule.defaultSessions) : null,
    is_active: 1,
    created_at,
    created_by: ADMIN_LABEL,
    edit_at: null,
    edit_by: null,
    delete_at: null,
    delete_by: null,
  };
}

function retireKelas(row: KelasRecord, when: string): KelasRecord {
  return { ...row, is_active: 0, delete_at: row.delete_at ?? when, delete_by: row.delete_by ?? ADMIN_LABEL };
}

function withDummyKelas(list: KelasRecord[]): KelasRecord[] {
  const base = nowIso();
  const legacy = legacyMeetingDefaults();
  let changed = false;
  let next = list.map((row, index) => {
    const placed = withPertemuan(examplePlacement(row), legacy);
    if (
      placed.cabang !== list[index]?.cabang ||
      placed.jalur !== list[index]?.jalur ||
      placed.pertemuan !== list[index]?.pertemuan
    ) {
      changed = true;
    }
    return placed;
  });

  const occupied = new Set(next.map((row) => kelasKey(row.cabang, row.nama_kelas)));
  next = next.map((row) => {
    const key = kelasKey(row.cabang, row.nama_kelas);
    const rename = LEGACY_RENAME[key];
    if (rename) {
      const target = kelasKey(row.cabang, rename.nama_kelas);
      if (occupied.has(target) && target !== key) {
        changed = true;
        return retireKelas(row, base);
      }
      occupied.delete(key);
      occupied.add(target);
      changed = true;
      return withPertemuan({ ...row, nama_kelas: rename.nama_kelas, jalur: rename.jalur, is_active: 1 }, legacy);
    }
    if (LEGACY_RETIRE.has(key) && row.is_active === 1) {
      changed = true;
      return retireKelas(row, base);
    }
    return row;
  });

  const taken = new Set(next.map((row) => row.id_kelas));
  const names = new Set(next.filter((row) => row.is_active === 1).map((row) => kelasKey(row.cabang, row.nama_kelas)));
  for (const spec of DUMMY_KELAS_SPEC) {
    const key = kelasKey(spec.cabang, spec.nama_kelas);
    if (names.has(key)) continue;
    let id_kelas = spec.id_kelas;
    if (taken.has(id_kelas)) id_kelas = Math.max(0, ...taken) + 1;
    taken.add(id_kelas);
    names.add(key);
    const family = pertemuanFamily(spec.jalur);
    const seededMeetings = family ? legacy[family] : null;
    next = [...next, blankKelas(spec, id_kelas, base, seededMeetings)];
    changed = true;
  }

  if (changed) saveKelasList(next);
  return next;
}

export function loadKelasList(): KelasRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as KelasRecord[];
    if (!Array.isArray(parsed)) return [];
    return withDummyKelas(parsed);
  } catch {
    return [];
  }
}

export function findKelasId(cabang: KelasCabang, nama_kelas: string): number | null {
  const key = kelasKey(cabang, nama_kelas);
  return loadKelasList().find((kelas) => kelasKey(kelas.cabang, kelas.nama_kelas) === key)?.id_kelas ?? null;
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
  const seeded = DUMMY_KELAS_SPEC.map((spec) => blankKelas(spec, spec.id_kelas, base));
  saveKelasList(seeded);
  localStorage.setItem(SEED_FLAG, "1");
  return seeded;
}

function nextKelasId(list: KelasRecord[]) {
  return list.length ? Math.max(...list.map((k) => k.id_kelas)) + 1 : 1;
}

export function kelasNameTaken(cabang: KelasCabang, nama_kelas: string, exceptId?: number) {
  const nama = nama_kelas.trim().toLowerCase();
  return loadKelasList().some(
    (kelas) =>
      kelas.id_kelas !== exceptId &&
      kelas.cabang === cabang &&
      kelas.nama_kelas.trim().toLowerCase() === nama,
  );
}

export function createKelas(
  nama_kelas: string,
  cabang: KelasCabang,
  jalur: KelasJalur,
  pertemuan: number | null = null,
): KelasRecord {
  const list = loadKelasList();
  const rule = pertemuanRule(jalur);
  const row: KelasRecord = {
    id_kelas: nextKelasId(list),
    nama_kelas: nama_kelas.trim(),
    cabang,
    jalur,
    pertemuan: rule ? clampPertemuan(jalur, pertemuan ?? rule.defaultSessions) : null,
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

export function updateKelas(
  id_kelas: number,
  nama_kelas: string,
  cabang: KelasCabang,
  jalur: KelasJalur,
  pertemuan: number | null = null,
) {
  const list = loadKelasList();
  const idx = list.findIndex((k) => k.id_kelas === id_kelas);
  if (idx < 0) return null;
  const rule = pertemuanRule(jalur);
  list[idx] = {
    ...list[idx],
    nama_kelas: nama_kelas.trim(),
    cabang,
    jalur,
    pertemuan: rule ? clampPertemuan(jalur, pertemuan ?? list[idx].pertemuan ?? rule.defaultSessions) : null,
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
  const kelas = loadKelasList().find((k) => k.id_kelas === id_kelas);
  return kelas ? kelasPlacementLabel(kelas) : null;
}
