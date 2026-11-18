import { LPK_PARTNERS } from "@/data/mock";
import { loadAllStudents } from "@/lib/fti-student-account-storage";
import { loadKelasList } from "@/lib/fti-kelas-storage";
import { seedLpkStudentsIfEmpty } from "@/lib/lpk-student-storage";
import { isAlumniByEntry } from "@/lib/placement";
import type { LpkStudentRecord } from "@/types/lpk-student";
import type { GuruSiswa } from "./siswa";

const PARTNER_NAMES = new Set(LPK_PARTNERS.map((partner) => partner.name));

function titleName(value: string) {
  return value.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function activePartnerStudents(): LpkStudentRecord[] {
  if (typeof window === "undefined") return [];
  return seedLpkStudentsIfEmpty().filter(
    (student) => PARTNER_NAMES.has(student.asal_lpk) && !isAlumniByEntry(student) && student.no_peserta.trim(),
  );
}

export function lpkAsalByUsername(): Map<string, string> {
  const map = new Map<string, string>();
  for (const student of activePartnerStudents()) {
    map.set(student.no_peserta.trim().toUpperCase(), student.asal_lpk);
  }
  return map;
}

/** Siswa LPK Mitra yang sudah dimasukkan ke kelas FTI, dengan nama kelas dan TC dari kelas itu. */
export function assignedLpkGuruSiswa(): GuruSiswa[] {
  if (typeof window === "undefined") return [];
  const byNumber = new Map(activePartnerStudents().map((student) => [student.no_peserta.trim().toUpperCase(), student]));
  const classes = loadKelasList();
  const rows: GuruSiswa[] = [];

  for (const account of loadAllStudents()) {
    if (Number(account.is_active) !== 1 || account.id_kelas == null) continue;
    const student = byNumber.get(account.user_name.trim().toUpperCase());
    if (!student) continue;
    const kelas = classes.find((row) => row.id_kelas === account.id_kelas && row.is_active === 1);
    if (!kelas?.cabang || (kelas.cabang !== "Bogor" && kelas.cabang !== "Jakarta")) continue;
    rows.push({
      id: student.id,
      noPeserta: student.no_peserta,
      nama: titleName(student.nama_lengkap),
      katakana: student.nama_katakana || "",
      angkatan: student.angkatan || "",
      kelas: kelas.nama_kelas,
      pusat: kelas.cabang,
      program: student.program === "tg" ? "tg" : "ikusei",
      job: student.jenis_pekerjaan || "",
      perusahaan: student.nama_perusahaan || student.asal_lpk,
    });
  }

  return rows.sort((left, right) => left.nama.localeCompare(right.nama, "id"));
}
