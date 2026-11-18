"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AlertTriangle, ArrowLeft, Download, Eye, EyeOff, Settings, X } from "lucide-react";
import { toast } from "react-hot-toast";
import PortalPageShell from "@/components/PortalPageShell";
import SearchField from "@/components/SearchField";
import { downloadExcel } from "@/lib/export-siswa-excel";
import { renderFinanceSlip } from "@/lib/finance-slip";
import { studentFileName } from "@/lib/student-file-name";
import TablePagination from "@/components/TablePagination";
import { useTablePagination } from "@/hooks/useTablePagination";
import {
  FTI_ADMIN_DEFAULT_PASSWORD,
  loadFtiAdminAccount,
  updateFtiAdminPassword,
  type FtiAdminAccount,
} from "@/lib/fti-admin-account";
import { omitInactiveAccounts } from "@/lib/fti-student-account-storage";
import { loadFtiDataSiswaStudents } from "@/lib/fti-data-siswa-storage";
import { seedLpkStudentsIfEmpty } from "@/lib/lpk-student-storage";
import { isAlumniByEntry } from "@/lib/placement";
import {
  assignStudentProgram,
  cancelStudentProgram,
  columnsForProgram,
  formatRupiah,
  isLineOverdue,
  linesForProgram,
  loadInvoices,
  loadPrograms,
  markLinePaid,
  OFFICIAL_PROGRAMS,
  programTotal,
  resetLinePaid,
  savePrograms,
  setLineDate,
  setLineNote,
  type FinanceInvoice,
  type FinanceProgram,
  type InvoiceLine,
} from "@/lib/finance-storage";
import type { LpkStudentRecord } from "@/types/lpk-student";

type SettingsLayer = "prices" | "password" | null;

const QUEUE_SHARE_KEY = "flora_finance_split_v1";
const DEFAULT_QUEUE_SHARE = 0.82 / (0.82 + 1.38);

function clampQueueShare(share: number, width: number) {
  if (!Number.isFinite(share)) return DEFAULT_QUEUE_SHARE;
  if (width < 900) return Math.min(0.72, Math.max(0.24, share));
  const available = Math.max(width - 12, 1);
  const minLeft = 340 / available;
  const maxLeft = 1 - 280 / available;
  if (maxLeft <= minLeft) return DEFAULT_QUEUE_SHARE;
  return Math.min(maxLeft, Math.max(minLeft, share));
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-left">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
      {children}
    </label>
  );
}

