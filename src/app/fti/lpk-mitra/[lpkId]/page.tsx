"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import PortalPageShell from "@/components/PortalPageShell";
import LpkSiswaTable from "@/app/lpk-mitra/components/LpkSiswaTable";
import { filterStudentsByLpkName, getLpkPartnerById } from "@/lib/fti-lpk-students";
import { seedLpkStudentsIfEmpty } from "@/lib/lpk-student-storage";
import type { LpkStudentRecord } from "@/types/lpk-student";

type PageProps = {
  params: Promise<{ lpkId: string }>;
};

export default function FtiLpkStudentsPage({ params }: PageProps) {
  const { lpkId } = use(params);
  const lpk = getLpkPartnerById(lpkId);
  const [students, setStudents] = useState<LpkStudentRecord[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const all = seedLpkStudentsIfEmpty();
    if (lpk) {
      setStudents(filterStudentsByLpkName(all, lpk.name));
    }
  }, [lpk]);

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.nama_lengkap.toLowerCase().includes(q) ||
        s.no_peserta.toLowerCase().includes(q)
    );
  }, [students, search]);

  if (!lpk) {
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
      <main className="p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/fti/lpk-mitra"
              className="p-3 bg-transparent hover:bg-gray-200/50 transition-colors border border-gray-300 text-gray-500 hover:text-gray-900"
              title="Kembali ke daftar LPK"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Link>
            <div>
              <h1 className="text-3xl font-serif text-gray-900 tracking-wide mb-1">
                Kelola Siswa
              </h1>
              <p className="text-xs font-medium text-gray-500 tracking-widest uppercase">
                {lpk.name} — data dari portal LPK Mitra (hanya lihat)
              </p>
            </div>
          </div>

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
        </header>

        <div className="mb-4 border border-primary-pink/20 bg-primary-pink-light px-4 py-3 text-sm text-gray-700">
          <strong>Mode testing:</strong> Data siswa diambil dari input LPK Mitra (dummy).{" "}
          <strong>Admin FTI</strong> dapat mengunduh CV, KTP, KK, MCU, dan dokumen lainnya.
        </div>

        <LpkSiswaTable
          students={filtered}
          readOnly
          emptyMessage={`Belum ada siswa dari ${lpk.name}.`}
        />
      </main>
    </PortalPageShell>
  );
}
