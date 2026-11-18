const STORAGE_KEY = "flora_fti_admin_account_v1";

export const FTI_ADMIN_DEFAULT_PASSWORD = "fti123";

export type FtiAdminAccount = {
  userName: string;
  displayName: string;
  password: string;
};

const DEFAULT_ACCOUNT: FtiAdminAccount = {
  userName: "ADMIN",
  displayName: "Admin FTI",
  password: FTI_ADMIN_DEFAULT_PASSWORD,
};

export function loadFtiAdminAccount(): FtiAdminAccount {
  if (typeof window === "undefined") return DEFAULT_ACCOUNT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNT));
      return DEFAULT_ACCOUNT;
    }
    const parsed = JSON.parse(raw) as Partial<FtiAdminAccount>;
    if (!parsed.userName || !parsed.password || !parsed.displayName) return DEFAULT_ACCOUNT;
    return {
      userName: parsed.userName,
      displayName: parsed.displayName,
      password: parsed.password,
    };
  } catch {
    return DEFAULT_ACCOUNT;
  }
}

/** `null` jika username bukan akun admin FTI. */
export function verifyFtiAdminLogin(userName: string, password: string): boolean | null {
  const account = loadFtiAdminAccount();
  if (userName.trim().toLowerCase() !== account.userName.toLowerCase()) return null;
  return password === account.password;
}

export function updateFtiAdminPassword(
  currentPassword: string,
  nextPassword: string
): { ok: true } | { ok: false; message: string } {
  const account = loadFtiAdminAccount();
  if (currentPassword !== account.password) {
    return { ok: false, message: "Password saat ini tidak sesuai." };
  }
  if (nextPassword === account.password) {
    return { ok: false, message: "Password baru harus berbeda dari password saat ini." };
  }
  const next: FtiAdminAccount = { ...account, password: nextPassword };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return { ok: true };
}
