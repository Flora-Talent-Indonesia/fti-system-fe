import type { LpkMitraAccount } from "@/types/lpk-account";
import { lpkOrderOf, lpkPublicId, lpkRouteId } from "@/lib/participant-id";

const STORAGE_KEY = "flora_lpk_mitra_accounts_v1";
const SEED_FLAG = "flora_lpk_mitra_accounts_seeded_v1";
const SEED_VERSION = "2";
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
  const seeds: Array<{ order: number; name: string; userName: string; kota: string }> = [
    { order: 1, name: "LPK Mitra Sukabumi", userName: "LPK-SUKABUMI", kota: "Sukabumi" },
    { order: 2, name: "LPK Mitra Bandung", userName: "LPK-BANDUNG", kota: "Bandung" },
    { order: 3, name: "LPK Mitra Semarang", userName: "LPK-SEMARANG", kota: "Semarang" },
  ];

  return seeds.map((s) => ({
    id: lpkRouteId(s.order),
    code: lpkPublicId(s.order),
    name: s.name,
    userName: s.userName,
    kota: s.kota,
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

export function nextLpkOrder(accounts: Array<{ id: string; code?: string }> = loadLpkAccounts()): number {
  const used = accounts.map((account) => lpkOrderOf(account.id, account.code));
  return (used.length ? Math.max(...used) : 0) + 1;
}

export function nextLpkAccountId(): string {
  return lpkRouteId(nextLpkOrder());
}

export function createLpkAccount(input: {
  name: string;
  userName: string;
  kota: string;
  password: string;
  contactName?: string;
  contactPhone?: string;
  mouStart?: string;
  mouEnd?: string;
  mouFileName?: string;
}): LpkMitraAccount[] {
  const list = loadLpkAccounts();
  const ts = nowIso();
  const order = nextLpkOrder(list);
  const account: LpkMitraAccount = {
    id: lpkRouteId(order),
    code: lpkPublicId(order),
    name: input.name.trim().toUpperCase(),
    userName: input.userName.trim().toUpperCase(),
    kota: input.kota.trim(),
    password: input.password,
    isActive: true,
    contactName: input.contactName?.trim() ?? "",
    contactPhone: input.contactPhone?.trim() ?? "",
    mouStart: input.mouStart ?? "",
    mouEnd: input.mouEnd ?? "",
    mouFileName: input.mouFileName?.trim() ?? "",
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
  patch: Partial<Pick<LpkMitraAccount, "name" | "userName" | "kota" | "password" | "isActive" | "contactName" | "contactPhone" | "mouStart" | "mouEnd" | "mouFileName">>
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

export function findLpkByUsername(userName: string): LpkMitraAccount | undefined {
  const key = userName.trim().toUpperCase();
  return loadLpkAccounts().find((account) => account.userName.toUpperCase() === key);
}

export function isMouExpired(account: Pick<LpkMitraAccount, "mouEnd">, today = new Date()): boolean {
  if (!account.mouEnd) return false;
  const end = new Date(`${account.mouEnd}T23:59:59`);
  return !Number.isNaN(end.getTime()) && end.getTime() < today.getTime();
}

export function mouDaysLeft(account: Pick<LpkMitraAccount, "mouEnd">, today = new Date()): number | null {
  if (!account.mouEnd) return null;
  const end = new Date(`${account.mouEnd}T00:00:00`);
  if (Number.isNaN(end.getTime())) return null;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.ceil((end.getTime() - start.getTime()) / 86400000);
}

export function lpkCanLogin(account: LpkMitraAccount): boolean {
  return account.isActive && !isMouExpired(account);
}

export function deleteLpkAccountPermanent(id: string): LpkMitraAccount[] {
  const list = loadLpkAccounts().filter((a) => a.id !== id);
  saveLpkAccounts(list);
  return list;
}
