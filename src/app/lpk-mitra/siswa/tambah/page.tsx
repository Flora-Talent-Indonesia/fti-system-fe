"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import type { CVData } from "@/components/cv-form/types";
import { defaultCVData } from "@/components/cv-form/defaults";
import StepMetaInfoLpk from "@/components/cv-form/components/StepMetaInfoLpk";
import StepFisik from "@/components/cv-form/components/StepFisik";
import StepPendidikan from "@/components/cv-form/components/StepPendidikan";
import StepPekerjaan from "@/components/cv-form/components/StepPekerjaan";
import StepSertifikat from "@/components/cv-form/components/StepSertifikat";
import StepKeluarga from "@/components/cv-form/components/StepKeluarga";
import CvPreviewPanel from "@/components/cv-form/components/CvPreviewPanel";
import { FormField } from "@/components/cv-form/components/FormControls";
import { cvDataToLpkStudent } from "@/lib/cv-to-lpk-student";
import { upsertLpkStudent, nextNoPeserta } from "@/lib/lpk-student-storage";
import { createDummyCvDraft } from "@/data/dummy-cv-draft";

const STEPS = [
  { id: 1, label: "Identitas", icon: "👤", desc: "Data diri & meta dokumen" },
  { id: 2, label: "Fisik & Kesehatan", icon: "💪", desc: "Kondisi fisik & kesehatan" },
  { id: 3, label: "Pendidikan", icon: "🎓", desc: "Riwayat pendidikan" },
  { id: 4, label: "Pekerjaan", icon: "💼", desc: "Riwayat kerja & magang" },
  { id: 5, label: "Sertifikat", icon: "🏆", desc: "Sertifikat & lisensi" },
  { id: 6, label: "Keluarga", icon: "👨‍👩‍👧", desc: "Susunan keluarga" },
];

