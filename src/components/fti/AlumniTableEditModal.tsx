"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Upload, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { FormField, FormSelect } from "@/components/cv-form/components/FormControls";
import { FileRuleTooltip } from "@/components/cv-form/components/FileRuleTooltip";
import SectionPanel from "@/components/lpk/SectionPanel";
import { PHOTO_ACCEPT_INPUT, TOOLTIP_PHOTO_UPLOAD, isAllowedPhotoUpload } from "@/components/cv-form/file-upload-rules";
import { ensureJobPlacement } from "@/lib/alumni-display-utils";
import type { LpkStudentRecord, LpkStudentStatus } from "@/types/lpk-student";

const STATUS_OPTIONS: { value: LpkStudentStatus; label: string }[] = [
  { value: "match_job", label: "Sudah Lulus" },
  { value: "aktif", label: "Sedang Dalam Pembelajaran" },
  { value: "rekrut", label: "Tidak Lulus" },
];

export default function AlumniTableEditModal({
  student,
  onClose,
  onSave,
}: {
  student: LpkStudentRecord;
  onClose: () => void;
  onSave: (updated: LpkStudentRecord) => void;
}) {
  const [draft, setDraft] = useState(student);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setDraft(student), [student]);

  const patch = (p: Partial<LpkStudentRecord>) => setDraft((d) => ({ ...d, ...p }));

  const patchPlacement = (p: { nama_perusahaan?: string; prefektur?: string; kota?: string }) => {
    setDraft((d) => ensureJobPlacement(d, p));
  };

  const onFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAllowedPhotoUpload(file)) {
      toast.error("Foto hanya JPG, JPEG, atau PNG.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => patch({ foto: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!draft.nama_lengkap.trim()) {
      toast.error("Nama peserta wajib diisi.");
      return;
    }
    onSave(draft);
    toast.success("Data alumni disimpan.");
    onClose();
  };

  if (!mounted) return null;

  const placement = draft.job_placement;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] bg-white border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80 flex-shrink-0">
          <div>
            <h2 className="text-xl font-serif text-gray-900">Edit Data Alumni</h2>
            <p className="text-sm text-gray-500 mt-0.5">Hanya kolom yang tampil di tabel</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
          <SectionPanel title="Program & Identitas">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                label="Program"
                value={draft.jenis_pekerjaan}
                onChange={(v) => patch({ jenis_pekerjaan: v })}
                placeholder="Contoh: Magang PM"
              />
              <FormField
                label="Nama Peserta"
                value={draft.nama_lengkap}
                onChange={(v) => patch({ nama_lengkap: v })}
              />
              <FormField
                label="Jalur Pendaftaran"
                value={draft.asal_lpk}
                onChange={(v) => patch({ asal_lpk: v })}
                placeholder="Mandiri atau nama LPK Mitra"
                className="md:col-span-2"
              />
              <FormSelect
                label="Status Siswa"
                value={draft.status}
                onChange={(v) => patch({ status: v as LpkStudentStatus })}
                options={STATUS_OPTIONS}
              />
            </div>
          </SectionPanel>

          <SectionPanel title="Foto">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-32 h-40 border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                {draft.foto ? (
                  <img src={draft.foto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-gray-300">👤</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-primary-pink/30 text-primary-pink hover:bg-primary-pink-light cursor-pointer bg-white rounded-lg">
                  <Upload size={14} />
                  Ubah Foto
                  <input type="file" accept={PHOTO_ACCEPT_INPUT} className="hidden" onChange={onFotoUpload} />
                </label>
                <FileRuleTooltip text={TOOLTIP_PHOTO_UPLOAD} />
              </div>
            </div>
          </SectionPanel>

          <SectionPanel title="Penempatan Kerja">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                label="Nama Perusahaan"
                value={placement?.nama_perusahaan ?? draft.nama_perusahaan}
                onChange={(v) => patchPlacement({ nama_perusahaan: v })}
                className="md:col-span-2"
              />
              <FormField
                label="Prefektur"
                value={placement?.prefektur ?? ""}
                onChange={(v) => patchPlacement({ prefektur: v })}
              />
              <FormField
                label="Kota"
                value={placement?.kota ?? ""}
                onChange={(v) => patchPlacement({ kota: v })}
              />
            </div>
          </SectionPanel>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>
          <button type="button" onClick={handleSave} className="btn-primary">
            Simpan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
