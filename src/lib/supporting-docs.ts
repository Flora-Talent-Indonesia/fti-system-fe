import type { DokumenPendukung } from "@/components/cv-form/types";
import type { LpkStudentRecord } from "@/types/lpk-student";

export type StudentDocKey =
  | "dokumen_ktp"
  | "dokumen_ktp_ortu"
  | "dokumen_kk"
  | "dokumen_akte"
  | "dokumen_paspor_file"
  | "dokumen_ijazah"
  | "dokumen_skck"
  | "mcu_pdf"
  | "dokumen_perjanjian";

export type SupportingDoc = {
  cvKey: keyof DokumenPendukung;
  studentKey: StudentDocKey;
  label: string;
  hint: string;
};

/** Satu daftar untuk semua form dan tampilan dokumen pendukung. */
export const SUPPORTING_DOCS: SupportingDoc[] = [
  { cvKey: "ktp", studentKey: "dokumen_ktp", label: "1. KTP", hint: "Hasil pindai PDF." },
  { cvKey: "ktp_ortu", studentKey: "dokumen_ktp_ortu", label: "2. KTP Orang Tua/Wali", hint: "Hasil pindai PDF." },
  { cvKey: "kk", studentKey: "dokumen_kk", label: "3. Kartu Keluarga (KK)", hint: "Hasil pindai PDF." },
  { cvKey: "akte_kelahiran", studentKey: "dokumen_akte", label: "4. Akta Kelahiran", hint: "Hasil pindai PDF." },
  { cvKey: "paspor", studentKey: "dokumen_paspor_file", label: "5. Paspor (jika sudah ada)", hint: "Opsional. Jika sudah ada, unggah hasil pindai PDF." },
  { cvKey: "ijazah_terakhir", studentKey: "dokumen_ijazah", label: "6. Ijazah (SD hingga pendidikan terakhir)", hint: "Hasil pindai PDF, dari SD sampai pendidikan terakhir." },
  { cvKey: "skck", studentKey: "dokumen_skck", label: "7. SKCK", hint: "Hasil pindai PDF." },
  { cvKey: "mcu", studentKey: "mcu_pdf", label: "8. Hasil MCU", hint: "Hasil pindai PDF." },
  { cvKey: "surat_perjanjian", studentKey: "dokumen_perjanjian", label: "9. Surat Perjanjian", hint: "Diunggah setelah lulus mensetsu. Hasil pindai PDF." },
];

function filled(value: unknown): boolean {
  const text = String(value ?? "").trim();
  return text.length > 0 && text !== "-";
}

export function docShortLabel(label: string): string {
  return label.replace(/^\d+\.\s*/, "");
}

/** Paspor opsional. Surat perjanjian baru wajib setelah lulus mensetsu. */
export function missingRequiredDocs(
  source: Partial<Record<StudentDocKey, string>> & { hasil_job?: string; status?: string }
): SupportingDoc[] {
  const passed = source.hasil_job === "lulus" || source.status === "match_job";
  return SUPPORTING_DOCS.filter((doc) => {
    if (doc.studentKey === "dokumen_paspor_file") return false;
    if (doc.studentKey === "dokumen_perjanjian" && !passed) return false;
    return !filled(source[doc.studentKey]);
  });
}

export function missingRequiredDocsFromCv(dokumen: DokumenPendukung, passedMensetsu = false): SupportingDoc[] {
  return SUPPORTING_DOCS.filter((doc) => {
    if (doc.cvKey === "paspor") return false;
    if (doc.cvKey === "surat_perjanjian" && !passedMensetsu) return false;
    return !filled(dokumen[doc.cvKey]);
  });
}

export function missingDocNames(docs: SupportingDoc[]): string {
  return docs.map((doc) => docShortLabel(doc.label)).join(", ");
}
