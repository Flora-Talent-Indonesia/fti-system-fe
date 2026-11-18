import { ftiStudentId } from "@/lib/participant-id";

export const FTI_ANGKATAN_OPTIONS = ["Angkatan 2024", "Angkatan 2025", "Angkatan 2026"] as const;
export const FTI_KELAS_OPTIONS = ["Kelas Magang 1", "Kelas TG 1", "Kelas Driver 1"] as const;

export type FtiDummyProfile = {
  no: string;
  nama: string;
  gender: "L" | "P";
  angkatan: string;
  kelas: string;
  asal: string;
  program: "ikusei" | "tg";
  job: string;
  hasil: "" | "lulus" | "tidak";
  perusahaan: string;
};

const MALE = [
  "AGUS", "BAGAS", "CAHYA", "DEDI", "EKO", "FAJAR", "GALIH", "HENDRA",
  "IRFAN", "JOKO", "KURNIA", "LUTFI", "MAULANA", "NANDA", "OMAR",
];
const FEMALE = [
  "AYU", "BUNGA", "CITRA", "DEWI", "ELSA", "FITRI", "GITA", "HANA",
  "INTAN", "JULIA", "KIRANA", "LINA", "MAYA", "NADIA", "PUTRI",
];
const LAST = [
  "SAPUTRA", "PRATAMA", "NUGROHO", "WIJAYA", "SANTOSO",
  "KURNIAWAN", "HIDAYAT", "RAMADHAN", "SETIAWAN", "PERMANA",
  "FIRMANSYAH", "KUSUMA", "WIBOWO", "GUNAWAN", "HARTONO",
  "LESMANA", "PRASETYO", "UTOMO", "RAHMAN", "SYAHPUTRA",
  "NUGRAHA", "MAHENDRA", "SIREGAR", "NASUTION", "HAKIM",
  "FADILLAH", "ALAMSYAH", "WIDODO", "BUDIANTO", "DARMAWAN",
];
const JOBS = [
  "PM - Gunma",
  "Care Worker - Ichikawa",
  "Pengelasan - Saitama",
  "Perhotelan - Chiba",
  "Konstruksi - Aichi",
  "Pengolahan Makanan - Osaka",
  "Pertanian - Ibaraki",
  "Building Cleaning - Kanagawa",
  "Perikanan - Hiroshima",
  "Manufaktur - Nagoya",
];
const COMPANIES = [
  "Sakura Seisakusho",
  "Himawari Care",
  "Fuji Foods",
  "Aoki Kensetsu",
  "Ichikawa Precision",
];
const CITIES = ["Sukabumi", "Bandung", "Semarang", "Garut", "Bogor"];

/** 15 siswa pertama untuk Bogor, 15 berikutnya untuk Jakarta. Tiap TC: 5 Magang, 5 TG, 5 Driver. */
function rosterPlacement(index: number): { kelas: (typeof FTI_KELAS_OPTIONS)[number]; program: "ikusei" | "tg"; job: string } {
  const slot = index % 15;
  if (slot < 5) return { kelas: "Kelas Magang 1", program: "ikusei", job: JOBS[index % JOBS.length] };
  if (slot < 10) return { kelas: "Kelas TG 1", program: "tg", job: JOBS[index % JOBS.length] };
  return { kelas: "Kelas Driver 1", program: "ikusei", job: "Driver" };
}

/** 30 siswa FTI yang sama di data siswa, akun, absensi, dan penilaian. */
export function buildFtiDummyProfiles(): FtiDummyProfile[] {
  return Array.from({ length: 30 }, (_, index) => {
    const male = index % 2 === 0;
    const first = male ? MALE[index / 2] : FEMALE[(index - 1) / 2];
    const year = 2024 + Math.floor(index / 10);
    const slot = index % 10;
    const placement = rosterPlacement(index);
    const hasil: FtiDummyProfile["hasil"] = index % 3 === 0 ? "lulus" : index % 3 === 1 ? "tidak" : "";
    return {
      no: ftiStudentId(String(year), slot + 1),
      nama: `${first} ${LAST[index]}`,
      gender: male ? "L" : "P",
      angkatan: `Angkatan ${year}`,
      kelas: placement.kelas,
      asal: CITIES[index % CITIES.length],
      program: placement.program,
      job: placement.job,
      hasil,
      perusahaan: COMPANIES[index % COMPANIES.length],
    };
  });
}
