import type {
  AnggotaKeluarga,
  RiwayatPendidikan,
  RiwayatPekerjaan,
  Sertifikat,
} from "@/components/cv-form/types";

export const PEKERJAAN_SLOT_COUNT = 4;
export const KELUARGA_SLOT_COUNT = 7;
export const SERTIFIKAT_MIN_ROWS = 3;

const text = (value: string | undefined | null) => (value ?? "").trim();

export type PendidikanSlotKey = "sd" | "smp" | "sma" | "univ";

export const PENDIDIKAN_SLOTS: {
  key: PendidikanSlotKey;
  levels: string[];
  heading: string;
  /** Label baris kosong di CV. */
  emptyLabel: string;
  needsJurusan: boolean;
}[] = [
  { key: "sd", levels: ["SD"], heading: "小学校 / SD", emptyLabel: "小学校", needsJurusan: false },
  { key: "smp", levels: ["SMP"], heading: "中学校 / SMP", emptyLabel: "中学校", needsJurusan: false },
  {
    key: "sma",
    levels: ["SMA", "SMK"],
    heading: "高校 / 専門高校",
    emptyLabel: "高校 / 専門高校",
    needsJurusan: true,
  },
  { key: "univ", levels: ["D3", "S1"], heading: "大学", emptyLabel: "大学", needsJurusan: true },
];

export function blankPendidikan(key: PendidikanSlotKey, tingkat = ""): RiwayatPendidikan {
  const slot = PENDIDIKAN_SLOTS.find((item) => item.key === key);
  const fixed = slot && slot.levels.length === 1 ? slot.levels[0] : tingkat;
  return {
    id: `pendidikan-${key}`,
    tahun_masuk: "",
    bulan_masuk: "",
    tanggal_masuk: "",
    tahun_lulus: "",
    bulan_lulus: "",
    tanggal_lulus: "",
    nama_sekolah: "",
    tingkat_pendidikan: fixed,
    jurusan: "",
  };
}

export function hydratePendidikan(item: RiwayatPendidikan): RiwayatPendidikan {
  return {
    ...blankPendidikan("sd"),
    ...item,
    tanggal_masuk: item.tanggal_masuk ?? "",
    tanggal_lulus: item.tanggal_lulus ?? "",
  };
}

export function isPendidikanFilled(item: RiwayatPendidikan): boolean {
  const started = [
    item.nama_sekolah,
    item.jurusan,
    item.tahun_masuk,
    item.bulan_masuk,
    item.tanggal_masuk,
    item.tahun_lulus,
    item.bulan_lulus,
    item.tanggal_lulus,
  ].some((value) => text(value).length > 0);
  if (started) return true;
  return ["SMA", "SMK", "D3", "S1"].includes(item.tingkat_pendidikan);
}

export function arrangePendidikan(items: RiwayatPendidikan[]): {
  slots: RiwayatPendidikan[];
  overflow: RiwayatPendidikan[];
} {
  const used = new Set<number>();
  const levelOf = (item: RiwayatPendidikan) => text(item.tingkat_pendidikan).toUpperCase();
  const slots = PENDIDIKAN_SLOTS.map((slot) => {
    const slotId = `pendidikan-${slot.key}`;
    let idx = items.findIndex((item, index) => !used.has(index) && item.id === slotId && isPendidikanFilled(item));
    if (idx < 0) {
      idx = items.findIndex((item, index) => {
        if (used.has(index) || !isPendidikanFilled(item)) return false;
        return slot.levels.includes(levelOf(item));
      });
    }
    if (idx < 0) return blankPendidikan(slot.key);
    used.add(idx);
    const source = hydratePendidikan(items[idx]);
    return {
      ...source,
      tingkat_pendidikan: levelOf(source) || source.tingkat_pendidikan,
    };
  });
  const overflow = items
    .filter((item, index) => !used.has(index) && isPendidikanFilled(item))
    .map(hydratePendidikan);
  return { slots, overflow };
}

export function pendidikanGakureki(tingkat: string, jurusan: string, emptyLabel: string): string {
  const level = text(tingkat).toUpperCase();
  const jur = text(jurusan);
  const wrap = (base: string) => (jur ? `${base}（${jur}）` : base);
  if (level === "SMK") return wrap("専門高校");
  if (level === "SMA") return wrap("高校");
  if (level === "D3" || level === "S1") return wrap("大学");
  if (level === "SD") return "小学校";
  if (level === "SMP") return "中学校";
  if (jur) return jur;
  return emptyLabel;
}

