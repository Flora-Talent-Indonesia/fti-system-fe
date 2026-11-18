import type { CVData, Sertifikat } from "@/components/cv-form/types";
import { isPdfFileName } from "@/components/cv-form/file-upload-rules";
import { filterFilledPekerjaan } from "@/lib/pekerjaan-utils";
import {
  arrangePendidikan,
  isKeluargaFilled,
  isPendidikanFilled,
  PENDIDIKAN_SLOTS,
} from "@/lib/cv-slots";

export type CvFormErrors = Record<string, string>;
export const CV_MSG = "Harap pilih / isi field ini";

export function validateCvStep1(data: CVData): CvFormErrors {
  const e: CvFormErrors = {};
  const i = data.informasi_dasar;
  if (!data.meta.tanggal_pembuatan_cv) e.tanggal_pembuatan_cv = CV_MSG;
  if (!/^\d{16}$/.test(i.nik.trim())) e.nik = "NIK harus tepat 16 digit angka";
  if (!i.no_peserta?.trim()) e.no_peserta = CV_MSG;
  if (!i.nama_lengkap.trim()) e.nama_lengkap = CV_MSG;
  if (!i.nama_katakana.trim()) e.nama_katakana = CV_MSG;
  if (!i.yobisho.trim()) e.yobisho = CV_MSG;
  if (!i.umur.trim()) e.umur = CV_MSG;
  if (!i.jenis_kelamin) e.jenis_kelamin = CV_MSG;
  if (!i.kewarganegaraan.trim()) e.kewarganegaraan = CV_MSG;
  if (!i.tanggal_lahir) e.tanggal_lahir = CV_MSG;
  if (!i.golongan_darah) e.golongan_darah = CV_MSG;
  if (!i.agama) e.agama = CV_MSG;
  if (!i.status_pernikahan) e.status_pernikahan = CV_MSG;
  if (!i.kode_pos.trim()) e.kode_pos = CV_MSG;
  if (!i.nomor_telepon.trim() || i.nomor_telepon === "+62" || i.nomor_telepon === "+81") {
    e.nomor_telepon = CV_MSG;
  }
  if (!i.email.trim()) e.email = CV_MSG;
  if (!i.alamat_lengkap.trim()) e.alamat_lengkap = CV_MSG;
  return e;
}

export function validateCvStep2(data: CVData): CvFormErrors {
  const e: CvFormErrors = {};
  const f = data.fisik_kesehatan;
  if (!f.tinggi_badan.trim()) e.tinggi_badan = CV_MSG;
  if (!f.berat_badan.trim()) e.berat_badan = CV_MSG;
  if (f.merokok === "Ya" && !f.jumlah_rokok.trim()) e.jumlah_rokok = CV_MSG;
  return e;
}

export function validateCvStep3(data: CVData): CvFormErrors {
  const e: CvFormErrors = {};
  const { slots, overflow } = arrangePendidikan(data.pendidikan);
  const filled = [...slots, ...overflow].filter(isPendidikanFilled);
  if (filled.length === 0) e["pendidikan-empty"] = "Isi minimal 1 jenjang pendidikan";
  slots.forEach((item, index) => {
    if (!isPendidikanFilled(item)) return;
    const slot = PENDIDIKAN_SLOTS[index];
    if (!item.nama_sekolah.trim()) e[`pendidikan-${item.id}-nama_sekolah`] = CV_MSG;
    if (slot.needsJurusan && !item.tingkat_pendidikan) {
      e[`pendidikan-${item.id}-tingkat_pendidikan`] = CV_MSG;
    }
    if (slot.needsJurusan && !item.jurusan.trim()) e[`pendidikan-${item.id}-jurusan`] = CV_MSG;
    if (!item.bulan_masuk) e[`pendidikan-${item.id}-bulan_masuk`] = CV_MSG;
    if (!item.tahun_masuk) e[`pendidikan-${item.id}-tahun_masuk`] = CV_MSG;
    if (!item.bulan_lulus) e[`pendidikan-${item.id}-bulan_lulus`] = CV_MSG;
    if (!item.tahun_lulus) e[`pendidikan-${item.id}-tahun_lulus`] = CV_MSG;
  });
  return e;
}