function Layer({
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide = false,
  zIndex = 50,
  closeOnEscape = true,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  zIndex?: number;
  closeOnEscape?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!closeOnEscape) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeOnEscape, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" style={{ zIndex }}>
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="finance-layer-title"
        className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden border border-gray-200 bg-white shadow-2xl ${wide ? "max-w-5xl" : "max-w-md"}`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-4">
          <div>
            <h2 id="finance-layer-title" className="font-serif text-xl text-gray-900">
              {title}
            </h2>
            {subtitle ? <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700" aria-label="Tutup">
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6">{children}</div>
        {footer ? <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

function MasterHargaLayer({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [programs, setPrograms] = useState<FinanceProgram[]>(OFFICIAL_PROGRAMS);

  useEffect(() => {
    setPrograms(loadPrograms());
  }, []);

  const patch = (id: string, key: "dp" | "cicilan" | "cicilanCount" | "coe" | "visa", value: number) => {
    setPrograms((current) => current.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const saveMaster = () => {
    savePrograms(programs);
    onSaved();
    toast.success("Master harga disimpan.");
    onClose();
  };

  return (
    <Layer
      title="Master harga"
      subtitle="Angka resmi per program. Dipakai saat siswa dikenakan biaya."
      onClose={onClose}
      wide
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="border border-gray-300 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={saveMaster}>
            Simpan harga
          </button>
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
              <th className="pb-2 pr-3 font-bold">Program</th>
              <th className="pb-2 pr-3 font-bold">DP</th>
              <th className="pb-2 pr-3 font-bold">Cicilan</th>
              <th className="pb-2 pr-3 font-bold">Bulan</th>
              <th className="pb-2 pr-3 font-bold">COE</th>
              <th className="pb-2 pr-3 font-bold">Visa</th>
              <th className="pb-2 font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((program) => (
              <tr key={program.id} className="border-t border-gray-100">
                <td className="py-2 pr-3 font-medium text-gray-900">{program.name}</td>
                {(["dp", "cicilan", "cicilanCount", "coe", "visa"] as const).map((key) => (
                  <td key={key} className="py-2 pr-3">
                    <input
                      type="number"
                      min={0}
                      className="input-field !py-1.5"
                      value={program[key]}
                      onChange={(event) => patch(program.id, key, Number(event.target.value))}
                    />
                  </td>
                ))}
                <td className="py-2 font-semibold text-gray-900">{formatRupiah(programTotal(program))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layer>
  );
}

function PasswordField({
  label,
  value,
  shown,
  onChange,
  onToggle,
  autoComplete,
  invalid = false,
}: {
  label: string;
  value: string;
  shown: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  autoComplete: string;
  invalid?: boolean;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <input
          type={shown ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className={`input-field pr-12 font-mono ${invalid ? "border-red-500 bg-red-50" : ""}`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={shown ? `Sembunyikan ${label}` : `Tampilkan ${label}`}
          className="absolute bottom-0 right-0 top-0 px-4 text-gray-400 hover:text-primary-pink"
        >
          {shown ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </Field>
  );
}

function EditPasswordLayer({ onClose }: { onClose: () => void }) {
  const [account, setAccount] = useState<FtiAdminAccount | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setAccount(loadFtiAdminAccount());
  }, []);

  const mismatch = confirmPassword.length > 0 && nextPassword !== confirmPassword;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentPassword) {
      toast.error("Masukkan password saat ini.");
      return;
    }
    if (nextPassword.trim().length < 4) {
      toast.error("Password baru minimal 4 karakter.");
      return;
    }
    if (nextPassword !== confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak sama.");
      return;
    }

    const result = updateFtiAdminPassword(currentPassword, nextPassword);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    setAccount(loadFtiAdminAccount());
    toast.success("Password akun berhasil diperbarui.");
    onClose();
  };

  return (
    <Layer
      title="Edit password"
      subtitle="Password login akun admin"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="border border-gray-300 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>
          <button type="submit" form="finance-password-form" disabled={mismatch} className="btn-primary disabled:opacity-50">
            Simpan password
          </button>
        </>
      }
    >
      <form id="finance-password-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Username">
          <input
            type="text"
            value={account?.userName ?? ""}
            disabled
            className="input-field cursor-not-allowed bg-gray-50 font-mono text-gray-500"
          />
        </Field>
        <PasswordField
          label="Password saat ini"
          value={currentPassword}
          shown={showCurrent}
          onChange={setCurrentPassword}
          onToggle={() => setShowCurrent((value) => !value)}
          autoComplete="current-password"
        />
        <PasswordField
          label="Password baru"
          value={nextPassword}
          shown={showNext}
          onChange={setNextPassword}
          onToggle={() => setShowNext((value) => !value)}
          autoComplete="new-password"
        />
        <PasswordField
          label="Konfirmasi password baru"
          value={confirmPassword}
          shown={showConfirm}
          onChange={setConfirmPassword}
          onToggle={() => setShowConfirm((value) => !value)}
          autoComplete="new-password"
          invalid={mismatch}
        />
        {mismatch ? <p className="text-[10px] font-medium text-red-500">Password tidak cocok.</p> : null}
        <p className="text-xs leading-relaxed text-gray-500">
          {account?.password === FTI_ADMIN_DEFAULT_PASSWORD
            ? `Mode testing. Username ${account.userName}, password awal ${FTI_ADMIN_DEFAULT_PASSWORD}.`
            : "Password tersimpan di browser ini dan dipakai saat login dengan username admin."}
        </p>
      </form>
    </Layer>
  );
}

function FinanceSettings({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [layer, setLayer] = useState<SettingsLayer>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openLayer = (next: SettingsLayer) => {
    setOpen(false);
    setLayer(next);
  };

  return (
    <>
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Pengaturan finance"
          title="Pengaturan"
          onClick={() => setOpen((value) => !value)}
          className="rounded-md border border-gray-200 bg-white p-2 text-gray-700 transition-colors hover:border-primary-pink/40 hover:bg-primary-pink-light"
        >
          <Settings size={18} strokeWidth={1.5} />
        </button>
        {open ? (
          <div role="menu" className="absolute right-0 top-full z-30 mt-2 w-56 border border-gray-200 bg-white py-1 shadow-md">
            <button
              type="button"
              role="menuitem"
              className="block w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-primary-pink-light"
              onClick={() => openLayer("prices")}
            >
              Master harga
            </button>
            <button
              type="button"
              role="menuitem"
              className="block w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-primary-pink-light"
              onClick={() => openLayer("password")}
            >
              Edit password
            </button>
          </div>
        ) : null}
      </div>
      {layer === "prices" ? <MasterHargaLayer onClose={() => setLayer(null)} onSaved={onSaved} /> : null}
      {layer === "password" ? <EditPasswordLayer onClose={() => setLayer(null)} /> : null}
    </>
  );
}

const FILTER_SELECT =
  "bg-transparent border border-gray-300 px-3 py-2 text-[10px] uppercase tracking-widest text-gray-600 focus:border-primary-pink focus:outline-none";

function nextOpen(invoice: FinanceInvoice) {
  return invoice.lines.find((line) => !line.paid);
}

function unpaidTotal(invoice: FinanceInvoice) {
  return invoice.lines.reduce((sum, line) => (line.paid ? sum : sum + line.amount), 0);
}

function isFullyPaid(invoice: FinanceInvoice) {
  return invoice.lines.length > 0 && invoice.lines.every((line) => line.paid);
}

function paidTotal(invoice: FinanceInvoice) {
  return invoice.lines.reduce((sum, line) => sum + line.amount, 0);
}

function lastPaidAt(invoice: FinanceInvoice) {
  return invoice.lines.reduce((latest, line) => (line.paidAt > latest ? line.paidAt : latest), "");
}

function formatPaidDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function sourceLabel(student: LpkStudentRecord) {
  const raw = (student.asal_lpk || "").trim();
  if (!raw) return "—";
  if (/flora|fti/i.test(raw)) return "FTI";
  const name = raw.replace(/\bmitra\b/gi, " ").replace(/\s+/g, " ").trim();
  return name || raw;
}

function dueText(line: InvoiceLine) {
  if (line.dueAt) {
    return `batas ${new Date(line.dueAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}`;
  }
  return line.dueDate;
}

function batasDate(line: InvoiceLine) {
  if (!line.dueAt) return line.dueDate;
  const date = new Date(line.dueAt);
  if (Number.isNaN(date.getTime())) return line.dueDate;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function lineAtColumn(lines: InvoiceLine[], columns: { kind: InvoiceLine["kind"] }[], columnIndex: number) {
  const column = columns[columnIndex];
  const nth = columns.slice(0, columnIndex + 1).filter((item) => item.kind === column.kind).length - 1;
  const matches = lines
    .map((line, index) => ({ line, index }))
    .filter((item) => item.line.kind === column.kind);
  return matches[nth];
}

function paymentCellText(line: InvoiceLine | undefined) {
  if (!line) return "-";
  if (line.paid) return `${formatRupiah(line.amount)} · ${line.receiptNo || "Lunas"}`;
  if (line.kind === "event-warning" && !line.dueDate) return `${formatRupiah(line.amount)} · Belum ada tanggal`;
  const when = dueText(line) || "Tanggal kosong";
  return `${formatRupiah(line.amount)} · ${isLineOverdue(line) ? "Terlambat · " : ""}${when}`;
}

function excelStamp() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function safeSheetName(name: string) {
  return name.replace(/[\\/?*[\]:]/g, " ").replace(/\s+/g, " ").trim().slice(0, 31) || "Pembayaran";
}

function excelName(kind: string, names: string[], fallback: string) {
  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  return unique.length === 1 ? `${studentFileName(kind, unique[0])}.xlsx` : fallback;
}

function printSlip(kind: "invoice" | "kwitansi", invoice: FinanceInvoice, line: InvoiceLine) {
  const win = window.open("", "_blank");
  if (!win) {
    toast.error("Popup cetak diblokir browser.");
    return;
  }
  win.document.open();
  win.document.write(renderFinanceSlip(kind, invoice, line, window.location.origin));
  win.document.close();
}

export default function FinancePage() {
  const [programs, setPrograms] = useState<FinanceProgram[]>(OFFICIAL_PROGRAMS);
  const [invoices, setInvoices] = useState<FinanceInvoice[]>([]);
  const [students, setStudents] = useState<LpkStudentRecord[]>([]);
  const [programFilter, setProgramFilter] = useState("");
  const [paySearch, setPaySearch] = useState("");
  const [payStatus, setPayStatus] = useState("semua");
  const [payView, setPayView] = useState<"kerja" | "lunas">("kerja");
  const [lunasDetailId, setLunasDetailId] = useState<string | null>(null);
  const [pickStudent, setPickStudent] = useState<LpkStudentRecord | null>(null);
  const [pickProgramId, setPickProgramId] = useState("");
  const [search, setSearch] = useState("");
  const [sumber, setSumber] = useState("semua");
  const [kelas, setKelas] = useState("Semua");
  const [cellMenu, setCellMenu] = useState<{ invoiceId: string; lineIndex: number } | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [printAsk, setPrintAsk] = useState<"invoice" | "kwitansi" | null>(null);
  const [draftDate, setDraftDate] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [queueShare, setQueueShare] = useState(DEFAULT_QUEUE_SHARE);
  const [splitDrag, setSplitDrag] = useState(false);
  const splitRef = useRef<HTMLDivElement>(null);
  const splitDragRef = useRef(false);

  useEffect(() => {
    const raw = localStorage.getItem(QUEUE_SHARE_KEY);
    const value = Number(raw);
    if (!raw || !Number.isFinite(value)) return;
    const width = splitRef.current?.getBoundingClientRect().width || window.innerWidth;
    setQueueShare(clampQueueShare(value, width));
  }, []);

  useEffect(() => {
    if (!splitDrag) return;
    const previousCursor = document.body.style.cursor;
    const previousSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousSelect;
    };
  }, [splitDrag]);

  const shareFromPointer = (clientX: number) => {
    const box = splitRef.current?.getBoundingClientRect();
    if (!box) return queueShare;
    return clampQueueShare((clientX - box.left - 6) / (box.width - 12), box.width);
  };

  const onSplitPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    event.preventDefault();
    splitDragRef.current = true;
    setSplitDrag(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onSplitPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!splitDragRef.current) return;
    setQueueShare(shareFromPointer(event.clientX));
  };

  const finishSplit = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!splitDragRef.current) return;
    splitDragRef.current = false;
    setSplitDrag(false);
    const next = shareFromPointer(event.clientX);
    setQueueShare(next);
    localStorage.setItem(QUEUE_SHARE_KEY, String(next));
  };

  const nudgeSplit = (delta: number) => {
    const box = splitRef.current?.getBoundingClientRect();
    const next = clampQueueShare(queueShare + delta, box?.width || window.innerWidth);
    setQueueShare(next);
    localStorage.setItem(QUEUE_SHARE_KEY, String(next));
  };

  const resetSplit = () => {
    setQueueShare(DEFAULT_QUEUE_SHARE);
    localStorage.removeItem(QUEUE_SHARE_KEY);
  };

  const reload = () => {
    const fti = loadFtiDataSiswaStudents();
    const mitra = seedLpkStudentsIfEmpty();
    const combined = [...fti, ...mitra.filter((item) => !fti.some((saved) => saved.id === item.id))].filter(
      (item) => !isAlumniByEntry(item),
    );
    const visible = omitInactiveAccounts(combined);
    const visibleIds = new Set(visible.map((item) => item.id));
    setStudents(visible);
    setInvoices(
      loadInvoices().filter(
        (invoice) => visibleIds.has(invoice.studentId) || !combined.some((item) => item.id === invoice.studentId),
      ),
    );
  };

  useEffect(() => {
    reload();
    setPrograms(loadPrograms());
  }, []);

  const studentById = useMemo(() => new Map(students.map((item) => [item.id, item])), [students]);
  const invoiceByStudent = useMemo(() => {
    const map = new Map<string, FinanceInvoice>();
    for (const invoice of invoices) {
      if (!map.has(invoice.studentId)) map.set(invoice.studentId, invoice);
    }
    return map;
  }, [invoices]);

  const unassigned = useMemo(
    () => students.filter((item) => !invoiceByStudent.has(item.id)),
    [invoiceByStudent, students],
  );
  const kelasOptions = useMemo(
    () => Array.from(new Set(unassigned.map((item) => item.kelas).filter(Boolean))).sort(),
    [unassigned],
  );
  const sumberOptions = useMemo(() => {
    const names = Array.from(new Set(unassigned.map((item) => sourceLabel(item)).filter((item) => item !== "—")));
    return names.sort((left, right) => {
      if (left === "FTI") return -1;
      if (right === "FTI") return 1;
      return left.localeCompare(right, "id");
    });
  }, [unassigned]);
  const queue = useMemo(() => {
    const q = search.trim().toLowerCase();
    return unassigned.filter((item) => {
      const source = sourceLabel(item);
      if (sumber !== "semua" && source !== sumber) return false;
      if (kelas !== "Semua" && item.kelas !== kelas) return false;
      if (!q) return true;
      return (
        item.nama_lengkap.toLowerCase().includes(q) ||
        item.no_peserta.toLowerCase().includes(q) ||
        source.toLowerCase().includes(q)
      );
    });
  }, [kelas, search, sumber, unassigned]);

  const outside = useMemo(
    () => invoices.filter((item) => !programs.some((program) => program.id === item.programId)),
    [invoices, programs],
  );
  const activeProgram = programs.find((item) => item.id === programFilter);
  const columns = activeProgram ? columnsForProgram(activeProgram) : [];
  const payRows = useMemo(() => {
    const q = paySearch.trim().toLowerCase();
    return invoices.filter((invoice) => {
      if (isFullyPaid(invoice)) return false;
      const known = programs.some((program) => program.id === invoice.programId);
      if (programFilter === "__outside" && known) return false;
      if (programFilter && programFilter !== "__outside" && invoice.programId !== programFilter) return false;
      if (payStatus === "terlambat" && !invoice.lines.some((line) => isLineOverdue(line))) return false;
      if (payStatus === "belum" && !invoice.lines.some((line) => !line.paid)) return false;
      if (!q) return true;
      const student = studentById.get(invoice.studentId);
      return (
        invoice.studentName.toLowerCase().includes(q) ||
        invoice.number.toLowerCase().includes(q) ||
        (student?.no_peserta || "").toLowerCase().includes(q)
      );
    });
  }, [invoices, paySearch, payStatus, programFilter, programs, studentById]);
  const lunasRows = useMemo(() => {
    const q = paySearch.trim().toLowerCase();
    return invoices.filter((invoice) => {
      if (!isFullyPaid(invoice)) return false;
      if (!q) return true;
      const student = studentById.get(invoice.studentId);
      return (
        invoice.studentName.toLowerCase().includes(q) ||
        invoice.number.toLowerCase().includes(q) ||
        invoice.programName.toLowerCase().includes(q) ||
        (student?.no_peserta || "").toLowerCase().includes(q)
      );
    });
  }, [invoices, paySearch, studentById]);
  const visiblePayRows = payView === "lunas" ? lunasRows : payRows;

  const queuePage = useTablePagination(queue, { storageKey: "flora-finance-queue-page" });
  const payPage = useTablePagination(visiblePayRows, { storageKey: "flora-finance-pay-page" });
  const pickProgram = programs.find((item) => item.id === pickProgramId);
  const preview = pickProgram ? linesForProgram(pickProgram) : [];
  const menuInvoice = invoices.find((item) => item.id === cellMenu?.invoiceId);
  const menuLine = menuInvoice && cellMenu ? menuInvoice.lines[cellMenu.lineIndex] : undefined;
  const lunasInvoice = invoices.find((item) => item.id === lunasDetailId) ?? null;
  const sisaTagihan = payRows.reduce((sum, invoice) => sum + unpaidTotal(invoice), 0);

  const saveAssignment = () => {
    if (!pickStudent || !pickProgramId) {
      toast.error("Pilih program dulu.");
      return;
    }
    const result = assignStudentProgram({
      studentId: pickStudent.id,
      studentName: pickStudent.nama_lengkap,
      programId: pickProgramId,
    });
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    reload();
    setProgramFilter(result.invoice.programId);
    setPickStudent(null);
    setPickProgramId("");
    toast.success(`${pickStudent.nama_lengkap} masuk ${result.invoice.programName}.`);
  };

  const cancelProgram = (invoice: FinanceInvoice) => {
    const result = cancelStudentProgram(invoice.studentId);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    reload();
    toast.success(`${invoice.studentName} kembali ke antrean.`);
  };

  const openCell = (invoiceId: string, lineIndex: number, line: InvoiceLine) => {
    setCellMenu({ invoiceId, lineIndex });
    setDraftDate(batasDate(line));
    setDraftNote(line.note || "");
    setResetConfirm(false);
    setPrintAsk(null);
  };

  const downloadQueue = () => {
    if (queue.length === 0) {
      toast.error("Tidak ada siswa pada filter ini.");
      return;
    }
    downloadExcel(
      excelName("Antrean", queue.map((item) => item.nama_lengkap), `Antrean_Pembayaran_${excelStamp()}.xlsx`),
      "Antrean",
      ["No", "Nama", "ID Peserta", "Kelas", "Sumber"],
      queue.map((item, index) => [
        String(index + 1),
        item.nama_lengkap,
        item.no_peserta || "-",
        item.kelas || "-",
        sourceLabel(item),
      ]),
    );
    toast.success(`${queue.length} siswa diunduh ke Excel.`);
  };

  const downloadPayments = () => {
    const stamp = excelStamp();
    if (payView === "lunas") {
      if (lunasRows.length === 0) {
        toast.error("Tidak ada tagihan lunas pada pencarian ini.");
        return;
      }
      downloadExcel(
        excelName("Lunas", lunasRows.map((invoice) => invoice.studentName), `Lunas_${stamp}.xlsx`),
        "Lunas",
        ["Nama", "ID Peserta", "Invoice", "Program", "Total", "Tanggal lunas"],
        lunasRows.map((invoice) => {
          const student = studentById.get(invoice.studentId);
          return [
            invoice.studentName,
            student?.no_peserta || "-",
            invoice.number,
            invoice.programName || "Invoice lama",
            formatRupiah(paidTotal(invoice)),
            formatPaidDate(lastPaidAt(invoice)),
          ];
        }),
      );
      toast.success(`${lunasRows.length} tagihan lunas diunduh ke Excel.`);
      return;
    }
    if (payRows.length === 0) {
      toast.error("Tidak ada tagihan pada filter ini.");
      return;
    }
    if (activeProgram) {
      downloadExcel(
        excelName(
          "Pembayaran",
          payRows.map((invoice) => invoice.studentName),
          `Pembayaran_${safeSheetName(activeProgram.name)}_${stamp}.xlsx`,
        ),
        safeSheetName(activeProgram.name),
        ["Nama", "ID Peserta", "Invoice", ...columns.map((column) => column.label)],
        payRows.map((invoice) => {
          const student = studentById.get(invoice.studentId);
          return [
            invoice.studentName,
            student?.no_peserta || "-",
            invoice.number,
            ...columns.map((column, index) => paymentCellText(lineAtColumn(invoice.lines, columns, index)?.line)),
          ];
        }),
      );
    } else {
      const label = programFilter === "__outside" ? "Invoice lama" : "Semua program";
      downloadExcel(
        excelName(
          "Pembayaran",
          payRows.map((invoice) => invoice.studentName),
          `Pembayaran_${safeSheetName(label)}_${stamp}.xlsx`,
        ),
        safeSheetName(label),
        ["Nama", "ID Peserta", "Invoice", "Program", "Berikutnya", "Sisa", "Status"],
        payRows.map((invoice) => {
          const student = studentById.get(invoice.studentId);
          const upcoming = nextOpen(invoice);
          const paidCount = invoice.lines.filter((line) => line.paid).length;
          const late = invoice.lines.some((line) => isLineOverdue(line));
          return [
            invoice.studentName,
            student?.no_peserta || "-",
            invoice.number,
            invoice.programName || "Invoice lama",
            upcoming ? `${upcoming.label} · ${paymentCellText(upcoming)}` : "Lunas",
            formatRupiah(unpaidTotal(invoice)),
            late ? "Terlambat" : `${paidCount}/${invoice.lines.length} lunas`,
          ];
        }),
      );
    }
    toast.success(`${payRows.length} tagihan diunduh ke Excel.`);
  };

  return (
    <PortalPageShell fill>
      <main className="flex h-full min-h-0 flex-col gap-3 overflow-hidden p-3 md:p-4">
        <header className="flex shrink-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="border border-gray-300 p-2.5 text-gray-500 transition-colors hover:bg-gray-200/50 hover:text-gray-900"
              title="Kembali"
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate font-serif text-2xl tracking-wide text-gray-900">Finance Dashboard</h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500">Antrean siswa dan tabel pembayaran</p>
            </div>
          </div>
          <FinanceSettings onSaved={() => setPrograms(loadPrograms())} />
        </header>

        <div
          ref={splitRef}
          className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(340px,var(--queue-share))_12px_minmax(280px,var(--pay-share))] lg:gap-0"
          style={{ ["--queue-share" as string]: `${queueShare}fr`, ["--pay-share" as string]: `${1 - queueShare}fr` }}
        >
          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden border border-gray-300 bg-white shadow-sm">
            <div className="shrink-0 space-y-2 border-b border-gray-200 px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-serif text-lg text-gray-900">Siswa belum masuk</h2>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500">{queue.length} siswa</p>
                  <button
                    type="button"
                    onClick={downloadQueue}
                    title="Unduh Excel"
                    aria-label="Unduh Excel antrean"
                    className="flex h-8 w-8 items-center justify-center border border-gray-300 bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900"
                  >
                    <Download size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              <SearchField value={search} onChange={setSearch} />
              <div className="space-y-2">
                <select
                  className="w-full border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-700 focus:border-primary-pink focus:outline-none"
                  value={sumber}
                  onChange={(event) => setSumber(event.target.value)}
                  aria-label="Sumber"
                >
                  <option value="semua">Semua LPK</option>
                  {sumberOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <select className={`${FILTER_SELECT} w-full`} value={kelas} onChange={(event) => setKelas(event.target.value)} aria-label="Kelas">
                  <option value="Semua">Kelas</option>
                  {kelasOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="profil-siswa-jukyu flex min-h-0 flex-1 flex-col">
              <div className="custom-scrollbar min-h-0 flex-1 overflow-auto">
                <table className="admin-data-table w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-100 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
                    <tr>
                      <th className="sticky left-0 top-0 z-20 bg-gray-100 px-3 py-2.5">No</th>
                      <th className="sticky top-0 z-10 bg-gray-100 px-3 py-2.5">Nama</th>
                      <th className="sticky top-0 z-10 bg-gray-100 px-3 py-2.5">ID Peserta</th>
                      <th className="sticky top-0 z-10 bg-gray-100 px-3 py-2.5">Kelas</th>
                      <th className="sticky top-0 z-10 bg-gray-100 px-3 py-2.5">Sumber</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queuePage.paginatedItems.map((item, index) => (
                      <tr
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setPickStudent(item);
                          setPickProgramId("");
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            setPickStudent(item);
                            setPickProgramId("");
                          }
                        }}
                        className="group cursor-pointer hover:bg-primary-pink-light"
                      >
                        <td className="sticky left-0 z-10 bg-white px-3 py-2 text-gray-500 group-hover:bg-primary-pink-light">{queuePage.rangeStart + index}</td>
                        <td className="px-3 py-2 font-medium text-gray-900">{item.nama_lengkap}</td>
                        <td className="px-3 py-2 text-gray-700">{item.no_peserta || "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{item.kelas || "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{sourceLabel(item)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {queue.length === 0 ? <p className="px-3 py-16 text-center text-sm text-gray-500">Tidak ada siswa pada filter ini.</p> : null}
              </div>
              <TablePagination
                compact
                currentPage={queuePage.currentPage}
                totalPages={queuePage.totalPages}
                totalItems={queuePage.totalItems}
                rangeStart={queuePage.rangeStart}
                rangeEnd={queuePage.rangeEnd}
                pageSize={queuePage.pageSize}
                minPageSize={queuePage.minPageSize}
                presetPageSizes={queuePage.presetPageSizes}
                isCustomPageSize={queuePage.isCustomPageSize}
                onPageChange={queuePage.setCurrentPage}
                onPageSizeChange={queuePage.setPageSize}
                onCustomModeChange={queuePage.setIsCustomPageSize}
              />
            </div>
          </section>

          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Geser lebar tabel"
            aria-valuemin={24}
            aria-valuemax={72}
            aria-valuenow={Math.round(queueShare * 100)}
            tabIndex={0}
            title="Geser untuk mengatur lebar. Klik dua kali untuk ukuran awal."
            className="group relative hidden cursor-col-resize touch-none items-center justify-center lg:flex"
            onPointerDown={onSplitPointerDown}
            onPointerMove={onSplitPointerMove}
            onPointerUp={finishSplit}
            onPointerCancel={finishSplit}
            onDoubleClick={resetSplit}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                nudgeSplit(-0.02);
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                nudgeSplit(0.02);
              }
              if (event.key === "Home") {
                event.preventDefault();
                resetSplit();
              }
            }}
          >
            <span className="absolute inset-y-0 -left-2 -right-2" />
            <span className={`relative z-10 h-12 w-1 rounded-full ${splitDrag ? "bg-primary-pink" : "bg-gray-300 group-hover:bg-primary-pink"}`} />
          </div>

          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden border border-gray-300 bg-white shadow-sm">
            <div className="shrink-0 space-y-2 border-b border-gray-200 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  {payView === "lunas" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPayView("kerja");
                        setLunasDetailId(null);
                      }}
                      className="inline-flex h-8 shrink-0 items-center gap-1.5 border border-gray-300 bg-white px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600 hover:border-gray-900 hover:text-gray-900"
                    >
                      <ArrowLeft size={14} />
                      Kembali
                    </button>
                  ) : null}
                  <h2 className="font-serif text-lg text-gray-900">{payView === "lunas" ? "Lunas" : "Pembayaran"}</h2>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-[10px] font-medium uppercase tracking-widest text-gray-500">
                    {payView === "lunas"
                      ? `${lunasRows.length} lunas`
                      : `${payRows.length} tagihan · sisa ${formatRupiah(sisaTagihan)}`}
                  </p>
                  {payView === "kerja" ? (
                    <button
                      type="button"
                      onClick={() => setPayView("lunas")}
                      className="inline-flex h-8 shrink-0 items-center border border-gray-300 bg-white px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600 hover:border-gray-900 hover:text-gray-900"
                    >
                      Lunas
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={downloadPayments}
                    title="Unduh Excel"
                    aria-label={payView === "lunas" ? "Unduh Excel lunas" : "Unduh Excel pembayaran"}
                    className="flex h-8 w-8 shrink-0 items-center justify-center border border-gray-300 bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900"
                  >
                    <Download size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <SearchField value={paySearch} onChange={setPaySearch} placeholder={payView === "lunas" ? "Cari yang lunas" : "Cari tagihan"} />
                {payView === "kerja" ? (
                <div className="flex items-center gap-2">
                <select className={`${FILTER_SELECT} min-w-0 flex-1`} value={programFilter} onChange={(event) => setProgramFilter(event.target.value)} aria-label="Program">
                  <option value="">Semua program</option>
                  {programs.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                  {outside.length > 0 ? <option value="__outside">Invoice lama</option> : null}
                </select>
                <select className={`${FILTER_SELECT} min-w-0 flex-1`} value={payStatus} onChange={(event) => setPayStatus(event.target.value)} aria-label="Status bayar">
                  <option value="semua">Semua status</option>
                  <option value="belum">Belum lunas</option>
                  <option value="terlambat">Terlambat</option>
                </select>
                {programFilter ? (
                  <button
                    type="button"
                    onClick={() => setProgramFilter("")}
                    className="inline-flex shrink-0 items-center gap-1.5 border border-gray-300 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600 hover:border-gray-900 hover:text-gray-900"
                  >
                    <ArrowLeft size={14} />
                    Kembali
                  </button>
                ) : null}
                </div>
                ) : null}
              </div>
            </div>
            <div className="profil-siswa-jukyu flex min-h-0 flex-1 flex-col">
              <div className="custom-scrollbar min-h-0 flex-1 overflow-auto">
                {payView === "lunas" ? (
                  <>
                    <table className="admin-data-table w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-gray-100 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
                        <tr>
                          <th className="sticky left-0 top-0 z-30 min-w-[160px] bg-gray-100 px-3 py-2.5 admin-sticky-split-right">Nama</th>
                          <th className="sticky top-0 z-10 bg-gray-100 px-3 py-2.5">Program</th>
                          <th className="sticky top-0 z-10 bg-gray-100 px-3 py-2.5">Invoice</th>
                          <th className="sticky top-0 z-10 bg-gray-100 px-3 py-2.5">Total</th>
                          <th className="sticky top-0 z-10 bg-gray-100 px-3 py-2.5">Tanggal lunas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payPage.paginatedItems.map((invoice) => (
                          <tr
                            key={invoice.id}
                            className="group cursor-pointer hover:bg-gray-50"
                            onClick={() => setLunasDetailId(invoice.id)}
                          >
                            <td className="sticky left-0 z-10 min-w-[160px] bg-white px-3 py-2 font-medium text-gray-900 admin-sticky-split-right group-hover:bg-gray-50">
                              <p>{invoice.studentName}</p>
                              <p className="text-[10px] font-normal text-gray-500">{studentById.get(invoice.studentId)?.no_peserta || "—"}</p>
                            </td>
                            <td className="px-3 py-2 text-gray-700">{invoice.programName || "Invoice lama"}</td>
                            <td className="px-3 py-2 text-indigo-600">{invoice.number}</td>
                            <td className="px-3 py-2 font-semibold text-gray-900">{formatRupiah(paidTotal(invoice))}</td>
                            <td className="px-3 py-2 text-gray-600">{formatPaidDate(lastPaidAt(invoice))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {lunasRows.length === 0 ? (
                      <p className="px-3 py-16 text-center text-sm text-gray-500">Belum ada tagihan yang lunas.</p>
                    ) : null}
                  </>
                ) : (
                <>
                <table className="admin-data-table w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-100 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
                    <tr>
                      <th className="sticky left-0 top-0 z-30 min-w-[160px] bg-gray-100 px-3 py-2.5 admin-sticky-split-right">Nama</th>
                      {activeProgram ? (
                        columns.map((column) => (
                          <th key={column.key} className="sticky top-0 z-10 bg-gray-100 px-3 py-2.5">{column.label}</th>
                        ))
                      ) : (
                        <>
                          <th className="sticky top-0 z-10 bg-gray-100 px-3 py-2.5">Program</th>
                          <th className="sticky top-0 z-10 bg-gray-100 px-3 py-2.5">Berikutnya</th>
                          <th className="sticky top-0 z-10 bg-gray-100 px-3 py-2.5">Sisa</th>
                          <th className="sticky top-0 z-10 bg-gray-100 px-3 py-2.5">Status</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {payPage.paginatedItems.map((invoice) => {
                      const locked = invoice.lines.some((line) => line.paid);
                      const paidCount = invoice.lines.filter((line) => line.paid).length;
                      const upcoming = nextOpen(invoice);
                      const late = invoice.lines.some((line) => isLineOverdue(line));
                      return (
                        <tr key={invoice.id} className="group hover:bg-gray-50">
                          <td className="sticky left-0 z-10 min-w-[160px] bg-white px-3 py-2 admin-sticky-split-right group-hover:bg-gray-50">
                            <p className="font-medium text-gray-900">{invoice.studentName}</p>
                            <p className="text-[10px] text-gray-500">{studentById.get(invoice.studentId)?.no_peserta || "—"}</p>
                            <p className="text-[10px] text-indigo-600">
                              {invoice.number}
                              {locked ? null : (
                                <>
                                  {" · "}
                                  <button type="button" className="font-semibold text-gray-400 hover:text-rose-600 hover:underline" onClick={() => cancelProgram(invoice)}>
                                    Batalkan
                                  </button>
                                </>
                              )}
                            </p>
                          </td>
                          {activeProgram ? (
                            columns.map((column, index) => {
                              const found = lineAtColumn(invoice.lines, columns, index);
                              const line = found?.line;
                              const lineIndex = found?.index ?? index;
                              const overdue = line ? isLineOverdue(line) : false;
                              const warning = line?.kind === "event-warning" && !line.dueDate;
                              const tone = !line
                                ? ""
                                : line.paid
                                  ? "bg-emerald-50 text-emerald-800"
                                  : overdue
                                    ? "bg-rose-50 text-rose-700"
                                    : warning
                                      ? "bg-amber-50 text-amber-800"
                                      : "text-gray-800";
                              return (
                                <td key={column.key} className={tone}>
                                  {line ? (
                                    <button type="button" onClick={() => openCell(invoice.id, lineIndex, line)} className="flex min-w-[8.5rem] flex-col items-start px-3 py-2 text-left hover:bg-primary-pink-light">
                                      <span className="font-semibold">{formatRupiah(line.amount)}</span>
                                      {line.paid ? (
                                        <span className="text-[10px]">{line.receiptNo}</span>
                                      ) : warning ? (
                                        <span className="inline-flex items-center gap-1 text-[10px]">
                                          <AlertTriangle size={12} /> Belum ada tanggal
                                        </span>
                                      ) : (
                                        <span className="text-[10px]">{overdue ? "Terlambat · " : ""}{dueText(line) || "Tanggal kosong"}</span>
                                      )}
                                    </button>
                                  ) : (
                                    <span className="px-3 py-2 text-gray-300">—</span>
                                  )}
                                </td>
                              );
                            })
                          ) : (
                            <>
                              <td className="px-3 py-2 text-gray-700">
                                <p>{invoice.programName || "Invoice lama"}</p>
                                {programs.some((program) => program.id === invoice.programId) ? (
                                  <button type="button" className="text-[10px] font-semibold uppercase tracking-wide text-primary-pink hover:underline" onClick={() => setProgramFilter(invoice.programId)}>
                                    Lihat rincian
                                  </button>
                                ) : null}
                              </td>
                              <td className="px-3 py-2">
                                {upcoming ? (
                                  <button
                                    type="button"
                                    className="text-left hover:text-primary-pink"
                                    onClick={() => openCell(invoice.id, invoice.lines.indexOf(upcoming), upcoming)}
                                  >
                                    <span className="block font-medium text-gray-900">{upcoming.label}</span>
                                    <span className="text-[10px] text-gray-500">{formatRupiah(upcoming.amount)} · {dueText(upcoming) || "Tanggal kosong"}</span>
                                  </button>
                                ) : (
                                  <span className="text-emerald-700">Lunas</span>
                                )}
                              </td>
                              <td className="px-3 py-2 font-semibold text-gray-900">{formatRupiah(unpaidTotal(invoice))}</td>
                              <td className="px-3 py-2">
                                <span className={late ? "font-semibold text-rose-700" : paidCount === invoice.lines.length ? "font-semibold text-emerald-700" : "text-gray-600"}>
                                  {late ? "Terlambat" : `${paidCount}/${invoice.lines.length} lunas`}
                                </span>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {payRows.length === 0 ? (
                  <p className="px-3 py-16 text-center text-sm text-gray-500">Belum ada tagihan pada filter ini. Pilih siswa di antrean kiri.</p>
                ) : null}
                </>
                )}
              </div>
              <TablePagination
                compact
                currentPage={payPage.currentPage}
                totalPages={payPage.totalPages}
                totalItems={payPage.totalItems}
                rangeStart={payPage.rangeStart}
                rangeEnd={payPage.rangeEnd}
                pageSize={payPage.pageSize}
                minPageSize={payPage.minPageSize}
                presetPageSizes={payPage.presetPageSizes}
                isCustomPageSize={payPage.isCustomPageSize}
                onPageChange={payPage.setCurrentPage}
                onPageSizeChange={payPage.setPageSize}
                onCustomModeChange={payPage.setIsCustomPageSize}
              />
            </div>
          </section>
        </div>

        {pickStudent ? (
          <Layer
            title={pickStudent.nama_lengkap}
            subtitle="Pilih program. Tanggal terisi saat Simpan."
            onClose={() => setPickStudent(null)}
            zIndex={60}
            footer={
              <>
                <button type="button" className="border border-gray-300 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-50" onClick={() => setPickStudent(null)}>
                  Batal
                </button>
                <button type="button" className="btn-primary" onClick={saveAssignment}>
                  Simpan
                </button>
              </>
            }
          >
            <div className="space-y-2">
              {programs.map((item) => (
                <label key={item.id} className={`block cursor-pointer border px-3 py-2 ${pickProgramId === item.id ? "border-primary-pink bg-white" : "border-gray-200 bg-white"}`}>
                  <span className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2">
                      <input type="radio" name="program" checked={pickProgramId === item.id} onChange={() => setPickProgramId(item.id)} />
                      {item.name}
                    </span>
                    <span className="font-semibold">{formatRupiah(programTotal(item))}</span>
                  </span>
                </label>
              ))}
              {preview.length > 0 ? (
                <ul className="space-y-1 pt-2 text-xs text-gray-600">
                  {preview.map((line) => (
                    <li key={line.label} className="flex justify-between gap-3">
                      <span>{line.label}</span>
                      <span>
                        {line.dueAt
                          ? "Hari simpan, batas 24 jam"
                          : line.kind === "dp"
                            ? "Hari simpan"
                            : line.kind === "cicilan"
                              ? line.dueDate
                              : line.kind === "event-warning"
                                ? "Tanda seru, tanggal menyusul"
                                : "Tanggal diisi finance"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Layer>
        ) : null}

        {lunasInvoice ? (
          <Layer
            title={lunasInvoice.studentName}
            subtitle={`${lunasInvoice.programName || "Invoice lama"} · ${lunasInvoice.number}`}
            onClose={() => setLunasDetailId(null)}
            zIndex={65}
          >
            <ul className="divide-y divide-gray-200 border border-gray-200">
              {lunasInvoice.lines.map((line, index) => (
                <li key={`${line.label}-${index}`}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-primary-pink-light"
                    onClick={() => openCell(lunasInvoice.id, index, line)}
                  >
                    <span>
                      <span className="block font-medium text-gray-900">{line.label}</span>
                      <span className="text-[10px] text-gray-500">{line.receiptNo || "Lunas"}</span>
                    </span>
                    <span className="font-semibold text-gray-900">{formatRupiah(line.amount)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Layer>
        ) : null}

        {menuInvoice && menuLine && cellMenu ? (
          <Layer
            title={menuLine.label}
            subtitle={`${menuInvoice.studentName} · ${menuInvoice.number}`}
            onClose={() => {
              setCellMenu(null);
              setResetConfirm(false);
              setPrintAsk(null);
            }}
            zIndex={70}
          >
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900">{formatRupiah(menuLine.amount)}</p>
              <p className="text-xs text-gray-500">{dueText(menuLine) || "Tanggal belum diisi"}</p>
              {printAsk ? (
                <div className="space-y-2 border border-gray-200 bg-white p-3">
                  <p className="text-sm text-gray-900">Catatan sebelum cetak {printAsk === "kwitansi" ? "kwitansi" : "invoice"}</p>
                  <textarea
                    className="input-field min-h-20 resize-y"
                    value={draftNote}
                    maxLength={180}
                    placeholder="Kosongkan bila ingin tanda minus seperti template"
                    onChange={(event) => setDraftNote(event.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-50"
                      onClick={() => setPrintAsk(null)}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => {
                        const note = draftNote.trim();
                        setLineNote(menuInvoice.id, cellMenu.lineIndex, note);
                        reload();
                        printSlip(printAsk, menuInvoice, { ...menuLine, note });
                        setPrintAsk(null);
                      }}
                    >
                      Cetak
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button type="button" className="w-full border border-gray-300 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-50" onClick={() => setPrintAsk("invoice")}>
                    Unduh invoice
                  </button>
                  {menuLine.paid && menuLine.receiptNo ? (
                    <button type="button" className="w-full border border-gray-300 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-50" onClick={() => setPrintAsk("kwitansi")}>
                      Unduh kwitansi
                    </button>
                  ) : null}
                </>
              )}
              {menuLine.paid ? (
                resetConfirm ? (
                  <div className="space-y-2 border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm text-gray-900">Yakin ingin reset?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-50"
                        onClick={() => setResetConfirm(false)}
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        className="border border-red-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-700 hover:bg-red-50"
                        onClick={() => {
                          resetLinePaid(menuInvoice.id, cellMenu.lineIndex);
                          reload();
                          setResetConfirm(false);
                          toast.success("Baris dikembalikan ke belum lunas.");
                        }}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full border border-gray-300 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-50"
                    onClick={() => setResetConfirm(true)}
                  >
                    Reset
                  </button>
                )
              ) : (
                <button
                  type="button"
                  className="btn-primary w-full"
                  onClick={() => {
                    markLinePaid(menuInvoice.id, cellMenu.lineIndex);
                    reload();
                    toast.success("Baris ditandai lunas.");
                  }}
                >
                  Set lunas
                </button>
              )}
              <div className="space-y-2 border-t border-gray-200 pt-3">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">Atur batas</label>
                <input type="date" className="input-field" value={draftDate} onChange={(event) => setDraftDate(event.target.value)} />
                <button
                  type="button"
                  className="w-full border border-gray-300 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setLineDate(menuInvoice.id, cellMenu.lineIndex, draftDate);
                    reload();
                    toast.success("Batas disimpan.");
                  }}
                >
                  Simpan batas
                </button>
              </div>
            </div>
          </Layer>
        ) : null}
      </main>
    </PortalPageShell>
  );
}
