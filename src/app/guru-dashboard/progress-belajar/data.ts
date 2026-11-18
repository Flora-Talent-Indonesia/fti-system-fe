export type ScoreValue = number | string | null;

export type AspectScores = Record<string, ScoreValue>;

export type NumericAspect = "kotoba" | "bunpou" | "choukai" | "kaiwa" | "kanji" | "praktek" | "praktek_kaigo";
export type AspectKey = NumericAspect | "sikap";

export type NilaiRevisions = {
  aspects: Partial<Record<NumericAspect, string>>;
  sub_nilai: string;
  sikap: string;
};

export type SikapPeriod =
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09"
  | "10"
  | "11"
  | "12"
  | "akhir";

export const SIKAP_PERIODS: { id: SikapPeriod; label: string }[] = [
  { id: "01", label: "Januari" },
  { id: "02", label: "Februari" },
  { id: "03", label: "Maret" },
  { id: "04", label: "April" },
  { id: "05", label: "Mei" },
  { id: "06", label: "Juni" },
  { id: "07", label: "Juli" },
  { id: "08", label: "Agustus" },
  { id: "09", label: "September" },
  { id: "10", label: "Oktober" },
  { id: "11", label: "November" },
  { id: "12", label: "Desember" },
  { id: "akhir", label: "Akhir" },
];

export type GuruJalurMode = "magang" | "tg" | "driver";

export const JALUR_OPTIONS: { id: GuruJalurMode; label: string }[] = [
  { id: "magang", label: "Magang" },
  { id: "tg", label: "TG" },
  { id: "driver", label: "Job matching Driver" },
];

export const ASPECTS_BY_JALUR: Record<GuruJalurMode, AspectKey[]> = {
  magang: ["praktek", "kaiwa", "sikap"],
  tg: ["kotoba", "choukai", "bunpou", "kanji", "kaiwa", "sikap", "praktek_kaigo"],
  driver: ["kaiwa", "sikap"],
};

export type ProgressRow = {
  id: number;
  no_peserta: string;
  nama_lengkap: string;
  kelas: string;
  pusat: "Bogor" | "Jakarta";
  perusahaan: string;
  program: "ikusei" | "tg";
  job: string;
  ujian_n5: string;
  ujian_n4: string;
  keterangan: string;
  keterangans: Record<string, string>;
  progress_percentages: Record<string, number>;
  revisions: NilaiRevisions;

  kotoba: AspectScores;
  bunpou: AspectScores;
  choukai: AspectScores;
  kaiwa: AspectScores;
  kanji: AspectScores;
  praktek: AspectScores;
  praktek_kaigo: AspectScores;
  sikap: Record<SikapPeriod, AspectScores>;

  ujian_n5_score: ScoreValue;
  ujian_n4_score: ScoreValue;

  foto?: string | null;
  nama_katakana?: string;
};

export type ColumnDef = {
  key: string;
  label: string;
  nLevel: 5 | 4;
};

export const KKM = 70;

export const KAIWA_EXAM_SETS = [
  ["kaiwa_uts_meta", "kaiwa_uts_syana", "kaiwa_uts_eko"],
  ["kaiwa_uas_meta", "kaiwa_uas_syana", "kaiwa_uas_eko"],
];

function block(prefix: string, from: number, to: number, size: number, nLevel: 5 | 4, title = "Bab"): ColumnDef[] {
  const cols: ColumnDef[] = [];
  for (let start = from; start <= to; start += size) {
    const end = Math.min(start + size - 1, to);
    cols.push({
      key: end === start ? `${prefix}_${start}` : `${prefix}_${start}_${end}`,
      label: end === start ? `${title} ${start}` : `${title} ${start}–${end}`,
      nLevel,
    });
  }
  return cols;
}

function materiColumns(prefix: string): ColumnDef[] {
  return [
    ...block(prefix, 1, 20, 4, 5),
    { key: `${prefix}_21_25`, label: "Bab 21–25 · UTS", nLevel: 5 },
    ...block(prefix, 26, 45, 4, 4),
    { key: `${prefix}_46_50`, label: "Bab 46–50 · UAS", nLevel: 4 },
  ];
}

function kaiwaColumns(): ColumnDef[] {
  return [
    ...block("kaiwa", 1, 20, 4, 5),
    { key: "kaiwa_uts_meta", label: "Bab 21–25 · UTS · Ibu Meta", nLevel: 5 },
    { key: "kaiwa_uts_syana", label: "Bab 21–25 · UTS · Bu Syana", nLevel: 5 },
    { key: "kaiwa_uts_eko", label: "Bab 21–25 · UTS · Pak Eko", nLevel: 5 },
    ...block("kaiwa", 26, 45, 4, 4),
    { key: "kaiwa_uas_meta", label: "Bab 46–50 · UAS · Ibu Meta", nLevel: 4 },
    { key: "kaiwa_uas_syana", label: "Bab 46–50 · UAS · Bu Syana", nLevel: 4 },
    { key: "kaiwa_uas_eko", label: "Bab 46–50 · UAS · Pak Eko", nLevel: 4 },
  ];
}

