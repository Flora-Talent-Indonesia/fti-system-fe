"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { FormField, FormSelect } from "@/components/cv-form/components/FormControls";
import StepCatatanCv from "@/components/cv-form/components/StepCatatanCv";
import StepKeluarga from "@/components/cv-form/components/StepKeluarga";
import StepPendidikan from "@/components/cv-form/components/StepPendidikan";
import StepPekerjaan from "@/components/cv-form/components/StepPekerjaan";
import StepSertifikat from "@/components/cv-form/components/StepSertifikat";
import { PHOTO_ACCEPT_INPUT, isAllowedPhotoUpload } from "@/components/cv-form/file-upload-rules";
import type { CVData, FisikKesehatan, InformasiDasar, MetaData } from "@/components/cv-form/types";
import { CV_MSG, validateCvStep2, validateCvStep3, validateCvStep4, validateCvStep5, validateCvStep6, type CvFormErrors } from "@/lib/cv-form-validation";
import { isKeluargaFilled, isPekerjaanFilled, isPendidikanFilled, isSertifikatFilled } from "@/lib/cv-slots";

const JK_OPTIONS = [
  { value: "Laki-laki", label: "男 / Laki-laki" },
  { value: "Perempuan", label: "女 / Perempuan" },
];
const TANGAN_OPTIONS = [
  { value: "右", label: "右 / Kanan" },
  { value: "左", label: "左 / Kiri" },
];
const GOLDAR_OPTIONS = ["A", "B", "AB", "O"].map((value) => ({ value, label: value }));
const STATUS_NIKAH = [
  { value: "Lajang", label: "独身 / Lajang" },
  { value: "Menikah", label: "既婚 / Menikah" },
  { value: "Cerai", label: "離婚 / Cerai" },
];
const YA_TIDAK = [
  { value: "Ya", label: "はい / Ya" },
  { value: "Tidak", label: "いいえ / Tidak" },
];

function validatePrintedIdentity(data: CVData): CvFormErrors {
  const e: CvFormErrors = {};
  const i = data.informasi_dasar;
  if (!data.meta.tanggal_pembuatan_cv) e.tanggal_pembuatan_cv = CV_MSG;
  if (!i.nama_lengkap.trim()) e.nama_lengkap = CV_MSG;
  if (!i.nama_katakana.trim()) e.nama_katakana = CV_MSG;
  if (!i.umur.trim()) e.umur = CV_MSG;
  if (!i.jenis_kelamin) e.jenis_kelamin = CV_MSG;
  if (!i.tanggal_lahir) e.tanggal_lahir = CV_MSG;
  if (!i.golongan_darah) e.golongan_darah = CV_MSG;
  if (!i.status_pernikahan) e.status_pernikahan = CV_MSG;
  if (!i.alamat_lengkap.trim()) e.alamat_lengkap = CV_MSG;
  return e;
}

