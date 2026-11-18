"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Download, Pencil, X } from "lucide-react";
import StickyHorizontalScroll from "@/components/StickyHorizontalScroll";
import TablePagination from "@/components/TablePagination";
import { useFitViewportScroll } from "@/hooks/useFitViewportScroll";
import { STUDENT_TABLE_PAGE, useTablePagination } from "@/hooks/useTablePagination";
import DocumentPreviewModal from "@/components/lpk/DocumentPreviewModal";
import LpkStudentEditModal from "@/app/lpk-mitra/components/LpkStudentEditModal";
import { CertificateDataModal, PersonalDataModal } from "@/app/lpk-mitra/components/SubDataModals";
import { cell, fmtGender } from "@/app/lpk-mitra/components/table-helpers";
import { cn } from "@/lib/cn";
import { docShortLabel, missingRequiredDocs } from "@/lib/supporting-docs";
import { seedJobsIfEmpty } from "@/lib/job-storage";
import { hasilLabel, namaPengirim, programLabel } from "@/lib/placement";
import { studentFileName } from "@/lib/student-file-name";
import type { Job } from "@/types";
import type { LpkStudentRecord } from "@/types/lpk-student";

const LINK_BTN =
  "px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors border border-blue-200 rounded-sm";
const EDIT_BTN =
  "flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-lg transition-colors border border-blue-100";

