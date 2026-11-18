"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Download, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import PortalPageShell from "@/components/PortalPageShell";
import SearchField from "@/components/SearchField";
import LpkSiswaTable from "@/app/lpk-mitra/components/LpkSiswaTable";
import DataSiswaExportModal from "@/components/fti/DataSiswaExportModal";
import StudentCvBatch from "@/components/fti/StudentCvBatch";
import { filterStudentsByLpkName, getLpkPartnerById } from "@/lib/fti-lpk-students";
import { seedLpkAccountsIfEmpty } from "@/lib/lpk-account-storage";
import { deleteLpkStudent, deleteLpkStudents, seedLpkStudentsIfEmpty, upsertLpkStudent } from "@/lib/lpk-student-storage";
import { omitInactiveAccounts } from "@/lib/fti-student-account-storage";
import { isAlumniByEntry } from "@/lib/placement";
import type { LpkStudentRecord } from "@/types/lpk-student";

function activeLpkStudents(all: LpkStudentRecord[], name: string) {
  return omitInactiveAccounts(filterStudentsByLpkName(all, name).filter((student) => !isAlumniByEntry(student)));
}

type PageProps = {
  params: Promise<{ lpkId: string }>;
};

export default function FtiLpkStudentsPage({ params }: PageProps) {
  const { lpkId } = use(params);
  const [ready, setReady] = useState(false);
  const [lpkName, setLpkName] = useState("");
  const [lpkCode, setLpkCode] = useState("");
  const [students, setStudents] = useState<LpkStudentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [exportFormat, setExportFormat] = useState<"cv" | "excel" | null>(null);
  const [cvQueue, setCvQueue] = useState<LpkStudentRecord[] | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulk, setConfirmBulk] = useState(false);

  useEffect(() => {
    const partner = getLpkPartnerById(lpkId);
    const account = seedLpkAccountsIfEmpty().find((item) => item.id === lpkId);
    const name = partner?.name || account?.name || "";
    setLpkName(name);
    setLpkCode(account?.code || "");
    if (name) setStudents(activeLpkStudents(seedLpkStudentsIfEmpty(), name));
    setSelecting(false);
    setSelectedIds(new Set());
    setReady(true);
  }, [lpkId]);

  const reload = (all: LpkStudentRecord[]) => {
    if (!lpkName) return;
    setStudents(activeLpkStudents(all, lpkName));
  };

  const handleSave = (updated: LpkStudentRecord) => {
    reload(upsertLpkStudent(updated));
  };

  const handleDelete = (student: LpkStudentRecord) => {
    reload(deleteLpkStudent(student.id));
    setSelectedIds((current) => {
      if (!current.has(student.id)) return current;
      const next = new Set(current);
      next.delete(student.id);
      return next;
    });
    toast.success(`Data ${student.nama_lengkap} dihapus.`);
  };

  const toggleStudent = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const student of filtered) {
        if (checked) next.add(student.id);
        else next.delete(student.id);
      }
      return next;
    });
  };

  const handleBulkDelete = () => {
    const ids = [...selectedIds];
    reload(deleteLpkStudents(ids));
    setSelectedIds(new Set());
    setSelecting(false);
    setConfirmBulk(false);
    toast.success(`${ids.length} siswa dihapus.`);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.nama_lengkap.toLowerCase().includes(q) ||
        s.no_peserta.toLowerCase().includes(q)
    );
  }, [students, search]);

  if (!ready) return null;

  if (!lpkName) {
    return (
      <PortalPageShell>
        <main className="p-4 md:p-8">
          <p className="text-sm text-gray-600 mb-4">LPK tidak ditemukan.</p>
          <Link
            href="/fti/lpk-mitra"
            className="text-xs font-bold uppercase tracking-wider text-primary-pink hover:underline"
          >
            ← Kembali ke daftar LPK
          </Link>
        </main>
      </PortalPageShell>
    );
  }

  return (
    <PortalPageShell>
      <main className="px-4 pb-8 pt-6 md:px-8 md:pb-8 md:pt-8">
        <header className="mb-5 flex shrink-0 flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/fti/lpk-mitra"
              className="shrink-0 border border-gray-300 bg-transparent p-2.5 text-gray-500 transition-colors hover:bg-gray-200/50 hover:text-gray-900"
              title="Kembali ke daftar LPK"
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
            </Link>
            <div className="min-w-0">
              <h1 className="font-serif text-3xl tracking-wide text-gray-900">
                Kelola Siswa
              </h1>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-widest text-gray-500">
                {lpkCode ? `${lpkCode} · ` : ""}{lpkName} — admin FTI dapat mengubah atau menghapus data siswa
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SearchField className="w-full shrink-0 md:w-52" value={search} onChange={setSearch} />
            <button
              type="button"
              aria-pressed={selecting}
              aria-label="Pilih siswa untuk dihapus"
              title="Pilih siswa untuk dihapus"
              onClick={() => {
                setSelecting((current) => {
                  if (current) setSelectedIds(new Set());
                  return !current;
                });
              }}
              className="flex h-11 w-11 items-center justify-center border bg-white hover:bg-gray-50"
              style={
                selecting
                  ? { borderWidth: 3, borderColor: "#fc809f", color: "#c2185b" }
                  : { borderWidth: 1, borderColor: "#d1d5db", color: "#374151" }
              }
            >
              <CheckSquare size={18} strokeWidth={1.5} />
            </button>
            {selecting && selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setConfirmBulk(true)}
                className="flex h-11 w-11 items-center justify-center border border-rose-300 bg-rose-50 text-rose-500 hover:bg-rose-100"
                title={`Hapus ${selectedIds.size} siswa terpilih`}
                aria-label={`Hapus ${selectedIds.size} siswa terpilih`}
              >
                <Trash2 size={18} strokeWidth={1.5} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setExportFormat("excel")}
              className="flex h-11 w-11 items-center justify-center border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              title="Unduh data siswa"
              aria-label="Unduh data siswa"
            >
              <Download size={18} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <LpkSiswaTable
          students={filtered}
          onSave={handleSave}
          allowDelete
          allowDownload
          onDelete={handleDelete}
          selecting={selecting}
          selectedIds={selectedIds}
          onToggleStudent={toggleStudent}
          onToggleAll={toggleAll}
          emptyMessage={`Belum ada siswa dari ${lpkName}.`}
        />
        {exportFormat && (
          <DataSiswaExportModal
            ftiStudents={[]}
            mitraStudents={students}
            initialSumber={lpkName}
            initialKelas="Semua"
            initialFormat={exportFormat}
            lockSumber
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
        {confirmBulk && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md border border-gray-200 bg-white p-6 shadow-2xl">
              <h2 className="mb-2 font-serif text-lg text-gray-900">Hapus siswa terpilih?</h2>
              <p className="mb-3 text-sm text-gray-600">{selectedIds.size} siswa akan dihapus dari {lpkName}.</p>
              <ul className="mb-6 max-h-40 overflow-auto border border-gray-200 text-sm">
                {students
                  .filter((student) => selectedIds.has(student.id))
                  .map((student) => (
                    <li key={student.id} className="border-b border-gray-100 px-3 py-2 last:border-b-0">
                      {student.no_peserta} — {student.nama_lengkap}
                    </li>
                  ))}
              </ul>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmBulk(false)}
                  className="border border-gray-300 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </PortalPageShell>
  );
}
