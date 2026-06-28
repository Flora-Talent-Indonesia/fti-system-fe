import type { CVData } from "@/components/cv-form/types";
import { defaultCVData } from "@/components/cv-form/defaults";

const CV_KEY = "flora_daftar_pribadi_cv_v1";

export function mergeCvData(partial: Partial<CVData> | null | undefined): CVData {
  if (!partial) return { ...defaultCVData };
  return {
    ...defaultCVData,
    ...partial,
    meta: { ...defaultCVData.meta, ...partial.meta },
    dokumen: { ...defaultCVData.dokumen, ...partial.dokumen },
    informasi_dasar: { ...defaultCVData.informasi_dasar, ...partial.informasi_dasar },
    fisik_kesehatan: { ...defaultCVData.fisik_kesehatan, ...partial.fisik_kesehatan },
    pendidikan: partial.pendidikan ?? defaultCVData.pendidikan,
    pekerjaan: partial.pekerjaan ?? defaultCVData.pekerjaan,
    sertifikat: partial.sertifikat ?? defaultCVData.sertifikat,
    keluarga: partial.keluarga ?? defaultCVData.keluarga,
  };
}

export function loadDaftarPribadiCv(): CVData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CV_KEY);
    if (!raw) return null;
    return mergeCvData(JSON.parse(raw) as Partial<CVData>);
  } catch {
    return null;
  }
}

export function saveDaftarPribadiCv(data: CVData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CV_KEY, JSON.stringify(data));
}

export function hasDaftarPribadiCv(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(CV_KEY));
}

export function getDaftarPribadiDisplayName(): string {
  const cv = loadDaftarPribadiCv();
  if (!cv) return "Siswa";
  return cv.informasi_dasar.nama_lengkap.trim() || cv.informasi_dasar.no_peserta.trim() || "Siswa";
}
