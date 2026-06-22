import type { LpkMitraAccount } from "@/types/lpk-account";

const STORAGE_KEY = "flora_lpk_mitra_accounts_v1";
const SEED_FLAG = "flora_lpk_mitra_accounts_seeded_v1";
const SEED_VERSION = "1";
const ADMIN_LABEL = "Admin FTI";

function nowIso() {
  return new Date().toISOString();
}

function formatDisplayDate(iso: string): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export { formatDisplayDate as formatLpkAccountDate };

export function getInitialLpkAccounts(): LpkMitraAccount[] {
  const base = nowIso();
  const seeds: Array<{ id: string; name: string; userName: string; kota: string }> = [
    { id: "lpk-001", name: "LPK Mitra Sukabumi", userName: "LPK-SUKABUMI", kota: "Sukabumi" },
    { id: "lpk-002", name: "LPK Mitra Bandung", userName: "LPK-BANDUNG", kota: "Bandung" },
    { id: "lpk-003", name: "LPK Mitra Semarang", userName: "LPK-SEMARANG", kota: "Semarang" },
  ];

  return seeds.map((s) => ({
    ...s,
    password: "lpk123",
    isActive: true,
    createdAt: base,
    updatedAt: base,
    createdBy: ADMIN_LABEL,
    updatedBy: ADMIN_LABEL,
  }));
}

export function loadLpkAccounts(): LpkMitraAccount[] {
  if (typeof window === "undefined") return getInitialLpkAccounts();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LpkMitraAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLpkAccounts(accounts: LpkMitraAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function seedLpkAccountsIfEmpty(): LpkMitraAccount[] {
  if (typeof window === "undefined") return getInitialLpkAccounts();
  const version = localStorage.getItem(SEED_FLAG);
  if (version === SEED_VERSION) {
    const existing = loadLpkAccounts();
    if (existing.length > 0) return existing;
  }
  const seeded = getInitialLpkAccounts();
  saveLpkAccounts(seeded);
  localStorage.setItem(SEED_FLAG, SEED_VERSION);
  return seeded;
}

export function nextLpkAccountId(): string {
  return `lpk-${Date.now().toString(36)}`;
}

export function createLpkAccount(input: {
  name: string;
  userName: string;
  kota: string;
  password: string;
}): LpkMitraAccount[] {
  const list = loadLpkAccounts();
  const ts = nowIso();
  const account: LpkMitraAccount = {
    id: nextLpkAccountId(),
    name: input.name.trim().toUpperCase(),
    userName: input.userName.trim().toUpperCase(),
    kota: input.kota.trim(),
    password: input.password,
    isActive: true,
    createdAt: ts,
    updatedAt: ts,
    createdBy: ADMIN_LABEL,
    updatedBy: ADMIN_LABEL,
  };
  list.unshift(account);
  saveLpkAccounts(list);
  return list;
}

export function updateLpkAccount(
  id: string,
  patch: Partial<Pick<LpkMitraAccount, "name" | "userName" | "kota" | "password" | "isActive">>
): LpkMitraAccount[] {
  const list = loadLpkAccounts();
  const idx = list.findIndex((a) => a.id === id);
  if (idx < 0) return list;
  list[idx] = {
    ...list[idx],
    ...patch,
    updatedAt: nowIso(),
    updatedBy: ADMIN_LABEL,
  };
  saveLpkAccounts(list);
  return list;
}

export function deleteLpkAccountPermanent(id: string): LpkMitraAccount[] {
  const list = loadLpkAccounts().filter((a) => a.id !== id);
  saveLpkAccounts(list);
  return list;
}
