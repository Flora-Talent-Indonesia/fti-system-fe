"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowLeft, Download, User } from "lucide-react";
import { toast } from "react-hot-toast";
import PortalPageShell from "@/components/PortalPageShell";
import SearchField from "@/components/SearchField";
import DataSiswaExportModal from "@/components/fti/DataSiswaExportModal";
import StudentCvBatch from "@/components/fti/StudentCvBatch";
import FtiProfilSiswaTable from "@/components/fti/FtiProfilSiswaTable";
import { LPK_PARTNERS } from "@/data/mock";
import { FTI_KELAS_OPTIONS } from "@/data/dummy-fti-students";
import {
  loadFtiDataSiswaStudents,
  upsertFtiDataSiswaFromLpkStudent,
} from "@/lib/fti-data-siswa-storage";
import { loadActiveStudents, omitInactiveAccounts } from "@/lib/fti-student-account-storage";
import { findMitraIdentityMatch, mitraIdentityWarning } from "@/lib/mitra-identity-match";
import { seedLpkStudentsIfEmpty, upsertLpkStudent } from "@/lib/lpk-student-storage";
import { isAlumniByEntry } from "@/lib/placement";
import type { LpkStudentRecord } from "@/types/lpk-student";
import type { StudentAccount } from "@/types/student-account";

const PARTNER_NAMES = LPK_PARTNERS.map((partner) => partner.name);
const ICON_BTN =
  "relative flex h-11 w-11 shrink-0 items-center justify-center border border-gray-300 bg-white text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900";

