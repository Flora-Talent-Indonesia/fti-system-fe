export type StudentStatus = "aktif" | "match_job" | "rekrut";

export type Student = {
  id: string;
  noPeserta: string;
  namaLengkap: string;
  angkatan: string;
  lpkId: string;
  lpkName: string;
  status: StudentStatus;
  matchJobNote?: string;
  jobTitle?: string;
  interestedJobs?: string[];
  certificates: string[];
  cvSummary: string;
};

export type LpkPartner = {
  id: string;
  name: string;
  kota: string;
  totalSiswa: number;
};

export type Job = {
  id: string;
  title: string;
  titleJa?: string;
  company: string;
  /** Kumiai untuk Magang, TSK untuk Tokutei Ginou. */
  pengirim?: string;
  description: string;
  deadlineDokumen: string;
  tanggalMansetsu: string;
  kuota: number | null;
  createdAt: string;
  assignedStudentIds: string[];
  interestedStudentIds: string[];
  /** Nama file PDF kyujin. Kosong berarti belum diunggah. */
  kyujinPdf?: string;
  /** LPK yang boleh melihat lowongan. Tidak diisi = data lama, tampil di semua LPK. Array kosong = tidak tampil. */
  visibleLpkIds?: string[];
  /** Hasil mensetsu per id siswa: lulus atau tidak. */
  mensetsuResults?: Record<string, "lulus" | "tidak">;
};
