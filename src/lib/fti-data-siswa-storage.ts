import type { CVData } from "@/components/cv-form/types";
import type { LpkStudentRecord } from "@/types/lpk-student";
import { createDummyCvDraft } from "@/data/dummy-cv-draft";
import { buildFtiDummyProfiles } from "@/data/dummy-fti-students";
import { cvDataToLpkStudent, lpkStudentToCvData } from "@/lib/cv-to-lpk-student";
import { mergeCvData } from "@/lib/daftar-pribadi-storage";
import { emojiAvatarDataUrl } from "@/lib/emoji-avatar";
import { toKatakana } from "@/lib/katakana-master";

const REGISTRY_KEY = "flora_fti_data_siswa_registry_v1";
const SEED_FLAG = "flora_fti_data_siswa_seeded_v1";
const SEED_VERSION = "4";
const DAFTAR_PRIBADI_CV_KEY = "flora_daftar_pribadi_cv_v1";

export type FtiDataSiswaAdmin = {
  angkatan: string;
  kelas: string;
  asal: string;
  asal_lpk: string;
  nama_kumiai: string;
  nama_perusahaan: string;
  jenis_pekerjaan: string;
  mcu: string;
  mcu_pdf: string;
  tingkatan_pembelajaran: string;
  tanggal_kelulusan: string;
  perkiraan_masuk_jepang: string;
  tanggal_keberangkatan: string;
  program: string;
  hasil_job: string;
  n3: string;
  sim_jepang: string;
  assigned_alumni?: boolean;
  tanggal_mensetsu?: string;
  tanggal_naitei?: string;
  tsk?: string;
  tanggal_rekrut?: string;
  cert_jft_basic_a2?: string;
  cert_ssw_idn?: string;
  cert_ssw_jpn?: string;
  dokumen_paspor?: string;
  dokumen_visa?: string;
  dokumen_coe?: string;
  dokumen_ektkln?: string;
  estimasi_pulang?: string;
};

export type FtiDataSiswaEntry = {
  id: string;
  cv: CVData;
  admin: FtiDataSiswaAdmin;
  updated_at: string;
};

function defaultAdmin(partial?: Partial<FtiDataSiswaAdmin>): FtiDataSiswaAdmin {
  const year = new Date().getFullYear();
  return {
    angkatan: `Angkatan ${year}`,
    kelas: "",
    asal: "",
    asal_lpk: "Flora Talent Indonesia",
    nama_kumiai: "",
    nama_perusahaan: "",
    jenis_pekerjaan: "",
    mcu: "-",
    mcu_pdf: "",
    tingkatan_pembelajaran: "Pemula",
    tanggal_kelulusan: "",
    perkiraan_masuk_jepang: "",
    tanggal_keberangkatan: "",
    program: "",
    hasil_job: "",
    n3: "",
    sim_jepang: "",
    ...partial,
  };
}

function loadRegistry(): FtiDataSiswaEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FtiDataSiswaEntry[];
    if (!Array.isArray(parsed)) return [];
    let stripped = false;
    for (const entry of parsed) {
      if (entry.admin && "nama_so" in entry.admin) {
        delete entry.admin.nama_so;
        stripped = true;
      }
    }
    if (stripped) saveRegistry(parsed);
    return parsed;
  } catch {
    return [];
  }
}

function saveRegistry(entries: FtiDataSiswaEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(entries));
}

