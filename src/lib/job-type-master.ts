const STORAGE_KEY = "flora_job_type_master_v1";

const DEFAULT_JOB_TYPES = [
  "Kaigo",
  "Driver",
  "Pengelasan",
  "Manufaktur",
  "Pertanian",
  "Pengolahan makanan",
  "Konstruksi",
];

export function loadJobTypes(): string[] {
  if (typeof window === "undefined") return [...DEFAULT_JOB_TYPES];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const extra = raw ? (JSON.parse(raw) as string[]) : [];
    const merged = [...DEFAULT_JOB_TYPES, ...(Array.isArray(extra) ? extra : [])];
    return Array.from(new Set(merged.map((item) => item.trim()).filter(Boolean)));
  } catch {
    return [...DEFAULT_JOB_TYPES];
  }
}

export function addJobType(name: string): string[] {
  const clean = name.trim();
  if (!clean) return loadJobTypes();
  const current = loadJobTypes();
  if (current.some((item) => item.toLocaleLowerCase("id") === clean.toLocaleLowerCase("id"))) {
    return current;
  }
  const extraRaw = localStorage.getItem(STORAGE_KEY);
  const extra = extraRaw ? (JSON.parse(extraRaw) as string[]) : [];
  extra.push(clean);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(extra));
  return loadJobTypes();
}
