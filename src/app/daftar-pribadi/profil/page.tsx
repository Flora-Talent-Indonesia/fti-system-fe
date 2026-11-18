"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Pencil, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import type { CVData, DokumenPendukung } from "@/components/cv-form/types";
import { defaultCVData } from "@/components/cv-form/defaults";
import ProfileCvEditor from "@/components/daftar-pribadi/ProfileCvEditor";
import ProfileCvSections from "@/components/daftar-pribadi/ProfileCvSections";
import { loadDaftarPribadiCv, mergeCvData, saveDaftarPribadiCv } from "@/lib/daftar-pribadi-storage";
import { upsertFtiDataSiswaFromCv } from "@/lib/fti-data-siswa-storage";
import { missingDocNames, missingRequiredDocsFromCv } from "@/lib/supporting-docs";

export default function DaftarPribadiProfilPage() {
  const [cv, setCv] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = loadDaftarPribadiCv();
    setCv(saved);
    setLoading(false);
  }, []);

  const data = cv ?? mergeCvData(defaultCVData);
  const cvNotFound = cv === null;

  const handleSaveCv = (nextDraft: CVData) => {
    const next = mergeCvData(nextDraft);
    saveDaftarPribadiCv(next);
    upsertFtiDataSiswaFromCv(next, next.program ? { program: next.program } : undefined);
    setCv(next);
    setEditing(false);
    toast.success("CV diperbarui");
  };

  const handleUploadDoc = (key: keyof DokumenPendukung, filename: string) => {
    const next = mergeCvData({
      ...data,
      dokumen: { ...data.dokumen, [key]: filename },
    });
    saveDaftarPribadiCv(next);
    upsertFtiDataSiswaFromCv(next, next.program ? { program: next.program } : undefined);
    setCv(next);
  };

  if (!mounted || loading) {
    return (
      <main className="min-h-screen bg-[#fdf8fa] flex items-center justify-center text-text-gray text-sm gap-2">
        <Loader2 size={16} className="animate-spin text-primary-pink" />
        Memuat profil…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fdf8fa] font-sans text-matte-black p-6 md:p-12 relative overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none fti-pattern" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-[#e5e7eb] pb-8">
          <div>
            <Link
              href="/daftar-pribadi"
              className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-primary-pink hover:text-[#be185d] mb-4"
            >
              <ArrowLeft size={14} />
              Kembali ke dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border border-primary-pink/25 flex items-center justify-center text-primary-pink bg-white">
                <UserRound size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="font-[family-name:var(--font-montserrat)] text-2xl md:text-3xl font-bold text-matte-black tracking-wide uppercase">
                  Profil Siswa
                </h1>
                <p className="text-sm text-text-gray mt-1">
                  Ringkasan data dari CV Anda.
                </p>
              </div>
            </div>
          </div>
        </header>

        {cvNotFound ? (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-primary-pink-light border border-primary-pink/25 px-4 py-3 text-sm text-[#be185d]">
            <p>
              <span className="font-semibold">CV belum tersedia:</span> Isi form CV terlebih dahulu
              untuk menampilkan data lengkap.
            </p>
            <Link
              href="/daftar-pribadi/cv-form"
              className="shrink-0 text-xs tracking-widest uppercase font-semibold text-primary-pink hover:underline"
            >
              Buka form CV
            </Link>
          </div>
        ) : null}

        {!cvNotFound && missingRequiredDocsFromCv(data.dokumen).length > 0 ? (
          <div className="mb-8 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold">Dokumen pendukung belum diunggah.</p>
            <p className="mt-1">{missingDocNames(missingRequiredDocsFromCv(data.dokumen))}</p>
          </div>
        ) : null}

        <div className="fti-panel p-8 md:p-10 min-w-0">
          <div className="mb-8 flex flex-col gap-4 border-b border-[#e5e7eb] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-bold uppercase tracking-wide text-matte-black">
                {editing ? "Edit CV" : "Data lengkap CV"}
              </h2>
              <p className="mt-2 text-xs text-text-gray">
                {editing
                  ? "Ubah data yang tercetak di CV, lalu simpan."
                  : "Data diambil dari form daftar pribadi yang telah Anda simpan. Perubahan di luar isi CV dilakukan oleh admin atau staf FTI."}
              </p>
            </div>
            {!cvNotFound && !editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex shrink-0 items-center justify-center gap-2 bg-primary-pink px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-[var(--primary-pink-hover)]"
              >
                <Pencil size={14} />
                Edit CV
              </button>
            ) : null}
          </div>
          {editing ? (
            <ProfileCvEditor data={data} onCancel={() => setEditing(false)} onSave={handleSaveCv} />
          ) : (
            <ProfileCvSections data={data} onUploadDoc={cvNotFound ? undefined : handleUploadDoc} />
          )}
        </div>
      </div>
    </main>
  );
}
