import type { CatatanCv } from "@/components/cv-form/types";

export const CATATAN_NASHI = "なし";
export const CATATAN_ARU = "あり";

/** Nilai lama berupa teks bebas tetap tampil sampai diganti なし atau あり. */
export function displayNashiAruStatus(status: string | undefined, legacyText = ""): string {
  const current = (status ?? "").trim();
  if (current === CATATAN_NASHI || current === CATATAN_ARU) return current;
  const legacy = legacyText.trim();
  if (legacy === CATATAN_NASHI) return CATATAN_NASHI;
  if (legacy) return CATATAN_ARU;
  return "";
}

export function formatSisaMasa(catatan: Pick<CatatanCv, "sisa_hari_tokutei" | "sisa_tahun" | "sisa_bulan">): string {
  const status = (catatan.sisa_hari_tokutei ?? "").trim();
  if (status === CATATAN_ARU) {
    const tahun = (catatan.sisa_tahun ?? "").replace(/\D/g, "");
    const bulan = (catatan.sisa_bulan ?? "").replace(/\D/g, "");
    return [tahun ? `${tahun}年` : "", bulan ? `${bulan}ヶ月` : ""].filter(Boolean).join("");
  }
  if (status === CATATAN_NASHI) return CATATAN_NASHI;
  return status;
}

export function formatKeteranganMedis(
  catatan: Pick<CatatanCv, "keterangan_medis_status" | "keterangan_medis">,
): string {
  const status = (catatan.keterangan_medis_status ?? "").trim();
  if (status === CATATAN_NASHI) return CATATAN_NASHI;
  if (status === CATATAN_ARU) return (catatan.keterangan_medis ?? "").trim();
  return (catatan.keterangan_medis ?? "").trim();
}
