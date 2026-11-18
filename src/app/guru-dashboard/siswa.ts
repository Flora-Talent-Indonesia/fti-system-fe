import { buildFtiDummyProfiles } from "@/data/dummy-fti-students";

export const GURU_PUSAT_OPTIONS = ["Bogor", "Jakarta"] as const;
export type GuruPusat = (typeof GURU_PUSAT_OPTIONS)[number];

export type GuruSiswa = {
  id: string;
  noPeserta: string;
  nama: string;
  katakana: string;
  angkatan: string;
  kelas: string;
  pusat: GuruPusat;
  program: "ikusei" | "tg";
  job: string;
  perusahaan: string;
};

const KANA: Record<string, string> = {
  AGUS: "アグス",
  BAGAS: "バガス",
  CAHYA: "チャヒャ",
  DEDI: "デディ",
  EKO: "エコ",
  FAJAR: "ファジャル",
  GALIH: "ガリフ",
  HENDRA: "ヘンドラ",
  IRFAN: "イルファン",
  JOKO: "ジョコ",
  KURNIA: "クルニア",
  LUTFI: "ルトフィ",
  MAULANA: "マウラナ",
  NANDA: "ナンダ",
  OMAR: "オマル",
  AYU: "アユ",
  BUNGA: "ブンガ",
  CITRA: "チトラ",
  DEWI: "デウィ",
  ELSA: "エルサ",
  FITRI: "フィトリ",
  GITA: "ギタ",
  HANA: "ハナ",
  INTAN: "インタン",
  JULIA: "ジュリア",
  KIRANA: "キラナ",
  LINA: "リナ",
  MAYA: "マヤ",
  NADIA: "ナディア",
  PUTRI: "プトリ",
  SAPUTRA: "サプトラ",
  PRATAMA: "プラタマ",
  NUGROHO: "ヌグロホ",
  WIJAYA: "ウィジャヤ",
  SANTOSO: "サントソ",
  KURNIAWAN: "クルニアワン",
  HIDAYAT: "ヒダヤット",
  RAMADHAN: "ラマダン",
  SETIAWAN: "セティアワン",
  PERMANA: "ペルマナ",
  FIRMANSYAH: "フィルマンシャー",
  KUSUMA: "クスマ",
  WIBOWO: "ウィボウォ",
  GUNAWAN: "グナワン",
  HARTONO: "ハルトノ",
  LESMANA: "レスマナ",
  PRASETYO: "プラセティヨ",
  UTOMO: "ウトモ",
  RAHMAN: "ラフマン",
  SYAHPUTRA: "シャハプトラ",
  NUGRAHA: "ヌグラハ",
  MAHENDRA: "マヘンドラ",
  SIREGAR: "シレガル",
  NASUTION: "ナスティオン",
  HAKIM: "ハキム",
  FADILLAH: "ファディラ",
  ALAMSYAH: "アラムシャー",
  WIDODO: "ウィドド",
  BUDIANTO: "ブディアント",
  DARMAWAN: "ダルマワン",
};

function titleName(value: string) {
  return value.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function toKatakana(nama: string) {
  return nama
    .split(/\s+/)
    .map((part) => KANA[part] ?? part)
    .join("・");
}

/** 15 siswa pertama di Bogor, 15 berikutnya di Jakarta. Kelas dan pekerjaan mengikuti profil yang sama. */
export function buildGuruSiswa(): GuruSiswa[] {
  return buildFtiDummyProfiles().map((profile, index) => ({
    id: profile.no,
    noPeserta: profile.no,
    nama: titleName(profile.nama),
    katakana: toKatakana(profile.nama),
    angkatan: profile.angkatan,
    kelas: profile.kelas,
    pusat: index < 15 ? "Bogor" : "Jakarta",
    program: profile.program,
    job: profile.job,
    perusahaan: profile.perusahaan,
  }));
}

export const GURU_SISWA: GuruSiswa[] = buildGuruSiswa();

export function isDriverJob(job: string) {
  return /driver/i.test(job);
}
