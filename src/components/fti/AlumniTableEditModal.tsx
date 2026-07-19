"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Upload, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { FormField, FormSelect } from "@/components/cv-form/components/FormControls";
import { FileRuleTooltip } from "@/components/cv-form/components/FileRuleTooltip";
import SectionPanel from "@/components/lpk/SectionPanel";
import { PHOTO_ACCEPT_INPUT, TOOLTIP_PHOTO_UPLOAD, isAllowedPhotoUpload } from "@/components/cv-form/file-upload-rules";
import type { LpkStudentRecord } from "@/types/lpk-student";

const GENDER_OPTIONS = [
  { value: "L", label: "Laki-laki (男)" },
  { value: "P", label: "Perempuan (女)" },
];

const CERT_OPTIONS = [
  { value: "", label: "—" },
  { value: "Lulus", label: "Lulus" },
  { value: "Proses", label: "Proses" },
  { value: "-", label: "-" },
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
  const [sekolah, setSekolah] = useState(student.pendidikan?.[0]?.nama_sekolah ?? "");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setDraft(student);
    setSekolah(student.pendidikan?.[0]?.nama_sekolah ?? "");
  }, [student]);

  const patch = (p: Partial<LpkStudentRecord>) => setDraft((d) => ({ ...d, ...p }));

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
      toast.error("Nama wajib diisi.");
      return;
    }
    const pendidikan = [...(draft.pendidikan ?? [])];
    if (pendidikan.length === 0) {
      pendidikan.push({
        nama_sekolah: sekolah,
        tingkat_pendidikan: "",
        jurusan: "",
        bulan_masuk: "",
        tahun_masuk: "",
        bulan_lulus: "",
        tahun_lulus: "",
      });
    } else {
      pendidikan[0] = { ...pendidikan[0], nama_sekolah: sekolah };
    }
    onSave({ ...draft, pendidikan });
    toast.success("Data alumni disimpan.");
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-3xl max-h-[92vh] bg-white border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80 flex-shrink-0">
          <div>
            <h2 className="text-xl font-serif text-gray-900">Edit Data Alumni</h2>
            <p className="text-sm text-gray-500 mt-0.5">Kolom yang tampil di tabel tracking</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
          <SectionPanel title="Identitas">
            <div className="grid md:grid-cols-[160px_1fr] gap-6">
              <div>
                <div className="w-32 h-40 border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                  {draft.foto ? (
                    <img src={draft.foto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl text-gray-300">👤</span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-primary-pink/30 text-primary-pink hover:bg-primary-pink-light cursor-pointer bg-white rounded-lg">
                    <Upload size={14} />
                    Ubah Foto
                    <input type="file" accept={PHOTO_ACCEPT_INPUT} className="hidden" onChange={onFotoUpload} />
                  </label>
                  <FileRuleTooltip text={TOOLTIP_PHOTO_UPLOAD} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  label="氏名 / Nama"
                  value={draft.nama_lengkap}
                  onChange={(v) => patch({ nama_lengkap: v })}
                />
                <FormField
                  label="フリガナ / Furigana"
                  value={draft.nama_katakana}
                  onChange={(v) => patch({ nama_katakana: v })}
                  autoUppercase={false}
                />
                <FormField
                  label="TSK"
                  value={draft.tsk ?? ""}
                  onChange={(v) => patch({ tsk: v })}
                  placeholder="Contoh: TSK-01"
                  autoUppercase={false}
                />
                <FormField
                  label="Tanggal Rekrut"
                  type="date"
                  value={draft.tanggal_rekrut ?? ""}
                  onChange={(v) => patch({ tanggal_rekrut: v })}
                />
                <FormSelect
                  label="性別 / Gender"
                  value={draft.jenis_kelamin}
                  onChange={(v) => patch({ jenis_kelamin: v })}
                  options={GENDER_OPTIONS}
                />
                <FormField
                  label="学校名 / Alamat"
                  value={sekolah}
                  onChange={setSekolah}
                  placeholder="Nama sekolah"
                />
                <FormField
                  label="LPK"
                  value={draft.asal_lpk}
                  onChange={(v) => patch({ asal_lpk: v })}
                />
                <FormField
                  label="出身 / Asal Kota"
                  value={draft.asal}
                  onChange={(v) => patch({ asal: v })}
                />
                <FormField
                  label="Phone Number"
                  value={draft.telepon}
                  onChange={(v) => patch({ telepon: v })}
                  type="tel"
                  autoUppercase={false}
                />
                <FormField
                  label="Email"
                  value={draft.email}
                  onChange={(v) => patch({ email: v })}
                  type="email"
                  autoUppercase={false}
                />
              </div>
            </div>
          </SectionPanel>

          <SectionPanel title="Jadwal">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                label="面接日 / Mensetsu"
                type="date"
                value={draft.tanggal_mensetsu ?? ""}
                onChange={(v) => patch({ tanggal_mensetsu: v })}
              />
              <FormField
                label="内定日 / Naitei"
                type="date"
                value={draft.tanggal_naitei ?? ""}
                onChange={(v) => patch({ tanggal_naitei: v })}
              />
            </div>
          </SectionPanel>

          <SectionPanel title="Certificates">
            <div className="grid md:grid-cols-3 gap-4">
              <FormSelect
                label="JFT BASIC A2"
                value={draft.cert_jft_basic_a2 ?? ""}
                onChange={(v) => patch({ cert_jft_basic_a2: v })}
                options={CERT_OPTIONS}
              />
              <FormSelect
                label="SSW IDN"
                value={draft.cert_ssw_idn ?? ""}
                onChange={(v) => patch({ cert_ssw_idn: v })}
                options={CERT_OPTIONS}
              />
              <FormSelect
                label="SSW JPN"
                value={draft.cert_ssw_jpn ?? ""}
                onChange={(v) => patch({ cert_ssw_jpn: v })}
                options={CERT_OPTIONS}
              />
            </div>
          </SectionPanel>

          <SectionPanel title="Dokumen Keberangkatan">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                label="No Paspor"
                value={draft.dokumen_paspor ?? ""}
                onChange={(v) => patch({ dokumen_paspor: v })}
                placeholder="Contoh: C1234567"
                autoUppercase={false}
              />
              <FormField
                label="VISA (Tanggal)"
                type="date"
                value={draft.dokumen_visa ?? ""}
                onChange={(v) => patch({ dokumen_visa: v })}
              />
              <FormField
                label="COE (Tanggal)"
                type="date"
                value={draft.dokumen_coe ?? ""}
                onChange={(v) => patch({ dokumen_coe: v })}
              />
              <FormField
                label="EKTKLN (Tanggal)"
                type="date"
                value={draft.dokumen_ektkln ?? ""}
                onChange={(v) => patch({ dokumen_ektkln: v })}
              />
              <FormField
                label="DEPARTURE (Tanggal)"
                type="date"
                value={draft.tanggal_keberangkatan}
                onChange={(v) => patch({ tanggal_keberangkatan: v })}
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
