import { firstBusinessDayOfMonth } from "@/lib/business-day";

const PROGRAM_KEY = "flora_finance_programs_v2";
const INVOICE_KEY = "flora_finance_invoices_v1";

export type FinanceProgram = {
  id: string;
  name: string;
  dp: number;
  cicilan: number;
  cicilanCount: number;
  coe: number;
  coeLabel: string;
  visa: number;
  visaLabel: string;
};

export type InvoiceLineKind = "dp" | "cicilan" | "event-warning" | "event-custom";

export type InvoiceLine = {
  label: string;
  amount: number;
  dueDate: string;
  /** Batas jam untuk DP Job Matching. Kosong untuk baris lain. */
  dueAt: string;
  kind: InvoiceLineKind;
  paid: boolean;
  paidAt: string;
  receiptNo: string;
  /** Teks pada kotak Catatan di invoice dan kwitansi. Kosong menampilkan tanda minus. */
  note: string;
};

export type PaymentColumn = {
  key: string;
  label: string;
  kind: InvoiceLineKind;
};

export type FinanceInvoice = {
  id: string;
  number: string;
  studentName: string;
  studentId: string;
  programId: string;
  programName: string;
  lines: InvoiceLine[];
  createdAt: string;
};

/** Angka resmi. Total dicek: 25jt, 40jt, 30jt, 38jt, 40jt. */
export const OFFICIAL_PROGRAMS: FinanceProgram[] = [
  {
    id: "job-matching",
    name: "Job Matching",
    dp: 5_000_000,
    cicilan: 0,
    cicilanCount: 0,
    coe: 10_000_000,
    coeLabel: "COE turun",
    visa: 10_000_000,
    visaLabel: "Visa turun / pelunasan",
  },
  {
    id: "ikusei-kojin",
    name: "Ikusei Kojin",
    dp: 2_000_000,
    cicilan: 1_400_000,
    cicilanCount: 10,
    coe: 12_000_000,
    coeLabel: "COE turun",
    visa: 12_000_000,
    visaLabel: "Visa turun",
  },
  {
    id: "ikusei-partner",
    name: "Ikusei Partner / Rekanan FTI",
    dp: 2_000_000,
    cicilan: 1_000_000,
    cicilanCount: 5,
    coe: 23_000_000,
    coeLabel: "COE turun / pelunasan",
    visa: 0,
    visaLabel: "",
  },
  {
    id: "magang",
    name: "Magang",
    dp: 4_000_000,
    cicilan: 3_000_000,
    cicilanCount: 4,
    coe: 11_000_000,
    coeLabel: "COE turun",
    visa: 11_000_000,
    visaLabel: "Visa turun / pelunasan",
  },
  {
    id: "kelas-reguler",
    name: "Kelas Reguler",
    dp: 2_000_000,
    cicilan: 1_400_000,
    cicilanCount: 10,
    coe: 12_000_000,
    coeLabel: "COE turun",
    visa: 12_000_000,
    visaLabel: "Visa turun",
  },
];

export function programTotal(program: FinanceProgram) {
  return program.dp + program.cicilan * program.cicilanCount + program.coe + program.visa;
}

export function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function localDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function makeLine(
  label: string,
  amount: number,
  dueDate: string,
  kind: InvoiceLineKind,
  dueAt = "",
): InvoiceLine {
  return { label, amount, dueDate, dueAt, kind, paid: false, paidAt: "", receiptNo: "", note: "" };
}

export function linesForProgram(program: FinanceProgram, at = new Date()): InvoiceLine[] {
  const job = program.id === "job-matching";
  const eventKind: InvoiceLineKind = job ? "event-warning" : "event-custom";
  const lines = [
    makeLine(
      "DP",
      program.dp,
      localDate(at),
      "dp",
      job ? new Date(at.getTime() + 24 * 60 * 60 * 1000).toISOString() : "",
    ),
  ];
  for (let i = 1; i <= program.cicilanCount; i += 1) {
    lines.push(
      makeLine(
        `Cicilan ${i}/${program.cicilanCount}`,
        program.cicilan,
        firstBusinessDayOfMonth(at.getFullYear(), at.getMonth() + i),
        "cicilan",
      ),
    );
  }
  if (program.coe > 0) lines.push(makeLine(program.coeLabel || "COE turun", program.coe, "", eventKind));
  if (program.visa > 0) lines.push(makeLine(program.visaLabel || "Visa turun", program.visa, "", eventKind));
  return lines;
}

function eventColumnLabel(program: FinanceProgram, which: "coe" | "visa"): string {
  if (program.id === "ikusei-partner") return "COE/pelunasan";
  if (program.id === "job-matching" || program.id === "magang") return which === "coe" ? "COE" : "Visa/pelunasan";
  return which === "coe" ? "COE" : "Visa";
}

