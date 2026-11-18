import type { Job } from "@/types";

const STORAGE_KEY = "flora_fti_jobs_v1";
const SEED_FLAG = "flora_fti_jobs_seeded_v2";
const SEED_VERSION = "5";

const DEMO_LPK = ["lpk-01"];

export function getInitialJobs(): Job[] {
  return [
    {
      id: "job-001",
      title: "Kaigo",
      titleJa: "介護",
      company: "Hanasaki Care Home",
      description: "Perawatan lansia di panti jompo.",
      deadlineDokumen: "2027-02-01",
      tanggalMansetsu: "2027-03-10",
      kuota: 8,
      createdAt: "2026-06-01T08:00:00.000Z",
      assignedStudentIds: ["dummy-001"],
      interestedStudentIds: ["dummy-001"],
      kyujinPdf: "kyujin_kaigo.pdf",
      visibleLpkIds: DEMO_LPK,
    },
    {
      id: "job-002",
      title: "Driver",
      titleJa: "ドライバー",
      company: "Aichi Transport",
      description: "Sopir pengiriman barang dalam kota.",
      deadlineDokumen: "2027-02-15",
      tanggalMansetsu: "2027-03-20",
      kuota: 4,
      createdAt: "2026-06-03T08:00:00.000Z",
      assignedStudentIds: [],
      interestedStudentIds: ["dummy-005"],
      kyujinPdf: "kyujin_driver.pdf",
      visibleLpkIds: DEMO_LPK,
    },
    {
      id: "job-003",
      title: "Pengolahan Makanan",
      titleJa: "食品加工",
      company: "Osaka Foods",
      description: "Pengolahan dan pengemasan makanan di pabrik.",
      deadlineDokumen: "2027-01-20",
      tanggalMansetsu: "2027-02-28",
      kuota: 10,
      createdAt: "2026-06-05T08:00:00.000Z",
      assignedStudentIds: ["dummy-004"],
      interestedStudentIds: ["dummy-004"],
      kyujinPdf: "kyujin_pengolahan_makanan.pdf",
      visibleLpkIds: DEMO_LPK,
    },
    {
      id: "job-004",
      title: "Pengelasan",
      titleJa: "溶接",
      company: "Osaka Metal Works",
      description: "Pengelasan komponen logam di bengkel manufaktur.",
      deadlineDokumen: "2027-03-01",
      tanggalMansetsu: "2027-04-05",
      kuota: 6,
      createdAt: "2026-06-08T08:00:00.000Z",
      assignedStudentIds: [],
      interestedStudentIds: ["dummy-001"],
      kyujinPdf: "kyujin_pengelasan.pdf",
      visibleLpkIds: DEMO_LPK,
    },
    {
      id: "job-005",
      title: "Konstruksi",
      titleJa: "建設",
      company: "Tokyo Build Partners",
      description: "Pekerjaan bangunan dan finishing gedung.",
      deadlineDokumen: "2027-03-10",
      tanggalMansetsu: "2027-04-15",
      kuota: 12,
      createdAt: "2026-06-10T08:00:00.000Z",
      assignedStudentIds: ["dummy-005"],
      interestedStudentIds: ["dummy-005"],
      kyujinPdf: "kyujin_konstruksi.pdf",
      visibleLpkIds: DEMO_LPK,
    },
    {
      id: "job-006",
      title: "Pertanian",
      titleJa: "農業",
      company: "Nagano Farm",
      description: "Budidaya sayuran di lahan pertanian.",
      deadlineDokumen: "2027-01-15",
      tanggalMansetsu: "2027-02-20",
      kuota: 6,
      createdAt: "2026-06-12T08:00:00.000Z",
      assignedStudentIds: [],
      interestedStudentIds: [],
      kyujinPdf: "kyujin_pertanian.pdf",
      visibleLpkIds: DEMO_LPK,
    },
    {
      id: "job-007",
      title: "Perhotelan",
      titleJa: "ホテル",
      company: "Kyoto Hospitality",
      description: "Petugas hotel untuk kamar dan penerimaan tamu.",
      deadlineDokumen: "2027-04-01",
      tanggalMansetsu: "2027-05-10",
      kuota: 8,
      createdAt: "2026-06-15T08:00:00.000Z",
      assignedStudentIds: ["dummy-006"],
      interestedStudentIds: ["dummy-006"],
      kyujinPdf: "kyujin_perhotelan.pdf",
      visibleLpkIds: DEMO_LPK,
    },
    {
      id: "job-008",
      title: "Perikanan",
      titleJa: "漁業",
      company: "Shizuoka Suisan",
      description: "Pengolahan hasil laut di pelabuhan.",
      deadlineDokumen: "2027-02-20",
      tanggalMansetsu: "2027-03-25",
      kuota: 5,
      createdAt: "2026-06-18T08:00:00.000Z",
      assignedStudentIds: [],
      interestedStudentIds: [],
      kyujinPdf: "kyujin_perikanan.pdf",
      visibleLpkIds: DEMO_LPK,
    },
    {
      id: "job-009",
      title: "Cleaning",
      titleJa: "ビルクリーニング",
      company: "Saitama Clean",
      description: "Kebersihan gedung perkantoran.",
      deadlineDokumen: "2027-03-05",
      tanggalMansetsu: "2027-04-08",
      kuota: 10,
      createdAt: "2026-06-20T08:00:00.000Z",
      assignedStudentIds: [],
      interestedStudentIds: [],
      kyujinPdf: "kyujin_cleaning.pdf",
      visibleLpkIds: DEMO_LPK,
    },
    {
      id: "job-010",
      title: "Manufaktur",
      titleJa: "製造",
      company: "Sakura Seisakusho",
      description: "Operator lini produksi komponen.",
      deadlineDokumen: "2027-04-10",
      tanggalMansetsu: "2027-05-20",
      kuota: 15,
      createdAt: "2026-06-22T08:00:00.000Z",
      assignedStudentIds: [],
      interestedStudentIds: ["dummy-001"],
      kyujinPdf: "kyujin_manufaktur.pdf",
      visibleLpkIds: DEMO_LPK,
    },
  ];
}

export function jobVisibleToLpk(job: Job, lpkId: string): boolean {
  if (job.visibleLpkIds == null) return true;
  return job.visibleLpkIds.includes(lpkId);
}

export function loadJobs(): Job[] {
  if (typeof window === "undefined") return getInitialJobs();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Job[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveJobs(jobs: Job[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export function seedJobsIfEmpty(): Job[] {
  if (typeof window === "undefined") return getInitialJobs();
  const version = localStorage.getItem(SEED_FLAG);
  if (version === SEED_VERSION) {
    const existing = loadJobs();
    if (existing.length > 0) return existing;
  }
  const seeded = getInitialJobs();
  saveJobs(seeded);
  localStorage.setItem(SEED_FLAG, SEED_VERSION);
  return seeded;
}

export function upsertJob(job: Job): Job[] {
  const list = loadJobs();
  const idx = list.findIndex((j) => j.id === job.id);
  if (idx >= 0) list[idx] = job;
  else list.unshift(job);
  saveJobs(list);
  return list;
}

export function deleteJob(id: string): Job[] {
  const list = loadJobs().filter((j) => j.id !== id);
  saveJobs(list);
  return list;
}

export function nextJobId(): string {
  return `job-${Date.now().toString(36)}`;
}
