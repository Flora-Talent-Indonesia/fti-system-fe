import type { KelasCabang, KelasJalur } from "@/types/student-account";
import {
  activateKelas,
  createKelas,
  deactivateKelas,
  hardDeleteKelas,
  kelasNameTaken,
  KELAS_CABANG,
  KELAS_JALUR,
  loadKelasList,
  pertemuanRule,
  seedKelasIfEmpty,
  updateKelas,
} from "@/lib/fti-kelas-storage";

function isCabang(value: string): value is KelasCabang {
  return KELAS_CABANG.includes(value as KelasCabang);
}

function isJalur(value: string): value is KelasJalur {
  return KELAS_JALUR.some((item) => item.id === value);
}

type ApiResult<T = unknown> = { status: number; message?: string; data?: T };

function ok<T>(data?: T, message?: string): ApiResult<T> {
  return { status: 200, data, message };
}

function fail(message: string, status = 400): ApiResult {
  return { status, message };
}

function validatePertemuan(jalur: string, pertemuan: number | null | undefined) {
  const rule = pertemuanRule(isJalur(jalur) ? jalur : null);
  if (!rule) return null;
  const value = pertemuan == null ? rule.defaultSessions : pertemuan;
  if (!Number.isFinite(value)) return "Isi jumlah pertemuan";
  const rounded = Math.round(value);
  if (rounded < rule.min || rounded > rule.max) {
    return `Pertemuan ${rule.min}–${rule.max}`;
  }
  return null;
}

/** Drop-in pengganti ApiKelas untuk portal FTI (localStorage demo). */
export default function FtiApiKelas() {
  seedKelasIfEmpty();
  return {
    getListKelas: async (): Promise<ApiResult> => ok(loadKelasList()),
    postCreateKelas: async (body: {
      nama_kelas: string;
      cabang: string;
      jalur: string;
      pertemuan?: number | null;
    }): Promise<ApiResult> => {
      const nama = body?.nama_kelas?.trim();
      if (!nama) return fail("nama_kelas wajib diisi");
      if (!isCabang(body?.cabang)) return fail("Pilih TC Bogor atau Jakarta");
      if (!isJalur(body?.jalur)) return fail("Pilih penilaian");
      if (kelasNameTaken(body.cabang, nama)) return fail("Nama kelas sudah ada di cabang ini");
      const pertemuanError = validatePertemuan(body.jalur, body.pertemuan);
      if (pertemuanError) return fail(pertemuanError);
      createKelas(nama, body.cabang, body.jalur, body.pertemuan ?? null);
      return ok(undefined, "Berhasil membuat kelas");
    },
    putUpdateKelas: async (body: {
      id_kelas: number;
      nama_kelas: string;
      cabang: string;
      jalur: string;
      pertemuan?: number | null;
    }): Promise<ApiResult> => {
      const nama = body?.nama_kelas?.trim();
      if (!nama) return fail("nama_kelas wajib diisi");
      if (!isCabang(body?.cabang)) return fail("Pilih TC Bogor atau Jakarta");
      if (!isJalur(body?.jalur)) return fail("Pilih penilaian");
      if (kelasNameTaken(body.cabang, nama, body.id_kelas)) return fail("Nama kelas sudah ada di cabang ini");
      const pertemuanError = validatePertemuan(body.jalur, body.pertemuan);
      if (pertemuanError) return fail(pertemuanError);
      const updated = updateKelas(body.id_kelas, nama, body.cabang, body.jalur, body.pertemuan ?? null);
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