export default function TambahSiswaPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<CVData>(() => ({
    ...defaultCVData,
    informasi_dasar: {
      ...defaultCVData.informasi_dasar,
      no_peserta: nextNoPeserta(),
    },
  }));
  const [asal, setAsal] = useState("");
  const [jenisProgram, setJenisProgram] = useState("");

  const update = <K extends keyof CVData>(key: K, value: CVData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const validateStep = (s: number): boolean => {
    const info = data.informasi_dasar;
    if (s === 1) {
      if (!info.nama_lengkap.trim() || !info.nik.trim() || !info.tanggal_lahir) {
        toast.error("Lengkapi nama, NIK, dan tanggal lahir.");
        return false;
      }
    }
    if (s === 6 && data.keluarga.length === 0) {
      toast.error("Tambahkan minimal satu anggota keluarga.");
      return false;
    }
    return true;
  };

  const tryGoNext = () => {
    if (!validateStep(step)) return;
    setErrors({});
    if (step < 6) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    if (!validateStep(6)) return;
    const record = cvDataToLpkStudent(data, {
      asalLpk: "LPK Mitra Sukabumi",
      asal,
      jenisPekerjaan: jenisProgram,
    });
    upsertLpkStudent(record);
    toast.success(`Siswa ${record.nama_lengkap} berhasil ditambahkan.`);
    router.push("/lpk-mitra/siswa");
  };

  const loadDummyData = () => {
    const draft = createDummyCvDraft(nextNoPeserta());
    setData(draft);
    setAsal("Sukabumi");
    setJenisProgram("Magang Manufaktur");
    setStep(1);
    setErrors({});
    toast.success("Data contoh dimuat — Rina Wulandari");
  };

  const errorCount = Object.keys(errors).length;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans text-gray-800 relative z-0">
      <div className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none fti-pattern" />

      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-72 min-h-screen bg-white border-r border-gray-200/60 px-6 py-10 gap-3 fixed top-0 left-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="mb-6">
          <Link
            href="/lpk-mitra/siswa"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Kembali ke daftar
          </Link>
          <h1 className="text-2xl font-serif text-gray-900 tracking-wide">Tambah Siswa</h1>
          <p className="text-[10px] font-semibold text-gray-400 tracking-[0.2em] uppercase mt-2">
            Form CV LPK Mitra
          </p>
        </div>
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setErrors({});
              setStep(s.id);
            }}
            className={`flex items-center gap-4 px-4 py-3 text-left transition-colors duration-500 border-l-2 ${
              step === s.id
                ? "bg-primary-pink-light/50 border-primary-pink text-gray-900"
                : step > s.id
                  ? "border-emerald-600 bg-transparent text-emerald-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span className="text-xl opacity-80">{step > s.id ? "✅" : s.icon}</span>
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase mb-1">{s.label}</p>
              <p className="text-[10px] text-gray-400 tracking-wide">{s.desc}</p>
            </div>
          </button>
        ))}
        <button
          type="button"
          onClick={loadDummyData}
          className="mt-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-pink border border-primary-pink/30 rounded-xl hover:bg-primary-pink-light transition"
        >
          <Sparkles size={14} />
          Muat data contoh
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-72 flex min-h-screen relative z-10">
        <div className="flex-1 p-3 md:p-6 lg:p-12 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/lpk-mitra/siswa"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={13} /> Kembali
            </Link>
            <span className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
              Step {step}/{STEPS.length}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{STEPS[step - 1].icon}</span>
            <span className="text-sm font-semibold text-gray-800">{STEPS[step - 1].label}</span>
            <span className="text-xs text-gray-400 hidden sm:inline">— {STEPS[step - 1].desc}</span>
          </div>
          <div className="h-1 bg-gray-200 w-full rounded-full">
            <div
              className="h-1 bg-primary-pink transition-all duration-700 ease-in-out rounded-full"
              style={{ width: `${(step / STEPS.length) * 100}%` }}
            />
          </div>
          <button
            type="button"
            onClick={loadDummyData}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary-pink"
          >
            <Sparkles size={13} /> Muat data contoh
          </button>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200/60 p-4 md:p-8 lg:p-12 shadow-sm">
            <div className="hidden lg:block mb-10 border-b border-gray-100 pb-6">
              <h2 className="text-3xl font-serif text-gray-900 mb-2">
                {STEPS[step - 1].icon} {STEPS[step - 1].label}
              </h2>
              <p className="text-xs tracking-widest font-medium uppercase text-gray-400">
                {STEPS[step - 1].desc}
              </p>
            </div>

            {errorCount > 0 && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
                <span className="text-lg leading-none">⚠️</span>
                <div>
                  <p className="font-semibold">Ada {errorCount} field yang belum diisi.</p>
                  <p className="text-xs text-red-500 mt-0.5">
                    Lengkapi semua field yang ditandai merah sebelum melanjutkan.
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <>
                <StepMetaInfoLpk
                  meta={data.meta}
                  dokumen={data.dokumen}
                  info={data.informasi_dasar}
                  onMetaChange={(v) => {
                    setErrors({});
                    update("meta", v);
                  }}
                  onDokumenChange={(v) => {
                    setErrors({});
                    update("dokumen", v);
                  }}
                  onInfoChange={(v) => {
                    setErrors({});
                    update("informasi_dasar", v);
                  }}
                  errors={errors}
                />
                <div className="mt-6 pt-4 border-t border-slate-100 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">
                      出身地 / Asal (Tempat Lahir)
                    </label>
                    <input
                      className="w-full border rounded-xl px-4 py-3 text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent"
                      value={asal}
                      onChange={(e) => setAsal(e.target.value)}
                      placeholder="Contoh: Sukabumi"
                    />
                  </div>
                  <FormField
                    label="Program Magang LPK"
                    value={jenisProgram}
                    onChange={setJenisProgram}
                    placeholder="Contoh: Magang PM, Magang Manufaktur"
                    hint="Ketik program magang yang diikuti siswa di LPK"
                  />
                </div>
              </>
            )}
            {step === 2 && (
              <StepFisik
                data={data.fisik_kesehatan}
                onChange={(v) => {
                  setErrors({});
                  update("fisik_kesehatan", v);
                }}
                errors={errors}
              />
            )}
            {step === 3 && (
              <StepPendidikan
                items={data.pendidikan}
                onChange={(v) => {
                  setErrors({});
                  update("pendidikan", v);
                }}
                errors={errors}
              />
            )}
            {step === 4 && (
              <StepPekerjaan
                items={data.pekerjaan}
                onChange={(v) => {
                  setErrors({});
                  update("pekerjaan", v);
                }}
                errors={errors}
              />
            )}
            {step === 5 && (
              <StepSertifikat
                items={data.sertifikat}
                onChange={(v) => {
                  setErrors({});
                  update("sertifikat", v);
                }}
                errors={errors}
              />
            )}
            {step === 6 && (
              <StepKeluarga
                items={data.keluarga}
                onChange={(v) => {
                  setErrors({});
                  update("keluarga", v);
                }}
                errors={errors}
              />
            )}

            <div className="flex items-center justify-between mt-6 md:mt-12 pt-4 md:pt-8 border-t border-gray-200/60">
              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  setStep((s) => Math.max(1, s - 1));
                }}
                disabled={step === 1}
                className="flex items-center gap-1.5 px-4 py-2.5 md:px-6 md:py-3 border border-gray-300 text-gray-600 text-xs tracking-widest uppercase font-semibold hover:border-gray-400 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-300"
              >
                <ChevronLeft size={15} strokeWidth={1.5} /> Sebelumnya
              </button>
              <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 hidden sm:block">
                Langkah {step} / {STEPS.length}
              </span>
              {step < 6 ? (
                <button
                  type="button"
                  onClick={tryGoNext}
                  className="flex items-center gap-1.5 px-4 py-2.5 md:px-6 md:py-3 border border-primary-pink bg-primary-pink text-white text-xs tracking-widest uppercase font-semibold hover:bg-[var(--primary-pink-hover)] transition-colors duration-300"
                >
                  Selanjutnya <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-1.5 px-4 py-2.5 md:px-6 md:py-3 border border-emerald-700 bg-emerald-700 text-white text-xs tracking-widest uppercase font-semibold hover:bg-emerald-800 transition-colors duration-300"
                >
                  <CheckCircle2 size={15} strokeWidth={1.5} /> Simpan Siswa
                </button>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Live CV preview — sama template dengan student-dashboard jukyu */}
        <aside className="hidden xl:flex flex-col w-[min(420px,38vw)] shrink-0 border-l border-gray-200/60 bg-white sticky top-0 h-screen">
          <div className="px-4 py-3 border-b border-gray-100 bg-[#FDFBF7]">
            <p className="text-[10px] font-semibold text-gray-400 tracking-[0.2em] uppercase">
              Preview CV
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Hanya tampilan — tidak dapat diunduh
            </p>
          </div>
          <CvPreviewPanel data={data} fixedScale={0.38} className="flex-1 min-h-0" />
        </aside>
      </main>
    </div>
  );
}
