"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import LpkMitraShell from "@/components/lpk/LpkMitraShell";
import SearchField from "@/components/SearchField";
import DataSiswaExportModal from "@/components/fti/DataSiswaExportModal";
import StudentCvBatch from "@/components/fti/StudentCvBatch";
import LpkSiswaTable, { LpkSiswaEmptyAction } from "../components/LpkSiswaTable";
import { upsertLpkStudent, seedLpkStudentsIfEmpty } from "@/lib/lpk-student-storage";
import { filterStudentsByLpkName } from "@/lib/fti-lpk-students";
import { omitInactiveAccounts } from "@/lib/fti-student-account-storage";
import { isAlumniByEntry } from "@/lib/placement";
import type { LpkStudentRecord } from "@/types/lpk-student";

function activePortalStudents(all: LpkStudentRecord[]) {
  return omitInactiveAccounts(
    filterStudentsByLpkName(all, LPK_PORTAL_NAME).filter((student) => !isAlumniByEntry(student)),
  );
}

const LPK_PORTAL_NAME = "LPK Mitra Sukabumi";

export default function LpkMitraSiswaPage() {
  const [students, setStudents] = useState<LpkStudentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [exportFormat, setExportFormat] = useState<"cv" | "excel" | null>(null);
  const [cvQueue, setCvQueue] = useState<LpkStudentRecord[] | null>(null);

  useEffect(() => {
    setStudents(activePortalStudents(seedLpkStudentsIfEmpty()));
  }, []);

  const filtered = useMemo(() => {
    let list = students;
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (s) =>
          s.nama_lengkap.toLowerCase().includes(q) ||
          s.no_peserta.toLowerCase().includes(q)
      );
    }
    return list;
  }, [students, search]);

  const handleSave = (updated: LpkStudentRecord) => {
    setStudents(activePortalStudents(upsertLpkStudent(updated)));
  };

  return (
    <LpkMitraShell>
      <main className="px-4 pb-8 pt-8 md:px-8 md:pb-8 md:pt-10">
        <header className="mb-5 flex shrink-0 flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/lpk-mitra"
              className="border border-gray-300 bg-transparent p-2.5 text-gray-500 transition-colors hover:bg-gray-200/50 hover:text-gray-900"
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
            </Link>
            <div>
              <h1 className="font-serif text-3xl tracking-wide text-gray-900">
                Kelola Siswa
              </h1>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-widest text-gray-500">
                Data peserta magang LPK Mitra — input oleh admin
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SearchField className="w-full md:w-52" value={search} onChange={setSearch} />
            <button
              type="button"
              onClick={() => setExportFormat("excel")}
              className="flex h-11 w-11 items-center justify-center border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              title="Unduh data siswa"
              aria-label="Unduh data siswa"
            >
              <Download size={18} strokeWidth={1.5} />
            </button>
            <Link
              href="/lpk-mitra/siswa/tambah"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-pink text-white text-xs font-semibold uppercase tracking-widest hover:bg-primary-pink-hover transition-colors"
            >
              <Plus size={16} />
              Tambah Siswa
            </Link>
          </div>
        </header>

        <LpkSiswaTable
          students={filtered}
          onSave={handleSave}
          emptyMessage="Belum ada siswa. Tambah siswa untuk memulai."
          emptyAction={<LpkSiswaEmptyAction />}
        />
        {exportFormat && (
          <DataSiswaExportModal
            ftiStudents={[]}
            mitraStudents={students}
            initialSumber={LPK_PORTAL_NAME}
            initialKelas="Semua"
            initialFormat={exportFormat}
            lockSumber
            onExportCv={(list) => {
              setCvQueue(list);
              toast.success(
                list.length === 1
                  ? `CV ${list[0].nama_lengkap} dibuka untuk disimpan sebagai PDF.`
                  : `${list.length} CV digabung. Simpan sebagai PDF dari jendela cetak.`,
              );
            }}
            onClose={() => setExportFormat(null)}
          />
        )}
        {cvQueue && <StudentCvBatch students={cvQueue} onDone={() => setCvQueue(null)} />}
      </main>
    </LpkMitraShell>
  );
}
