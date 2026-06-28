"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import PortalPageShell from "@/components/PortalPageShell";
import FtiProfilSiswaTable from "@/components/fti/FtiProfilSiswaTable";
import {
  loadFtiDataSiswaStudents,
  upsertFtiDataSiswaFromLpkStudent,
} from "@/lib/fti-data-siswa-storage";
import type { LpkStudentRecord } from "@/types/lpk-student";

export default function DataSiswaFtiPage() {
  const [students, setStudents] = useState<LpkStudentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAngkatan, setFilterAngkatan] = useState("Semua");

  useEffect(() => {
    setStudents(loadFtiDataSiswaStudents());
  }, []);

  const uniqueAngkatan = useMemo(
    () => Array.from(new Set(students.map((s) => s.angkatan).filter(Boolean))),
    [students]
  );

  const filtered = useMemo(() => {
    let result = students;
    if (filterAngkatan !== "Semua") {
      result = result.filter((s) => s.angkatan === filterAngkatan);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.nama_lengkap.toLowerCase().includes(q) ||
          s.no_peserta.toLowerCase().includes(q) ||
          (s.nama_katakana || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [students, searchTerm, filterAngkatan]);

  const handleSave = (updated: LpkStudentRecord) => {
    upsertFtiDataSiswaFromLpkStudent(updated);
    setStudents(loadFtiDataSiswaStudents());
  };

  return (
    <PortalPageShell>
      <main className="p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                Data dari Daftar Pribadi — kelola profil seluruh peserta magang FTI
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
                placeholder="Cari nama atau no. peserta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-primary-pink w-full sm:w-64"
              />
            </div>
            <select
              value={filterAngkatan}
              onChange={(e) => setFilterAngkatan(e.target.value)}
              className="px-4 py-2.5 bg-transparent border border-gray-300 text-xs tracking-widest uppercase text-gray-600 focus:outline-none focus:border-primary-pink"
            >
              <option value="Semua">Semua Angkatan</option>
              {uniqueAngkatan.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="mb-4 border border-primary-pink/20 bg-primary-pink-light px-4 py-3 text-sm text-gray-700">
          <strong>Mode testing:</strong> Data siswa diisi melalui form{" "}
          <Link href="/daftar-pribadi" className="text-primary-pink font-semibold hover:underline">
            Daftar Pribadi
          </Link>
          . Setiap penyimpanan CV otomatis tampil di tabel ini.
        </div>

        <FtiProfilSiswaTable
          students={filtered}
          onSave={handleSave}
          emptyMessage="Belum ada siswa yang mengisi Daftar Pribadi."
        />
      </main>
    </PortalPageShell>
  );
}
