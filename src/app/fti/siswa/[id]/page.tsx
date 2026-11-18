"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download } from "lucide-react";
import { toast } from "react-hot-toast";
import CvPreviewPanel from "@/components/cv-form/components/CvPreviewPanel";
import DownloadFileButton from "@/components/lpk/DownloadFileButton";
import PortalPageShell from "@/components/PortalPageShell";
import { lpkStudentToCvData } from "@/lib/cv-to-lpk-student";
import { exportCVToPDF } from "@/lib/export-cv-pdf";
import { studentFileName } from "@/lib/student-file-name";
import { upsertFtiDataSiswaFromLpkStudent } from "@/lib/fti-data-siswa-storage";
import { ftiStudentProfileUrl, getLpkStudentById, seedLpkStudentsIfEmpty, upsertLpkStudent } from "@/lib/lpk-student-storage";
import { missingDocNames, missingRequiredDocs, SUPPORTING_DOCS } from "@/lib/supporting-docs";
import type { LpkStudentRecord } from "@/types/lpk-student";

const CV_EXPORT_ID = "fti-student-cv-export";

function isRegulerAsal(asal: string | undefined): boolean {
  const value = (asal || "").trim().toLowerCase();
  if (!value || value === "fti" || value === "mandiri") return true;
  return value.includes("flora talent");
}

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

  const docs = SUPPORTING_DOCS.map((doc) => ({
    label: doc.label,
    value: String(student[doc.studentKey] ?? ""),
  }));

  const handleExport = () => {
    const fileName = studentFileName("CV", student.nama_lengkap);
    void exportCVToPDF(CV_EXPORT_ID, fileName);
  };

  const saveCvNote = (patch: Pick<LpkStudentRecord, "tujuan_ke_jepang" | "komentar_pewawancara">) => {
    const next = { ...student, ...patch };
    upsertLpkStudent(next);
    upsertFtiDataSiswaFromLpkStudent(next);
    setStudent(next);
    toast.success("CV diperbarui");
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
          {isRegulerAsal(student.asal_lpk) && missingRequiredDocs(student).length > 0 ? (
            <div className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-semibold">Dokumen pendukung belum diunggah.</p>
              <p className="mt-1">{missingDocNames(missingRequiredDocs(student))}</p>
            </div>
          ) : null}
          <CvNoteEditor
            tujuan={student.tujuan_ke_jepang ?? ""}
            komentar={student.komentar_pewawancara ?? ""}
            onSave={saveCvNote}
          />
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
            <section className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden md:col-span-2">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600">Dokumen Diri</h2>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-3">
                {docs.map((d) => (
                  <li
                    key={d.label}
                    className="flex items-center justify-between gap-3 border-b border-r border-gray-100 px-6 py-3 text-sm"
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

function CvNoteEditor({
  tujuan,
  komentar,
  onSave,
}: {
  tujuan: string;
  komentar: string;
  onSave: (patch: Pick<LpkStudentRecord, "tujuan_ke_jepang" | "komentar_pewawancara">) => void;
}) {
  const [goal, setGoal] = useState(tujuan);
  const [comment, setComment] = useState(komentar);
  useEffect(() => setGoal(tujuan), [tujuan]);
  useEffect(() => setComment(komentar), [komentar]);
  const dirty = goal !== tujuan || comment !== komentar;

  return (
    <section className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600">Edit CV</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4 px-6 py-5">
        <label className="block text-sm">
          <span className="font-medium text-gray-700">日本での目標 / Tujuan ke Jepang</span>
          <textarea
            value={goal}
            rows={5}
            onChange={(event) => setGoal(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-gray-700">コメント / Komentar pewawancara</span>
          <textarea
            value={comment}
            rows={5}
            onChange={(event) => setComment(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-gray-400">Hanya diisi FTI. Tidak muncul di form siswa atau LPK mitra.</span>
        </label>
      </div>
      <div className="px-6 pb-5">
        <button
          type="button"
          disabled={!dirty}
          onClick={() => onSave({ tujuan_ke_jepang: goal, komentar_pewawancara: comment })}
          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
        >
          Simpan
        </button>
      </div>
    </section>
  );
}
