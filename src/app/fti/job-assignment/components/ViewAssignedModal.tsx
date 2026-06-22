"use client";

import { ExternalLink, X } from "lucide-react";
import { ftiStudentProfileUrl } from "@/lib/lpk-student-storage";
import type { LpkStudentRecord } from "@/types/lpk-student";

export default function ViewAssignedModal({
  jobTitle,
  students,
  onClose,
  onUnassign,
}: {
  jobTitle: string;
  students: LpkStudentRecord[];
  onClose: () => void;
  onUnassign: (studentId: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-serif font-semibold text-gray-900">Siswa Ter-assign</h2>
            <p className="text-sm text-gray-500">{jobTitle}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
          {students.length === 0 ? (
            <li className="px-6 py-8 text-center text-sm text-gray-500">Belum ada siswa di-assign.</li>
          ) : (
            students.map((s) => (
              <li key={s.id} className="px-6 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <a
                    href={ftiStudentProfileUrl(s.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary-pink hover:underline truncate"
                  >
                    {s.nama_lengkap}
                    <ExternalLink size={12} className="shrink-0 opacity-70" />
                  </a>
                  <p className="text-xs text-gray-500">{s.no_peserta}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUnassign(s.id)}
                  className="text-xs text-red-600 hover:underline shrink-0"
                >
                  Unassign
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
