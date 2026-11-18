import type { RiwayatPekerjaan } from "@/components/cv-form/types";
import { isPekerjaanFilled } from "@/lib/cv-slots";

export function isPekerjaanRowEmpty(item: RiwayatPekerjaan): boolean {
  return !isPekerjaanFilled(item);
}

export function filterFilledPekerjaan(items: RiwayatPekerjaan[]): RiwayatPekerjaan[] {
  return items.filter((item) => !isPekerjaanRowEmpty(item));
}