export function columnsForProgram(program: FinanceProgram): PaymentColumn[] {
  const eventKind: InvoiceLineKind = program.id === "job-matching" ? "event-warning" : "event-custom";
  const columns: PaymentColumn[] = [{ key: "dp", label: "DP", kind: "dp" }];
  for (let i = 1; i <= program.cicilanCount; i += 1) {
    columns.push({ key: `cicilan-${i}`, label: `Cicilan ${i}`, kind: "cicilan" });
  }
  if (program.coe > 0) columns.push({ key: "coe", label: eventColumnLabel(program, "coe"), kind: eventKind });
  if (program.visa > 0) columns.push({ key: "visa", label: eventColumnLabel(program, "visa"), kind: eventKind });
  return columns;
}

export function isLineOverdue(line: InvoiceLine, now = new Date()): boolean {
  if (line.paid) return false;
  if (line.kind === "dp" && line.dueAt) return now.getTime() > new Date(line.dueAt).getTime();
  if (!line.dueDate) return false;
  return now.getTime() > new Date(`${line.dueDate}T23:59:59`).getTime();
}

export function loadPrograms(): FinanceProgram[] {
  if (typeof window === "undefined") return OFFICIAL_PROGRAMS.map((item) => ({ ...item }));
  try {
    const raw = localStorage.getItem(PROGRAM_KEY);
    if (!raw) {
      savePrograms(OFFICIAL_PROGRAMS);
      return OFFICIAL_PROGRAMS.map((item) => ({ ...item }));
    }
    const parsed = JSON.parse(raw) as FinanceProgram[];
    if (!Array.isArray(parsed) || parsed.length === 0) return OFFICIAL_PROGRAMS.map((item) => ({ ...item }));
    return OFFICIAL_PROGRAMS.map((official) => {
      const stored = parsed.find((item) => item.id === official.id);
      if (!stored) return { ...official };
      return {
        ...official,
        dp: Number(stored.dp) || 0,
        cicilan: Number(stored.cicilan) || 0,
        cicilanCount: Number(stored.cicilanCount) || 0,
        coe: Number(stored.coe) || 0,
        visa: Number(stored.visa) || 0,
      };
    });
  } catch {
    return OFFICIAL_PROGRAMS.map((item) => ({ ...item }));
  }
}

export function savePrograms(programs: FinanceProgram[]) {
  localStorage.setItem(PROGRAM_KEY, JSON.stringify(programs));
}

function inferKind(line: Partial<InvoiceLine>, programId: string): InvoiceLineKind {
  if (line.kind === "dp" || line.kind === "cicilan" || line.kind === "event-warning" || line.kind === "event-custom") {
    return line.kind;
  }
  const label = (line.label || "").toLowerCase();
  if (label.startsWith("dp")) return "dp";
  if (label.startsWith("cicilan")) return "cicilan";
  return programId === "job-matching" ? "event-warning" : "event-custom";
}

function asInvoice(raw: Partial<FinanceInvoice> & { scheme?: string }): FinanceInvoice | null {
  if (!raw.id || !raw.studentId || !Array.isArray(raw.lines)) return null;
  const programId = raw.programId || raw.scheme || "";
  return {
    id: raw.id,
    number: raw.number || raw.id,
    studentName: raw.studentName || "",
    studentId: raw.studentId,
    programId,
    programName: raw.programName || (raw.scheme === "job-matching" ? "Job Matching" : raw.scheme === "reguler" ? "Reguler lama" : ""),
    lines: raw.lines.map((line) => ({
      label: line.label || "",
      amount: Number(line.amount) || 0,
      dueDate: line.dueDate || "",
      dueAt: line.dueAt || "",
      kind: inferKind(line, programId),
      paid: Boolean(line.paid),
      paidAt: line.paidAt || "",
      receiptNo: line.receiptNo || "",
      note: line.note || "",
    })),
    createdAt: raw.createdAt || "",
  };
}

export function loadInvoices(): FinanceInvoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INVOICE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Array<Partial<FinanceInvoice> & { scheme?: string }>) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(asInvoice).filter((item): item is FinanceInvoice => item !== null);
  } catch {
    return [];
  }
}

function saveInvoices(list: FinanceInvoice[]) {
  localStorage.setItem(INVOICE_KEY, JSON.stringify(list));
}

function nextNumber(prefix: "INV" | "KW", year: number, taken: string[]): string {
  const head = `${prefix}-${year}-`;
  const seq = taken
    .filter((no) => no.startsWith(head))
    .map((no) => Number(no.slice(head.length)))
    .filter((n) => Number.isFinite(n));
  const next = (seq.length ? Math.max(...seq) : 0) + 1;
  return `${head}${String(next).padStart(3, "0")}`;
}