export function validateCvStep4(data: CVData): CvFormErrors {
  const e: CvFormErrors = {};
  filterFilledPekerjaan(data.pekerjaan).forEach((item) => {
    if (!item.nama_perusahaan.trim()) e[`pekerjaan-${item.id}-nama_perusahaan`] = CV_MSG;
    if (!item.status_pekerjaan) e[`pekerjaan-${item.id}-status_pekerjaan`] = CV_MSG;
    if (!item.bulan_mulai) e[`pekerjaan-${item.id}-bulan_mulai`] = CV_MSG;
    if (!item.tahun_mulai) e[`pekerjaan-${item.id}-tahun_mulai`] = CV_MSG;
    if (!item.bulan_selesai) e[`pekerjaan-${item.id}-bulan_selesai`] = CV_MSG;
    if (!item.tahun_selesai) e[`pekerjaan-${item.id}-tahun_selesai`] = CV_MSG;
  });
  return e;
}

export function validateSertifikatRows(items: Sertifikat[]): CvFormErrors {
  const e: CvFormErrors = {};
  items.forEach((item) => {
    const named = item.nama_sertifikat.trim().length > 0;
    const started = [
      item.status_kelulusan,
      item.keterangan_skor,
      item.bulan_diperoleh,
      item.tahun_diperoleh,
      item.tanggal_diperoleh,
      item.foto_sertifikat,
    ].some((value) => (value ?? "").trim().length > 0);
    if (!named && !started) return;
    if (!named) e[`sertifikat-${item.id}-nama_sertifikat`] = CV_MSG;
    if (!isPdfFileName(item.foto_sertifikat)) {
      e[`sertifikat-${item.id}-foto_sertifikat`] = "Setiap sertifikat wajib dilampiri file PDF.";
    }
  });
  return e;
}

export function validateCvStep5(data: CVData): CvFormErrors {
  return validateSertifikatRows(data.sertifikat);
}

export function validateCvStep6(data: CVData): CvFormErrors {
  const e: CvFormErrors = {};
  const filled = data.keluarga.filter(isKeluargaFilled);
  if (filled.length === 0) e["keluarga-empty"] = "Isi minimal 1 anggota keluarga";
  filled.forEach((item) => {
    if (!item.hubungan) e[`keluarga-${item.id}-hubungan`] = CV_MSG;
    if (!item.nama_anggota.trim()) e[`keluarga-${item.id}-nama_anggota`] = CV_MSG;
    if (!item.umur?.trim()) e[`keluarga-${item.id}-umur`] = CV_MSG;
    else if (Number.isNaN(Number(item.umur)) || Number(item.umur) < 1 || Number(item.umur) > 120) {
      e[`keluarga-${item.id}-umur`] = "Isi umur 1–120 (tahun)";
    }
    if (!item.pekerjaan.trim()) e[`keluarga-${item.id}-pekerjaan`] = CV_MSG;
  });
  return e;
}

/** Tujuan, komentar, dan keterangan medis tidak wajib. */
export function validateCvStep7(_data: CVData): CvFormErrors {
  return {};
}

export const CV_STEP_VALIDATORS = [
  validateCvStep1,
  validateCvStep2,
  validateCvStep3,
  validateCvStep4,
  validateCvStep5,
  validateCvStep6,
  validateCvStep7,
];

export function validateAllCvSteps(data: CVData): { errors: CvFormErrors; step: number } {
  for (let i = 0; i < CV_STEP_VALIDATORS.length; i++) {
    const errors = CV_STEP_VALIDATORS[i](data);
    if (Object.keys(errors).length > 0) {
      return { errors, step: i + 1 };
    }
  }
  return { errors: {}, step: 7 };
}
