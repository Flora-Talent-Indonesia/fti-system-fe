import type { CVData, CatatanCv } from './types';

export const emptyCatatan = (): CatatanCv => ({
  periode_luar_negeri: '',
  tujuan_luar_negeri: '',
  sisa_hari_tokutei: '',
  sisa_tahun: '',
  sisa_bulan: '',
  tujuan_ke_jepang: '',
  komentar_pewawancara: '',
  keterangan_medis_status: '',
  keterangan_medis: '',
});

export const defaultCVData: CVData = {
  meta: {
    tanggal_pembuatan_cv: new Date().toISOString().split('T')[0],
    foto: '',
  },
  dokumen: {
    ktp: '',
    ktp_ortu: '',
    kk: '',
    akte_kelahiran: '',
    paspor: '',
    ijazah_terakhir: '',
    skck: '',
    mcu: '',
    surat_perjanjian: '',
  },

  informasi_dasar: {
    nik: '',
    no_peserta: '',
    nama_lengkap: '',
    nama_katakana: '',
    yobisho: '',
    umur: '',
    jenis_kelamin: '',
    kewarganegaraan: 'インドネシア',
    tanggal_lahir: '',
    golongan_darah: '',
    agama: '',
    status_pernikahan: '',
    alamat_lengkap: '',
    kode_pos: '',
    nomor_telepon: '',
    email: '',
    kontak_darurat_nama: '',
    kontak_darurat_hubungan: '',
    kontak_darurat_telepon: '',
    tempat_lahir: '',
    tangan_dominan: '',
  },
  fisik_kesehatan: {
    tinggi_badan: '',
    berat_badan: '',
    visus_mata_kiri: '',
    kondisi_mata_kiri: '',
    visus_mata_kanan: '',
    kondisi_mata_kanan: '',
    berkacamata: '',
    tato: '',
    merokok: '',
    jumlah_rokok: '',
    buta_warna: '',
    riwayat_patah_tulang: '',
    hobi: '',
    minum_alkohol: '',
  },
  pendidikan: [],
  pekerjaan: [],
  sertifikat: [],
  keluarga: [],
  catatan: emptyCatatan(),
  program: '',
};

export const BULAN_OPTIONS = [
  { value: '1', label: 'Januari' },  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },    { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },      { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },     { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },{ value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },{ value: '12', label: 'Desember' },
];

export const TAHUN_OPTIONS = Array.from({ length: 50 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { value: String(y), label: String(y) };
});
