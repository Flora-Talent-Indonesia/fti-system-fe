"use client";

import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import { FileRuleTooltip } from "@/components/cv-form/components/FileRuleTooltip";
import { DOC_ACCEPT_INPUT, TOOLTIP_DOC_UPLOAD, isAllowedDocUpload } from "@/components/cv-form/file-upload-rules";
import DocumentPreviewModal from "@/components/lpk/DocumentPreviewModal";

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-primary-pink transition " +
  "file:mr-3 file:border-0 file:bg-primary-pink-light file:text-primary-pink file:px-3 file:py-1.5 file:rounded-lg file:cursor-pointer";

const viewButtonClass =
  "inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#fc809f]/20 bg-[#fc809f]/10 px-2.5 py-1 text-xs font-medium text-[#fc809f] hover:bg-[#fc809f]/20";

interface Props {
  label: string;
  value: string;
  onChange: (filename: string) => void;
  hint?: string;
  studentName?: string;
}

export default function DocUploadField({ label, value, onChange, hint, studentName }: Props) {
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const localUrlRef = useRef<string | null>(null);
  const storedName = value.startsWith("data:") || value.startsWith("blob:") ? label : value;
  const directUrl = value.startsWith("data:") || value.startsWith("blob:") ? value : null;

  useEffect(() => {
    return () => {
      if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase flex items-center gap-1.5">
        {label}
        <FileRuleTooltip text={TOOLTIP_DOC_UPLOAD} />
      </span>
      <input
        type="file"
        accept={DOC_ACCEPT_INPUT}
        title={TOOLTIP_DOC_UPLOAD}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (!isAllowedDocUpload(file)) {
            toast.error("Dokumen pendukung wajib hasil pindai PDF.");
            e.target.value = "";
            return;
          }
          if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
          const nextUrl = URL.createObjectURL(file);
          localUrlRef.current = nextUrl;
          setLocalUrl(nextUrl);
          onChange(file.name);
          toast.success(`${file.name} terlampir.`);
        }}
        className={inputClass}
      />
      {value ? (
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-xs text-gray-500" title={storedName}>
            Terpilih: {storedName}
          </p>
          <button type="button" onClick={() => setOpen(true)} className={viewButtonClass}>
            <Eye size={13} />
            Lihat
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-500">{hint ?? "Belum ada hasil pindai PDF"}</p>
      )}
      {open && value ? (
        <DocumentPreviewModal
          label={label}
          filename={storedName}
          fileUrl={localUrl || directUrl}
          studentName={studentName}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
