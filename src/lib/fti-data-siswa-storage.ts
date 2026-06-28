import type { CVData } from "@/components/cv-form/types";
import type { LpkStudentRecord } from "@/types/lpk-student";
import { createDummyCvDraft } from "@/data/dummy-cv-draft";
import { cvDataToLpkStudent, lpkStudentToCvData } from "@/lib/cv-to-lpk-student";
import { mergeCvData } from "@/lib/daftar-pribadi-storage";

const REGISTRY_KEY = "flora_fti_data_siswa_registry_v1";
const SEED_FLAG = "flora_fti_data_siswa_seeded_v1";
const DAFTAR_PRIBADI_CV_KEY = "flora_daftar_pribadi_cv_v1";

export type FtiDataSiswaAdmin = {
  angkatan: string;
  asal: string;
  asal_lpk: string;
  nama_so: string;
  nama_kumiai: string;
  nama_perusahaan: string;
  jenis_pekerjaan: string;
  mcu: string;
  mcu_pdf: string;
  tingkatan_pembelajaran: string;
  tanggal_kelulusan: string;
  perkiraan_masuk_jepang: string;
  tanggal_keberangkatan: string;
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
    asal: "",
    asal_lpk: "Flora Talent Indonesia",
    nama_so: "",
    nama_kumiai: "",
    nama_perusahaan: "",
    jenis_pekerjaan: "",
    mcu: "-",
    mcu_pdf: "",
    tingkatan_pembelajaran: "Pemula",
    tanggal_kelulusan: "",
    perkiraan_masuk_jepang: "",
    tanggal_keberangkatan: "",
    ...partial,
  };
}

function loadRegistry(): FtiDataSiswaEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FtiDataSiswaEntry[];
    return Array.isArray(parsed) ? parsed : [];
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
    asal: entry.admin.asal || base.asal,
    asal_lpk: entry.admin.asal_lpk,
    nama_so: entry.admin.nama_so,
    nama_kumiai: entry.admin.nama_kumiai,
    nama_perusahaan: entry.admin.nama_perusahaan,
    jenis_pekerjaan: entry.admin.jenis_pekerjaan || base.jenis_pekerjaan,
    mcu: entry.admin.mcu,
    mcu_pdf: entry.admin.mcu_pdf,
    tingkatan_pembelajaran: entry.admin.tingkatan_pembelajaran,
    tanggal_kelulusan: entry.admin.tanggal_kelulusan,
    perkiraan_masuk_jepang: entry.admin.perkiraan_masuk_jepang,
    tanggal_keberangkatan: entry.admin.tanggal_keberangkatan,
  };
}

function lpkStudentToAdmin(student: LpkStudentRecord): FtiDataSiswaAdmin {
  return {
    angkatan: student.angkatan,
    asal: student.asal,
    asal_lpk: student.asal_lpk,
    nama_so: student.nama_so,
    nama_kumiai: student.nama_kumiai,
    nama_perusahaan: student.nama_perusahaan,
    jenis_pekerjaan: student.jenis_pekerjaan,
    mcu: student.mcu,
    mcu_pdf: student.mcu_pdf,
    tingkatan_pembelajaran: student.tingkatan_pembelajaran,
    tanggal_kelulusan: student.tanggal_kelulusan,
    perkiraan_masuk_jepang: student.perkiraan_masuk_jepang,
    tanggal_keberangkatan: student.tanggal_keberangkatan,
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

function seedRegistryIfEmpty(): FtiDataSiswaEntry[] {
  if (typeof window === "undefined") return [];
  if (localStorage.getItem(SEED_FLAG) === "1") {
    const existing = loadRegistry();
    if (existing.length > 0) return existing;
  }

  const seeds: FtiDataSiswaEntry[] = [
    {
      id: "FTI-2026-101",
      cv: createDummyCvDraft("FTI-2026-101"),
      admin: defaultAdmin({
        angkatan: "Angkatan 2026",
        asal: "Sukabumi",
        jenis_pekerjaan: "Magang Manufaktur",
        tingkatan_pembelajaran: "Pemula",
      }),
      updated_at: new Date().toISOString(),
    },
    {
      id: "FTI-2026-102",
      cv: {
        ...createDummyCvDraft("FTI-2026-102"),
        informasi_dasar: {
          ...createDummyCvDraft("FTI-2026-102").informasi_dasar,
          nama_lengkap: "ANDI PRASETYO",
          nama_katakana: "アンディ・プラセティヨ",
          yobisho: "アンディ",
        },
      },
      admin: defaultAdmin({
        angkatan: "Angkatan 2026",
        asal: "Bandung",
        jenis_pekerjaan: "Magang Pertanian",
        mcu: "Fit to Work (Sehat/Bugar)",
        mcu_pdf: "mcu_andi_prasetyo.pdf",
      }),
      updated_at: new Date().toISOString(),
    },
  ];

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
  localStorage.setItem(SEED_FLAG, "1");
  return seeds;
}

export function loadFtiDataSiswaStudents(): LpkStudentRecord[] {
  seedRegistryIfEmpty();
  const personal = loadPersonalCv();
  if (personal?.informasi_dasar.no_peserta.trim()) {
    upsertFtiDataSiswaFromCv(personal);
  }
  return loadRegistry().map(entryToLpkStudent);
}
