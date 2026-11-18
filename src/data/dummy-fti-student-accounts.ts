import type { StudentAccount } from "@/types/student-account";
import { buildFtiDummyProfiles } from "@/data/dummy-fti-students";

/** Akun siswa dummy memakai orang yang sama dengan data siswa, absensi, dan penilaian. */
export function getDummyFtiStudentAccounts(): StudentAccount[] {
  return buildFtiDummyProfiles().map((profile, index) => ({
    user_id: 1100 + index,
    name: profile.nama,
    user_name: profile.no,
    password: "Fti2026!",
    is_admin: 0,
    is_active: 1,
    id_kelas: null,
    kelas: profile.kelas,
  }));
}
