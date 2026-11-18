import type { LpkStudentRecord } from "@/types/lpk-student";

export const SIM_JEPANG_OPTIONS = [
  { value: "", label: "Tidak punya" },
  { value: "futsuu", label: "普通 / Futsuu" },
  { value: "jun-chugata", label: "準中型 / Jun-chugata" },
  { value: "chugata", label: "中型 / Chugata" },
  { value: "ogata", label: "大型 / Ogata" },
  { value: "ogata-tokushu", label: "大型特殊 / Ogata tokushu" },
];

export const LPK_PROGRAM_OPTIONS = [
  { value: "tg", label: "Tokutei Ginou" },
  { value: "ikusei", label: "Ikusei Shuro" },
] as const;

export function hasilLabel(hasil: string | undefined): string {
  if (hasil === "lulus") return "Lolos";
  if (hasil === "tidak") return "Tidak lolos";
  return "Belum";
}

export function programLabel(program: string | undefined): string {
  if (program === "ikusei") return "Ikusei Shuro";
  if (program === "tg") return "Tokutei Ginou";
  if (program === "reguler") return "Reguler";
  return "";
}

export function lembagaLabel(program: string | undefined): string {
  if (program === "tg") return "TSK";
  if (program === "ikusei") return "Kumiai";
  return "Lembaga";
}

/** Magang (Ikusei) memakai Kumiai. Tokutei Ginou memakai TSK. */
export function namaPengirim(student: Pick<LpkStudentRecord, "program" | "tsk" | "nama_kumiai">): string {
  if (student.program === "ikusei") return student.nama_kumiai?.trim() || "";
  if (student.program === "tg") return student.tsk?.trim() || "";
  return student.tsk?.trim() || student.nama_kumiai?.trim() || "";
}

/** Saat mensetsu lolos, kaisha job menjadi perusahaan siswa dan pengirim masuk ke Kumiai atau TSK. */
export function applyMensetsuToStudent(
  student: LpkStudentRecord,
  job: { company?: string; pengirim?: string },
  result: "lulus" | "tidak" | "",
): LpkStudentRecord {
  const next: LpkStudentRecord = { ...student, hasil_job: result };
  if (result !== "lulus") return next;
  const company = job.company?.trim();
  if (company && company !== "-") next.nama_perusahaan = company;
  const pengirim = job.pengirim?.trim();
  if (pengirim) {
    if (student.program === "ikusei") next.nama_kumiai = pengirim;
    else if (student.program === "tg") next.tsk = pengirim;
  }
  return next;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseDateOnly(value: string | undefined): Date | null {
  if (!value?.trim()) return null;
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Siswa pindah ke alumni setelah di-assign, atau setelah tanggal perkiraan masuk Jepang terlewati. */
export function isAlumniByEntry(
  student: Pick<LpkStudentRecord, "perkiraan_masuk_jepang" | "assigned_alumni">,
  today = new Date(),
): boolean {
  if (student.assigned_alumni) return true;
  const entry = parseDateOnly(student.perkiraan_masuk_jepang);
  if (!entry) return false;
  return entry.getTime() <= startOfDay(today).getTime();
}

/** Tahun yang diisi manual dipakai. Jika kosong: Ikusei +3 tahun, TG +5 tahun, dari tahun perkiraan masuk. */
export function estimasiPulang(student: Pick<LpkStudentRecord, "program" | "perkiraan_masuk_jepang" | "estimasi_pulang">): string {
  const manual = student.estimasi_pulang?.trim();
  if (manual) return manual;
  const entry = parseDateOnly(student.perkiraan_masuk_jepang);
  if (!entry) return "";
  const years = student.program === "tg" ? 5 : student.program === "ikusei" ? 3 : 0;
  if (!years) return "";
  return String(entry.getFullYear() + years);
}

export function simJepangLabel(value: string | undefined): string {
  return SIM_JEPANG_OPTIONS.find((item) => item.value === value)?.label ?? value ?? "";
}
