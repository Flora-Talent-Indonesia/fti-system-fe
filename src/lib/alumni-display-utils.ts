import type { JobPlacement, LpkStudentRecord, LpkStudentStatus } from "@/types/lpk-student";

export function fmtJalurPendaftaran(asalLpk: string | null | undefined): string {
  if (!asalLpk || asalLpk.toLowerCase() === "fti" || asalLpk.toLowerCase() === "mandiri") {
    return "Mandiri";
  }
  return asalLpk;
}

export function statusSiswaLabel(status: LpkStudentStatus): string {
  if (status === "match_job") return "Sudah Lulus";
  if (status === "aktif") return "Sedang Dalam Pembelajaran";
  return "Tidak Lulus";
}

export function statusSiswaColor(status: LpkStudentStatus): string {
  if (status === "match_job") return "bg-green-50 text-green-700 border-green-200";
  if (status === "aktif") return "bg-yellow-50 text-yellow-700 border-yellow-200";
  return "bg-red-50 text-red-700 border-red-200";
}

export function getNamaPerusahaan(student: LpkStudentRecord): string {
  return student.job_placement?.nama_perusahaan || student.nama_perusahaan || student.job_company || "";
}

export function getPrefektur(student: LpkStudentRecord): string {
  return student.job_placement?.prefektur || "";
}

export function getKota(student: LpkStudentRecord): string {
  return student.job_placement?.kota || "";
}

export function ensureJobPlacement(
  student: LpkStudentRecord,
  patch: Partial<JobPlacement>
): LpkStudentRecord {
  const base: JobPlacement = student.job_placement ?? {
    prefektur: "",
    kota: "",
    alamat_kerja: "",
    nama_perusahaan: "",
    bidang_usaha: "",
    posisi: "",
    gaji: "",
    durasi_kontrak: "",
    hari_libur: "",
  };
  const job_placement = { ...base, ...patch };
  return {
    ...student,
    job_placement,
    nama_perusahaan: job_placement.nama_perusahaan || student.nama_perusahaan,
  };
}
