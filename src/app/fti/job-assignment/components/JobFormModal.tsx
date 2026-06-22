"use client";

import { X } from "lucide-react";

export type JobFormData = {
  title: string;
  description: string;
  company: string;
  deadlineDokumen: string;
  tanggalMansetsu: string;
  kuota: number | null;
};

type Props = {
  title: string;
  initial?: Partial<JobFormData>;
  onClose: () => void;
  onSave: (data: JobFormData) => void;
  submitLabel?: string;
};

export default function JobFormModal({
  title,
  initial,
  onClose,
  onSave,
  submitLabel = "Simpan",
}: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const kuotaRaw = String(fd.get("kuota") || "").trim();
    onSave({
      title: String(fd.get("title") || "").trim(),
      description: String(fd.get("description") || "").trim(),
      company: String(fd.get("company") || "").trim(),
      deadlineDokumen: String(fd.get("deadlineDokumen") || ""),
      tanggalMansetsu: String(fd.get("tanggalMansetsu") || ""),
      kuota: kuotaRaw ? parseInt(kuotaRaw, 10) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-serif text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input
              name="title"
              required
              defaultValue={initial?.title ?? ""}
              className="input-field"
              placeholder="Contoh: Manufacturing Operator"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perusahaan</label>
            <input
              name="company"
              defaultValue={initial?.company ?? ""}
              className="input-field"
              placeholder="Nama perusahaan / SO"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              required
              rows={3}
              defaultValue={initial?.description ?? ""}
              className="input-field resize-none"
              placeholder="Deskripsi singkat job..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline Dokumen *</label>
              <input
                name="deadlineDokumen"
                type="date"
                required
                defaultValue={initial?.deadlineDokumen ?? ""}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Mansetsu *</label>
              <input
                name="tanggalMansetsu"
                type="date"
                required
                defaultValue={initial?.tanggalMansetsu ?? ""}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kuota *</label>
            <input
              name="kuota"
              required
              inputMode="numeric"
              defaultValue={initial?.kuota ?? ""}
              className="input-field"
              placeholder="0"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-pink hover:bg-primary-pink-hover rounded-lg">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
