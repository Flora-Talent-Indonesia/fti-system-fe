import { findLpkByUsername, seedLpkAccountsIfEmpty } from "@/lib/lpk-account-storage";

export const PORTAL_ACCESS_OPTIONS = [
  { id: "fti", label: "FTI", path: "/fti" },
  { id: "ys", label: "YS", path: "/ys" },
  { id: "guru", label: "Guru", path: "/guru-dashboard" },
  { id: "finance", label: "Finance Dashboard", path: "/finance" },
  { id: "dokumen", label: "Dokumen", path: "/dokumen" },
] as const;

export type PortalAccessId = (typeof PORTAL_ACCESS_OPTIONS)[number]["id"];

export type PortalAccount = {
  id: string;
  displayName: string;
  userName: string;
  password: string;
  access: PortalAccessId[];
  isActive: boolean;
  protected: boolean;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "flora_portal_accounts_v1";
const SESSION_KEY = "flora_portal_login_v1";
const LEGACY_ADMIN_KEY = "flora_fti_admin_account_v1";
const ADMIN_ID = "portal-admin";

const ALL_ACCESS: PortalAccessId[] = PORTAL_ACCESS_OPTIONS.map((item) => item.id);

export function portalAccessForPath(path: string): PortalAccessId | null {
  const clean = (path.split("?")[0] || "").replace(/\/+$/, "") || "/";
  if (clean === "/finance" || clean.startsWith("/finance/")) return "finance";
  if (clean === "/dokumen" || clean.startsWith("/dokumen/")) return "dokumen";
  if (clean === "/fti" || clean.startsWith("/fti/")) return "fti";
  if (clean === "/ys" || clean.startsWith("/ys/")) return "ys";
  if (clean === "/guru-dashboard" || clean.startsWith("/guru-dashboard/")) return "guru";
  return null;
}

export function portalPathFor(access: PortalAccessId): string {
  return PORTAL_ACCESS_OPTIONS.find((item) => item.id === access)?.path ?? "/";
}

export function portalLabel(access: PortalAccessId): string {
  return PORTAL_ACCESS_OPTIONS.find((item) => item.id === access)?.label ?? access;
}

function nowIso() {
  return new Date().toISOString();
}

function isAccessId(value: string): value is PortalAccessId {
  return PORTAL_ACCESS_OPTIONS.some((item) => item.id === value);
}

function normalizeAccess(access: unknown): PortalAccessId[] {
  if (!Array.isArray(access)) return [];
  const picked = new Set<PortalAccessId>();
  for (const item of access) {
    if (typeof item === "string" && isAccessId(item)) picked.add(item);
  }
  return ALL_ACCESS.filter((id) => picked.has(id));
}

function readLegacyAdmin(): { userName: string; displayName: string; password: string } {
  const fallback = { userName: "ADMIN", displayName: "Admin FTI", password: "fti123" };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(LEGACY_ADMIN_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<{ userName: string; displayName: string; password: string }>;
    if (!parsed.userName || !parsed.password || !parsed.displayName) return fallback;
    return {
      userName: parsed.userName,
      displayName: parsed.displayName,
      password: parsed.password,
    };
  } catch {
    return fallback;
  }
}

function writeLegacyAdminPassword(password: string) {
  if (typeof window === "undefined") return;
  const current = readLegacyAdmin();
  localStorage.setItem(LEGACY_ADMIN_KEY, JSON.stringify({ ...current, password }));
}

function defaultAdmin(): PortalAccount {
  const legacy = readLegacyAdmin();
  const ts = nowIso();
  return {
    id: ADMIN_ID,
    displayName: legacy.displayName || "Admin FTI",
    userName: (legacy.userName || "ADMIN").trim().toUpperCase(),
    password: legacy.password || "fti123",
    access: [...ALL_ACCESS],
    isActive: true,
    protected: true,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function loadPortalAccounts(): PortalAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PortalAccount[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((account) => account && typeof account.id === "string" && typeof account.userName === "string")
      .map((account) => ({
        ...account,
        displayName: String(account.displayName || account.userName),
        userName: String(account.userName).trim().toUpperCase(),
        password: String(account.password || ""),
        access: normalizeAccess(account.access),
        isActive: account.isActive !== false,
        protected: Boolean(account.protected) || account.id === ADMIN_ID,
        createdAt: account.createdAt || nowIso(),
        updatedAt: account.updatedAt || account.createdAt || nowIso(),
      }));
  } catch {
    return [];
  }
}

function savePortalAccounts(accounts: PortalAccount[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

function defaultFinanceDemo(): PortalAccount {
  const ts = nowIso();
  return {
    id: "portal-ucok-baba",
    displayName: "Ucok Baba",
    userName: "UCOK.BABA",
    password: "123",
    access: ["finance"],
    isActive: true,
    protected: false,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function seedPortalAccounts(): PortalAccount[] {
  if (typeof window === "undefined") return [];
  let existing = loadPortalAccounts();
  let changed = false;
  if (!existing.some((account) => account.protected || account.id === ADMIN_ID)) {
    existing = [defaultAdmin(), ...existing];
    changed = true;
  }
  if (!existing.some((account) => account.userName === "UCOK.BABA")) {
    existing = [...existing, defaultFinanceDemo()];
    changed = true;
  }
  if (changed) savePortalAccounts(existing);
  return existing;
}

export function findPortalAccountByUsername(userName: string): PortalAccount | undefined {
  const key = userName.trim().toUpperCase();
  if (!key) return undefined;
  return loadPortalAccounts().find((account) => account.userName === key);
}

export function findPortalAccountById(id: string): PortalAccount | undefined {
  return loadPortalAccounts().find((account) => account.id === id);
}

function usernameTaken(userName: string, exceptId?: string): string | null {
  const key = userName.trim().toUpperCase();
  if (!key) return "Username wajib diisi.";
  if (!/^[A-Z0-9._-]+$/.test(key)) {
    return "Username hanya boleh huruf, angka, titik, strip, atau garis bawah.";
  }
  const duplicate = loadPortalAccounts().find((account) => account.userName === key && account.id !== exceptId);
  if (duplicate) return "Username sudah dipakai.";
  seedLpkAccountsIfEmpty();
  if (findLpkByUsername(key)) return "Username sudah dipakai akun LPK Mitra.";
  return null;
}

export type PortalAccountInput = {
  displayName: string;
  userName: string;
  password: string;
  access: PortalAccessId[];
};

export function createPortalAccount(
  input: PortalAccountInput
): { ok: true; account: PortalAccount } | { ok: false; message: string } {
  const displayName = input.displayName.trim();
  const userName = input.userName.trim().toUpperCase();
  const password = input.password.trim();
  const access = normalizeAccess(input.access);
  if (!displayName) return { ok: false, message: "Nama tampilan wajib diisi." };
  if (password.trim().length < 4) return { ok: false, message: "Password minimal 4 karakter." };
  if (access.length === 0) return { ok: false, message: "Pilih minimal satu portal yang boleh dibuka." };
  const taken = usernameTaken(userName);
  if (taken) return { ok: false, message: taken };

  const ts = nowIso();
  const account: PortalAccount = {
    id: `portal-${Date.now().toString(36)}`,
    displayName,
    userName,
    password,
    access,
    isActive: true,
    protected: false,
    createdAt: ts,
    updatedAt: ts,
  };
  const list = seedPortalAccounts();
  list.push(account);
  savePortalAccounts(list);
  return { ok: true, account };
}

export function updatePortalAccount(
  id: string,
  patch: { displayName?: string; userName?: string; access?: PortalAccessId[]; isActive?: boolean }
): { ok: true } | { ok: false; message: string } {
  const list = seedPortalAccounts();
  const index = list.findIndex((account) => account.id === id);
  if (index < 0) return { ok: false, message: "Akun tidak ditemukan." };
  const current = list[index];

  const displayName = (patch.displayName ?? current.displayName).trim();
  const userName = (patch.userName ?? current.userName).trim().toUpperCase();
  let access = patch.access ? normalizeAccess(patch.access) : current.access;
  if (!displayName) return { ok: false, message: "Nama tampilan wajib diisi." };

  if (current.protected && patch.isActive === false) {
    return { ok: false, message: "Akun admin tidak bisa dinonaktifkan." };
  }
  if (current.protected && !access.includes("fti")) {
    access = normalizeAccess(["fti", ...access]);
  }
  if (access.length === 0) return { ok: false, message: "Pilih minimal satu portal yang boleh dibuka." };

  const nextUserName = current.protected ? current.userName : userName;
  const taken = usernameTaken(nextUserName, id);
  if (taken) return { ok: false, message: taken };

  const next: PortalAccount = {
    ...current,
    displayName,
    userName: nextUserName,
    access,
    isActive: current.protected ? true : (patch.isActive ?? current.isActive),
    updatedAt: nowIso(),
  };
  list[index] = next;
  savePortalAccounts(list);
  refreshSessionIfCurrent(next);
  return { ok: true };
}

export function updatePortalAccountPassword(
  id: string,
  password: string
): { ok: true } | { ok: false; message: string } {
  const nextPassword = password.trim();
  if (nextPassword.length < 4) return { ok: false, message: "Password minimal 4 karakter." };
  const list = seedPortalAccounts();
  const index = list.findIndex((account) => account.id === id);
  if (index < 0) return { ok: false, message: "Akun tidak ditemukan." };
  const next = { ...list[index], password: nextPassword, updatedAt: nowIso() };
  list[index] = next;
  savePortalAccounts(list);
  if (next.protected) writeLegacyAdminPassword(nextPassword);
  return { ok: true };
}

export function updateLoggedInPassword(
  currentPassword: string,
  nextPassword: string
): { ok: true } | { ok: false; message: string } {
  const session = getPortalSession();
  const account = session ? findPortalAccountById(session.accountId) : undefined;
  if (!account) return { ok: false, message: "Sesi login tidak ditemukan. Masuk lagi, lalu ubah password." };
  if (currentPassword !== account.password) {
    return { ok: false, message: "Password saat ini tidak sesuai." };
  }
  if (nextPassword === account.password) {
    return { ok: false, message: "Password baru harus berbeda dari password saat ini." };
  }
  return updatePortalAccountPassword(account.id, nextPassword);
}

export function deletePortalAccount(id: string): { ok: true } | { ok: false; message: string } {
  const list = seedPortalAccounts();
  const account = list.find((item) => item.id === id);
  if (!account) return { ok: false, message: "Akun tidak ditemukan." };
  if (account.protected) return { ok: false, message: "Akun admin tidak bisa dihapus." };
  savePortalAccounts(list.filter((item) => item.id !== id));
  const session = getPortalSession();
  if (session?.accountId === id) clearPortalSession();
  return { ok: true };
}

export function syncProtectedAdminPassword(nextPassword: string) {
  if (typeof window === "undefined") return;
  const list = seedPortalAccounts();
  const index = list.findIndex((account) => account.protected || account.id === ADMIN_ID);
  if (index < 0) return;
  list[index] = { ...list[index], password: nextPassword, updatedAt: nowIso() };
  savePortalAccounts(list);
}

export type PortalLoginSession = {
  accountId: string;
  userName: string;
  displayName: string;
  access: PortalAccessId[];
};

export function getPortalSession(): PortalLoginSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PortalLoginSession>;
    if (!parsed.accountId || !parsed.userName) return null;
    return {
      accountId: parsed.accountId,
      userName: parsed.userName,
      displayName: parsed.displayName || parsed.userName,
      access: normalizeAccess(parsed.access),
    };
  } catch {
    return null;
  }
}

export function setPortalSession(account: PortalAccount) {
  const session: PortalLoginSession = {
    accountId: account.id,
    userName: account.userName,
    displayName: account.displayName,
    access: account.access,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function refreshSessionIfCurrent(account: PortalAccount) {
  const session = getPortalSession();
  if (!session || session.accountId !== account.id) return;
  if (!account.isActive) {
    clearPortalSession();
    return;
  }
  setPortalSession(account);
}

export function clearPortalSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

export function activeSessionAccount(): PortalAccount | null {
  const session = getPortalSession();
  if (!session) return null;
  const account = findPortalAccountById(session.accountId);
  if (!account || !account.isActive) return null;
  return account;
}

export function loginPortalAccount(
  userName: string,
  password: string,
  access: PortalAccessId | null
): { ok: true; account: PortalAccount } | { ok: false; message: string } {
  seedPortalAccounts();
  const account = findPortalAccountByUsername(userName);
  if (!account) return { ok: false, message: "Username tidak ditemukan." };
  if (!account.isActive) return { ok: false, message: "Akun nonaktif. Data tetap tersimpan." };
  if (account.password !== password) return { ok: false, message: "Password tidak sesuai." };
  if (access && !account.access.includes(access)) {
    const granted = account.access.map(portalLabel).join(", ");
    return {
      ok: false,
      message: `Akun ini tidak punya akses ke ${portalLabel(access)}. Akses yang ada: ${granted}.`,
    };
  }
  if (!access && account.access.length === 0) {
    return { ok: false, message: "Akun ini belum punya akses portal." };
  }
  setPortalSession(account);
  return { ok: true, account };
}
