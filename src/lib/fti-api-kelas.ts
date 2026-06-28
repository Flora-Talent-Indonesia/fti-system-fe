import {
  activateKelas,
  createKelas,
  deactivateKelas,
  hardDeleteKelas,
  loadKelasList,
  seedKelasIfEmpty,
  updateKelas,
} from "@/lib/fti-kelas-storage";

type ApiResult<T = unknown> = { status: number; message?: string; data?: T };

function ok<T>(data?: T, message?: string): ApiResult<T> {
  return { status: 200, data, message };
}

function fail(message: string, status = 400): ApiResult {
  return { status, message };
}

/** Drop-in pengganti ApiKelas untuk portal FTI (localStorage demo). */
export default function FtiApiKelas() {
  seedKelasIfEmpty();
  return {
    getListKelas: async (): Promise<ApiResult> => ok(loadKelasList()),
    postCreateKelas: async (body: { nama_kelas: string }): Promise<ApiResult> => {
      const nama = body?.nama_kelas?.trim();
      if (!nama) return fail("nama_kelas wajib diisi");
      if (loadKelasList().some((k) => k.nama_kelas.toLowerCase() === nama.toLowerCase())) {
        return fail("Nama kelas sudah ada");
      }
      createKelas(nama);
      return ok(undefined, "Berhasil membuat kelas");
    },
    putUpdateKelas: async (body: { id_kelas: number; nama_kelas: string }): Promise<ApiResult> => {
      const updated = updateKelas(body.id_kelas, body.nama_kelas);
      if (!updated) return fail("Kelas tidak ditemukan", 404);
      return ok(undefined, "Berhasil update kelas");
    },
    putDeleteKelas: async (body: { id_kelas: number }): Promise<ApiResult> => {
      const updated = deactivateKelas(body.id_kelas);
      if (!updated) return fail("Kelas tidak ditemukan", 404);
      return ok(undefined, "Berhasil nonaktifkan kelas");
    },
    putActivateKelas: async (body: { id_kelas: number }): Promise<ApiResult> => {
      const updated = activateKelas(body.id_kelas);
      if (!updated) return fail("Kelas tidak ditemukan", 404);
      return ok(undefined, "Berhasil aktivasi");
    },
    putHardDeleteKelas: async (body: { id_kelas: number }): Promise<ApiResult> => {
      hardDeleteKelas(body.id_kelas);
      return ok(undefined, "Kelas berhasil dihapus permanen");
    },
  };
}