export default function ProfileCvEditor({
  data,
  onCancel,
  onSave,
}: {
  data: CVData;
  onCancel: () => void;
  onSave: (next: CVData) => void;
}) {
  const [draft, setDraft] = useState(data);
  const [errors, setErrors] = useState<CvFormErrors>({});
  const info = draft.informasi_dasar;
  const fisik = draft.fisik_kesehatan;

  const setMeta = (patch: Partial<MetaData>) =>
    setDraft((current) => ({ ...current, meta: { ...current.meta, ...patch } }));
  const setInfo = (patch: Partial<InformasiDasar>) =>
    setDraft((current) => ({
      ...current,
      informasi_dasar: { ...current.informasi_dasar, ...patch },
    }));
  const setFisik = (patch: Partial<FisikKesehatan>) =>
    setDraft((current) => ({
      ...current,
      fisik_kesehatan: { ...current.fisik_kesehatan, ...patch },
    }));

  const handleSave = () => {
    const nextErrors = {
      ...validatePrintedIdentity(draft),
      ...validateCvStep2(draft),
      ...validateCvStep3(draft),
      ...validateCvStep4(draft),
      ...validateCvStep5(draft),
      ...validateCvStep6(draft),
    };
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Lengkapi data yang tercetak di CV.");
      return;
    }
    onSave({
      ...data,
      meta: {
        ...data.meta,
        tanggal_pembuatan_cv: draft.meta.tanggal_pembuatan_cv,
        foto: draft.meta.foto,
      },
      informasi_dasar: {
        ...data.informasi_dasar,
        nama_lengkap: info.nama_lengkap,
        nama_katakana: info.nama_katakana,
        umur: info.umur,
        jenis_kelamin: info.jenis_kelamin,
        tanggal_lahir: info.tanggal_lahir,
        tempat_lahir: info.tempat_lahir,
        tangan_dominan: info.tangan_dominan,
        golongan_darah: info.golongan_darah,
        status_pernikahan: info.status_pernikahan,
        alamat_lengkap: info.alamat_lengkap,
      },
      fisik_kesehatan: {
        ...data.fisik_kesehatan,
        tinggi_badan: fisik.tinggi_badan,
        berat_badan: fisik.berat_badan,
        visus_mata_kiri: fisik.visus_mata_kiri,
        visus_mata_kanan: fisik.visus_mata_kanan,
        merokok: fisik.merokok,
        jumlah_rokok: fisik.merokok === "Ya" ? fisik.jumlah_rokok : data.fisik_kesehatan.jumlah_rokok,
        minum_alkohol: fisik.minum_alkohol,
        hobi: fisik.hobi,
      },
      pendidikan: draft.pendidikan.filter(isPendidikanFilled),
      pekerjaan: draft.pekerjaan.filter(isPekerjaanFilled),
      sertifikat: draft.sertifikat.filter(isSertifikatFilled),
      keluarga: draft.keluarga.filter(isKeluargaFilled),
      catatan: {
        ...draft.catatan,
        komentar_pewawancara: data.catatan.komentar_pewawancara,
      },
    });
  };

  return (
    <div className="space-y-8">
      <div className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold">Form ini mengubah data yang tampil di CV.</p>
        <p className="mt-1">
          Untuk mengubah NIK, nomor peserta, nama panggilan, kewarganegaraan, agama, kode pos,
          telepon, email, kacamata, tato, buta warna, patah tulang, program, atau komentar
          pewawancara, hubungi admin atau staf FTI.
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-pink">Identitas di CV</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="NO / No. peserta"
            value={info.no_peserta}
            onChange={() => undefined}
            readOnly
            hint="Diubah oleh admin atau staf FTI."
          />
          <FormField
            id="field-tanggal_pembuatan_cv"
            label="作成日 / Tanggal pembuatan CV"
            value={draft.meta.tanggal_pembuatan_cv}
            onChange={(value) => setMeta({ tanggal_pembuatan_cv: value })}
            type="date"
            error={errors.tanggal_pembuatan_cv}
          />
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">写真 / Pas foto</span>
            <div className="flex items-start gap-3">
              <div className="flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                {draft.meta.foto ? (
                  <img src={draft.meta.foto} alt="Pas foto" className="h-full w-full object-cover" />
                ) : (
                  <span className="px-1 text-center text-[10px] text-slate-400">Belum ada foto</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  id="profil-cv-foto"
                  type="file"
                  accept={PHOTO_ACCEPT_INPUT}
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (!isAllowedPhotoUpload(file)) {
                      toast.error("Foto hanya boleh JPG, JPEG, atau PNG.");
                      event.target.value = "";
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => setMeta({ foto: reader.result as string });
                    reader.readAsDataURL(file);
                  }}
                />
                <label
                  htmlFor="profil-cv-foto"
                  className="cursor-pointer rounded-xl bg-primary-pink px-4 py-2 text-center text-sm font-medium text-white"
                >
                  Ganti foto
                </label>
                <p className="text-xs text-slate-400">JPG atau PNG, ukuran 3×4.</p>
              </div>
            </div>
          </div>
          <FormField id="field-nama_lengkap" label="氏名 / Nama lengkap" value={info.nama_lengkap} onChange={(value) => setInfo({ nama_lengkap: value })} error={errors.nama_lengkap} />
          <FormField id="field-nama_katakana" label="ふりがな / Nama katakana" value={info.nama_katakana} onChange={(value) => setInfo({ nama_katakana: value })} autoUppercase={false} error={errors.nama_katakana} />
          <FormField id="field-umur" label="年齢 / Umur" value={info.umur} onChange={(value) => setInfo({ umur: value.replace(/\D/g, "") })} inputMode="numeric" autoUppercase={false} error={errors.umur} />
          <FormSelect id="field-jenis_kelamin" label="性別 / Jenis kelamin" value={info.jenis_kelamin} onChange={(value) => setInfo({ jenis_kelamin: value })} options={JK_OPTIONS} error={errors.jenis_kelamin} />
          <FormField id="field-tanggal_lahir" label="生年月日 / Tanggal lahir" value={info.tanggal_lahir} onChange={(value) => setInfo({ tanggal_lahir: value })} type="date" error={errors.tanggal_lahir} />
          <FormField label="出身地 / Tempat lahir" value={info.tempat_lahir} onChange={(value) => setInfo({ tempat_lahir: value })} autoUppercase={false} />
          <FormSelect label="利き手 / Tangan dominan" value={info.tangan_dominan} onChange={(value) => setInfo({ tangan_dominan: value })} options={TANGAN_OPTIONS} />
          <FormSelect id="field-golongan_darah" label="血液型 / Golongan darah" value={info.golongan_darah} onChange={(value) => setInfo({ golongan_darah: value })} options={GOLDAR_OPTIONS} error={errors.golongan_darah} />
          <FormSelect id="field-status_pernikahan" label="既婚・未婚 / Status pernikahan" value={info.status_pernikahan} onChange={(value) => setInfo({ status_pernikahan: value })} options={STATUS_NIKAH} error={errors.status_pernikahan} />
          <FormField id="field-alamat_lengkap" label="現住所 / Alamat lengkap" value={info.alamat_lengkap} onChange={(value) => setInfo({ alamat_lengkap: value })} type="textarea" autoUppercase={false} className="sm:col-span-2" error={errors.alamat_lengkap} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-pink">Fisik yang tercetak</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="field-tinggi_badan" label="身長 / Tinggi badan (cm)" value={fisik.tinggi_badan} onChange={(value) => setFisik({ tinggi_badan: value.replace(/\D/g, "") })} inputMode="numeric" autoUppercase={false} error={errors.tinggi_badan} />
          <FormField id="field-berat_badan" label="体重 / Berat badan (kg)" value={fisik.berat_badan} onChange={(value) => setFisik({ berat_badan: value.replace(/\D/g, "") })} inputMode="numeric" autoUppercase={false} error={errors.berat_badan} />
          <FormField label="視力 右 / Visus mata kanan" value={fisik.visus_mata_kanan} onChange={(value) => setFisik({ visus_mata_kanan: value })} autoUppercase={false} />
          <FormField label="視力 左 / Visus mata kiri" value={fisik.visus_mata_kiri} onChange={(value) => setFisik({ visus_mata_kiri: value })} autoUppercase={false} />
          <FormSelect label="喫煙 / Merokok" value={fisik.merokok} onChange={(value) => setFisik({ merokok: value })} options={YA_TIDAK} />
          <FormSelect label="飲酒 / Minum alkohol" value={fisik.minum_alkohol} onChange={(value) => setFisik({ minum_alkohol: value })} options={YA_TIDAK} />
          {fisik.merokok === "Ya" ? (
            <FormField
              id="field-jumlah_rokok"
              label="Jumlah rokok per hari"
              value={fisik.jumlah_rokok}
              onChange={(value) => setFisik({ jumlah_rokok: value.replace(/\D/g, "") })}
              inputMode="numeric"
              autoUppercase={false}
              hint="Tidak tercetak di CV. Wajib diisi jika merokok."
              error={errors.jumlah_rokok}
            />
          ) : null}
          <FormField label="趣味 / Hobi" value={fisik.hobi} onChange={(value) => setFisik({ hobi: value })} autoUppercase={false} className="sm:col-span-2" />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-pink">Pendidikan</h3>
        <StepPendidikan items={draft.pendidikan} onChange={(pendidikan) => setDraft((current) => ({ ...current, pendidikan }))} errors={errors} />
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-pink">Pekerjaan</h3>
        <p className="text-sm text-slate-500">Status magang atau kontrak wajib diisi agar riwayat tersimpan. Status itu tidak tercetak di CV.</p>
        <StepPekerjaan items={draft.pekerjaan} onChange={(pekerjaan) => setDraft((current) => ({ ...current, pekerjaan }))} errors={errors} />
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-pink">Sertifikat</h3>
        <p className="text-sm text-slate-500">Nama, tanggal, dan skor tercetak di CV. File PDF wajib dilampirkan dan tidak tercetak.</p>
        <StepSertifikat items={draft.sertifikat} onChange={(sertifikat) => setDraft((current) => ({ ...current, sertifikat }))} errors={errors} />
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-pink">Keluarga</h3>
        <StepKeluarga items={draft.keluarga} onChange={(keluarga) => setDraft((current) => ({ ...current, keluarga }))} errors={errors} />
      </section>

      <StepCatatanCv data={draft.catatan} onChange={(catatan) => setDraft((current) => ({ ...current, catatan }))} />

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-pink">Komentar pewawancara</h3>
        <p className="whitespace-pre-wrap text-sm text-slate-700">{data.catatan.komentar_pewawancara.trim() || "Belum diisi."}</p>
        <p className="text-xs text-slate-400">Diisi oleh FTI. Untuk perubahan, hubungi admin atau staf FTI.</p>
      </section>

      <div className="sticky bottom-0 z-10 -mx-8 flex items-center justify-end gap-3 border-t border-[#e5e7eb] bg-white/95 px-8 py-4 backdrop-blur md:-mx-10 md:px-10">
        <button
          type="button"
          onClick={onCancel}
          className="border border-[#e5e7eb] px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-text-gray hover:border-primary-pink/40"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="bg-primary-pink px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-[var(--primary-pink-hover)]"
        >
          Simpan CV
        </button>
      </div>
    </div>
  );
}
