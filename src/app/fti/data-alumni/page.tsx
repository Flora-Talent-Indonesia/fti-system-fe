"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import PortalPageShell from "@/components/PortalPageShell";
import AlumniDataTable from "@/components/fti/AlumniDataTable";
import AlumniTableEditModal from "@/components/fti/AlumniTableEditModal";
import {
  nextNoPeserta,
  seedLpkStudentsIfEmpty,
  upsertLpkStudent,
} from "@/lib/lpk-student-storage";
import { createEmptyLpkStudent, type LpkStudentRecord } from "@/types/lpk-student";

export default function DataAlumniPage() {
  const [students, setStudents] = useState<LpkStudentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [addingStudent, setAddingStudent] = useState<LpkStudentRecord | null>(null);

  useEffect(() => {
    const all = seedLpkStudentsIfEmpty();
    setStudents(all);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.nama_lengkap.toLowerCase().includes(q) ||
        s.no_peserta.toLowerCase().includes(q) ||
        (s.asal_lpk || "").toLowerCase().includes(q) ||
        (s.nama_katakana || "").toLowerCase().includes(q)
    );
  }, [students, search]);

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
    upsertLpkStudent(updated);
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === updated.id);
      if (exists) return prev.map((s) => (s.id === updated.id ? updated : s));
      return [updated, ...prev];
    });
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
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-pink"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari nama, no, atau LPK..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-primary-pink w-full sm:w-56"
              />
            </div>
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
          <strong>Mode testing:</strong> Gunakan <strong>Add Data</strong> untuk menambah alumni baru.
          Visa, COE, EKTKLN, dan Departure diisi sebagai tanggal.
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
