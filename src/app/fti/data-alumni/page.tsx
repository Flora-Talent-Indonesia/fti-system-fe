"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import PortalPageShell from "@/components/PortalPageShell";
import SearchField from "@/components/SearchField";
import AlumniDataTable from "@/components/fti/AlumniDataTable";
import AlumniTableEditModal from "@/components/fti/AlumniTableEditModal";
import {
  loadFtiDataSiswaStudents,
  upsertFtiDataSiswaFromLpkStudent,
} from "@/lib/fti-data-siswa-storage";
import {
  nextNoPeserta,
  seedLpkStudentsIfEmpty,
  upsertLpkStudent,
} from "@/lib/lpk-student-storage";
import { omitInactiveAccounts } from "@/lib/fti-student-account-storage";
import { isAlumniByEntry } from "@/lib/placement";
import { createEmptyLpkStudent, type LpkStudentRecord } from "@/types/lpk-student";

export default function DataAlumniPage() {
  const [students, setStudents] = useState<LpkStudentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [addingStudent, setAddingStudent] = useState<LpkStudentRecord | null>(null);

  const reload = () => {
    const lpk = seedLpkStudentsIfEmpty();
    const fti = loadFtiDataSiswaStudents();
    const seen = new Set(lpk.map((student) => student.id));
    setStudents([...lpk, ...fti.filter((student) => !seen.has(student.id))]);
  };

  useEffect(() => {
    reload();
  }, []);

  const alumni = useMemo(
    () => omitInactiveAccounts(students.filter((student) => isAlumniByEntry(student))),
    [students],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return alumni;
    const q = search.toLowerCase().trim();
    return alumni.filter(
      (s) =>
        s.nama_lengkap.toLowerCase().includes(q) ||
        s.no_peserta.toLowerCase().includes(q) ||
        (s.asal_lpk || "").toLowerCase().includes(q) ||
        (s.nama_katakana || "").toLowerCase().includes(q)
    );
  }, [alumni, search]);

  const handleAdd = () => {
    setAddingStudent(
      createEmptyLpkStudent({
        no_peserta: nextNoPeserta(),
        status: "match_job",
        asal_lpk: "Flora Talent Indonesia",
      })
    );
  };

  const handleSaveExisting = (updated: LpkStudentRecord) => {
    const inFti = loadFtiDataSiswaStudents().some((student) => student.id === updated.id);
    const inLpk = seedLpkStudentsIfEmpty().some((student) => student.id === updated.id);
    if (inFti) upsertFtiDataSiswaFromLpkStudent(updated);
    if (inLpk || !inFti) upsertLpkStudent(updated);
    reload();
  };

  const handleSaveNew = (created: LpkStudentRecord) => {
    upsertLpkStudent(created);
    setStudents((prev) => [created, ...prev]);
    setAddingStudent(null);
    toast.success("Data alumni ditambahkan.");
  };

  return (
    <PortalPageShell>
      <main className="p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/fti"
              className="p-3 bg-transparent hover:bg-gray-200/50 transition-colors border border-gray-300 text-gray-500 hover:text-gray-900"
              title="Kembali ke portal"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Link>
            <div>
              <h1 className="text-3xl font-serif text-gray-900 tracking-wide mb-1">
                Data Alumni
              </h1>
              <p className="text-xs font-medium text-gray-500 tracking-widest uppercase">
                Semua Data Alumni — LPK Mitra & Mandiri
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <SearchField className="w-full sm:w-52" value={search} onChange={setSearch} />
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#fc809f] hover:bg-[#e56f8d] border border-[#fc809f] transition-colors"
            >
              <Plus size={16} />
              Add Data
            </button>
          </div>
        </header>

        <div className="mb-4 border border-primary-pink/20 bg-primary-pink-light px-4 py-3 text-sm text-gray-700">
          Siswa masuk daftar ini setelah dipindahkan dari Data Siswa FTI, atau setelah tanggal perkiraan masuk Jepang terlewati. Data yang sudah ada tetap tersimpan. Tabel ini menampilkan kolom tracking, dan setiap kolomnya bisa diubah lewat Edit.
        </div>

        <AlumniDataTable
          students={filtered}
          emptyMessage="Belum ada alumni yang terdaftar."
          onSave={handleSaveExisting}
        />

        {addingStudent && (
          <AlumniTableEditModal
            student={addingStudent}
            onClose={() => setAddingStudent(null)}
            onSave={handleSaveNew}
          />
        )}
      </main>
    </PortalPageShell>
  );
}
