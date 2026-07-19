export type LpkStudentStatus = "aktif" | "rekrut" | "match_job";

export type LpkKeluargaItem = {
  hubungan?: string | null;
  nama?: string | null;
  umur?: string | number | null;
  status_pekerjaan?: string | null;
};

export type LpkSertifikatItem = {
  nama_sertifikat?: string | null;
  status_kelulusan?: number | null;
  score?: string | null;
  bulan_diperoleh?: string | null;
  tahun_diperoleh?: string | null;
  sertifikat?: string | null;
};

export type LpkPendidikanItem = {
  nama_sekolah?: string | null;
  tingkat_pendidikan?: string | null;
  jurusan?: string | null;
  bulan_masuk?: string | null;
  tahun_masuk?: string | null;
  bulan_lulus?: string | null;
  tahun_lulus?: string | null;
};

export type LpkPekerjaanItem = {
  nama_perusahaan?: string | null;
  posisi_pekerjaan?: string | null;
  status_pekerjaan?: string | null;
  bulan_mulai?: string | null;
  tahun_mulai?: string | null;
  bulan_selesai?: string | null;
  tahun_selesai?: string | null;
};

export type TimelineEventStatus = "done" | "current" | "upcoming" | "failed";

export type TimelineEvent = {
  label: string;
  date?: string;
  status: TimelineEventStatus;
  note?: string;
};

export type JobPlacement = {
  prefektur: string;
  kota: string;
  alamat_kerja: string;
  nama_perusahaan: string;
  bidang_usaha: string;
  posisi: string;
  gaji: string;
  durasi_kontrak: string;
  hari_libur: string;
};

/** Data siswa LPK Mitra — selaras kolom tabel profil siswa Jukyu */
export type LpkStudentRecord = {
  id: string;
  status: LpkStudentStatus;
  match_job_note?: string;
  job_id?: string;
  job_title?: string;
  job_company?: string;

  foto: string;
  no_peserta: string;
  nik: string;
  nama_lengkap: string;
  nama_katakana: string;
  nama_panggilan: string;
  angkatan: string;
  kewarganegaraan: string;
  tanggal_lahir: string;
  umur: string;
  jenis_kelamin: string;
  golongan_darah: string;
  status_pernikahan: string;
  agama: string;
  asal: string;
  alamat: string;
  kode_pos: string;
  telepon: string;
  email: string;
  mcu_pdf: string;
  mcu: string;
  tinggi_badan: string;
  berat_badan: string;
  mata_kiri: string;
  kondisi_mata_kiri: string;
  mata_kanan: string;
  kondisi_mata_kanan: string;
  berkacamata: string;
  tato: string;
  merokok: string;
  frequensi_merokok: string;
  buta_warna: string;
  patah_tulang: string;
  hobi: string;
  tingkatan_pembelajaran: string;
  asal_lpk: string;
  nama_so: string;
  nama_kumiai: string;
  nama_perusahaan: string;
  jenis_pekerjaan: string;
  tanggal_masuk_pelatihan: string;
  tanggal_kelulusan: string;
  perkiraan_masuk_jepang: string;
  tanggal_keberangkatan: string;
  dokumen_ktp: string;
  dokumen_kk: string;
  dokumen_akte: string;
  dokumen_ijazah: string;
  sertifikat_dimiliki: string[];
  keluarga: LpkKeluargaItem[];
  sertifikat: LpkSertifikatItem[];
  pendidikan: LpkPendidikanItem[];
  pekerjaan: LpkPekerjaanItem[];
  timeline?: TimelineEvent[];
  job_placement?: JobPlacement;

  /** Kolom tracking alumni (Data Alumni FTI) */
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
};

export function createEmptyLpkStudent(partial?: Partial<LpkStudentRecord>): LpkStudentRecord {
  return {
    id: crypto.randomUUID(),
    status: "rekrut",
    foto: "",
    no_peserta: "",
    nik: "",
    nama_lengkap: "",
    nama_katakana: "",
    nama_panggilan: "",
    angkatan: String(new Date().getFullYear()),
    kewarganegaraan: "インドネシア",
    tanggal_lahir: "",
    umur: "",
    jenis_kelamin: "",
    golongan_darah: "",
    status_pernikahan: "",
    agama: "",
    asal: "",
    alamat: "",
    kode_pos: "",
    telepon: "",
    email: "",
    mcu_pdf: "",
    mcu: "",
    tinggi_badan: "",
    berat_badan: "",
    mata_kiri: "",
    kondisi_mata_kiri: "",
    mata_kanan: "",
    kondisi_mata_kanan: "",
    berkacamata: "",
    tato: "",
    merokok: "",
    frequensi_merokok: "",
    buta_warna: "",
    patah_tulang: "",
    hobi: "",
    tingkatan_pembelajaran: "",
    asal_lpk: "LPK Mitra Sukabumi",
    nama_so: "",
    nama_kumiai: "",
    nama_perusahaan: "",
    jenis_pekerjaan: "",
    tanggal_masuk_pelatihan: "",
    tanggal_kelulusan: "",
    perkiraan_masuk_jepang: "",
    tanggal_keberangkatan: "",
    dokumen_ktp: "",
    dokumen_kk: "",
    dokumen_akte: "",
    dokumen_ijazah: "",
    sertifikat_dimiliki: [],
    keluarga: [],
    sertifikat: [],
    pendidikan: [],
    pekerjaan: [],
    tanggal_mensetsu: "",
    tanggal_naitei: "",
    tsk: "",
    tanggal_rekrut: "",
    cert_jft_basic_a2: "",
    cert_ssw_idn: "",
    cert_ssw_jpn: "",
    dokumen_paspor: "",
    dokumen_visa: "",
    dokumen_coe: "",
    dokumen_ektkln: "",
    ...partial,
  };
}
