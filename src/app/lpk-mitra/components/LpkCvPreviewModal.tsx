"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";
import CvPreviewPanel from "@/components/cv-form/components/CvPreviewPanel";
import { exportCVToPDF } from "@/lib/export-cv-pdf";
import { lpkStudentToCvData } from "@/lib/cv-to-lpk-student";
import type { LpkStudentRecord } from "@/types/lpk-student";

const CV_EXPORT_ID = "lpk-cv-export";

export default function LpkCvPreviewModal({
  student,
  onClose,
  allowDownload = false,
}: {
  student: LpkStudentRecord;
  onClose: () => void;
  allowDownload?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const cvData = lpkStudentToCvData(student);

  const handleExport = () => {
    const fileName = `CV_${student.nama_lengkap.replace(/\s+/g, "_")}_${student.no_peserta}.pdf`;
    void exportCVToPDF(CV_EXPORT_ID, fileName);
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-5xl max-h-[95vh] bg-gray-100 border border-gray-300 shadow-2xl flex flex-col overflow-hidden rounded-lg">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0 gap-3">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-serif font-semibold text-gray-800 truncate">
              Preview CV — {student.nama_lengkap}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {allowDownload
                ? "Admin FTI — unduh / export CV tersedia."
                : "Hanya tampilan. Unduh / export tidak tersedia pada mode testing."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {allowDownload && (
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider hover:bg-emerald-700 transition-colors"
              >
                <Download size={14} />
                Export PDF
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Tutup preview CV"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <CvPreviewPanel
            data={cvData}
            exportElementId={CV_EXPORT_ID}
            allowDownload={allowDownload}
            className="h-full max-h-[calc(95vh-80px)]"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
