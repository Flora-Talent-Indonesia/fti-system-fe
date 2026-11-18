"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Eye, Info, Pencil, Trash2 } from "lucide-react";
import StickyHorizontalScroll from "@/components/StickyHorizontalScroll";
import TablePagination from "@/components/TablePagination";
import { useFitViewportScroll } from "@/hooks/useFitViewportScroll";
import { STUDENT_TABLE_PAGE, useTablePagination } from "@/hooks/useTablePagination";
import DownloadFileButton from "@/components/lpk/DownloadFileButton";
import { useFtiAdmin } from "@/hooks/use-fti-admin";
import LpkCvPreviewModal from "./LpkCvPreviewModal";
import LpkStudentEditModal from "./LpkStudentEditModal";
import {
  CertificateDataModal,
  ParentDataModal,
  PersonalDataModal,
} from "./SubDataModals";
import { SiswaTh, SiswaTd, SiswaActionTh, SiswaActionTd, cell, fmtGender, fmtMata } from "./table-helpers";
import StudentDetailsModal from "@/components/fti/StudentDetailsModal";
import type { LpkStudentRecord } from "@/types/lpk-student";
import { hasilLabel, namaPengirim, programLabel } from "@/lib/placement";
import { docShortLabel, missingRequiredDocs } from "@/lib/supporting-docs";

const ACTION_ICON =
  "inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-300 bg-rose-50 text-rose-500 transition-colors hover:bg-rose-100";

function SelectAllBox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      aria-label="Pilih semua siswa"
      className="h-4 w-4 accent-[#fc809f]"
    />
  );
}
const LINK_BTN =
  "px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors border border-blue-200 rounded-sm";

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
    setTip({ top: box.top + box.height / 2, left: Math.max(8, left) });
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
            style={{ top: tip.top, left: tip.left, transform: "translateY(-50%)" }}
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

type Props = {
  students: LpkStudentRecord[];
  readOnly?: boolean;
  onSave?: (updated: LpkStudentRecord) => void;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  /** Paksa aktif/nonaktif unduh; default mengikuti sesi Admin FTI */
  allowDownload?: boolean;
  /** Hanya admin FTI. Portal LPK tidak menerima prop ini. */
  allowDelete?: boolean;
  onDelete?: (student: LpkStudentRecord) => void;
  selecting?: boolean;
  selectedIds?: Set<string>;
  onToggleStudent?: (id: string) => void;
  onToggleAll?: (checked: boolean) => void;
  showJalurPendaftaran?: boolean;
  showStatusSiswa?: boolean;
};

