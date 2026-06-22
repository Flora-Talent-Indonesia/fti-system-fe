import type { CVData } from "@/components/cv-form/types";
import type { LpkStudentRecord } from "@/types/lpk-student";
import { createEmptyLpkStudent } from "@/types/lpk-student";

function mapJenisKelamin(v: string): string {
  if (v === "Laki-laki") return "L";
  if (v === "Perempuan") return "P";
  return v;
}

export function cvDataToLpkStudent(
  cv: CVData,
  options?: {
    jobId?: string;
    jobTitle?: string;
    jobCompany?: string;
    asalLpk?: string;
    asal?: string;
    jenisPekerjaan?: string;
    existingId?: string;
  }
): LpkStudentRecord {
  const info = cv.informasi_dasar;
  const fisik = cv.fisik_kesehatan;
  const base = createEmptyLpkStudent({
    id: options?.existingId ?? crypto.randomUUID(),
    status: "rekrut",
    job_id: options?.jobId,
    job_title: options?.jobTitle,
    job_company: options?.jobCompany,
    asal_lpk: options?.asalLpk ?? "LPK Mitra Sukabumi",
    asal: options?.asal ?? "",
    jenis_pekerjaan: options?.jenisPekerjaan ?? "",
    foto: cv.meta.foto,
    no_peserta: info.no_peserta,
    nik: info.nik,
    nama_lengkap: info.nama_lengkap,
    nama_katakana: info.nama_katakana,
    nama_panggilan: info.yobisho,
    angkatan: "",
    kewarganegaraan: info.kewarganegaraan,
    tanggal_lahir: info.tanggal_lahir,
    umur: info.umur,
    jenis_kelamin: mapJenisKelamin(info.jenis_kelamin),
    golongan_darah: info.golongan_darah,
    status_pernikahan: info.status_pernikahan,
    agama: info.agama,
    alamat: info.alamat_lengkap,
    kode_pos: info.kode_pos,
    telepon: info.nomor_telepon,
    email: info.email,
    tanggal_masuk_pelatihan: cv.meta.tanggal_pembuatan_cv,
    tinggi_badan: fisik.tinggi_badan,
    berat_badan: fisik.berat_badan,
    mata_kiri: fisik.visus_mata_kiri,
    kondisi_mata_kiri: fisik.kondisi_mata_kiri,
    mata_kanan: fisik.visus_mata_kanan,
    kondisi_mata_kanan: fisik.kondisi_mata_kanan,
    berkacamata: fisik.berkacamata,
    tato: fisik.tato,
    merokok: fisik.merokok,
    frequensi_merokok: fisik.jumlah_rokok,
    buta_warna: fisik.buta_warna,
    patah_tulang: fisik.riwayat_patah_tulang,
    hobi: fisik.hobi,
    dokumen_ktp: cv.dokumen.ktp,
    dokumen_kk: cv.dokumen.kk,
    dokumen_akte: cv.dokumen.akte_kelahiran,
    dokumen_ijazah: cv.dokumen.ijazah_terakhir,
    pendidikan: cv.pendidikan.map((p) => ({
      nama_sekolah: p.nama_sekolah,
      tingkat_pendidikan: p.tingkat_pendidikan,
      jurusan: p.jurusan,
      bulan_masuk: p.bulan_masuk,
      tahun_masuk: p.tahun_masuk,
      bulan_lulus: p.bulan_lulus,
      tahun_lulus: p.tahun_lulus,
    })),
    pekerjaan: cv.pekerjaan.map((p) => ({
      nama_perusahaan: p.nama_perusahaan,
      posisi_pekerjaan: p.posisi_pekerjaan,
      status_pekerjaan: p.status_pekerjaan,
      bulan_mulai: p.bulan_mulai,
      tahun_mulai: p.tahun_mulai,
      bulan_selesai: p.bulan_selesai,
      tahun_selesai: p.tahun_selesai,
    })),
    sertifikat: cv.sertifikat.map((s) => ({
      nama_sertifikat: s.nama_sertifikat,
      status_kelulusan: s.status_kelulusan === "Lulus" ? 1 : 0,
      score: s.keterangan_skor,
      bulan_diperoleh: s.bulan_diperoleh,
      tahun_diperoleh: s.tahun_diperoleh,
      sertifikat: s.foto_sertifikat,
    })),
    sertifikat_dimiliki: cv.sertifikat
      .map((s) => s.nama_sertifikat)
      .filter(Boolean),
    keluarga: cv.keluarga.map((k) => ({
      hubungan: k.hubungan,
      nama: k.nama_anggota,
      umur: k.umur,
      status_pekerjaan: k.pekerjaan,
    })),
  });

  return base;
}

