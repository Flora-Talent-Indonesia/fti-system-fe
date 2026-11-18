"use client";

import { Download } from "lucide-react";
import { downloadDemoDocument } from "@/lib/download-document";
import { studentFileName } from "@/lib/student-file-name";

type Props = {
  filename?: string | null;
  studentName?: string;
  className?: string;
};

export default function DownloadFileButton({ filename, studentName, className = "" }: Props) {
  if (!filename) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <button
      type="button"
      onClick={() => {
        const ext = filename.match(/(\.[a-z0-9]{2,5})$/i)?.[1] || ".pdf";
        const kind = filename.replace(/\.[^.]+$/, "") || "Dokumen";
        const saved = studentName ? `${studentFileName(kind, studentName)}${ext}` : filename;
        downloadDemoDocument(saved, studentName);
      }}
      className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 ${className}`}
      title={`Unduh ${filename}`}
    >
      <Download size={12} />
      Unduh
    </button>
  );
}
