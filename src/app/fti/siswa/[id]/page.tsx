"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download } from "lucide-react";
import CvPreviewPanel from "@/components/cv-form/components/CvPreviewPanel";
import DownloadFileButton from "@/components/lpk/DownloadFileButton";
import PortalPageShell from "@/components/PortalPageShell";
import { lpkStudentToCvData } from "@/lib/cv-to-lpk-student";
import { exportCVToPDF } from "@/lib/export-cv-pdf";
import { ftiStudentProfileUrl, getLpkStudentById, seedLpkStudentsIfEmpty } from "@/lib/lpk-student-storage";
import type { LpkStudentRecord } from "@/types/lpk-student";

const CV_EXPORT_ID = "fti-student-cv-export";

export default function FtiStudentProfilePage() {
  const params = useParams<{ id: string }>();
  const [student, setStudent] = useState<LpkStudentRecord | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedLpkStudentsIfEmpty();
    const found = getLpkStudentById(params.id);
    setStudent(found ?? null);
    setReady(true);
  }, [params.id]);

  if (!ready) {
    return (
      <PortalPageShell>
        <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
          Memuat data siswa…
        </div>
      </PortalPageShell>
    );
  }

  if (!student) {
    return (
      <PortalPageShell>
        <div className="min-h-screen flex flex-col items-center justify-center gap-2 px-4">
          <p className="text-lg font-medium text-gray-900">Siswa tidak ditemukan</p>
          <p className="text-sm text-gray-500">ID: {params.id}</p>
        </div>
      </PortalPageShell>
    );
  }

  const cvData = lpkStudentToCvData(student);
  const certItems = student.sertifikat?.length
    ? student.sertifikat
    : student.sertifikat_dimiliki.map((n) => ({ nama_sertifikat: n }));

  const docs = [
    { label: "KTP", value: student.dokumen_ktp },
    { label: "KK (Kartu Keluarga)", value: student.dokumen_kk },
    { label: "Akte Kelahiran", value: student.dokumen_akte },
    { label: "Ijazah Terakhir", value: student.dokumen_ijazah },
    { label: "MCU", value: student.mcu_pdf },
  ];

  const handleExport = () => {
    const fileName = `CV_${student.nama_lengkap.replace(/\s+/g, "_")}_${student.no_peserta}.pdf`;
    void exportCVToPDF(CV_EXPORT_ID, fileName);
  };

  return (
    <PortalPageShell>
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/95 backdrop-blur-sm px-4 md:px-8 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            CV & Dokumen Siswa
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-1">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-gray-900">{student.nama_lengkap}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {student.no_peserta} · {student.asal_lpk} · {student.angkatan}
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shrink-0"
            >
              <Download size={14} />
              Export CV PDF
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
          <section className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600">Curriculum Vitae</h2>
            </div>
            <div className="h-[min(70vh,720px)]">
              <CvPreviewPanel
                data={cvData}
                exportElementId={CV_EXPORT_ID}
                allowDownload
                className="h-full"
              />
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600">Dokumen Diri</h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {docs.map((d) => (
                  <li
                    key={d.label}
                    className="flex items-center justify-between gap-3 px-6 py-3 text-sm"
                  >
                    <span className="font-medium text-gray-800 shrink-0">{d.label}</span>
                    {d.value ? (
                      <DownloadFileButton filename={d.value} studentName={student.nama_lengkap} />
                    ) : (
                      <span className="text-gray-400 text-xs">Belum diunggah</span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="px-6 py-3 text-[10px] text-gray-500 border-t border-gray-100 flex items-center gap-1">
                <Download size={12} />
                Admin FTI dapat mengunduh semua dokumen peserta.
              </p>
            </section>

            <section className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600">Sertifikat</h2>
              </div>
              {!certItems.length ? (
                <p className="px-6 py-8 text-sm text-gray-500">Belum ada sertifikat.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {certItems.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 px-6 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <span className="font-medium text-gray-800">{s.nama_sertifikat || "-"}</span>
                        {"score" in s && s.score ? (
                          <span className="text-gray-500 ml-2 text-xs">({s.score})</span>
                        ) : null}
                      </div>
                      {"sertifikat" in s && s.sertifikat ? (
                        <DownloadFileButton
                          filename={s.sertifikat}
                          studentName={student.nama_lengkap}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </main>
      </div>
    </PortalPageShell>
  );
}
