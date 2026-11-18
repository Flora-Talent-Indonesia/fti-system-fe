import * as XLSX from "xlsx";
import { fmtGender } from "@/app/lpk-mitra/components/table-helpers";
import { hasilLabel, lembagaLabel, namaPengirim, programLabel } from "@/lib/placement";
import { studentFileName } from "@/lib/student-file-name";
import type { LpkStudentRecord } from "@/types/lpk-student";

function text(value: string | number | null | undefined) {
  if (value === null || value === undefined || String(value).trim() === "") return "-";
  return String(value);
}

function safeFilePart(value: string) {
  return value.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "_").slice(0, 40);
}

export function downloadExcel(filename: string, sheetName: string, headers: string[], rows: string[][]) {
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  sheet["!cols"] = headers.map((header, index) => {
    const widest = rows.reduce((max, row) => Math.max(max, (row[index] || "").length), header.length);
    return { wch: Math.min(42, Math.max(12, widest + 2)) };
  });
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, sheetName.slice(0, 31));
  XLSX.writeFile(book, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

export function downloadStudentExcel(students: LpkStudentRecord[], filename: string) {
  const headers = [
    "ID Peserta",
    "Nama Peserta Magang",
    "Katakana",
    "Nama Panggilan",
    "Asal LPK",
    "Angkatan",
    "Kelas",
    "Program",
    "Lembaga",
    "Job",
    "Hasil",
    "Kewarganegaraan",
    "Tanggal Lahir",
    "Usia",
    "Jenis Kelamin",
    "Golongan Darah",
    "Status Pernikahan",
    "Agama",
    "Tempat Lahir",
    "Alamat",
    "Kode Pos",
    "Telepon",
    "Email",
    "Kontak Darurat",
    "Hubungan Darurat",
    "Telepon Darurat",
    "Nama Pengirim",
    "Hasil MCU",
    "Berat Badan",
    "Tinggi Badan",
    "Perusahaan",
    "Tanggal Masuk Pelatihan",
    "Tanggal Kelulusan",
    "Perkiraan Masuk Jepang",
    "Tanggal Keberangkatan",
  ];
  const rows = students.map((student) => [
    text(student.no_peserta),
    text(student.nama_lengkap),
    text(student.nama_katakana),
    text(student.nama_panggilan),
    text(student.asal_lpk),
    text(student.angkatan),
    text(student.kelas),
    text(programLabel(student.program)),
    student.program ? lembagaLabel(student.program) : "-",
    text(student.jenis_pekerjaan),
    hasilLabel(student.hasil_job),
    text(student.kewarganegaraan),
    text(student.tanggal_lahir),
    student.umur ? `${student.umur} thn` : "-",
    text(fmtGender(student.jenis_kelamin)),
    text(student.golongan_darah),
    text(student.status_pernikahan),
    text(student.agama),
    text(student.asal),
    text(student.alamat),
    text(student.kode_pos),
    text(student.telepon),
    text(student.email),
    text(student.kontak_darurat_nama),
    text(student.kontak_darurat_hubungan),
    text(student.kontak_darurat_telepon),
    text(namaPengirim(student)),
    text(student.mcu),
    student.berat_badan ? `${student.berat_badan} kg` : "-",
    student.tinggi_badan ? `${student.tinggi_badan} cm` : "-",
    text(student.nama_perusahaan),
    text(student.tanggal_masuk_pelatihan),
    text(student.tanggal_kelulusan),
    text(student.perkiraan_masuk_jepang),
    text(student.tanggal_keberangkatan),
  ]);
  const date = new Date().toISOString().slice(0, 10);
  const base =
    students.length === 1
      ? studentFileName("Excel", students[0].nama_lengkap)
      : `Data Siswa_${safeFilePart(filename)}_${date}`;
  downloadExcel(`${base}.xlsx`, "Data Siswa", headers, rows);
}
