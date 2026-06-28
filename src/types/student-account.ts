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

export type KelasRecord = {
  id_kelas: number;
  nama_kelas: string;
  is_active: number;
  created_at: string;
  created_by: string | null;
  edit_at: string | null;
  edit_by: string | null;
  delete_at: string | null;
  delete_by: string | null;
};