function kanjiColumns(): ColumnDef[] {
  return [
    ...block("kanji", 1, 9, 3, 5),
    { key: "kanji_10_11", label: "Bab 10–11 · UTS", nLevel: 5 },
    ...block("kanji_n4", 1, 18, 3, 4, "N4 Bab"),
    { key: "kanji_42_45", label: "Bab 42–45", nLevel: 4 },
    { key: "kanji_46_50", label: "Bab 46–50 · UAS", nLevel: 4 },
  ];
}

export const aspectsConfig: Record<AspectKey, { label: string; columns: ColumnDef[] }> = {
  kotoba: { label: "言葉 (Kosakata)", columns: materiColumns("kotoba") },
  bunpou: { label: "文法 (Tata Bahasa)", columns: materiColumns("bunpou") },
  choukai: { label: "聴解 (Chokai)", columns: materiColumns("choukai") },
  kaiwa: { label: "会話 (Kaiwa)", columns: kaiwaColumns() },
  kanji: { label: "漢字 (Kanji)", columns: kanjiColumns() },
  praktek: {
    label: "実技 (Praktek)",
    columns: [{ key: "nilai", label: "Nilai praktek", nLevel: 5 }],
  },
  praktek_kaigo: {
    label: "介護実技 (Praktek Kaigo)",
    columns: [{ key: "nilai", label: "Nilai praktek kaigo", nLevel: 5 }],
  },
  sikap: {
    label: "性格 (Sikap)",
    columns: [
      { key: "kedisiplinan", label: "Kedisiplinan", nLevel: 5 },
      { key: "cara_komunikasi", label: "Cara Komunikasi", nLevel: 5 },
      { key: "kesopanan", label: "Kesopanan", nLevel: 5 },
      { key: "kontrol_emosi", label: "Kontrol Emosi", nLevel: 5 },
      { key: "inisiatif", label: "Inisiatif", nLevel: 5 },
      { key: "percaya_diri", label: "Percaya Diri", nLevel: 5 },
      { key: "kejujuran", label: "Kejujuran", nLevel: 5 },
      { key: "tanggung_jawab", label: "Tanggung Jawab", nLevel: 5 },
    ],
  },
};

export const emptyNilaiRevisions = (): NilaiRevisions => ({
  aspects: {},
  sub_nilai: "",
  sikap: "",
});

export type MateriAspect = NumericAspect;
export type NilaiSaveScope = "exams" | "sikap" | MateriAspect;
export const MATERI_ASPECTS: MateriAspect[] = ["kotoba", "bunpou", "choukai", "kaiwa", "kanji", "praktek", "praktek_kaigo"];

export function toScoreNumber(value: ScoreValue): number | null {
  if (value === null || value === undefined || value === "-" || value === "") return null;
  const num = typeof value === "string" ? parseInt(value, 10) : value;
  return Number.isNaN(num) ? null : num;
}

export function gradeBand(score: number): { letter: string; className: string } {
  if (score >= 85) return { letter: "A", className: "font-semibold text-green-600" };
  if (score >= 80) return { letter: "A−", className: "font-semibold text-green-600" };
  if (score >= 75) return { letter: "B+", className: "font-semibold text-yellow-600" };
  if (score >= 70) return { letter: "B", className: "font-semibold text-yellow-600" };
  if (score >= 55) return { letter: "C", className: "font-semibold text-red-600" };
  if (score >= 40) return { letter: "D", className: "font-semibold text-red-600" };
  return { letter: "", className: "font-semibold text-red-600" };
}

export function meetsKkm(value: ScoreValue) {
  const num = toScoreNumber(value);
  return num !== null && num >= KKM;
}

/** Rata-rata angka. Tiga penguji UTS atau UAS kaiwa dihitung sebagai satu nilai. */
export function averageScore(scores: AspectScores, columns: ColumnDef[]): number | null {
  const grouped = new Set(KAIWA_EXAM_SETS.flat());
  const values: number[] = [];
  columns.forEach((col) => {
    if (grouped.has(col.key)) return;
    const num = toScoreNumber(scores?.[col.key]);
    if (num !== null) values.push(num);
  });
  KAIWA_EXAM_SETS.forEach((keys) => {
    const used = keys.filter((key) => columns.some((col) => col.key === key));
    if (used.length === 0) return;
    const nums = used.map((key) => toScoreNumber(scores?.[key])).filter((num): num is number => num !== null);
    if (nums.length === 0) return;
    values.push(nums.reduce((sum, num) => sum + num, 0) / nums.length);
  });
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, num) => sum + num, 0) / values.length);
}

