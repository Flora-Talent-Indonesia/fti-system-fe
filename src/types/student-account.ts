export type StudentAccount = {
  user_id: number;
  name: string;
  user_name: string;
  password: string;
  is_admin: number;
  is_active: number;
  id_kelas?: number | null;
  kelas?: string | null;
};

export type KelasCabang = "Bogor" | "Jakarta";
export type KelasJalur = "magang" | "tg" | "reguler" | "job_matching";

export type KelasRecord = {
  id_kelas: number;
  nama_kelas: string;
  cabang?: KelasCabang | null;
  jalur?: KelasJalur | null;
  /** Jumlah pertemuan. Magang, Flora Ikusei, dan Reguler. */
  pertemuan?: number | null;
  is_active: number;
  created_at: string;
  created_by: string | null;
  edit_at: string | null;
  edit_by: string | null;
  delete_at: string | null;
  delete_by: string | null;
};