export default function LpkSiswaTable({
  students,
  readOnly = false,
  onSave,
  emptyMessage = "Belum ada siswa.",
  emptyAction,
  allowDownload: allowDownloadProp,
  allowDelete = false,
  onDelete,
  selecting = false,
  selectedIds,
  onToggleStudent,
  onToggleAll,
  showJalurPendaftaran = false,
  showStatusSiswa = false,
}: Props) {
  const ftiAdmin = useFtiAdmin();
  const allowDownload = allowDownloadProp ?? ftiAdmin;
  const [editStudent, setEditStudent] = useState<LpkStudentRecord | null>(null);
  const [parentStudent, setParentStudent] = useState<LpkStudentRecord | null>(null);
  const [certStudent, setCertStudent] = useState<LpkStudentRecord | null>(null);
  const [personalStudent, setPersonalStudent] = useState<LpkStudentRecord | null>(null);
  const [cvPreviewStudent, setCvPreviewStudent] = useState<LpkStudentRecord | null>(null);
  const [detailStudent, setDetailStudent] = useState<LpkStudentRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<LpkStudentRecord | null>(null);
  const canDelete = allowDelete && Boolean(onDelete);
  const showRowActions = (!readOnly && !showStatusSiswa) || canDelete;

  const rows = useMemo(() => students, [students]);
  const chosen = selectedIds ?? new Set<string>();
  const selectedOnPage = rows.filter((student) => chosen.has(student.id)).length;
  const allSelected = rows.length > 0 && selectedOnPage === rows.length;
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

  if (rows.length === 0) {
    return (
      <div className="py-20 text-center bg-white border border-gray-300 shadow-sm">
        <p className="text-gray-500 mb-4">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <>
      <div className="profil-siswa-jukyu relative z-10 border border-gray-300 bg-white shadow-sm" style={{ zoom: "90%" }}>
        <StickyHorizontalScroll ref={tableFit.scrollerRef} maxHeight={tableFit.maxHeight}>
          <table className="admin-data-table w-full text-left text-sm whitespace-nowrap">
            <thead className="sticky top-0 z-30 bg-gray-100 text-xs uppercase text-gray-700">
              <tr>
                <SiswaTh jp="NO" id="" sticky="sticky left-0 z-20 min-w-[60px] border-r bg-gray-100" />
                <SiswaTh jp="実習生番号" id="ID Peserta" sticky="sticky left-[60px] z-20 min-w-[140px] border-r bg-gray-100" />
                <SiswaTh jp="プログラム" id="Program" sticky="sticky left-[200px] z-20 min-w-[140px] border-r bg-gray-100" />
                <SiswaTh jp="写真" id="Foto" sticky="sticky left-[340px] z-20 min-w-[80px] border-r bg-gray-100" />
                <SiswaTh
                  jp="実習生本名"
                  id="Nama Peserta"
                  sticky="sticky left-[420px] z-20 min-w-[200px] border-r bg-gray-100 admin-sticky-split-right"
                />
                <SiswaTh jp="送出元" id="Nama Pengirim" className="min-w-[160px]" />
                <SiswaTh jp="企業名" id="Nama Perusahaan" className="min-w-[160px]" />
                <SiswaTh jp="結果" id="Hasil" className="min-w-[120px]" />
                {showJalurPendaftaran && (
                  <SiswaTh jp="登録ルート" id="Jalur Pendaftaran" className="min-w-[150px]" />
                )}
                {showStatusSiswa && (
                  <SiswaTh jp="学生のステータス" id="Status Siswa" className="min-w-[180px]" />
                )}
                <SiswaTh jp="履歴書" id="Preview CV" cv className="text-center min-w-[100px]" />
                <SiswaTh jp="親のデータ" id="Data Orang Tua" cv />
                <SiswaTh jp="呼称" id="Nama Panggilan" cv />
                <SiswaTh jp="国籍" id="Kewarganegaraan" cv />
                <SiswaTh jp="生年月日" id="Tgl Lahir" />
                <SiswaTh jp="年齢" id="Usia" />
                <SiswaTh jp="性別" id="Jenis Kelamin" />
                <SiswaTh jp="血液型" id="Gol. Darah" cv />
                <SiswaTh jp="婚姻" id="Status Pernikahan" />
                <SiswaTh jp="宗教" id="Agama" />
                <SiswaTh jp="出生地" id="Asal (Tempat Lahir)" />
                <SiswaTh jp="住所" id="Alamat" />
                <SiswaTh jp="郵便番号" id="Kode Pos" cv />
                <SiswaTh jp="電話番号" id="No. Telepon" cv />
                <SiswaTh jp="メール" id="Email" cv />
                <SiswaTh jp="健康診断" id="File MCU" />
                <SiswaTh jp="体重" id="Berat Badan" />
                <SiswaTh jp="身長" id="Tinggi Badan" />
                <SiswaTh jp="視力" id="Mata (Kiri/Kanan)" cv />
                <SiswaTh jp="眼鏡" id="Kacamata" cv />
                <SiswaTh jp="刺青" id="Tato" cv />
                <SiswaTh jp="喫煙" id="Merokok" cv />
                <SiswaTh jp="色盲" id="Buta Warna" cv />
                <SiswaTh jp="骨折歴" id="Patah Tulang" cv />
                <SiswaTh jp="趣味" id="Hobi" />
                <SiswaTh jp="学習レベル" id="Tingkatan Pembelajaran" />
                <SiswaTh jp="保有資格" id="Sertifikat Dimiliki" cv />
                <SiswaTh jp="入学日" id="Tanggal Masuk Pelatihan" />
                <SiswaTh jp="卒業日" id="Tanggal Kelulusan" />
                <SiswaTh jp="入国予定日" id="Perkiraan Masuk (Jepang)" />
                <SiswaTh jp="出国日" id="Tanggal Keberangkatan" />
                <SiswaTh jp="個人データファイル" id="File Data Diri" cv />
                {showStatusSiswa && <SiswaActionTh jp="アクション" label="Action" />}
                {showRowActions && (
                  <SiswaActionTh
                    label="Aksi"
                    leading={
                      selecting ? (
                        <SelectAllBox
                          checked={allSelected}
                          indeterminate={selectedOnPage > 0 && !allSelected}
                          onChange={(checked) => onToggleAll?.(checked)}
                        />
                      ) : undefined
                    }
                  />
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((s, index) => (
                <tr key={s.id} className="bg-white transition-colors hover:bg-slate-50 group">
                  <SiswaTd sticky="sticky left-0" className="font-medium text-gray-900">
                    {rangeStart + index}
                  </SiswaTd>
                  <SiswaTd sticky="sticky left-[60px]" className="font-medium text-gray-800">
                    {cell(s.no_peserta)}
                  </SiswaTd>
                  <SiswaTd sticky="sticky left-[200px]" className="text-xs">
                    <div>{programLabel(s.program) || "—"}</div>
                    <span className="font-medium text-[#fc809f]">{cell(s.jenis_pekerjaan)}</span>
                  </SiswaTd>
                  <SiswaTd sticky="sticky left-[340px]">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 shadow-sm">
                      {s.foto ? (
                        <img src={s.foto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-[10px]">—</span>
                      )}
                    </div>
                  </SiswaTd>
                  <SiswaTd
                    sticky="sticky left-[420px] admin-sticky-split-right"
                    className="font-medium text-gray-800"
                  >
                    <div className="text-[10px] leading-none text-gray-500">{cell(s.nama_katakana)}</div>
                    <span className="mt-1 inline-flex items-center">
                      {s.nama_lengkap}
                      {(() => {
                        const missing = missingRequiredDocs(s);
                        if (!missing.length) return null;
                        return <MissingDocsMark names={missing.map((doc) => docShortLabel(doc.label))} />;
                      })()}
                    </span>
                  </SiswaTd>
                  <SiswaTd>{cell(namaPengirim(s))}</SiswaTd>
                  <SiswaTd>{cell(s.nama_perusahaan)}</SiswaTd>
                  <SiswaTd>{hasilLabel(s.hasil_job)}</SiswaTd>
                  {showJalurPendaftaran && (
                    <SiswaTd>
                      <span className="font-medium text-[#fc809f]">
                        {!s.asal_lpk ||
                        s.asal_lpk.toLowerCase() === "fti" ||
                        s.asal_lpk.toLowerCase() === "mandiri"
                          ? "Mandiri"
                          : s.asal_lpk}
                      </span>
                    </SiswaTd>
                  )}
                  {showStatusSiswa && (
                    <SiswaTd className="text-center">
                      {(() => {
                        let label = "Tidak Lulus";
                        let colorClass = "bg-red-50 text-red-700 border-red-200";
                        if (s.status === "match_job") {
                          label = "Sudah Lulus";
                          colorClass = "bg-green-50 text-green-700 border-green-200";
                        } else if (s.status === "aktif") {
                          label = "Sedang Dalam Pembelajaran";
                          colorClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
                        }

                        return (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-[10px] font-semibold border ${colorClass}`}
                          >
                            {label}
                          </span>
                        );
                      })()}
                    </SiswaTd>
                  )}
                  <SiswaTd cv className="text-center">
                    <button
                      type="button"
                      onClick={() => setCvPreviewStudent(s)}
                      className={`inline-flex items-center gap-1 ${LINK_BTN}`}
                      title="Preview CV"
                    >
                      <Eye size={14} />
                      Lihat
                    </button>
                  </SiswaTd>
                  <SiswaTd cv>
                    <button type="button" onClick={() => setParentStudent(s)} className={LINK_BTN}>
                      Lihat Data
                    </button>
                  </SiswaTd>
                  <SiswaTd cv>{cell(s.nama_panggilan)}</SiswaTd>
                  <SiswaTd cv>{cell(s.kewarganegaraan)}</SiswaTd>
                  <SiswaTd>{cell(s.tanggal_lahir)}</SiswaTd>
                  <SiswaTd>{cell(s.umur)}</SiswaTd>
                  <SiswaTd>{fmtGender(s.jenis_kelamin)}</SiswaTd>
                  <SiswaTd cv className="font-semibold">
                    {cell(s.golongan_darah)}
                  </SiswaTd>
                  <SiswaTd>{cell(s.status_pernikahan)}</SiswaTd>
                  <SiswaTd>{cell(s.agama)}</SiswaTd>
                  <SiswaTd>{cell(s.asal)}</SiswaTd>
                  <SiswaTd className="max-w-[200px] truncate">{cell(s.alamat)}</SiswaTd>
                  <SiswaTd cv>{cell(s.kode_pos)}</SiswaTd>
                  <SiswaTd cv>{cell(s.telepon)}</SiswaTd>
                  <SiswaTd cv>{cell(s.email)}</SiswaTd>
                  <SiswaTd>
                    {allowDownload ? (
                      <DownloadFileButton filename={s.mcu_pdf} studentName={s.nama_lengkap} />
                    ) : (
                      cell(s.mcu_pdf)
                    )}
                  </SiswaTd>
                  <SiswaTd>{cell(s.berat_badan)}</SiswaTd>
                  <SiswaTd>{cell(s.tinggi_badan)}</SiswaTd>
                  <SiswaTd cv>{fmtMata(s.mata_kiri, s.mata_kanan)}</SiswaTd>
                  <SiswaTd cv>{cell(s.berkacamata)}</SiswaTd>
                  <SiswaTd cv>{cell(s.tato)}</SiswaTd>
                  <SiswaTd cv>{cell(s.merokok)}</SiswaTd>
                  <SiswaTd cv>{cell(s.buta_warna)}</SiswaTd>
                  <SiswaTd cv>{cell(s.patah_tulang)}</SiswaTd>
                  <SiswaTd>{cell(s.hobi)}</SiswaTd>
                  <SiswaTd>{cell(s.tingkatan_pembelajaran)}</SiswaTd>
                  <SiswaTd cv>
                    <button type="button" onClick={() => setCertStudent(s)} className={LINK_BTN}>
                      Lihat
                    </button>
                  </SiswaTd>
                  <SiswaTd>{cell(s.tanggal_masuk_pelatihan)}</SiswaTd>
                  <SiswaTd>{cell(s.tanggal_kelulusan)}</SiswaTd>
                  <SiswaTd>{cell(s.perkiraan_masuk_jepang)}</SiswaTd>
                  <SiswaTd>{cell(s.tanggal_keberangkatan)}</SiswaTd>
                  <SiswaTd cv>
                    <button type="button" onClick={() => setPersonalStudent(s)} className={LINK_BTN}>
                      Lihat File
                    </button>
                  </SiswaTd>
                  {showStatusSiswa && (
                    <SiswaActionTd>
                      <button
                        type="button"
                        onClick={() => setDetailStudent(s)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-500 border border-gray-300 hover:border-[#fc809f] hover:text-[#fc809f] hover:bg-[#fc809f]/10 transition-colors"
                        title="Lihat Detail Siswa"
                      >
                        <Info size={16} strokeWidth={2.5} />
                      </button>
                    </SiswaActionTd>
                  )}
                  {showRowActions && (
                    <SiswaActionTd>
                      <div className="flex items-center justify-center gap-2">
                        {selecting && (
                          <input
                            type="checkbox"
                            checked={chosen.has(s.id)}
                            onChange={() => onToggleStudent?.(s.id)}
                            aria-label={`Pilih ${s.nama_lengkap}`}
                            className="h-4 w-4 accent-[#fc809f]"
                          />
                        )}
                        {!readOnly && !showStatusSiswa && (
                          <button type="button" onClick={() => setEditStudent(s)} className={ACTION_ICON} title="Edit" aria-label="Edit">
                            <Pencil size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => setPendingDelete(s)}
                            className={ACTION_ICON}
                            title="Hapus"
                            aria-label="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </SiswaActionTd>
                  )}
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
          showPageNumbers={false}
        />
        </div>
      </div>

      {!readOnly && editStudent && onSave && (
        <LpkStudentEditModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSave={handleSave}
          scheduleEditable={ftiAdmin}
          interviewerCommentEditable={ftiAdmin}
        />
      )}
      {parentStudent && (
        <ParentDataModal student={parentStudent} onClose={() => setParentStudent(null)} />
      )}
      {certStudent && (
        <CertificateDataModal
          student={certStudent}
          onClose={() => setCertStudent(null)}
          allowDownload={allowDownload}
        />
      )}
      {personalStudent && (
        <PersonalDataModal
          student={personalStudent}
          onClose={() => setPersonalStudent(null)}
          allowDownload={allowDownload}
        />
      )}
      {cvPreviewStudent && (
        <LpkCvPreviewModal
          student={cvPreviewStudent}
          onClose={() => setCvPreviewStudent(null)}
          allowDownload={allowDownload}
        />
      )}
      {detailStudent && (
        <StudentDetailsModal
          student={detailStudent}
          onClose={() => setDetailStudent(null)}
        />
      )}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white border border-gray-200 shadow-2xl p-6">
            <h2 className="text-lg font-serif text-gray-900 mb-2">Hapus data siswa?</h2>
            <p className="text-sm text-gray-600 mb-6">
              <strong>{pendingDelete.nama_lengkap}</strong> akan dihapus dari data LPK Mitra.
              Tindakan ini hanya tersedia untuk admin FTI.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-gray-300 text-gray-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete?.(pendingDelete);
                  setPendingDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-red-600 text-white"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function LpkSiswaEmptyAction() {
  return (
    <Link href="/lpk-mitra/siswa/tambah" className="btn-primary inline-block">
      Tambah Siswa
    </Link>
  );
}
