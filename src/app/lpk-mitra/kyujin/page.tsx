"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowLeft, FileText, X } from "lucide-react";
import LpkMitraShell from "@/components/lpk/LpkMitraShell";
import { jobVisibleToLpk, seedJobsIfEmpty } from "@/lib/job-storage";
import type { Job } from "@/types";

const DEMO_LPK_ID = "lpk-01";

function KyujinPreview({ job, onClose }: { job: Job; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden border border-gray-300 bg-gray-100 shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate font-serif text-lg text-gray-900">Kyujin — {job.title}</h2>
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {job.kyujinPdf || "PDF belum diunggah"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Tutup kyujin"
          >
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          {job.kyujinPdf ? (
            <article className="mx-auto max-w-[640px] bg-white px-8 py-10 text-gray-800 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-pink">求人票 / Kyujin</p>
              <h3 className="mt-3 font-serif text-2xl text-gray-900">{job.title}</h3>
              {job.titleJa && <p className="mt-1 text-sm text-gray-500">{job.titleJa}</p>}
              <p className="mt-4 text-sm font-medium">{job.company}</p>
              <p className="mt-4 text-sm leading-relaxed">{job.description}</p>
              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-gray-400">Mensetsu</dt>
                  <dd className="mt-1">{job.tanggalMansetsu || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-gray-400">Kuota</dt>
                  <dd className="mt-1">{job.kuota == null ? "Terbuka" : job.kuota}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[10px] uppercase tracking-wider text-gray-400">Berkas</dt>
                  <dd className="mt-1 inline-flex items-center gap-2">
                    <FileText size={14} className="text-primary-pink" />
                    {job.kyujinPdf}
                  </dd>
                </div>
              </dl>
              <p className="mt-8 text-[11px] text-gray-400">
                Mode testing: ini tampilan berkas kyujin. File asli menyusul setelah penyimpanan dokumen terhubung.
              </p>
            </article>
          ) : (
            <p className="bg-white p-8 text-sm text-gray-600">PDF kyujin untuk job ini belum diunggah FTI.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function LpkKyujinPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [openJob, setOpenJob] = useState<Job | null>(null);

  useEffect(() => {
    setJobs(seedJobsIfEmpty().filter((job) => jobVisibleToLpk(job, DEMO_LPK_ID)));
  }, []);

  return (
    <LpkMitraShell className="h-dvh max-h-dvh min-h-0 overflow-hidden">
      <main className="flex h-dvh min-h-0 flex-col overflow-hidden p-4 md:p-6">
        <header className="mb-4 flex shrink-0 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/lpk-mitra"
              className="border border-gray-300 p-3 text-gray-500 transition-colors hover:bg-gray-200/50 hover:text-gray-900"
              aria-label="Kembali ke dashboard LPK"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Link>
            <div className="min-w-0">
              <h1 className="font-serif text-3xl tracking-wide text-gray-900">Job</h1>
              <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
                Lowongan yang dibuka FTI untuk LPK ini
              </p>
            </div>
          </div>
        </header>

        {jobs.length === 0 ? (
          <p className="border border-gray-200 bg-white p-8 text-sm text-gray-500">
            Belum ada job yang ditampilkan untuk LPK ini. FTI mengatur visibilitas di Job Assignment.
          </p>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid w-full grid-cols-2 items-start gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {jobs.map((job) => (
                <article
                  key={job.id}
                  className="flex min-w-0 flex-col border border-gray-200 bg-white p-3 shadow-sm"
                >
                  <h2 className="font-serif text-base leading-snug text-gray-900">{job.title}</h2>
                  {job.titleJa && (
                    <p className="mt-0.5 truncate text-[11px] tracking-wide text-gray-400">{job.titleJa}</p>
                  )}
                  <p className="mt-1 truncate text-xs text-gray-600">{job.company}</p>
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => setOpenJob(job)}
                      className="inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap border border-[#fc809f]/20 bg-[#fc809f]/10 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#fc809f] transition-colors hover:bg-[#fc809f] hover:text-white"
                    >
                      <FileText size={14} />
                      Lihat Kyujin
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>
      {openJob && <KyujinPreview job={openJob} onClose={() => setOpenJob(null)} />}
    </LpkMitraShell>
  );
}
