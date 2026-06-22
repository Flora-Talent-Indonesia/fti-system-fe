"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search } from "lucide-react";
import LpkMitraShell from "@/components/lpk/LpkMitraShell";
import LpkSiswaTable, { LpkSiswaEmptyAction } from "../components/LpkSiswaTable";
import { upsertLpkStudent, seedLpkStudentsIfEmpty } from "@/lib/lpk-student-storage";
import { filterStudentsByLpkName } from "@/lib/fti-lpk-students";
import type { LpkStudentRecord } from "@/types/lpk-student";

const LPK_PORTAL_NAME = "LPK Mitra Sukabumi";

export default function LpkMitraSiswaPage() {
  const [students, setStudents] = useState<LpkStudentRecord[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const all = seedLpkStudentsIfEmpty();
    setStudents(filterStudentsByLpkName(all, LPK_PORTAL_NAME));
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
    const list = upsertLpkStudent(updated);
    setStudents(list);
  };

  return (
    <LpkMitraShell>
      <main className="p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/lpk-mitra"
              className="p-3 bg-transparent hover:bg-gray-200/50 transition-colors border border-gray-300 text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Link>
            <div>
              <h1 className="text-3xl font-serif text-gray-900 tracking-wide mb-1">
                Kelola Siswa
              </h1>
              <p className="text-xs font-medium text-gray-500 tracking-widest uppercase">
                Data peserta magang LPK Mitra — input oleh admin
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-pink"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari nama atau no. peserta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-primary-pink w-full md:w-64"
              />
            </div>
            <Link
              href="/lpk-mitra/siswa/tambah"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-pink text-white text-xs font-semibold uppercase tracking-widest hover:bg-primary-pink-hover transition-colors"
            >
              <Plus size={16} />
              Tambah Siswa
            </Link>
          </div>
        </header>

        <div className="mb-4 border border-primary-pink/20 bg-primary-pink-light px-4 py-3 text-sm text-gray-700">
          <strong>Mode testing:</strong> Semua data di tabel ini masih dummy untuk pengujian frontend.
        </div>

        <LpkSiswaTable
          students={filtered}
          onSave={handleSave}
          emptyMessage="Belum ada siswa. Tambah siswa untuk memulai."
          emptyAction={<LpkSiswaEmptyAction />}
        />
      </main>
    </LpkMitraShell>
  );
}
