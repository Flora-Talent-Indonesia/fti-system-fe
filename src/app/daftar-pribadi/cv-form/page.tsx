"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Loader2,
  Pencil,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { CVData } from "@/components/cv-form/types";
import { defaultCVData } from "@/components/cv-form/defaults";
import StepMetaInfoLpk from "@/components/cv-form/components/StepMetaInfoLpk";
import StepFisik from "@/components/cv-form/components/StepFisik";
import StepPendidikan from "@/components/cv-form/components/StepPendidikan";
import StepPekerjaan from "@/components/cv-form/components/StepPekerjaan";
import StepSertifikat from "@/components/cv-form/components/StepSertifikat";
import StepKeluarga from "@/components/cv-form/components/StepKeluarga";
import CVTemplate from "@/components/cv-form/components/CVTemplate";
import { createDummyCvDraft } from "@/data/dummy-cv-draft";
import {
  CV_STEP_VALIDATORS,
  validateAllCvSteps,
  type CvFormErrors,
} from "@/lib/cv-form-validation";
import {
  loadDaftarPribadiCv,
  saveDaftarPribadiCv,
} from "@/lib/daftar-pribadi-storage";
import { upsertFtiDataSiswaFromCv } from "@/lib/fti-data-siswa-storage";
import { exportCVToPDF } from "@/lib/export-cv-pdf";

function persistDaftarPribadiCv(data: CVData) {
  saveDaftarPribadiCv(data);
  upsertFtiDataSiswaFromCv(data);
}

const STEPS = [
  { id: 1, label: "Identitas", icon: "👤", desc: "Data diri & meta dokumen" },
  { id: 2, label: "Fisik & Kesehatan", icon: "💪", desc: "Kondisi fisik & kesehatan" },
  { id: 3, label: "Pendidikan", icon: "🎓", desc: "Riwayat pendidikan" },
  { id: 4, label: "Pekerjaan", icon: "💼", desc: "Riwayat kerja & magang" },
  { id: 5, label: "Sertifikat", icon: "🏆", desc: "Sertifikat & lisensi" },
  { id: 6, label: "Keluarga", icon: "👨‍👩‍👧", desc: "Susunan keluarga" },
];

function nextNoPesertaDraft(): string {
  const year = new Date().getFullYear();
  return `FTI-${year}-001`;
}

export default function DaftarPribadiCvFormPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<CVData>(defaultCVData);
  const [errors, setErrors] = useState<CvFormErrors>({});
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDataValid, setIsDataValid] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(794);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const update = <K extends keyof CVData>(key: K, value: CVData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  useEffect(() => {
    const saved = loadDaftarPribadiCv();
    if (saved) {
      setData(saved);
    } else {
      setData((d) => ({
        ...d,
        informasi_dasar: {
          ...d.informasi_dasar,
          no_peserta: nextNoPesertaDraft(),
        },
      }));
    }
    setReady(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!ready || submitted) return;
    const t = window.setTimeout(() => persistDaftarPribadiCv(data), 900);
    return () => window.clearTimeout(t);
  }, [data, ready, submitted]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const fitScale = Math.min((viewportWidth - 64) / 794, 1);

  const tryGoNext = () => {
    const validate = CV_STEP_VALIDATORS[step - 1];
    const errs = validate(data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Lengkapi field yang ditandai merah terlebih dahulu.");
      return;
    }
    setErrors({});
    if (step < STEPS.length) {
      setStep(step + 1);
    } else {
      handleFinishForm();
    }
  };

  const handleFinishForm = () => {
    const { errors: allErrors, step: errStep } = validateAllCvSteps(data);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setStep(errStep);
      toast.error("Masih ada data wajib yang belum lengkap.");
      return;
    }
    persistDaftarPribadiCv(data);
    setSubmitted(true);
    setIsDataValid(false);
    toast.success("CV berhasil disimpan. Tinjau preview lalu unduh PDF jika perlu.");
  };

  const handleSaveFromPreview = () => {
    if (!isDataValid) {
      toast.error("Centang konfirmasi data sudah benar terlebih dahulu.");
      return;
    }
    persistDaftarPribadiCv(data);
    toast.success("CV tersimpan.");
  };

  const loadDummyData = () => {
    const draft = createDummyCvDraft(
      data.informasi_dasar.no_peserta.trim() || nextNoPesertaDraft(),
    );
    setData(draft);
    setStep(1);
    setErrors({});
    setSubmitted(false);
    toast.success("Data contoh otomatis diisi — Rina Wulandari");
  };

  const dummyDataButton = (
    <button
      type="button"
      onClick={loadDummyData}
      className="inline-flex items-center gap-2 shrink-0 px-3 py-2 md:px-4 md:py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-wider text-primary-pink border border-primary-pink/40 rounded-lg bg-primary-pink-light/60 hover:bg-primary-pink hover:text-white hover:border-primary-pink transition-colors shadow-sm"
    >
      <Sparkles size={14} />
      Isi data contoh
    </button>
  );

  const errorCount = Object.keys(errors).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fdf8fa] flex items-center justify-center text-text-gray text-sm gap-2">
        <Loader2 size={16} className="animate-spin text-primary-pink" />
        Memuat data CV…
      </main>
    );
  }

  if (submitted) {
    const noPeserta = data.informasi_dasar.no_peserta.trim() || "CV";
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-[#fdf8fa] font-sans text-matte-black">
        <div className="lg:w-[380px] xl:w-[420px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-[#e5e7eb] p-4 md:p-6 flex flex-col gap-4">
          <Link
            href="/daftar-pribadi"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-text-gray hover:text-primary-pink"
          >
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <div>
            <h1 className="font-[family-name:var(--font-montserrat)] text-xl font-bold uppercase tracking-wide text-matte-black">
              Preview CV
            </h1>
            <p className="text-xs text-text-gray mt-1">
              Periksa data sebelum menyimpan atau mengunduh PDF.
            </p>
          </div>

          <label
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer ${
              isDataValid
                ? "border-emerald-400 bg-emerald-50"
                : "border-primary-pink/30 bg-primary-pink-light/40"
            }`}
          >
            <input
              type="checkbox"
              checked={isDataValid}
              onChange={(e) => setIsDataValid(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-gray-300 text-primary-pink focus:ring-primary-pink"
            />
            <div>
              <span className="block text-sm font-semibold text-matte-black">Data sudah benar</span>
              <span className="mt-0.5 block text-xs text-text-gray">
                Centang konfirmasi untuk mengaktifkan simpan & unduh.
              </span>
            </div>
          </label>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setIsDataValid(false);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm font-semibold text-matte-black hover:bg-primary-pink-light/50"
            >
              <Pencil size={16} /> Edit Data
            </button>
            <button
              type="button"
              onClick={handleSaveFromPreview}
              disabled={!isDataValid}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
                isDataValid ? "bg-primary-pink hover:bg-[var(--primary-pink-hover)]" : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <CheckCircle2 size={16} /> Simpan CV
            </button>
            <button
              type="button"
              onClick={() => void exportCVToPDF("cv-print-area", `CV_${noPeserta}`)}
              disabled={!isDataValid}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                isDataValid
                  ? "border-primary-pink text-primary-pink hover:bg-primary-pink hover:text-white"
                  : "border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <FileDown size={16} /> Unduh PDF
            </button>
          </div>

          <Link
            href="/daftar-pribadi/profil"
            className="text-center text-xs font-semibold uppercase tracking-wider text-primary-pink hover:underline mt-auto pt-4"
          >
            Lihat halaman profil →
          </Link>
        </div>

        <div ref={previewContainerRef} className="flex-1 overflow-auto bg-gray-300 min-h-[50vh] lg:min-h-screen">
          <div className="p-4 flex justify-center">
            <div style={{ width: 794 * fitScale, position: "relative" }}>
              <div
                id="cv-print-area"
                style={{
                  width: 794,
                  background: "#fff",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
                  transformOrigin: "top left",
                  transform: `scale(${fitScale})`,
                }}
              >
                <CVTemplate data={data} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8fa] flex font-sans text-matte-black relative z-0">
      <div className="fixed inset-0 z-[-1] opacity-[0.04] pointer-events-none fti-pattern" />

      <aside className="hidden lg:flex flex-col w-72 min-h-screen bg-white border-r border-[#e5e7eb] px-6 py-10 gap-3 fixed top-0 left-0 z-10 shadow-sm">
        <div className="mb-6">
          <Link
            href="/daftar-pribadi"
            className="inline-flex items-center gap-1.5 text-xs text-text-gray hover:text-primary-pink transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Kembali
          </Link>
          <h1 className="font-[family-name:var(--font-montserrat)] text-2xl font-bold text-matte-black tracking-wide uppercase">
            Form CV
          </h1>
          <p className="text-[10px] font-semibold text-text-gray tracking-[0.2em] uppercase mt-2">
            Flora Talent Indonesia
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
                ? "bg-primary-pink-light/50 border-primary-pink text-matte-black"
                : step > s.id
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-text-gray hover:bg-primary-pink-light/30"
            }`}
          >
            <span className="text-xl opacity-80">{step > s.id ? "✅" : s.icon}</span>
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase mb-1">{s.label}</p>
              <p className="text-[10px] text-text-gray tracking-wide">{s.desc}</p>
            </div>
          </button>
        ))}
      </aside>

      <main className="flex-1 lg:ml-72 min-h-screen relative z-10">
        <div className="p-3 md:p-6 lg:p-12 min-w-0">
          <div className="lg:hidden mb-4">
            <div className="flex items-center justify-between mb-2">
              <Link
                href="/daftar-pribadi"
                className="flex items-center gap-1 text-xs text-text-gray hover:text-matte-black"
              >
                <ArrowLeft size={13} /> Kembali
              </Link>
              <span className="text-[10px] font-semibold text-text-gray tracking-widest uppercase">
                Step {step}/{STEPS.length}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">{STEPS[step - 1].icon}</span>
                <span className="text-sm font-semibold">{STEPS[step - 1].label}</span>
              </div>
              {step === 1 ? dummyDataButton : null}
            </div>
            <div className="h-1 bg-gray-200 w-full rounded-full">
              <div
                className="h-1 bg-primary-pink transition-all duration-700 rounded-full"
                style={{ width: `${(step / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="fti-panel p-4 md:p-8 lg:p-12">
              <div className="hidden lg:block mb-10 border-b border-[#e5e7eb] pb-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-[family-name:var(--font-montserrat)] text-2xl font-bold text-matte-black mb-2">
                      {STEPS[step - 1].icon} {STEPS[step - 1].label}
                    </h2>
                    <p className="text-xs tracking-widest font-medium uppercase text-text-gray">
                      {STEPS[step - 1].desc}
                    </p>
                  </div>
                  {step === 1 ? dummyDataButton : null}
                </div>
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

              <div className="flex items-center justify-between mt-6 md:mt-12 pt-4 md:pt-8 border-t border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => {
                    setErrors({});
                    setStep((s) => Math.max(1, s - 1));
                  }}
                  disabled={step === 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 md:px-6 md:py-3 border border-[#e5e7eb] text-text-gray text-xs tracking-widest uppercase font-semibold hover:border-primary-pink/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={15} /> Sebelumnya
                </button>
                <span className="text-[10px] tracking-[0.2em] uppercase text-text-gray hidden sm:block">
                  Langkah {step} / {STEPS.length}
                </span>
                <button
                  type="button"
                  onClick={tryGoNext}
                  className="flex items-center gap-1.5 px-4 py-2.5 md:px-6 md:py-3 border border-primary-pink bg-primary-pink text-white text-xs tracking-widest uppercase font-semibold hover:bg-[var(--primary-pink-hover)] transition-colors"
                >
                  {step < STEPS.length ? (
                    <>
                      Selanjutnya <ChevronRight size={16} />
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} /> Selesai & Preview
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
