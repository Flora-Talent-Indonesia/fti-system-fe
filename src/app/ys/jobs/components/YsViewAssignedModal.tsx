"use client";

import { Award, ExternalLink, FileText, X } from "lucide-react";
import { ysStudentCvUrl, ysStudentSertifikatUrl } from "@/lib/lpk-student-storage";
import type { LpkStudentRecord } from "@/types/lpk-student";

export default function YsViewAssignedModal({
  jobTitleJa,
  jobTitleEn,
  students,
  onClose,
}: {
  jobTitleJa: string;
  jobTitleEn: string;
  students: LpkStudentRecord[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-serif font-semibold text-gray-900">割り当て学生</h2>
            <p className="text-sm text-gray-500 mt-0.5">Assigned Students</p>
            <p className="text-sm font-medium text-gray-800 mt-1">{jobTitleJa}</p>
            <p className="text-xs text-gray-500">{jobTitleEn}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
          {students.length === 0 ? (
            <li className="px-6 py-8 text-center text-sm text-gray-500">
              割り当てられた学生はいません。
              <span className="block text-xs mt-1 text-gray-400">No students assigned yet.</span>
            </li>
          ) : (
            students.map((s) => (
              <li key={s.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{s.nama_lengkap}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.no_peserta} · {s.asal_lpk}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={ysStudentCvUrl(s.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-primary-pink border border-primary-pink/30 bg-primary-pink-light hover:bg-primary-pink/20 rounded-md"
                  >
                    <FileText size={13} />
                    履歴書 · CV
                    <ExternalLink size={11} className="opacity-60" />
                  </a>
                  <a
                    href={ysStudentSertifikatUrl(s.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-gray-700 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-md"
                  >
                    <Award size={13} />
                    証明書 · Sertifikat
                    <ExternalLink size={11} className="opacity-60" />
                  </a>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
