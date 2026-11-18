export interface MetaData {
  tanggal_pembuatan_cv: string;
  foto: string; // base64 data URL
}

export interface DokumenPendukung {
  ktp: string;
  ktp_ortu: string;
  kk: string;
  akte_kelahiran: string;
  paspor: string;
  ijazah_terakhir: string;
  skck: string;
  mcu: string;
  surat_perjanjian: string;
}


export interface InformasiDasar {
  nik: string;
  no_peserta: string;
  nama_lengkap: string;
  nama_katakana: string;
  yobisho: string;        // 呼称 / nama panggilan
  umur: string;
  jenis_kelamin: string;
  kewarganegaraan: string;
  tanggal_lahir: string;
  golongan_darah: string;
  agama: string;
  status_pernikahan: string;
  alamat_lengkap: string;
  kode_pos: string;
  nomor_telepon: string;
  email: string;
  kontak_darurat_nama: string;
  kontak_darurat_hubungan: string;
  kontak_darurat_telepon: string;
  /** 出身地 */
  tempat_lahir: string;
  /** 利き手: 右 | 左 */
  tangan_dominan: string;
}

export interface FisikKesehatan {
  tinggi_badan: string;
  berat_badan: string;
  visus_mata_kiri: string;
  kondisi_mata_kiri: string;
  visus_mata_kanan: string;
  kondisi_mata_kanan: string;
  berkacamata: string;
  tato: string;
  merokok: string;
  jumlah_rokok: string;
  buta_warna: string;
  riwayat_patah_tulang: string;
  hobi: string;
  /** 飲酒: Ya | Tidak */
  minum_alkohol: string;
}

export interface RiwayatPendidikan {
  id: string;
  tahun_masuk: string;
  bulan_masuk: string;
  /** Hari masuk, 1–31. Boleh kosong. */
  tanggal_masuk: string;
  tahun_lulus: string;
  bulan_lulus: string;
  /** Hari lulus, 1–31. Boleh kosong. */
  tanggal_lulus: string;
  nama_sekolah: string;
  tingkat_pendidikan: string;
  jurusan: string;
}

export interface RiwayatPekerjaan {
  id: string;
  tahun_mulai: string;
  bulan_mulai: string;
  /** Hari mulai, 1–31. Boleh kosong. */
  tanggal_mulai: string;
  tahun_selesai: string;
  bulan_selesai: string;
  /** Hari selesai, 1–31. Boleh kosong. */
  tanggal_selesai: string;
  nama_perusahaan: string;
  status_pekerjaan: string;
  posisi_pekerjaan: string;
  /** 仕事 — nilai Jepang dari kamus Referensi. */
  jenis_pekerjaan: string;
  /** 仕事内容 */
  deskripsi_pekerjaan: string;
}

export interface Sertifikat {
  id: string;
  tahun_diperoleh: string;
  bulan_diperoleh: string;
  /** Hari diperoleh, 1–31. Boleh kosong. */
  tanggal_diperoleh: string;
  nama_sertifikat: string;
  status_kelulusan: string;
  keterangan_skor: string;
  foto_sertifikat: string;
}

export interface AnggotaKeluarga {
  id: string;
  hubungan: string;
  nama_anggota: string;
  /** Usia anggota keluarga (tahun). */
  umur: string;
  pekerjaan: string;
}

/** Blok naratif di bagian bawah FORMAT CV. */
export interface CatatanCv {
  /** 渡航時期 */
  periode_luar_negeri: string;
  /** 渡航目的 */
  tujuan_luar_negeri: string;
  /** 特定技能残日数: "" | "なし" | "あり" */
  sisa_hari_tokutei: string;
  /** Sisa tahun, diisi bila status あり. */
  sisa_tahun: string;
  /** Sisa bulan, diisi bila status あり. */
  sisa_bulan: string;
  /** 日本での目標 */
  tujuan_ke_jepang: string;
  /** コメント — hanya diisi FTI. */
  komentar_pewawancara: string;
  /** 追加情報: "" | "なし" | "あり" */
  keterangan_medis_status: string;
  /** Nama obat / perawatan, diisi bila status あり. */
  keterangan_medis: string;
}

export interface CVData {
  meta: MetaData;
  dokumen: DokumenPendukung;
  informasi_dasar: InformasiDasar;
  fisik_kesehatan: FisikKesehatan;
  pendidikan: RiwayatPendidikan[];
  pekerjaan: RiwayatPekerjaan[];
  sertifikat: Sertifikat[];
  keluarga: AnggotaKeluarga[];
  catatan: CatatanCv;
  /** Program yang diikuti siswa: "tg" (Tokutei Ginou) | "ikusei" (Ikusei Shuro). */
  program: string;
}
