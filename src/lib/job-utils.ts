import type { Job } from "@/types";

export function calculateJobStatus(deadline: string, mansetsu: string): string {
  if (!deadline || !mansetsu) return "Open";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const mansetsuDate = new Date(mansetsu);
  mansetsuDate.setHours(0, 0, 0, 0);

  if (today < deadlineDate) return "Waiting";
  if (today.getTime() === deadlineDate.getTime()) return "Submission Day";
  if (today > deadlineDate && today < mansetsuDate) return "Ongoing";
  if (today.getTime() === mansetsuDate.getTime()) return "Mansetsu Day";
  return "Closed";
}

export function isJobActive(job: Job): boolean {
  if (!job.tanggalMansetsu) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mansetsuDate = new Date(job.tanggalMansetsu);
  mansetsuDate.setHours(0, 0, 0, 0);
  return today <= mansetsuDate;
}

export type JobSortField = "createdAt" | "deadlineDokumen" | "tanggalMansetsu";
export type JobSortDir = "asc" | "desc";

export function sortJobs(jobs: Job[], field: JobSortField, dir: JobSortDir): Job[] {
  const mult = dir === "asc" ? 1 : -1;
  return [...jobs].sort((a, b) => {
    const av = a[field] || "";
    const bv = b[field] || "";
    if (!av && !bv) return 0;
    if (!av) return 1;
    if (!bv) return -1;
    return (new Date(av).getTime() - new Date(bv).getTime()) * mult;
  });
}

export function formatJobDate(iso: string, emptyLabel = "Tanpa batas"): string {
  if (!iso) return emptyLabel;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function statusBadgeClass(status: string, inactiveTab: boolean): string {
  if (inactiveTab) return "bg-gray-100 text-gray-600 border border-gray-200/50";
  switch (status) {
    case "Waiting":
      return "bg-amber-50 text-amber-700 border border-amber-200/50";
    case "Open":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
    case "Submission Day":
      return "bg-red-50 text-red-700 border border-red-200/50";
    case "Ongoing":
      return "bg-blue-50 text-blue-700 border border-blue-200/50";
    case "Mansetsu Day":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200/50";
  }
}
