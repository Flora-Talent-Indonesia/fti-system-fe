"use client";

import { X } from "lucide-react";
import type { Student } from "@/types";

type CvPreviewModalProps = {
  student: Student | null;
  onClose: () => void;
  openInNewTabHref?: string;
};

export function CvPreviewModal({ student, onClose, openInNewTabHref }: CvPreviewModalProps) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-matte-black">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
          <div>
            <h2 className="font-[family-name:var(--font-montserrat)] text-lg font-bold text-matte-black uppercase">
              CV — {student.namaLengkap}
            </h2>
            <p className="text-sm text-text-gray mt-1">{student.noPeserta}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-gray hover:text-matte-black"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-gray mb-2">
              Ringkasan
            </h3>
            <p className="text-sm text-matte-black leading-relaxed">{student.cvSummary}</p>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-gray mb-2">
              Sertifikat
            </h3>
            <ul className="space-y-2">
              {student.certificates.map((cert) => (
                <li
                  key={cert}
                  className="text-sm text-matte-black border border-[#e5e7eb] px-3 py-2"
                >
                  {cert}
                </li>
              ))}
            </ul>
          </section>

          {openInNewTabHref && (
            <a
              href={openInNewTabHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-bold uppercase tracking-wider text-primary-pink hover:underline"
            >
              Buka CV lengkap + dokumen di tab baru →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