export function lpkStudentToCvData(student: LpkStudentRecord): CVData {
  return {
    meta: {
      tanggal_pembuatan_cv: student.tanggal_masuk_pelatihan || new Date().toISOString().split("T")[0],
      foto: student.foto,
    },
    dokumen: {
      ktp: student.dokumen_ktp,
      kk: student.dokumen_kk,
      akte_kelahiran: student.dokumen_akte,
      ijazah_terakhir: student.dokumen_ijazah,
    },
    informasi_dasar: {
      nik: student.nik,
      no_peserta: student.no_peserta,
      nama_lengkap: student.nama_lengkap,
      nama_katakana: student.nama_katakana,
      yobisho: student.nama_panggilan,
      umur: student.umur,
      jenis_kelamin:
        student.jenis_kelamin === "L"
          ? "Laki-laki"
          : student.jenis_kelamin === "P"
            ? "Perempuan"
            : student.jenis_kelamin,
      kewarganegaraan: student.kewarganegaraan,
      tanggal_lahir: student.tanggal_lahir,
      golongan_darah: student.golongan_darah,
      agama: student.agama,
      status_pernikahan: student.status_pernikahan,
      alamat_lengkap: student.alamat,
      kode_pos: student.kode_pos,
      nomor_telepon: student.telepon,
      email: student.email,
    },
    fisik_kesehatan: {
      tinggi_badan: student.tinggi_badan,
      berat_badan: student.berat_badan,
      visus_mata_kiri: student.mata_kiri,
      kondisi_mata_kiri: student.kondisi_mata_kiri,
      visus_mata_kanan: student.mata_kanan,
      kondisi_mata_kanan: student.kondisi_mata_kanan,
      berkacamata: student.berkacamata,
      tato: student.tato,
      merokok: student.merokok,
      jumlah_rokok: student.frequensi_merokok,
      buta_warna: student.buta_warna,
      riwayat_patah_tulang: student.patah_tulang,
      hobi: student.hobi,
    },
    pendidikan: (student.pendidikan ?? []).map((p, i) => ({
      id: `p-${i}`,
      nama_sekolah: p.nama_sekolah ?? "",
      tingkat_pendidikan: p.tingkat_pendidikan ?? "",
      jurusan: p.jurusan ?? "",
      bulan_masuk: p.bulan_masuk ?? "",
      tahun_masuk: p.tahun_masuk ?? "",
      bulan_lulus: p.bulan_lulus ?? "",
      tahun_lulus: p.tahun_lulus ?? "",
    })),
    pekerjaan: (student.pekerjaan ?? []).map((p, i) => ({
      id: `w-${i}`,
      nama_perusahaan: p.nama_perusahaan ?? "",
      posisi_pekerjaan: p.posisi_pekerjaan ?? "",
      status_pekerjaan: p.status_pekerjaan ?? "",
      bulan_mulai: p.bulan_mulai ?? "",
      tahun_mulai: p.tahun_mulai ?? "",
      bulan_selesai: p.bulan_selesai ?? "",
      tahun_selesai: p.tahun_selesai ?? "",
    })),
    sertifikat: (student.sertifikat ?? []).map((s, i) => ({
      id: `s-${i}`,
      nama_sertifikat: s.nama_sertifikat ?? "",
      status_kelulusan: s.status_kelulusan === 1 ? "Lulus" : "Tidak Lulus",
      keterangan_skor: s.score ?? "",
      bulan_diperoleh: s.bulan_diperoleh ?? "",
      tahun_diperoleh: s.tahun_diperoleh ?? "",
      foto_sertifikat: s.sertifikat ?? "",
    })),
    keluarga: (student.keluarga ?? []).map((k, i) => ({
      id: `k-${i}`,
      hubungan: k.hubungan ?? "",
      nama_anggota: k.nama ?? "",
      umur: String(k.umur ?? ""),
      pekerjaan: k.status_pekerjaan ?? "",
    })),
  };
}
