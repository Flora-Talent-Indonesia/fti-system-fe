"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CvPreviewPanel from "@/components/cv-form/components/CvPreviewPanel";
import DownloadFileButton from "@/components/lpk/DownloadFileButton";
import PortalPageShell from "@/components/PortalPageShell";
import { lpkStudentToCvData } from "@/lib/cv-to-lpk-student";
import { getLpkStudentById, seedLpkStudentsIfEmpty } from "@/lib/lpk-student-storage";
import type { LpkStudentRecord } from "@/types/lpk-student";

const CV_EXPORT_ID = "ys-student-cv-export";

function getCertificateItems(student: LpkStudentRecord) {
  return student.sertifikat?.length
    ? student.sertifikat
    : student.sertifikat_dimiliki.map((n) => ({ nama_sertifikat: n }));
}

export default function YsStudentProfilePage() {
  const params = useParams<{ id: string }>();
  const [student, setStudent] = useState<LpkStudentRecord | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedLpkStudentsIfEmpty();
    const found = getLpkStudentById(params.id);
    setStudent(found ?? null);
    setReady(true);
  }, [params.id]);

  useEffect(() => {
    if (!ready || !student) return;
    if (window.location.hash === "#sertifikat") {
      const el = document.getElementById("sertifikat");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [ready, student]);

  if (!ready) {
    return (
      <PortalPageShell sakura>
        <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
          読み込み中… / Loading…
        </div>
      </PortalPageShell>
    );
  }

  if (!student) {
    return (
      <PortalPageShell sakura>
        <div className="min-h-screen flex flex-col items-center justify-center gap-2 px-4">
          <p className="text-lg font-medium text-gray-900">学生が見つかりません</p>
          <p className="text-sm text-gray-500">Student not found · ID: {params.id}</p>
        </div>
      </PortalPageShell>
    );
  }

  const cvData = lpkStudentToCvData(student);
  const certItems = getCertificateItems(student);

  return (
    <PortalPageShell sakura>
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/95 backdrop-blur-sm px-4 md:px-8 py-5">
          <div className="max-w-6xl mx-auto flex items-start gap-4">
            <Link
              href="/ys/jobs"
              className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-gray-900 shrink-0 mt-0.5"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                履歴書 · Curriculum Vitae
              </p>
              <h1 className="font-serif text-2xl font-semibold text-gray-900 mt-1">{student.nama_lengkap}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {student.no_peserta} · {student.asal_lpk}
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
          <section className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <h2 className="font-serif text-lg text-gray-900">履歴書</h2>
              <p className="text-xs text-gray-500 mt-0.5">CV / Resume — 閲覧のみ · View only</p>
            </div>
            <div className="h-[min(70vh,720px)]">
              <CvPreviewPanel
                data={cvData}
                exportElementId={CV_EXPORT_ID}
                allowDownload={false}
                className="h-full"
              />
            </div>
          </section>

          <section
            id="sertifikat"
            className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden scroll-mt-24"
          >
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <h2 className="font-serif text-lg text-gray-900">保有証明書</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Sertifikat · JLPT N5 / N4 / SSW など
              </p>
            </div>
            <div className="px-6 py-6">
              {!certItems.length ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  証明書が登録されていません。
                  <span className="block text-xs mt-1">No certificates on file.</span>
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                  {certItems.map((cert, i) => (
                    <li
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-4 bg-white"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cert.nama_sertifikat || "-"}</p>
                        {"score" in cert && cert.score ? (
                          <p className="text-xs text-gray-500 mt-0.5">Score: {cert.score}</p>
                        ) : null}
                        {"sertifikat" in cert && cert.sertifikat ? (
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">{cert.sertifikat}</p>
                        ) : null}
                      </div>
                      {"sertifikat" in cert && cert.sertifikat ? (
                        <DownloadFileButton
                          filename={cert.sertifikat}
                          studentName={student.nama_lengkap}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">ファイルなし</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-[10px] text-gray-400 text-center">
                証明書のみダウンロード可能 · Certificates downloadable (testing mode)
              </p>
            </div>
          </section>
        </main>
      </div>
    </PortalPageShell>
  );
}