export function assignStudentProgram(input: {
  studentId: string;
  studentName: string;
  programId: string;
}): { ok: true; invoice: FinanceInvoice } | { ok: false; message: string } {
  const program = loadPrograms().find((item) => item.id === input.programId);
  if (!program) return { ok: false, message: "Pilih program dulu." };
  const existing = loadInvoices();
  const current = existing.find((item) => item.studentId === input.studentId);
  if (current?.lines.some((line) => line.paid)) {
    return { ok: false, message: "Siswa ini sudah punya pembayaran. Program tidak diganti." };
  }
  const year = new Date().getFullYear();
  const invoice: FinanceInvoice = {
    id: current?.id ?? `inv-${Date.now().toString(36)}`,
    number: current?.number ?? nextNumber("INV", year, existing.map((item) => item.number)),
    studentName: input.studentName,
    studentId: input.studentId,
    programId: program.id,
    programName: program.name,
    lines: linesForProgram(program),
    createdAt: current?.createdAt || new Date().toISOString(),
  };
  if (current) {
    const index = existing.findIndex((item) => item.id === current.id);
    existing[index] = invoice;
  } else {
    existing.unshift(invoice);
  }
  saveInvoices(existing);
  return { ok: true, invoice };
}

export function markLinePaid(invoiceId: string, lineIndex: number): FinanceInvoice | null {
  const list = loadInvoices();
  const invoice = list.find((item) => item.id === invoiceId);
  if (!invoice || !invoice.lines[lineIndex] || invoice.lines[lineIndex].paid) return invoice ?? null;
  const year = new Date().getFullYear();
  const taken = list.flatMap((item) => item.lines.map((line) => line.receiptNo).filter(Boolean));
  invoice.lines[lineIndex] = {
    ...invoice.lines[lineIndex],
    paid: true,
    paidAt: new Date().toISOString(),
    receiptNo: nextNumber("KW", year, taken),
  };
  saveInvoices(list);
  return invoice;
}

export function resetLinePaid(invoiceId: string, lineIndex: number): FinanceInvoice | null {
  const list = loadInvoices();
  const invoice = list.find((item) => item.id === invoiceId);
  const line = invoice?.lines[lineIndex];
  if (!invoice || !line || !line.paid) return invoice ?? null;
  invoice.lines[lineIndex] = { ...line, paid: false, paidAt: "", receiptNo: "" };
  saveInvoices(list);
  return invoice;
}

export function setLineNote(invoiceId: string, lineIndex: number, note: string): FinanceInvoice | null {
  const list = loadInvoices();
  const invoice = list.find((item) => item.id === invoiceId);
  const line = invoice?.lines[lineIndex];
  if (!invoice || !line) return null;
  invoice.lines[lineIndex] = { ...line, note: note.trim() };
  saveInvoices(list);
  return invoice;
}

export function setLineDate(invoiceId: string, lineIndex: number, dueDate: string): FinanceInvoice | null {
  const list = loadInvoices();
  const invoice = list.find((item) => item.id === invoiceId);
  const line = invoice?.lines[lineIndex];
  if (!invoice || !line) return null;
  invoice.lines[lineIndex] = { ...line, dueDate, dueAt: line.dueAt ? movedDueAt(line.dueAt, dueDate) : "" };
  saveInvoices(list);
  return invoice;
}

function movedDueAt(dueAt: string, dueDate: string) {
  if (!dueDate) return "";
  const previous = new Date(dueAt);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dueDate);
  if (Number.isNaN(previous.getTime()) || !match) return dueAt;
  previous.setFullYear(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return previous.toISOString();
}

export function cancelStudentProgram(studentId: string): { ok: true } | { ok: false; message: string } {
  const list = loadInvoices();
  const current = list.find((item) => item.studentId === studentId);
  if (!current) return { ok: false, message: "Siswa ini belum masuk pembayaran." };
  if (current.lines.some((line) => line.paid)) {
    return { ok: false, message: "Sudah ada pembayaran. Program tidak bisa dibatalkan." };
  }
  saveInvoices(list.filter((item) => item.id !== current.id));
  return { ok: true };
}

export function upcomingDues(invoices: FinanceInvoice[]): Array<InvoiceLine & { invoiceNumber: string; studentName: string }> {
  return invoices
    .flatMap((invoice) =>
      invoice.lines
        .filter((line) => !line.paid && line.dueDate)
        .map((line) => ({ ...line, invoiceNumber: invoice.number, studentName: invoice.studentName })),
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