/** Persen kolom yang mencapai KKM. Tiga penguji kaiwa dihitung sebagai satu nilai ujian (rata-rata). */
export function numericProgress(scores: AspectScores, columns: ColumnDef[]) {
  const grouped = new Set(KAIWA_EXAM_SETS.flat());
  let passed = 0;
  let total = 0;
  columns.forEach((col) => {
    if (grouped.has(col.key)) return;
    total += 1;
    if (meetsKkm(scores[col.key])) passed += 1;
  });
  KAIWA_EXAM_SETS.forEach((keys) => {
    if (!keys.every((key) => columns.some((col) => col.key === key))) return;
    total += 1;
    const nums = keys.map((key) => toScoreNumber(scores[key])).filter((num): num is number => num !== null);
    if (nums.length === keys.length && nums.reduce((sum, num) => sum + num, 0) / nums.length >= KKM) passed += 1;
  });
  return total === 0 ? 0 : Math.ceil((passed / total) * 100);
}

export function sikapProgress(scores: AspectScores, columns: ColumnDef[]) {
  const filled = columns.filter((col) => {
    const value = scores?.[col.key];
    return value !== null && value !== undefined && value !== "-" && value !== "";
  }).length;
  return columns.length === 0 ? 0 : Math.ceil((filled / columns.length) * 100);
}

export function emptySikap(): Record<SikapPeriod, AspectScores> {
  const scores: AspectScores = {};
  aspectsConfig.sikap.columns.forEach((col) => {
    scores[col.key] = "-";
  });
  return Object.fromEntries(SIKAP_PERIODS.map((period) => [period.id, { ...scores }])) as Record<SikapPeriod, AspectScores>;
}

export const EXAM_STATUSES = ["Belum", "Lulus", "Gagal"] as const;

export function examStatus(value: unknown): (typeof EXAM_STATUSES)[number] {
  if (value === "Lulus") return "Lulus";
  if (value === "Gagal" || value === "Remedial") return "Gagal";
  return "Belum";
}

export function mapApiUserToProgressRow(userModel: any, index: number): ProgressRow {
  const student: Partial<ProgressRow> = {
    id: index + 1,
    no_peserta: userModel.user_name || "-",
    nama_lengkap: userModel.name || "-",
    kelas: userModel.nama_kelas || "-",
    pusat: userModel.pusat === "Jakarta" ? "Jakarta" : "Bogor",
    perusahaan: userModel.perusahaan || "-",
    program: userModel.program === "tg" ? "tg" : "ikusei",
    job: userModel.job || "-",
    nama_katakana: userModel.nama_katakana || "",
    keterangan: userModel.catatan_sikap_siswa || "-",
    ujian_n5: examStatus(userModel.ujian_n5),
    ujian_n4: examStatus(userModel.ujian_n4),
    ujian_n5_score: userModel.nilai_n5 ?? "-",
    ujian_n4_score: userModel.nilai_n4 ?? "-",
    revisions: userModel.revisions ?? emptyNilaiRevisions(),
    keterangans: {},
    progress_percentages: {},
    sikap: emptySikap(),
  };

  MATERI_ASPECTS.forEach((aspect) => {
    const scores: AspectScores = {};
    aspectsConfig[aspect].columns.forEach((col, idx) => {
      const fromApi = userModel[aspect]?.[`bab_${idx + 1}`];
      scores[col.key] = fromApi ?? "-";
    });
    student[aspect] = scores;
    student.keterangans![aspect] = userModel[aspect]?.keterangan || "-";
    student.progress_percentages![aspect] = numericProgress(scores, aspectsConfig[aspect].columns);
  });

  const sikapSource = userModel.sikap || userModel.kepribadian || {};
  SIKAP_PERIODS.forEach((period) => {
    const bag = sikapSource[period.id] || (period.id === "akhir" ? sikapSource : {});
    const scores: AspectScores = {};
    aspectsConfig.sikap.columns.forEach((col) => {
      scores[col.key] = bag[col.key] ?? "-";
    });
    student.sikap![period.id] = scores;
  });
  student.keterangans!.sikap = userModel.catatan_sikap_siswa || "-";
  student.progress_percentages!.sikap = sikapProgress(student.sikap!.akhir, aspectsConfig.sikap.columns);

  return student as ProgressRow;
}
