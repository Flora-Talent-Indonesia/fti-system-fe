import {
  bulkAssignKelas,
  createStudentBatch,
  hardDeleteStudent,
  loadActiveStudents,
  loadAllStudents,
  loadInactiveStudents,
  loadStudentUserNameSnapshot,
  setStudentActive,
  updateStudentName,
  updateStudentPassword,
  assignStudentKelas,
} from "@/lib/fti-student-account-storage";

type ApiResult<T = unknown> = { status: number; message?: string; data?: T; created?: number };

function ok<T>(data?: T, message?: string): ApiResult<T> {
  return { status: 200, data, message };
}

function fail(message: string, status = 400): ApiResult {
  return { status, message };
}

/** Drop-in pengganti ApiUser untuk portal FTI (localStorage demo). */
export default function FtiApiUser() {
  return {
    getAllUser: async (): Promise<ApiResult> => {
      return ok(loadStudentUserNameSnapshot());
    },
    getAllActiveUser: async (): Promise<ApiResult> => ok(loadActiveStudents()),
    getAllInactiveUser: async (): Promise<ApiResult> => ok(loadInactiveStudents()),
    postCreateUserBatch: async (body: {
      users: Array<{ name: string; user_name: string; user_password: string; is_admin?: number }>;
    }): Promise<ApiResult> => {
      const users = body?.users ?? [];
      if (users.length === 0) return fail("users tidak boleh kosong");
      const created = createStudentBatch(users);
      return { status: 200, message: `Berhasil membuat ${created} user`, created };
    },
    putUpdateUserPassword: async (body: { id_user: number; user_password: string }): Promise<ApiResult> => {
      if (!updateStudentPassword(body.id_user, body.user_password)) {
        return fail("User tidak ditemukan", 404);
      }
      return ok(undefined, "Berhasil update password");
    },
    putUpdateUserName: async (body: { id_user: number; name: string }): Promise<ApiResult> => {
      if (!updateStudentName(body.id_user, body.name)) {
        return fail("User tidak ditemukan", 404);
      }
      return ok(undefined, "Berhasil update nama");
    },
    putDeleteUser: async (body: { id_user: number; is_active: number }): Promise<ApiResult> => {
      if (!setStudentActive(body.id_user, Number(body.is_active))) {
        return fail("User tidak ditemukan", 404);
      }
      return ok(undefined, "Berhasil update status aktif");
    },
    putHardDeleteUser: async (body: { id_user: number }): Promise<ApiResult> => {
      hardDeleteStudent(body.id_user);
      return ok(undefined, "Berhasil menghapus user");
    },
    putAssignKelas: async (body: { id_user: number; id_kelas: number }): Promise<ApiResult> => {
      if (!assignStudentKelas(body.id_user, body.id_kelas)) {
        return fail("User tidak ditemukan", 404);
      }
      return ok(undefined, "Berhasil assign kelas");
    },
    putChangeKelas: async (body: { id_user: number; id_kelas: number }): Promise<ApiResult> => {
      if (!assignStudentKelas(body.id_user, body.id_kelas)) {
        return fail("User tidak ditemukan", 404);
      }
      return ok(undefined, "Berhasil ubah kelas");
    },
    putKickKelas: async (body: { id_user: number }): Promise<ApiResult> => {
      if (!assignStudentKelas(body.id_user, null)) {
        return fail("User tidak ditemukan", 404);
      }
      return ok(undefined, "Berhasil kick kelas");
    },
    putBulkAssignKelas: async (body: { user_ids: number[]; id_kelas: number | null }): Promise<ApiResult> => {
      bulkAssignKelas(body.user_ids ?? [], body.id_kelas ?? null);
      return ok(undefined, "Berhasil bulk assign kelas");
    },
  };
}

export { loadAllStudents as ftiLoadAllStudentsForDebug };