export function entryToLpkStudent(entry: FtiDataSiswaEntry): LpkStudentRecord {
  const base = cvDataToLpkStudent(entry.cv, {
    existingId: entry.id,
    asalLpk: entry.admin.asal_lpk,
    asal: entry.admin.asal,
    jenisPekerjaan: entry.admin.jenis_pekerjaan,
  });
  return {
    ...base,
    angkatan: entry.admin.angkatan,
    kelas: entry.admin.kelas ?? "",
    asal: entry.admin.asal || base.asal,
    asal_lpk: entry.admin.asal_lpk,
    nama_kumiai: entry.admin.nama_kumiai,
    nama_perusahaan: entry.admin.nama_perusahaan,
    jenis_pekerjaan: entry.admin.jenis_pekerjaan || base.jenis_pekerjaan,
    mcu: entry.admin.mcu,
    mcu_pdf: entry.admin.mcu_pdf || base.mcu_pdf,
    tingkatan_pembelajaran: entry.admin.tingkatan_pembelajaran,
    tanggal_kelulusan: entry.admin.tanggal_kelulusan,
    perkiraan_masuk_jepang: entry.admin.perkiraan_masuk_jepang,
    tanggal_keberangkatan: entry.admin.tanggal_keberangkatan,
    program: entry.admin.program ?? "",
    hasil_job: entry.admin.hasil_job ?? "",
    n3: entry.admin.n3 ?? "",
    sim_jepang: entry.admin.sim_jepang ?? "",
    assigned_alumni: entry.admin.assigned_alumni === true,
    tanggal_mensetsu: entry.admin.tanggal_mensetsu ?? "",
    tanggal_naitei: entry.admin.tanggal_naitei ?? "",
    tsk: entry.admin.tsk ?? "",
    tanggal_rekrut: entry.admin.tanggal_rekrut ?? "",
    cert_jft_basic_a2: entry.admin.cert_jft_basic_a2 ?? "",
    cert_ssw_idn: entry.admin.cert_ssw_idn ?? "",
    cert_ssw_jpn: entry.admin.cert_ssw_jpn ?? "",
    dokumen_paspor: entry.admin.dokumen_paspor ?? "",
    dokumen_visa: entry.admin.dokumen_visa ?? "",
    dokumen_coe: entry.admin.dokumen_coe ?? "",
    dokumen_ektkln: entry.admin.dokumen_ektkln ?? "",
    estimasi_pulang: entry.admin.estimasi_pulang ?? "",
  };
}

function lpkStudentToAdmin(student: LpkStudentRecord): FtiDataSiswaAdmin {
  return {
    angkatan: student.angkatan,
    kelas: student.kelas,
    asal: student.asal,
    asal_lpk: student.asal_lpk,
    nama_kumiai: student.nama_kumiai,
    nama_perusahaan: student.nama_perusahaan,
    jenis_pekerjaan: student.jenis_pekerjaan,
    mcu: student.mcu,
    mcu_pdf: student.mcu_pdf,
    tingkatan_pembelajaran: student.tingkatan_pembelajaran,
    tanggal_kelulusan: student.tanggal_kelulusan,
    perkiraan_masuk_jepang: student.perkiraan_masuk_jepang,
    tanggal_keberangkatan: student.tanggal_keberangkatan,
    program: student.program,
    hasil_job: student.hasil_job,
    n3: student.n3,
    sim_jepang: student.sim_jepang,
    assigned_alumni: student.assigned_alumni === true,
    tanggal_mensetsu: student.tanggal_mensetsu ?? "",
    tanggal_naitei: student.tanggal_naitei ?? "",
    tsk: student.tsk ?? "",
    tanggal_rekrut: student.tanggal_rekrut ?? "",
    cert_jft_basic_a2: student.cert_jft_basic_a2 ?? "",
    cert_ssw_idn: student.cert_ssw_idn ?? "",
    cert_ssw_jpn: student.cert_ssw_jpn ?? "",
    dokumen_paspor: student.dokumen_paspor ?? "",
    dokumen_visa: student.dokumen_visa ?? "",
    dokumen_coe: student.dokumen_coe ?? "",
    dokumen_ektkln: student.dokumen_ektkln ?? "",
    estimasi_pulang: student.estimasi_pulang ?? "",
  };
}

export function upsertFtiDataSiswaFromCv(cv: CVData, adminPartial?: Partial<FtiDataSiswaAdmin>) {
  const no = cv.informasi_dasar.no_peserta.trim();
  if (!no) return;
  const list = loadRegistry();
  const idx = list.findIndex((e) => e.id === no || e.cv.informasi_dasar.no_peserta === no);
  const entry: FtiDataSiswaEntry = {
    id: no,
    cv: mergeCvData(cv),
    admin: idx >= 0 ? { ...list[idx].admin, ...adminPartial } : defaultAdmin(adminPartial),
    updated_at: new Date().toISOString(),
  };
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  saveRegistry(list);
}

export function upsertFtiDataSiswaFromLpkStudent(student: LpkStudentRecord) {
  const cv = lpkStudentToCvData(student);
  upsertFtiDataSiswaFromCv(cv, lpkStudentToAdmin(student));
}

function loadPersonalCv(): CVData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DAFTAR_PRIBADI_CV_KEY);
    if (!raw) return null;
    return mergeCvData(JSON.parse(raw) as Partial<CVData>);
  } catch {
    return null;
  }
}

