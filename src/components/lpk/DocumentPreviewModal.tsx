"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { buildDemoPdf } from "@/lib/demo-pdf";

type Props = {
  label: string;
  filename: string;
  /** URL berkas sungguhan (blob/data). Kosong berarti pratinjau dari nama file demo. */
  fileUrl?: string | null;
  studentName?: string;
  onClose: () => void;
};

export default function DocumentPreviewModal({ label, filename, fileUrl, studentName, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(fileUrl || null);
  const [ownedUrl, setOwnedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (fileUrl) {
      setUrl(fileUrl);
      setOwnedUrl(null);
      return;
    }
    const blob = buildDemoPdf([
      "Flora Talent Indonesia",
      "Pratinjau dokumen pendukung",
      "",
      `Dokumen: ${label.replace(/^\d+\.\s*/, "")}`,
      `Berkas: ${filename}`,
      studentName ? `Peserta: ${studentName}` : "",
      "",
      "Mode testing. Isi pindaian asli mengikuti unggahan PDF.",
    ].filter((line) => line !== undefined));
    const next = URL.createObjectURL(blob);
    setUrl(next);
    setOwnedUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [fileUrl, filename, label, studentName]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex h-[min(86vh,820px)] w-full max-w-4xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-gray-900">{label}</h2>
            <p className="truncate text-xs text-gray-500">{filename}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700" aria-label="Tutup pratinjau">
            <X size={18} />
          </button>
        </div>
        {url ? (
          <iframe title={label} src={url} className="min-h-0 w-full flex-1 bg-gray-100" />
        ) : (
          <p className="p-6 text-sm text-gray-500">Menyiapkan pratinjau…</p>
        )}
        {ownedUrl ? (
          <p className="border-t border-gray-100 px-5 py-2 text-[11px] text-gray-500">
            Pratinjau demo dari nama berkas yang tersimpan.
          </p>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
