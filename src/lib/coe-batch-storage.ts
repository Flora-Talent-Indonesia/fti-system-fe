import { EMPTY_COE, type CoeBatch, type CoeBatchMember, type CoeShared, emptyShared } from "@/lib/coe-batch";

const STORAGE_KEY = "flora_coe_batches_v1";

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function asShared(value: unknown): CoeShared {
  const base = emptyShared();
  if (!value || typeof value !== "object") return base;
  const row = value as Partial<CoeShared>;
  return {
    ...base,
    ...row,
    jalur: row.jalur === "ikusei" ? "ikusei" : "tg",
  };
}

function asMember(value: unknown): CoeBatchMember | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<CoeBatchMember>;
  if (typeof row.id !== "string" || !row.draft || typeof row.draft !== "object") return null;
  const status = row.status === "draft" || row.status === "selesai" ? row.status : "belum";
  return {
    id: row.id,
    studentId: String(row.studentId ?? ""),
    noPeserta: String(row.noPeserta ?? ""),
    nama: String(row.nama ?? row.draft.nama ?? ""),
    status,
    draft: {
      ...EMPTY_COE,
      ...row.draft,
      jalur: row.draft.jalur === "ikusei" ? "ikusei" : "tg",
    },
  };
}

function asBatch(value: unknown): CoeBatch | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<CoeBatch>;
  if (typeof row.id !== "string" || typeof row.name !== "string") return null;
  const members = Array.isArray(row.members) ? row.members.map(asMember).filter((item) => item !== null) : [];
  return {
    id: row.id,
    name: row.name,
    note: String(row.note ?? ""),
    createdAt: String(row.createdAt ?? ""),
    updatedAt: String(row.updatedAt ?? ""),
    shared: asShared(row.shared),
    members,
  };
}

function readAll(): CoeBatch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(asBatch).filter((item) => item !== null);
  } catch {
    return [];
  }
}

function writeAll(batches: CoeBatch[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
}

export function listCoeBatches(): CoeBatch[] {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getCoeBatch(id: string): CoeBatch | null {
  return readAll().find((batch) => batch.id === id) ?? null;
}

export function createCoeBatch(batch: CoeBatch): CoeBatch {
  const now = new Date().toISOString();
  const next: CoeBatch = {
    ...batch,
    id: uid("coe"),
    name: batch.name.trim() || "Batch baru",
    note: batch.note.trim(),
    createdAt: now,
    updatedAt: now,
    members: batch.members.map((member) => ({ ...member, id: member.id || uid("mem") })),
  };
  const all = readAll();
  all.unshift(next);
  writeAll(all);
  return next;
}

export function updateCoeBatch(id: string, batch: CoeBatch): CoeBatch | null {
  const all = readAll();
  const index = all.findIndex((item) => item.id === id);
  if (index < 0) return null;
  const next: CoeBatch = {
    ...batch,
    id,
    name: batch.name.trim() || "Batch baru",
    note: batch.note.trim(),
    createdAt: all[index].createdAt,
    updatedAt: new Date().toISOString(),
  };
  all[index] = next;
  writeAll(all);
  return next;
}

export function deleteCoeBatch(id: string): boolean {
  const all = readAll();
  const next = all.filter((batch) => batch.id !== id);
  if (next.length === all.length) return false;
  writeAll(next);
  return true;
}

export function newMemberId(): string {
  return uid("mem");
}
