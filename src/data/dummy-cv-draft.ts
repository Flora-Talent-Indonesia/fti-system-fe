import type { CVData } from "@/components/cv-form/types";
import { emojiAvatarDataUrl } from "@/lib/emoji-avatar";

/** Data CV contoh untuk demo / testing FE di halaman tambah siswa. */
export function createDummyCvDraft(noPeserta: string): CVData {
  return {
    meta: {
      tanggal_pembuatan_cv: new Date().toISOString().split("T")[0],
      foto: emojiAvatarDataUrl("👩"),
    },
    dokumen: {
      ktp: "ktp_rina_wulandari.pdf",
      kk: "kk_wulandari.pdf",
      akte_kelahiran: "akte_rina.pdf",
      ijazah_terakhir: "ijazah_smk.pdf",
    },
    informasi_dasar: {
      nik: "3201234567890123",
      no_peserta: noPeserta,
      nama_lengkap: "RINA WULANDARI",
      nama_katakana: "リナ・ウランダリ",
      yobisho: "リナ",
      umur: "22",
      jenis_kelamin: "Perempuan",
      kewarganegaraan: "インドネシア",
      tanggal_lahir: "2003-08-15",
      golongan_darah: "B",
      agama: "イスラム教",
      status_pernikahan: "Lajang",
      alamat_lengkap:
        "JL. MERDEKA NO. 45 RT 03 RW 05, KEL. BAROS, KEC. CIKOLE, KOTA SUKABUMI, JAWA BARAT",
      kode_pos: "43161",
      nomor_telepon: "+6281234567890",
      email: "rina.wulandari@email.com",
    },
    fisik_kesehatan: {
      tinggi_badan: "158",
      berat_badan: "52",
      visus_mata_kiri: "6/6",
      kondisi_mata_kiri: "Normal",
      visus_mata_kanan: "6/6",
      kondisi_mata_kanan: "Normal",
      berkacamata: "Tidak",
      tato: "Tidak",
      merokok: "Tidak",
      jumlah_rokok: "",
      buta_warna: "Tidak",
      riwayat_patah_tulang: "Tidak",
      hobi: "Memasak, membaca manga",
    },
    pendidikan: [
      {
        id: "p-1",
        nama_sekolah: "SMK NEGERI 1 SUKABUMI",
        tingkat_pendidikan: "SMK",
        jurusan: "Teknik Mesin",
        bulan_masuk: "7",
        tahun_masuk: "2019",
        bulan_lulus: "6",
        tahun_lulus: "2022",
      },
    ],
    pekerjaan: [
      {
        id: "w-1",
        nama_perusahaan: "PT MITRA MANUFAKTUR",
        posisi_pekerjaan: "Operator Produksi",
        status_pekerjaan: "Magang",
        bulan_mulai: "1",
        tahun_mulai: "2023",
        bulan_selesai: "6",
        tahun_selesai: "2023",
      },
    ],
    sertifikat: [
      {
        id: "s-1",
        nama_sertifikat: "JLPT N4",
        status_kelulusan: "Lulus",
        keterangan_skor: "Score 125",
        bulan_diperoleh: "12",
        tahun_diperoleh: "2024",
        foto_sertifikat: "",
      },
    ],
    keluarga: [
      {
        id: "k-1",
        hubungan: "Ayah",
        nama_anggota: "BUDI WULANDARA",
        umur: "52",
        pekerjaan: "Wiraswasta",
      },
      {
        id: "k-2",
        hubungan: "Ibu",
        nama_anggota: "SITI AMINAH",
        umur: "48",
        pekerjaan: "Ibu Rumah Tangga",
      },
    ],
  };
}
