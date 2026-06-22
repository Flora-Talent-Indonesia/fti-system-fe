"use client";

import { toast } from "react-hot-toast";
import { FileRuleTooltip } from "@/components/cv-form/components/FileRuleTooltip";
import { DOC_ACCEPT_INPUT, TOOLTIP_DOC_UPLOAD, isAllowedDocUpload } from "@/components/cv-form/file-upload-rules";

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-primary-pink transition " +
  "file:mr-3 file:border-0 file:bg-primary-pink-light file:text-primary-pink file:px-3 file:py-1.5 file:rounded-lg file:cursor-pointer";

interface Props {
  label: string;
  value: string;
  onChange: (filename: string) => void;
  hint?: string;
}

export default function DocUploadField({ label, value, onChange, hint }: Props) {
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
            toast.error("Hanya file PDF, JPG, JPEG, atau PNG.");
            e.target.value = "";
            return;
          }
          onChange(file.name);
          toast.success(`${file.name} terlampir.`);
        }}
        className={inputClass}
      />
      <p className="text-xs text-gray-500">
        {value ? `Terpilih: ${value}` : hint ?? "Belum ada file (PDF / JPG)"}
      </p>
    </div>
  );
}
