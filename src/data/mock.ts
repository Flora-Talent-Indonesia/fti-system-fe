import type { Job, LpkPartner, Student } from "@/types";

export const LPK_PARTNERS: LpkPartner[] = [
  { id: "lpk-001", name: "LPK Mitra Sukabumi", kota: "Sukabumi", totalSiswa: 2 },
  { id: "lpk-002", name: "LPK Mitra Bandung", kota: "Bandung", totalSiswa: 2 },
  { id: "lpk-003", name: "LPK Mitra Semarang", kota: "Semarang", totalSiswa: 2 },
];

export const STUDENTS: Student[] = [
  {
    id: "s-001",
    noPeserta: "FTI-2024-001",
    namaLengkap: "Ahmad Rizki Pratama",
    angkatan: "2024",
    lpkId: "lpk-001",
    lpkName: "LPK Mitra Sukabumi",
    status: "rekrut",
    jobTitle: "Manufacturing Operator",
    interestedJobs: ["job-001"],
    certificates: ["JLPT N4", "Sertifikat K3"],
    cvSummary: "Berpengalaman di bidang manufaktur, siap kerja di Jepang.",
  },
  {
    id: "s-002",
    noPeserta: "FTI-2024-002",
    namaLengkap: "Siti Nurhaliza",
    angkatan: "2024",
    lpkId: "lpk-001",
    lpkName: "LPK Mitra Sukabumi",
    status: "aktif",
    certificates: ["JLPT N5"],
    cvSummary: "Lulusan SMK, fokus hospitality dan customer service.",
  },
  {
    id: "s-003",
    noPeserta: "FTI-2023-011",
    namaLengkap: "Budi Santoso",
    angkatan: "2023",
    lpkId: "lpk-002",
    lpkName: "LPK Mitra Bandung",
    status: "match_job",
    matchJobNote: "Sudah ditempatkan di perusahaan lain (Match Job)",
    certificates: ["JLPT N3", "Sertifikat Welding"],
    cvSummary: "Teknisi welding berpengalaman 2 tahun.",
  },
  {
    id: "s-004",
    noPeserta: "FTI-2024-008",
    namaLengkap: "Dewi Lestari",
    angkatan: "2024",
    lpkId: "lpk-002",
    lpkName: "LPK Mitra Bandung",
    status: "rekrut",
    jobTitle: "Care Worker",
    interestedJobs: ["job-002"],
    certificates: ["JLPT N4", "Care Worker Basic"],
    cvSummary: "Berpengalaman merawat lansia, komunikatif.",
  },
  {
    id: "s-005",
    noPeserta: "FTI-2024-015",
    namaLengkap: "Muhammad Azzaky",
    angkatan: "2024",
    lpkId: "lpk-003",
    lpkName: "LPK Mitra Semarang",
    status: "rekrut",
    interestedJobs: ["job-001", "job-003"],
    certificates: ["JLPT N4"],
    cvSummary: "Fresh graduate teknik mesin, motivasi tinggi.",
  },
];

export const JOBS: Job[] = [
  {
    id: "job-001",
    title: "Manufacturing Operator",
    titleJa: "製造オペレーター",
    company: "Sakura Manufacturing Co.",
    description: "Operator produksi di pabrik komponen otomotif.",
    deadlineDokumen: "2026-07-01",
    tanggalMansetsu: "2026-07-15",
    kuota: 5,
    createdAt: "2026-06-01T08:00:00.000Z",
    assignedStudentIds: ["s-001"],
    interestedStudentIds: ["s-001", "s-005"],
  },
  {
    id: "job-002",
    title: "Care Worker",
    titleJa: "介護職",
    company: "Hanasaki Care Home",
    description: "Perawat lansia di fasilitas perawatan Jepang.",
    deadlineDokumen: "2026-07-10",
    tanggalMansetsu: "2026-07-20",
    kuota: 10,
    createdAt: "2026-06-05T08:00:00.000Z",
    assignedStudentIds: [],
    interestedStudentIds: ["s-004"],
  },
  {
    id: "job-003",
    title: "Construction Helper",
    titleJa: "建設作業員",
    company: "Tokyo Build Partners",
    description: "Pembantu konstruksi gedung residensial.",
    deadlineDokumen: "2025-12-01",
    tanggalMansetsu: "2025-12-15",
    kuota: 50,
    createdAt: "2025-11-20T08:00:00.000Z",
    assignedStudentIds: [],
    interestedStudentIds: ["s-005"],
  },
];

export function getStudentById(id: string) {
  return STUDENTS.find((s) => s.id === id);
}

export function getLpkById(id: string) {
  return LPK_PARTNERS.find((l) => l.id === id);
}

export function getStudentsByLpk(lpkId: string) {
  return STUDENTS.filter((s) => s.lpkId === lpkId && s.status === "rekrut");
}

export function getJobById(id: string) {
  return JOBS.find((j) => j.id === id);
}
