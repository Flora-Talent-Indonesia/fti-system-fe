import type { Job } from "@/types";

const STORAGE_KEY = "flora_fti_jobs_v1";
const SEED_FLAG = "flora_fti_jobs_seeded_v2";
const SEED_VERSION = "2";

export function getInitialJobs(): Job[] {
  return [
    {
      id: "job-001",
      title: "Manufacturing Operator",
      titleJa: "製造オペレーター",
      company: "Sakura Manufacturing Co.",
      description: "Operator produksi di pabrik komponen otomotif.",
      deadlineDokumen: "2026-08-01",
      tanggalMansetsu: "2026-08-20",
      kuota: 5,
      createdAt: "2026-06-01T08:00:00.000Z",
      assignedStudentIds: ["dummy-001"],
      interestedStudentIds: ["dummy-001", "dummy-005"],
    },
    {
      id: "job-002",
      title: "Care Worker",
      titleJa: "介護職",
      company: "Hanasaki Care Home",
      description: "Perawat lansia di fasilitas perawatan Jepang — rekrutmen terbuka tanpa batas waktu.",
      deadlineDokumen: "",
      tanggalMansetsu: "",
      kuota: null,
      createdAt: "2026-06-05T08:00:00.000Z",
      assignedStudentIds: ["dummy-004", "dummy-005"],
      interestedStudentIds: ["dummy-004"],
    },
    {
      id: "job-004",
      title: "Hotel Staff",
      titleJa: "ホテルスタッフ",
      company: "Kyoto Hospitality Group",
      description: "Front office & housekeeping untuk hotel resort — tanpa deadline dokumen.",
      deadlineDokumen: "",
      tanggalMansetsu: "",
      kuota: 20,
      createdAt: "2026-06-10T08:00:00.000Z",
      assignedStudentIds: ["dummy-006"],
      interestedStudentIds: ["dummy-006"],
    },
    {
      id: "job-005",
      title: "Welding Technician",
      titleJa: "溶接技術者",
      company: "Osaka Metal Works",
      description: "Teknisi las untuk industri manufaktur — kuota terbuka, tanpa mansetsu tetap.",
      deadlineDokumen: "",
      tanggalMansetsu: "",
      kuota: 8,
      createdAt: "2026-06-12T08:00:00.000Z",
      assignedStudentIds: [],
      interestedStudentIds: ["dummy-001"],
    },
    {
      id: "job-003",
      title: "Test MMI Pertama",
      titleJa: "建設作業員",
      company: "Tokyo Build Partners",
      description: "Job non konstruksi — demo job nonaktif (mansetsu lewat).",
      deadlineDokumen: "2025-12-01",
      tanggalMansetsu: "2025-12-15",
      kuota: 50,
      createdAt: "2025-11-20T08:00:00.000Z",
      assignedStudentIds: [],
      interestedStudentIds: ["dummy-005"],
    },
  ];
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