export default function DataSiswaFtiPage() {
  const [students, setStudents] = useState<LpkStudentRecord[]>([]);
  const [mitraStudents, setMitraStudents] = useState<LpkStudentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKelas, setFilterKelas] = useState("Semua");
  const [sumber, setSumber] = useState("fti");
  const [unfilledAccounts, setUnfilledAccounts] = useState<StudentAccount[]>([]);
  const [unfilledOpen, setUnfilledOpen] = useState(false);
  const [unfilledBox, setUnfilledBox] = useState<{ top: number; right: number } | null>(null);
  const unfilledButtonRef = useRef<HTMLButtonElement>(null);
  const unfilledCount = unfilledAccounts.length;
  const [exportFormat, setExportFormat] = useState<"cv" | "excel" | null>(null);
  const [cvQueue, setCvQueue] = useState<LpkStudentRecord[] | null>(null);

  const reload = () => {
    const ftiStudents = loadFtiDataSiswaStudents();
    const filledNos = new Set(
      ftiStudents.map((student) => student.no_peserta.trim().toUpperCase()).filter(Boolean)
    );
    setUnfilledAccounts(
      loadActiveStudents()
        .filter((account) => !filledNos.has(account.user_name.trim().toUpperCase()))
        .sort((a, b) => a.name.localeCompare(b.name, "id")),
    );
    setStudents(omitInactiveAccounts(ftiStudents.filter((student) => !isAlumniByEntry(student))));
    setMitraStudents(
      omitInactiveAccounts(
        seedLpkStudentsIfEmpty().filter(
          (student) => PARTNER_NAMES.includes(student.asal_lpk) && !isAlumniByEntry(student),
        ),
      ),
    );
  };

  useEffect(() => {
    reload();
  }, []);

  const placeUnfilledPanel = () => {
    const rect = unfilledButtonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setUnfilledBox({ top: rect.bottom + 8, right: Math.max(8, window.innerWidth - rect.right) });
  };

  const toggleUnfilled = () => {
    if (unfilledOpen) {
      setUnfilledOpen(false);
      return;
    }
    placeUnfilledPanel();
    setUnfilledOpen(true);
  };

  useEffect(() => {
    if (!unfilledOpen) return;
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (unfilledButtonRef.current?.contains(target)) return;
      if (document.getElementById("unfilled-account-panel")?.contains(target)) return;
      setUnfilledOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUnfilledOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", placeUnfilledPanel);
    window.addEventListener("scroll", placeUnfilledPanel, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", placeUnfilledPanel);
      window.removeEventListener("scroll", placeUnfilledPanel, true);
    };
  }, [unfilledOpen]);

  const sourceStudents = useMemo(() => {
    if (sumber === "fti") return students;
    if (sumber === "all-mitra") return mitraStudents;
    return mitraStudents.filter((student) => student.asal_lpk === sumber);
  }, [mitraStudents, students, sumber]);

  const filtered = useMemo(() => {
    let result = sourceStudents;
    if (sumber === "fti" && filterKelas !== "Semua") {
      result = result.filter((student) => student.kelas === filterKelas);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (student) =>
          student.nama_lengkap.toLowerCase().includes(q) ||
          student.no_peserta.toLowerCase().includes(q) ||
          (student.nama_katakana || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [filterKelas, searchTerm, sourceStudents, sumber]);

  const handleSave = (updated: LpkStudentRecord) => {
    if (/flora talent indonesia/i.test(updated.asal_lpk || "")) {
      upsertFtiDataSiswaFromLpkStudent(updated);
      const match = findMitraIdentityMatch(updated.nama_lengkap, updated.tanggal_lahir);
      if (match) toast(mitraIdentityWarning(match), { icon: "⚠️" });
      else toast.success("Data siswa diperbarui.");
    } else {
      upsertLpkStudent(updated);
      toast.success("Data siswa diperbarui.");
    }
    reload();
  };

  return (
    <PortalPageShell>
      <main className="px-4 pb-8 pt-6 md:px-8 md:pb-8 md:pt-8">
        <header className="mb-4 flex shrink-0 flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/fti"
              className="p-3 bg-transparent hover:bg-gray-200/50 transition-colors border border-gray-300 text-gray-500 hover:text-gray-900"
              title="Kembali ke portal FTI"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Link>
            <div>
              <h1 className="text-3xl font-serif text-gray-900 tracking-wide mb-1">
                Data Siswa FTI{" "}
                <span className="text-lg text-gray-400 font-sans ml-1 tracking-normal font-normal">
                  (実習生プロフィール)
                </span>
              </h1>
              <p className="text-xs font-medium text-gray-500 tracking-widest uppercase">
                30 siswa FTI — Bogor dan Jakarta, masing-masing Magang, TG, dan Driver
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <SearchField
              className="w-full sm:w-52"
              value={searchTerm}
              onChange={setSearchTerm}
            />
            {sumber === "fti" && (
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="px-4 py-2.5 bg-transparent border border-gray-300 text-xs tracking-widest uppercase text-gray-600 focus:outline-none focus:border-primary-pink"
              >
                <option value="Semua">Semua Kelas</option>
                {FTI_KELAS_OPTIONS.map((kelas) => (
                  <option key={kelas} value={kelas}>
                    {kelas}
                  </option>
                ))}
              </select>
            )}
            <select
              value={sumber}
              onChange={(e) => {
                setSumber(e.target.value);
                setFilterKelas("Semua");
              }}
              className="px-4 py-2.5 bg-transparent border border-gray-300 text-xs tracking-widest uppercase text-gray-600 focus:outline-none focus:border-primary-pink"
            >
              <option value="fti">Siswa FTI</option>
              <option value="all-mitra">Semua LPK Mitra</option>
              {LPK_PARTNERS.map((partner) => (
                <option key={partner.id} value={partner.name}>
                  {partner.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                ref={unfilledButtonRef}
                type="button"
                className={ICON_BTN}
                onClick={toggleUnfilled}
                aria-expanded={unfilledOpen}
                aria-controls="unfilled-account-panel"
                title={
                  unfilledCount > 0
                    ? `${unfilledCount} akun sudah dibuat, data belum diisi`
                    : "Semua akun sudah mengisi data"
                }
                aria-label={
                  unfilledCount > 0
                    ? `${unfilledCount} akun sudah dibuat, data belum diisi`
                    : "Semua akun sudah mengisi data"
                }
              >
                <User size={18} strokeWidth={1.5} />
                {unfilledCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                    {unfilledCount > 99 ? "99+" : unfilledCount}
                  </span>
                )}
              </button>
              <button type="button" onClick={() => setExportFormat("excel")} className={ICON_BTN} title="Unduh data siswa" aria-label="Unduh data siswa">
                <Download size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </header>

        <FtiProfilSiswaTable
          students={filtered}
          onSave={handleSave}
          emptyMessage="Tidak ada siswa pada filter ini."
        />
        {exportFormat && (
          <DataSiswaExportModal
            ftiStudents={students}
            mitraStudents={mitraStudents}
            initialSumber={sumber}
            initialKelas={filterKelas}
            initialFormat={exportFormat}
            onExportCv={(list) => {
              setCvQueue(list);
              toast.success(
                list.length === 1
                  ? `CV ${list[0].nama_lengkap} dibuka untuk disimpan sebagai PDF.`
                  : `${list.length} CV digabung. Simpan sebagai PDF dari jendela cetak.`
              );
            }}
            onClose={() => setExportFormat(null)}
          />
        )}
        {cvQueue && <StudentCvBatch students={cvQueue} onDone={() => setCvQueue(null)} />}
        {unfilledOpen &&
          unfilledBox &&
          createPortal(
            <div
              id="unfilled-account-panel"
              role="dialog"
              aria-label="Akun yang belum mengisi data"
              className="fixed z-[80] w-[min(22rem,calc(100vw-1rem))] border border-gray-300 bg-white shadow-lg"
              style={{ top: unfilledBox.top, right: unfilledBox.right }}
            >
              <div className="border-b border-gray-200 px-3 py-2">
                <p className="text-sm font-semibold text-gray-900">Akun sudah dibuat, data belum diisi</p>
                <p className="text-xs text-gray-500">{unfilledCount} akun</p>
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {unfilledCount === 0 ? (
                  <li className="px-3 py-3 text-sm text-gray-500">Semua akun sudah mengisi data.</li>
                ) : (
                  unfilledAccounts.map((account) => (
                    <li key={account.user_id} className="border-b border-gray-100 px-3 py-2 last:border-b-0">
                      <p className="text-sm font-medium text-gray-900">{account.name}</p>
                      <p className="text-xs text-gray-500">{account.user_name}</p>
                    </li>
                  ))
                )}
              </ul>
            </div>,
            document.body,
          )}
      </main>
    </PortalPageShell>
  );
}
