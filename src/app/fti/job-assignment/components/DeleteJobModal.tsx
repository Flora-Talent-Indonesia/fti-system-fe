"use client";

import { X } from "lucide-react";

export default function DeleteJobModal({
  jobTitle,
  onClose,
  onConfirm,
}: {
  jobTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 p-6">
        <h2 className="text-lg font-serif text-gray-900 mb-2">Hapus Job?</h2>
        <p className="text-sm text-gray-600 mb-6">
          Job <strong>{jobTitle}</strong> akan dihapus permanen dari daftar (mode testing).
        </p>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