function MissingDocsMark({ names }: { names: string[] }) {
  const markRef = useRef<HTMLSpanElement>(null);
  const [tip, setTip] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!tip) return;
    const hide = () => setTip(null);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [tip]);

  const show = () => {
    const box = markRef.current?.getBoundingClientRect();
    if (!box) return;
    const width = 240;
    const left = box.right + 8 + width > window.innerWidth ? box.left - width - 8 : box.right + 8;
    setTip({
      top: box.top + box.height / 2,
      left: Math.max(8, left),
    });
  };

  return (
    <>
      <span
        ref={markRef}
        className="ml-1.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold leading-none text-amber-700"
        aria-label={`Belum upload: ${names.join(", ")}`}
        onMouseEnter={show}
        onMouseLeave={() => setTip(null)}
        onFocus={show}
        onBlur={() => setTip(null)}
        tabIndex={0}
      >
        !
      </span>
      {tip &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[80] w-max max-w-[240px] border border-amber-200 bg-white px-3 py-2 text-left shadow-lg"
            style={{
              top: tip.top,
              left: tip.left,
              transform: "translateY(-50%)",
            }}
          >
            <p className="text-[11px] font-semibold text-amber-800">Belum upload</p>
            <ul className="m-0 mt-1 list-none space-y-0.5 p-0 text-[11px] font-medium leading-snug text-gray-700">
              {names.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </>
  );
}

function ColHead({ jp, id, className }: { jp: string; id?: string; className?: string }) {
  return (
    <th scope="col" className={cn("px-4 py-4 font-semibold border-b border-gray-200", className)}>
      {jp}
      {id ? (
        <>
          <br />
          <span className="text-[10px] text-gray-500 normal-case">{id}</span>
        </>
      ) : null}
    </th>
  );
}

function Col({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-4 text-gray-600", className)}>{children}</td>;
}

type Props = {
  students: LpkStudentRecord[];
  onSave?: (updated: LpkStudentRecord) => void;
  emptyMessage?: string;
};

/** Tabel profil siswa FTI, disalin dari profil siswa jukyu. Header halaman tetap milik FTI. */
export default function FtiProfilSiswaTable({
  students,
  onSave,
  emptyMessage = "Belum ada data siswa.",
}: Props) {
  const [editStudent, setEditStudent] = useState<LpkStudentRecord | null>(null);
  const [historyFor, setHistoryFor] = useState<LpkStudentRecord | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [photoStudent, setPhotoStudent] = useState<LpkStudentRecord | null>(null);
  const [docStudent, setDocStudent] = useState<LpkStudentRecord | null>(null);
  const [mcuStudent, setMcuStudent] = useState<LpkStudentRecord | null>(null);
  const [certStudent, setCertStudent] = useState<LpkStudentRecord | null>(null);

  const rows = useMemo(() => students, [students]);
  const {
    paginatedItems,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    rangeStart,
    rangeEnd,
    minPageSize,
    presetPageSizes,
    isCustomPageSize,
    setCurrentPage,
    setPageSize,
    setIsCustomPageSize,
  } = useTablePagination(rows, STUDENT_TABLE_PAGE);
  const tableFit = useFitViewportScroll(rows.length > 0);

  useEffect(() => {
    setJobs(seedJobsIfEmpty());
  }, []);

  const history = historyFor
    ? jobs.filter((job) => job.assignedStudentIds?.includes(historyFor.id))
    : [];

  const handleSave = (updated: LpkStudentRecord) => {
    onSave?.(updated);
    setEditStudent(null);
  };

  return (
    <>
      <div className="profil-siswa-jukyu bg-white border border-gray-300 relative z-10 shadow-sm" style={{ zoom: "90%" }}>
        {rows.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          <>
        <StickyHorizontalScroll ref={tableFit.scrollerRef} maxHeight={tableFit.maxHeight}>
          <table className="admin-data-table w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-30">
              <tr>
                <ColHead jp="NO" className="border-r bg-gray-100 sticky left-0 z-20 min-w-[60px]" />
                <ColHead jp="実習生番号" id="ID Peserta" className="border-r bg-gray-100 sticky left-[60px] z-20 min-w-[140px]" />
                <ColHead jp="写真" id="Foto" className="border-r bg-gray-100 sticky left-[200px] z-20 min-w-[80px]" />
                <ColHead jp="実習生本名" id="Nama Peserta Magang" className="border-r bg-gray-100 sticky left-[280px] z-20 min-w-[200px] admin-sticky-split-right" />
                <ColHead jp="クラス" id="Kelas" />
                <ColHead jp="プログラム" id="Program" />
                <ColHead jp="職種・作業" id="Job" />
                <ColHead jp="結果" id="Hasil" />
                <ColHead jp="履歴" id="Riwayat" />
                <ColHead jp="生年月日" id="Tgl Lahir" />
                <ColHead jp="性別" id="Jenis Kelamin" />
                <ColHead jp="電話番号" id="No. Telepon" />
                <ColHead jp="メール" id="Email" />
                <ColHead jp="元LPK名" id="Asal LPK" />
                <ColHead jp="送出元" id="Nama Pengirim" />
                <ColHead jp="企業名" id="Nama Perusahaan" />
                <ColHead jp="卒業日" id="Tanggal Kelulusan" />
                <ColHead jp="入国予定日" id="Perkiraan Masuk (Jepang)" />
                <ColHead jp="出国日" id="Tanggal Keberangkatan" />
                <ColHead jp="個人データファイル" id="Dokumen" />
                <ColHead jp="健康診断" id="MCU" />
                <ColHead jp="保有資格" id="Sertifikat" />
                <ColHead jp="Aksi" className="sticky right-0 bg-gray-100 admin-sticky-split-left text-center" />
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((s, index) => (
                <tr key={s.id} className="bg-white hover:bg-slate-50 transition-colors group">
                  <Col className="font-medium text-gray-900 border-r bg-white group-hover:bg-slate-50 sticky left-0 z-10 transition-colors">
                    {rangeStart + index}
                  </Col>
                  <Col className="font-semibold text-blue-600 border-r bg-white group-hover:bg-slate-50 sticky left-[60px] z-10 transition-colors">
                    {s.no_peserta}
                  </Col>
                  <Col className="border-r bg-white group-hover:bg-slate-50 sticky left-[200px] z-10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200 shadow-sm flex items-center justify-center group/foto">
                      {s.foto ? (
                        <>
                          <img src={s.foto} alt="Foto" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPhotoStudent(s)}
                            className="absolute inset-0 bg-black/60 hidden group-hover/foto:flex items-center justify-center transition-colors focus:outline-none"
                            title="Lihat Foto"
                          >
                            <span className="text-[9px] font-bold text-white tracking-widest uppercase">View</span>
                          </button>
                        </>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
                      )}
                    </div>
                  </Col>
                  <Col className="font-medium text-gray-800 border-r bg-white group-hover:bg-slate-50 sticky left-[280px] z-10 admin-sticky-split-right transition-colors">
                    <div className="text-[10px] leading-none text-gray-500">{cell(s.nama_katakana)}</div>
                    <span className="mt-1 inline-flex items-center">
                      {s.nama_lengkap}
                      {(() => {
                        const missing = missingRequiredDocs(s);
                        if (!missing.length) return null;
                        return <MissingDocsMark names={missing.map((doc) => docShortLabel(doc.label))} />;
                      })()}
                    </span>
                  </Col>
                  <Col>{cell(s.kelas)}</Col>
                  <Col>{cell(programLabel(s.program))}</Col>
                  <Col>{cell(s.jenis_pekerjaan)}</Col>
                  <Col>{hasilLabel(s.hasil_job)}</Col>
                  <Col>
                    <button type="button" onClick={() => setHistoryFor(s)} className={LINK_BTN}>
                      Riwayat
                    </button>
                  </Col>
                  <Col>{cell(s.tanggal_lahir)}</Col>
                  <Col>{fmtGender(s.jenis_kelamin)}</Col>
                  <Col>{cell(s.telepon)}</Col>
                  <Col>{cell(s.email)}</Col>
                  <Col>{cell(s.asal_lpk)}</Col>
                  <Col>{cell(namaPengirim(s))}</Col>
                  <Col className="font-medium text-gray-800">{cell(s.nama_perusahaan)}</Col>
                  <Col>{cell(s.tanggal_kelulusan)}</Col>
                  <Col>{cell(s.perkiraan_masuk_jepang)}</Col>
                  <Col>{cell(s.tanggal_keberangkatan)}</Col>
                  <Col>
                    <button type="button" onClick={() => setDocStudent(s)} className={LINK_BTN}>
                      Lihat
                    </button>
                  </Col>
                  <Col>
                    <button type="button" onClick={() => setMcuStudent(s)} className={LINK_BTN}>
                      Lihat
                    </button>
                  </Col>
                  <Col>
                    <button type="button" onClick={() => setCertStudent(s)} className={LINK_BTN}>
                      Lihat
                    </button>
                  </Col>
                  <Col className="sticky right-0 bg-white admin-sticky-split-left group-hover:bg-slate-50 transition-colors">
                    <button type="button" onClick={() => setEditStudent(s)} className={EDIT_BTN} title="Edit Data">
                      <Pencil size={14} /> Edit
                    </button>
                  </Col>
                </tr>
              ))}
            </tbody>
          </table>
        </StickyHorizontalScroll>
        <div ref={tableFit.footerRef}>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          pageSize={pageSize}
          minPageSize={minPageSize}
          presetPageSizes={presetPageSizes}
          isCustomPageSize={isCustomPageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          onCustomModeChange={setIsCustomPageSize}
        />
        </div>
          </>
        )}
      </div>

      {editStudent && onSave && (
        <LpkStudentEditModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSave={handleSave}
          scheduleEditable
          placementEditable
          interviewerCommentEditable
        />
      )}
      {historyFor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-md p-6">
            <h3 className="font-serif text-xl">{historyFor.nama_lengkap}</h3>
            <p className="mt-1 text-xs uppercase tracking-widest text-gray-400">Riwayat matching</p>
            <ul className="mt-4 space-y-2 text-sm">
              {history.length === 0 && <li className="text-gray-500">Belum di-assign ke job.</li>}
              {history.map((job) => (
                <li key={job.id} className="border border-gray-200 px-3 py-2">
                  <p>{job.title}</p>
                  <p className="text-gray-500">Mensetsu: {job.tanggalMansetsu || "—"}</p>
                  <p>Hasil: {job.mensetsuResults?.[historyFor.id] || "belum"}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end">
              <button type="button" className="btn-primary" onClick={() => setHistoryFor(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {docStudent && (
        <PersonalDataModal student={docStudent} onClose={() => setDocStudent(null)} allowDownload />
      )}
      {certStudent && (
        <CertificateDataModal student={certStudent} onClose={() => setCertStudent(null)} allowDownload />
      )}
      {mcuStudent && mcuStudent.mcu_pdf && mcuStudent.mcu_pdf !== "-" ? (
        <DocumentPreviewModal
          label={mcuStudent.mcu && mcuStudent.mcu !== "-" ? `Hasil MCU: ${mcuStudent.mcu}` : "Hasil MCU"}
          filename={mcuStudent.mcu_pdf}
          studentName={mcuStudent.nama_lengkap}
          onClose={() => setMcuStudent(null)}
        />
      ) : mcuStudent ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white p-6">
            <h3 className="font-serif text-xl">{mcuStudent.nama_lengkap}</h3>
            <p className="mt-1 text-xs uppercase tracking-widest text-gray-400">Hasil MCU</p>
            <p className="mt-4 text-sm text-gray-700">{cell(mcuStudent.mcu)}</p>
            <div className="mt-4 flex justify-end">
              <button type="button" className="btn-primary" onClick={() => setMcuStudent(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {photoStudent && photoStudent.foto && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setPhotoStudent(null)} />
          <div className="relative z-10 max-w-sm w-full bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-serif text-gray-800 text-lg">Foto Profil</h3>
              <button type="button" onClick={() => setPhotoStudent(null)} className="p-1 text-gray-500 hover:text-gray-800 transition-colors rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center justify-center bg-gray-100/50">
              <div className="w-48 h-64 border border-gray-200 bg-white overflow-hidden flex items-center justify-center shadow-sm">
                <img src={photoStudent.foto} alt="Foto" className="w-full h-full object-cover" />
              </div>
              <p className="mt-4 font-medium text-gray-900">{photoStudent.nama_lengkap}</p>
              <p className="text-xs text-gray-500">{photoStudent.no_peserta}</p>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <a
                href={photoStudent.foto}
                download={`${studentFileName("Foto", photoStudent.nama_lengkap)}.png`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-xs tracking-widest uppercase font-medium rounded hover:bg-blue-800 transition-colors shadow-sm"
              >
                <Download size={14} /> Download Foto
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
