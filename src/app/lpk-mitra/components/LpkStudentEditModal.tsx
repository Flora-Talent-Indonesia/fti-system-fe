"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Upload, Wand2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { FormField, FormSelect } from "@/components/cv-form/components/FormControls";
import { FileRuleTooltip } from "@/components/cv-form/components/FileRuleTooltip";
import StepKeluarga from "@/components/cv-form/components/StepKeluarga";
import StepSertifikat from "@/components/cv-form/components/StepSertifikat";
import SectionPanel from "@/components/lpk/SectionPanel";
import DocUploadField from "@/components/lpk/DocUploadField";
import { PHOTO_ACCEPT_INPUT, TOOLTIP_PHOTO_UPLOAD, isAllowedPhotoUpload } from "@/components/cv-form/file-upload-rules";
import { lpkStudentToCvData } from "@/lib/cv-to-lpk-student";
import { toKatakana } from "@/lib/katakana-master";
import type { LpkStudentRecord } from "@/types/lpk-student";

const TABS = [
  { id: "biodata", label: "Profil & Kontak", icon: "👤" },
  { id: "keluarga", label: "Keluarga", icon: "👨‍👩‍👧" },
  { id: "sertifikat", label: "Sertifikat", icon: "🏆" },
  { id: "dokumen", label: "Dokumen & MCU", icon: "📎" },
  { id: "program", label: "Program & Jadwal", icon: "📅" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const GENDER = [
  { value: "L", label: "男 / Laki-laki" },
  { value: "P", label: "女 / Perempuan" },
];
const YA_TIDAK = [
  { value: "Ya", label: "はい / Ya" },
  { value: "Tidak", label: "いいえ / Tidak" },
];
const ADA_TIDAK = [
  { value: "Ada", label: "あり / Ada" },
  { value: "Tidak Ada", label: "無し / Tidak Ada" },
];

export default function LpkStudentEditModal({
  student,
  onClose,
  onSave,
}: {
  student: LpkStudentRecord;
  onClose: () => void;
  onSave: (s: LpkStudentRecord) => void;
}) {
  const [draft, setDraft] = useState(student);
  const [tab, setTab] = useState<TabId>("biodata");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const patch = (p: Partial<LpkStudentRecord>) => setDraft((d) => ({ ...d, ...p }));
  const cv = lpkStudentToCvData(draft);

  const handleSave = () => {
    onSave(draft);
    toast.success("Data siswa disimpan.");
    onClose();
  };

  const generateKatakana = () => {
    const r = toKatakana(draft.nama_lengkap.trim());
    if (!r) {
      toast.error("Gagal generate katakana.");
      return;
    }
    patch({ nama_katakana: r });
    toast.success("Katakana di-generate.");
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

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-6xl max-h-[92vh] bg-white border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80 flex-shrink-0">
          <div>
            <h2 className="text-xl font-serif text-gray-900">Edit Siswa</h2>
            <p className="text-sm text-gray-500 mt-0.5">{draft.nama_lengkap || draft.no_peserta}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700">
            <X size={22} />
          </button>
        </div>

        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto flex-shrink-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                tab === t.id
                  ? "border-primary-pink text-primary-pink bg-white font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/80"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
          {tab === "biodata" && (
            <>
              <SectionPanel title="Foto & Identitas Inti">
                <div className="grid md:grid-cols-[200px_1fr] gap-6">
                  <div>
                    <div className="w-40 h-52 border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                      {draft.foto ? (
                        <img src={draft.foto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl text-gray-300">👤</span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2 w-40">
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-primary-pink/30 text-primary-pink hover:bg-primary-pink-light cursor-pointer bg-white rounded-lg">
                        <Upload size={14} />
                        Ubah Foto
                        <input type="file" accept={PHOTO_ACCEPT_INPUT} className="hidden" onChange={onFotoUpload} />
                      </label>
                      <FileRuleTooltip text={TOOLTIP_PHOTO_UPLOAD} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="No. Peserta" value={draft.no_peserta} onChange={(v) => patch({ no_peserta: v })} />
                    <FormField label="NIK" value={draft.nik} onChange={(v) => patch({ nik: v })} autoUppercase={false} />
                    <FormField label="Nama Lengkap" value={draft.nama_lengkap} onChange={(v) => patch({ nama_lengkap: v })} />
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">Nama Katakana</span>
                        <button type="button" onClick={generateKatakana} className="text-[10px] font-bold text-primary-pink flex items-center gap-1">
                          <Wand2 size={12} /> Auto
                        </button>
                      </div>
                      <FormField label="" value={draft.nama_katakana} onChange={(v) => patch({ nama_katakana: v })} autoUppercase={false} />
                    </div>
                    <FormField label="Nama Panggilan" value={draft.nama_panggilan} onChange={(v) => patch({ nama_panggilan: v })} autoUppercase={false} />
                    <FormField label="Kewarganegaraan" value={draft.kewarganegaraan} onChange={(v) => patch({ kewarganegaraan: v })} autoUppercase={false} />
                    <FormField label="Tanggal Lahir" type="date" value={draft.tanggal_lahir} onChange={(v) => patch({ tanggal_lahir: v })} />
                    <FormField label="Umur" value={draft.umur} onChange={(v) => patch({ umur: v })} type="number" autoUppercase={false} />
                    <FormSelect label="Jenis Kelamin" value={draft.jenis_kelamin} onChange={(v) => patch({ jenis_kelamin: v })} options={GENDER} />
                    <FormField label="Gol. Darah" value={draft.golongan_darah} onChange={(v) => patch({ golongan_darah: v })} />
                    <FormField label="Status Pernikahan" value={draft.status_pernikahan} onChange={(v) => patch({ status_pernikahan: v })} />
                    <FormField label="Agama" value={draft.agama} onChange={(v) => patch({ agama: v })} autoUppercase={false} />
                  </div>
                </div>
              </SectionPanel>

              <SectionPanel title="Kontak & Alamat">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField label="Asal (Tempat Lahir)" value={draft.asal} onChange={(v) => patch({ asal: v })} />
                  <FormField label="Kode Pos" value={draft.kode_pos} onChange={(v) => patch({ kode_pos: v })} autoUppercase={false} />
                  <FormField label="Telepon" value={draft.telepon} onChange={(v) => patch({ telepon: v })} type="tel" autoUppercase={false} />
                  <FormField label="Email" value={draft.email} onChange={(v) => patch({ email: v })} type="email" autoUppercase={false} />
                  <FormField label="Alamat Lengkap" value={draft.alamat} onChange={(v) => patch({ alamat: v })} type="textarea" className="md:col-span-2" />
                </div>
              </SectionPanel>

              <SectionPanel title="身体・健康 / Medis & Fisik">
                <div className="grid md:grid-cols-3 gap-4">
                  <FormField label="Berat Badan (kg)" value={draft.berat_badan} onChange={(v) => patch({ berat_badan: v })} type="number" autoUppercase={false} />
                  <FormField label="Tinggi Badan (cm)" value={draft.tinggi_badan} onChange={(v) => patch({ tinggi_badan: v })} type="number" autoUppercase={false} />
                  <div />
                  <FormField label="Visus Mata Kiri" value={draft.mata_kiri} onChange={(v) => patch({ mata_kiri: v })} autoUppercase={false} />
                  <FormField label="Kondisi Mata Kiri" value={draft.kondisi_mata_kiri} onChange={(v) => patch({ kondisi_mata_kiri: v })} />
                  <div />
                  <FormField label="Visus Mata Kanan" value={draft.mata_kanan} onChange={(v) => patch({ mata_kanan: v })} autoUppercase={false} />
                  <FormField label="Kondisi Mata Kanan" value={draft.kondisi_mata_kanan} onChange={(v) => patch({ kondisi_mata_kanan: v })} />
                  <div />
                  <FormSelect label="Berkacamata" value={draft.berkacamata} onChange={(v) => patch({ berkacamata: v })} options={YA_TIDAK} />
                  <FormField label="Buta Warna" value={draft.buta_warna} onChange={(v) => patch({ buta_warna: v })} />
                  <div />
                  <FormSelect label="Tato" value={draft.tato} onChange={(v) => patch({ tato: v })} options={ADA_TIDAK} />
                  <FormSelect label="Patah Tulang" value={draft.patah_tulang} onChange={(v) => patch({ patah_tulang: v })} options={ADA_TIDAK} />
                  <FormSelect label="Merokok" value={draft.merokok} onChange={(v) => patch({ merokok: v })} options={YA_TIDAK} />
                  {draft.merokok === "Ya" && (
                    <FormField label="Frekuensi Merokok" value={draft.frequensi_merokok} onChange={(v) => patch({ frequensi_merokok: v })} autoUppercase={false} />
                  )}
                  <FormField label="Hobi" value={draft.hobi} onChange={(v) => patch({ hobi: v })} className="md:col-span-2" autoUppercase={false} />
                  <FormField label="Tingkatan Pembelajaran" value={draft.tingkatan_pembelajaran} onChange={(v) => patch({ tingkatan_pembelajaran: v })} />
                </div>
              </SectionPanel>
            </>
          )}

          {tab === "keluarga" && (
            <SectionPanel title="Data Orang Tua / Keluarga">
              <StepKeluarga
                items={cv.keluarga}
                onChange={(keluarga) =>
                  patch({
                    keluarga: keluarga.map((k) => ({
                      hubungan: k.hubungan,
                      nama: k.nama_anggota,
                      umur: k.umur,
                      status_pekerjaan: k.pekerjaan,
                    })),
                  })
                }
              />
            </SectionPanel>
          )}

          {tab === "sertifikat" && (
            <SectionPanel title="Sertifikat & Lisensi">
              <StepSertifikat
                items={cv.sertifikat}
                onChange={(sertifikat) =>
                  patch({
                    sertifikat: sertifikat.map((s) => ({
                      nama_sertifikat: s.nama_sertifikat,
                      status_kelulusan: s.status_kelulusan === "Lulus" ? 1 : 0,
                      score: s.keterangan_skor,
                      bulan_diperoleh: s.bulan_diperoleh,
                      tahun_diperoleh: s.tahun_diperoleh,
                      sertifikat: s.foto_sertifikat,
                    })),
                    sertifikat_dimiliki: sertifikat.map((s) => s.nama_sertifikat).filter(Boolean),
                  })
                }
              />
            </SectionPanel>
          )}

          {tab === "dokumen" && (
            <div className="space-y-6">
              <SectionPanel title="Dokumen Pendukung">
                <div className="grid md:grid-cols-2 gap-4">
                  <DocUploadField label="KTP" value={draft.dokumen_ktp} onChange={(v) => patch({ dokumen_ktp: v })} />
                  <DocUploadField label="Kartu Keluarga (KK)" value={draft.dokumen_kk} onChange={(v) => patch({ dokumen_kk: v })} />
                  <DocUploadField label="Akte Kelahiran" value={draft.dokumen_akte} onChange={(v) => patch({ dokumen_akte: v })} />
                  <DocUploadField label="Ijazah Terakhir" value={draft.dokumen_ijazah} onChange={(v) => patch({ dokumen_ijazah: v })} />
                </div>
              </SectionPanel>
              <SectionPanel title="Hasil Medical Check Up (MCU)">
                <div className="max-w-md">
                  <DocUploadField
                    label="File Hasil MCU"
                    value={draft.mcu_pdf}
                    onChange={(v) => patch({ mcu_pdf: v })}
                    hint="Upload hasil MCU (PDF / JPG)"
                  />
                </div>
              </SectionPanel>
            </div>
          )}

          {tab === "program" && (
            <SectionPanel title="Program Magang & Jadwal Pelatihan">
              <p className="text-sm text-gray-600 mb-4">
                Ketik program magang yang diikuti siswa. Data penempatan perusahaan di Jepang diisi oleh FTI.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  label="Program Magang LPK"
                  value={draft.jenis_pekerjaan}
                  onChange={(v) => patch({ jenis_pekerjaan: v })}
                  placeholder="Contoh: Magang PM, Magang Manufaktur"
                />
                <FormField label="Asal LPK" value={draft.asal_lpk} onChange={(v) => patch({ asal_lpk: v })} />
                <FormField label="Tanggal Masuk Pelatihan" type="date" value={draft.tanggal_masuk_pelatihan} onChange={(v) => patch({ tanggal_masuk_pelatihan: v })} />
                <FormField label="Tanggal Kelulusan" type="date" value={draft.tanggal_kelulusan} onChange={(v) => patch({ tanggal_kelulusan: v })} />
                <FormField label="Perkiraan Masuk Jepang" type="date" value={draft.perkiraan_masuk_jepang} onChange={(v) => patch({ perkiraan_masuk_jepang: v })} />
                <FormField label="Tanggal Keberangkatan" type="date" value={draft.tanggal_keberangkatan} onChange={(v) => patch({ tanggal_keberangkatan: v })} />
              </div>
            </SectionPanel>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border border-gray-300 text-gray-600 hover:bg-gray-50">
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