export function blankPekerjaan(index: number): RiwayatPekerjaan {
  return {
    id: `pekerjaan-slot-${index + 1}`,
    tahun_mulai: "",
    bulan_mulai: "",
    tanggal_mulai: "",
    tahun_selesai: "",
    bulan_selesai: "",
    tanggal_selesai: "",
    nama_perusahaan: "",
    status_pekerjaan: "",
    posisi_pekerjaan: "",
    jenis_pekerjaan: "",
    deskripsi_pekerjaan: "",
  };
}

export function hydratePekerjaan(item: RiwayatPekerjaan): RiwayatPekerjaan {
  return {
    ...blankPekerjaan(0),
    ...item,
    tanggal_mulai: item.tanggal_mulai ?? "",
    tanggal_selesai: item.tanggal_selesai ?? "",
    jenis_pekerjaan: item.jenis_pekerjaan ?? "",
    deskripsi_pekerjaan: item.deskripsi_pekerjaan ?? "",
  };
}

export function isPekerjaanFilled(item: RiwayatPekerjaan): boolean {
  return [
    item.nama_perusahaan,
    item.posisi_pekerjaan,
    item.status_pekerjaan,
    item.jenis_pekerjaan,
    item.deskripsi_pekerjaan,
    item.bulan_mulai,
    item.tahun_mulai,
    item.tanggal_mulai,
    item.bulan_selesai,
    item.tahun_selesai,
    item.tanggal_selesai,
  ].some((value) => text(value).length > 0);
}

export function padPekerjaan(items: RiwayatPekerjaan[]): RiwayatPekerjaan[] {
  const rows = items.map(hydratePekerjaan);
  for (let i = rows.length; i < PEKERJAAN_SLOT_COUNT; i += 1) rows.push(blankPekerjaan(i));
  return rows;
}

export function blankKeluarga(index: number): AnggotaKeluarga {
  return {
    id: `keluarga-slot-${index + 1}`,
    hubungan: "",
    nama_anggota: "",
    umur: "",
    pekerjaan: "",
  };
}

export function isKeluargaFilled(item: AnggotaKeluarga): boolean {
  return [item.hubungan, item.nama_anggota, item.umur, item.pekerjaan].some(
    (value) => text(value).length > 0,
  );
}

export function padKeluarga(items: AnggotaKeluarga[]): AnggotaKeluarga[] {
  const rows = items.map((item) => ({ ...blankKeluarga(0), ...item, umur: item.umur ?? "" }));
  for (let i = rows.length; i < KELUARGA_SLOT_COUNT; i += 1) rows.push(blankKeluarga(i));
  return rows;
}

export function blankSertifikat(index: number): Sertifikat {
  return {
    id: `sertifikat-slot-${index + 1}`,
    tahun_diperoleh: "",
    bulan_diperoleh: "",
    tanggal_diperoleh: "",
    nama_sertifikat: "",
    status_kelulusan: "",
    keterangan_skor: "",
    foto_sertifikat: "",
  };
}

export function hydrateSertifikat(item: Sertifikat): Sertifikat {
  return { ...blankSertifikat(0), ...item, tanggal_diperoleh: item.tanggal_diperoleh ?? "" };
}

export function isSertifikatFilled(item: Sertifikat): boolean {
  return [
    item.nama_sertifikat,
    item.status_kelulusan,
    item.keterangan_skor,
    item.bulan_diperoleh,
    item.tahun_diperoleh,
    item.tanggal_diperoleh,
    item.foto_sertifikat,
  ].some((value) => text(value).length > 0);
}

/** Tahun dan bulan. Hari tidak dicetak di pendidikan, pekerjaan, dan sertifikat. */
export function formatCvYm(year?: string, month?: string): string {
  const y = text(year);
  const m = text(month);
  if (!y && !m) return "";
  return `${y}年${m}月`;
}

/** Tanggal ISO `YYYY-MM-DD` menjadi `YYYY年M月D日` tanpa geser zona waktu. */
export function formatIsoDateJa(iso: string | undefined): string {
  const raw = text(iso);
  if (!raw) return "";
  const match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return raw;
  return `${Number(match[1])}年${Number(match[2])}月${Number(match[3])}日`;
}
