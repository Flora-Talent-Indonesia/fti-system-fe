export type LpkMitraAccount = {
  id: string;
  /** Kode tampilan, misalnya MFTI01. */
  code: string;
  name: string;
  userName: string;
  kota: string;
  /** Demo FE only — integrasi backend nanti */
  password: string;
  isActive: boolean;
  contactName?: string;
  contactPhone?: string;
  mouStart?: string;
  mouEnd?: string;
  mouFileName?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};
