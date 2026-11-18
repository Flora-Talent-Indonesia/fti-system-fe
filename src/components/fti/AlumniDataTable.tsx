"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Download, Pencil, X } from "lucide-react";
import StickyHorizontalScroll from "@/components/StickyHorizontalScroll";
import TablePagination from "@/components/TablePagination";
import { useFitViewportScroll } from "@/hooks/useFitViewportScroll";
import { STUDENT_TABLE_PAGE, useTablePagination } from "@/hooks/useTablePagination";
import AlumniTableEditModal from "@/components/fti/AlumniTableEditModal";
import { cell, fmtGender } from "@/app/lpk-mitra/components/table-helpers";
import { cn } from "@/lib/cn";
import { estimasiPulang, simJepangLabel } from "@/lib/placement";
import { studentFileName } from "@/lib/student-file-name";
import type { LpkStudentRecord } from "@/types/lpk-student";

const EDIT_BTN =
  "flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-lg transition-colors border border-blue-100";

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

function Col({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-4 text-gray-600", className)}>{children}</td>;
}

function getSekolahNama(s: LpkStudentRecord): string {
  return s.pendidikan?.[0]?.nama_sekolah?.trim() || s.alamat || "";
}

function StatusPill({ value }: { value?: string | null }) {
  const v = (value || "").trim();
  if (!v || v === "-") return <span className="text-gray-400">-</span>;
  const lower = v.toLowerCase();
  if (lower === "lulus" || lower === "done" || lower === "ok") {
    return (
      <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold border bg-green-50 text-green-700 border-green-200">
        {v}
      </span>
    );
  }
  if (lower === "proses" || lower === "pending") {
    return (
      <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
        {v}
      </span>
    );
  }
  return <span className="text-gray-700 text-xs font-medium">{v}</span>;
}

const STICKY =
  "border-r bg-white group-hover:bg-slate-50 sticky z-10 transition-colors";

type Props = {
  students: LpkStudentRecord[];
  onSave?: (updated: LpkStudentRecord) => void;
  emptyMessage?: string;
};

/**
 * Kolom Data Alumni tetap kolom tracking.
 * Bentuk tabel mengikuti daftar siswa FTI.
 */
export default function AlumniDataTable({
  students,
  onSave,
  emptyMessage = "Belum ada alumni.",
}: Props) {
  const [editStudent, setEditStudent] = useState<LpkStudentRecord | null>(null);
  const [photoStudent, setPhotoStudent] = useState<LpkStudentRecord | null>(null);

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

  const handleSave = (updated: LpkStudentRecord) => {
    onSave?.(updated);
    setEditStudent(null);
  };

  return (
    <>
      <div className="profil-siswa-jukyu relative z-10 border border-gray-300 bg-white shadow-sm" style={{ zoom: "90%" }}>
        {rows.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          <>
            <StickyHorizontalScroll ref={tableFit.scrollerRef} maxHeight={tableFit.maxHeight}>
              <table className="admin-data-table w-full text-left text-sm whitespace-nowrap">
                <thead className="sticky top-0 z-30 bg-gray-100 text-xs uppercase text-gray-700">
                  <tr>
                    <ColHead jp="NO" className="sticky left-0 z-20 min-w-[60px] border-r bg-gray-100" />
                    <ColHead jp="写真" id="Foto" className="sticky left-[60px] z-20 min-w-[80px] border-r bg-gray-100" />
                    <ColHead jp="氏名" id="Nama" className="sticky left-[140px] z-20 min-w-[200px] border-r bg-gray-100 admin-sticky-split-right" />
                    <ColHead jp="フリガナ" id="Furigana" />
                    <ColHead jp="TSK" />
                    <ColHead jp="日付" id="Tgl Rekrut" />
                    <ColHead jp="性別" id="Gender" />
                    <ColHead jp="学校名" id="Alamat" />
                    <ColHead jp="面接日" id="Mensetsu" />
                    <ColHead jp="内定日" id="Naitei" />
                    <ColHead jp="JFT BASIC A2" className="text-center" />
                    <ColHead jp="SSW IDN" className="text-center" />
                    <ColHead jp="SSW JPN" className="text-center" />
                    <ColHead jp="LPK" />
                    <ColHead jp="出身" id="Asal Kota" />
                    <ColHead jp="PHONE" id="Number" />
                    <ColHead jp="EMAIL" />
                    <ColHead jp="NO PASPOR" />
                    <ColHead jp="VISA" id="Tanggal" />
                    <ColHead jp="COE" id="Tanggal" />
                    <ColHead jp="EKTKLN" id="Tanggal" />
                    <ColHead jp="DEPARTURE" id="Tanggal" />
                    <ColHead jp="N3" />
                    <ColHead jp="免許" id="SIM Jepang" />
                    <ColHead jp="帰国" id="Estimasi pulang" />
                    <ColHead jp="Aksi" className="sticky right-0 bg-gray-100 text-center admin-sticky-split-left" />
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((s, index) => (
                    <tr key={s.id} className="group bg-white transition-colors hover:bg-slate-50">
                      <Col className={cn(STICKY, "left-0 font-medium text-gray-900")}>{rangeStart + index}</Col>
                      <Col className={cn(STICKY, "left-[60px]")}>
                        <div className="group/foto relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 shadow-sm">
                          {s.foto ? (
                            <>
                              <img src={s.foto} alt="Foto" className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setPhotoStudent(s)}
                                className="absolute inset-0 hidden items-center justify-center bg-black/60 group-hover/foto:flex"
                                title="Lihat Foto"
                              >
                                <span className="text-[9px] font-bold uppercase tracking-widest text-white">View</span>
                              </button>
                            </>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
                          )}
                        </div>
                      </Col>
                      <Col className={cn(STICKY, "left-[140px] font-medium text-gray-800 admin-sticky-split-right")}>
                        {s.nama_lengkap}
                      </Col>
                      <Col>{cell(s.nama_katakana)}</Col>
                      <Col>{cell(s.tsk)}</Col>
                      <Col>{cell(s.tanggal_rekrut)}</Col>
                      <Col>{fmtGender(s.jenis_kelamin)}</Col>
                      <Col className="max-w-[220px] truncate">{cell(getSekolahNama(s))}</Col>
                      <Col>{cell(s.tanggal_mensetsu)}</Col>
                      <Col>{cell(s.tanggal_naitei)}</Col>
                      <Col className="text-center"><StatusPill value={s.cert_jft_basic_a2} /></Col>
                      <Col className="text-center"><StatusPill value={s.cert_ssw_idn} /></Col>
                      <Col className="text-center"><StatusPill value={s.cert_ssw_jpn} /></Col>
                      <Col>{cell(s.asal_lpk)}</Col>
                      <Col>{cell(s.asal)}</Col>
                      <Col>{cell(s.telepon)}</Col>
                      <Col>{cell(s.email)}</Col>
                      <Col className="font-mono text-xs">{cell(s.dokumen_paspor)}</Col>
                      <Col>{cell(s.dokumen_visa)}</Col>
                      <Col>{cell(s.dokumen_coe)}</Col>
                      <Col>{cell(s.dokumen_ektkln)}</Col>
                      <Col>{cell(s.tanggal_keberangkatan)}</Col>
                      <Col>{cell(s.n3)}</Col>
                      <Col>{cell(simJepangLabel(s.sim_jepang))}</Col>
                      <Col>{cell(estimasiPulang(s))}</Col>
                      <Col className="sticky right-0 bg-white transition-colors admin-sticky-split-left group-hover:bg-slate-50">
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
        <AlumniTableEditModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSave={handleSave}
        />
      )}
      {photoStudent && photoStudent.foto && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setPhotoStudent(null)} />
          <div className="relative z-10 flex w-full max-w-sm flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-4">
              <h3 className="font-serif text-lg text-gray-800">Foto Profil</h3>
              <button type="button" onClick={() => setPhotoStudent(null)} className="rounded p-1 text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center bg-gray-100/50 p-6">
              <div className="flex h-64 w-48 items-center justify-center overflow-hidden border border-gray-200 bg-white shadow-sm">
                <img src={photoStudent.foto} alt="Foto" className="h-full w-full object-cover" />
              </div>
              <p className="mt-4 font-medium text-gray-900">{photoStudent.nama_lengkap}</p>
              <p className="text-xs text-gray-500">{photoStudent.no_peserta}</p>
            </div>
            <div className="flex justify-end border-t border-gray-100 bg-gray-50 p-4">
              <a
                href={photoStudent.foto}
                download={`${studentFileName("Foto", photoStudent.nama_lengkap)}.png`}
                className="inline-flex items-center gap-2 rounded bg-blue-700 px-4 py-2 text-xs font-medium uppercase tracking-widest text-white shadow-sm hover:bg-blue-800"
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
