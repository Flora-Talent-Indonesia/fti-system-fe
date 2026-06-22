"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Search, X } from "lucide-react";
import { ftiStudentProfileUrl } from "@/lib/lpk-student-storage";
import type { LpkStudentRecord } from "@/types/lpk-student";

export default function AssignStudentModal({
  jobTitle,
  students,
  initialSelectedIds,
  onClose,
  onSave,
}: {
  jobTitle: string;
  students: LpkStudentRecord[];
  initialSelectedIds: string[];
  onClose: () => void;
  onSave: (studentIds: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelectedIds));

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.nama_lengkap.toLowerCase().includes(q) ||
        s.no_peserta.toLowerCase().includes(q) ||
        s.asal_lpk.toLowerCase().includes(q)
    );
  }, [students, search]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white border border-gray-200 shadow-xl rounded-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-serif font-semibold text-gray-900">Assign Kandidat</h2>
            <p className="text-sm text-gray-500 mt-0.5">Job: {jobTitle}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama / no. peserta / LPK"
              className="input-field pl-9"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-500">Tidak ada kandidat rekrut.</p>
          ) : (
            filtered.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-3 px-6 py-3 hover:bg-primary-pink-light/40 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.has(s.id)}
                  onChange={() => toggle(s.id)}
                  className="rounded border-gray-300 text-primary-pink focus:ring-primary-pink"
                />
                <div className="min-w-0 flex-1">
                  <a
                    href={ftiStudentProfileUrl(s.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 font-medium text-primary-pink hover:underline truncate"
                  >
                    {s.nama_lengkap}
                    <ExternalLink size={12} className="shrink-0 opacity-70" />
                  </a>
                  <p className="text-xs text-gray-500">
                    {s.no_peserta} · {s.asal_lpk}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center gap-3">
          <span className="text-xs text-gray-500">{selected.size} siswa dipilih</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
              Batal
            </button>
            <button
              type="button"
              onClick={() => onSave(Array.from(selected))}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-pink hover:bg-primary-pink-hover rounded-lg"
            >
              Simpan Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