function patchDummyPlacement(entries: FtiDataSiswaEntry[]): FtiDataSiswaEntry[] {
  const profiles = new Map(buildFtiDummyProfiles().map((profile) => [profile.no, profile]));
  let changed = false;
  const next = entries.map((entry) => {
    const profile = profiles.get(entry.id);
    if (!profile) return entry;
    const admin = entry.admin;
    const kumiai = profile.program === "ikusei" ? "Kumiai Sakura" : "TSK Kanto";
    const tingkat = profile.program === "tg" ? "N4" : "N5";
    if (
      admin.kelas === profile.kelas &&
      admin.angkatan === profile.angkatan &&
      admin.program === profile.program &&
      admin.jenis_pekerjaan === profile.job &&
      admin.nama_kumiai === kumiai &&
      admin.tingkatan_pembelajaran === tingkat
    ) {
      return entry;
    }
    changed = true;
    return {
      ...entry,
      admin: {
        ...admin,
        kelas: profile.kelas,
        angkatan: profile.angkatan,
        program: profile.program,
        jenis_pekerjaan: profile.job,
        nama_kumiai: kumiai,
        tingkatan_pembelajaran: tingkat,
      },
    };
  });
  if (changed) saveRegistry(next);
  return changed ? next : entries;
}

function seedRegistryIfEmpty(): FtiDataSiswaEntry[] {
  if (typeof window === "undefined") return [];
  const seeded = localStorage.getItem(SEED_FLAG);
  if (seeded === SEED_VERSION || seeded === "2") {
    const existing = loadRegistry();
    if (existing.length > 0) {
      const patched = patchDummyPlacement(existing);
      if (seeded !== SEED_VERSION) localStorage.setItem(SEED_FLAG, SEED_VERSION);
      return patched;
    }
  }

  const seeds: FtiDataSiswaEntry[] = buildFtiDummyProfiles().map((profile) => {
    const cv = createDummyCvDraft(profile.no);
    const first = profile.nama.split(" ")[0] ?? profile.nama;
    cv.meta.foto = emojiAvatarDataUrl(profile.gender === "L" ? "👨" : "👩");
    cv.informasi_dasar = {
      ...cv.informasi_dasar,
      no_peserta: profile.no,
      nik: `3201${profile.no.replace(/\D/g, "").padStart(12, "0").slice(-12)}`,
      nama_lengkap: profile.nama,
      nama_katakana: toKatakana(profile.nama),
      yobisho: toKatakana(first),
      jenis_kelamin: profile.gender === "L" ? "Laki-laki" : "Perempuan",
    };
    return {
      id: profile.no,
      cv,
      admin: defaultAdmin({
        angkatan: profile.angkatan,
        kelas: profile.kelas,
        asal: profile.asal,
        program: profile.program,
        jenis_pekerjaan: profile.job,
        hasil_job: profile.hasil,
        nama_kumiai: profile.program === "ikusei" ? "Kumiai Sakura" : "TSK Kanto",
        nama_perusahaan: profile.perusahaan,
        tingkatan_pembelajaran: profile.program === "tg" ? "N4" : "N5",
        tanggal_kelulusan: profile.hasil === "lulus" ? "2026-11-01" : "",
        perkiraan_masuk_jepang: "2027-04-01",
      }),
      updated_at: new Date().toISOString(),
    };
  });

  const personal = loadPersonalCv();
  if (personal?.informasi_dasar.no_peserta.trim()) {
    const no = personal.informasi_dasar.no_peserta.trim();
    const existingIdx = seeds.findIndex((s) => s.id === no);
    const entry: FtiDataSiswaEntry = {
      id: no,
      cv: personal,
      admin: existingIdx >= 0 ? seeds[existingIdx].admin : defaultAdmin(),
      updated_at: new Date().toISOString(),
    };
    if (existingIdx >= 0) seeds[existingIdx] = entry;
    else seeds.push(entry);
  }

  saveRegistry(seeds);
  localStorage.setItem(SEED_FLAG, SEED_VERSION);
  return seeds;
}

export function loadFtiDataSiswaStudents(): LpkStudentRecord[] {
  seedRegistryIfEmpty();
  const personal = loadPersonalCv();
  const no = personal?.informasi_dasar.no_peserta.trim() ?? "";
  if (personal && no) {
    const before = loadRegistry().find((entry) => entry.id === no || entry.cv.informasi_dasar.no_peserta === no);
    if (!before) upsertFtiDataSiswaFromCv(personal);
  }
  return loadRegistry().map(entryToLpkStudent);
}
