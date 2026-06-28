import type { StudentAccount } from "@/types/student-account";

/** Akun siswa dummy untuk demo Student Account Management (FE only). */
export function getDummyFtiStudentAccounts(): StudentAccount[] {
  return [
    {
      user_id: 1001,
      name: "BUDI SANTOSO",
      user_name: "FTI-2026-001",
      password: "Fti2026!",
      is_admin: 0,
      is_active: 1,
      id_kelas: 1,
      kelas: "Kelas A",
    },
    {
      user_id: 1002,
      name: "SITI NURHALIZA",
      user_name: "FTI-2026-002",
      password: "Fti2026!",
      is_admin: 0,
      is_active: 1,
      id_kelas: 1,
      kelas: "Kelas A",
    },
    {
      user_id: 1003,
      name: "ANDI PRASETYO",
      user_name: "FTI-2026-003",
      password: "Fti2026!",
      is_admin: 0,
      is_active: 1,
      id_kelas: 2,
      kelas: "Kelas N4 Sore",
    },
    {
      user_id: 1004,
      name: "RINA WULANDARI",
      user_name: "FTI-2026-004",
      password: "Fti2026!",
      is_admin: 0,
      is_active: 1,
      id_kelas: null,
      kelas: null,
    },
    {
      user_id: 1005,
      name: "DEWI LESTARI",
      user_name: "FTI-2026-005",
      password: "Fti2026!",
      is_admin: 0,
      is_active: 1,
      id_kelas: 2,
      kelas: "Kelas N4 Sore",
    },
    {
      user_id: 1006,
      name: "AGUS WIJAYA",
      user_name: "FTI-2026-006",
      password: "Fti2026!",
      is_admin: 0,
      is_active: 0,
      id_kelas: null,
      kelas: null,
    },
  ];
}
