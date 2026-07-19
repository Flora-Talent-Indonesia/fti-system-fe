"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Info, Pencil } from "lucide-react";
import StickyHorizontalScroll from "@/components/StickyHorizontalScroll";
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

const STICKY_TRACK_INSET = "calc((60px + 140px + 80px + 200px) * 0.9)";
const EDIT_BTN =
  "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#fc809f] hover:text-white bg-[#fc809f]/10 hover:bg-[#fc809f] rounded-lg transition-colors border border-[#fc809f]/20";
const LINK_BTN =
  "px-3 py-1.5 text-xs font-medium text-[#fc809f] bg-[#fc809f]/10 border border-[#fc809f]/20 hover:bg-[#fc809f]/20 rounded-lg transition-colors";

type Props = {
  students: LpkStudentRecord[];
  readOnly?: boolean;
  onSave?: (updated: LpkStudentRecord) => void;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  /** Paksa aktif/nonaktif unduh; default mengikuti sesi Admin FTI */
  allowDownload?: boolean;
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

  const rows = useMemo(() => students, [students]);

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
      <div className="bg-white border border-gray-300 relative z-10 shadow-sm">
        <StickyHorizontalScroll trackInsetLeft={STICKY_TRACK_INSET}>
          <table
            className="admin-data-table w-full text-sm text-left whitespace-nowrap"
            style={{ zoom: "90%" }}
          >
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <SiswaTh jp="NO" id="" sticky="sticky left-0 z-20 min-w-[60px] bg-gray-100" />
                <SiswaTh jp="プログラム" id="Program" sticky="sticky left-[60px] z-20 min-w-[140px] bg-gray-100" />
                <SiswaTh jp="写真" id="Foto" sticky="sticky left-[200px] z-20 min-w-[80px] bg-gray-100" />
                <SiswaTh
                  jp="実習生本名"
                  id="Nama Peserta"
                  sticky="sticky left-[280px] z-20 min-w-[200px] bg-gray-100 admin-sticky-split-right"
                />
                {showJalurPendaftaran && (
                  <SiswaTh jp="登録ルート" id="Jalur Pendaftaran" className="min-w-[150px]" />
                )}
                {showStatusSiswa && (
                  <SiswaTh jp="学生のステータス" id="Status Siswa" className="min-w-[180px]" />
                )}
                <SiswaTh jp="履歴書" id="Preview CV" cv className="text-center min-w-[100px]" />
                <SiswaTh jp="カタカナ" id="Katakana" cv />
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
                {!readOnly && !showStatusSiswa && <SiswaActionTh label="Aksi" />}
              </tr>
            </thead>
            <tbody>
              {rows.map((s, index) => (
                <tr key={s.id} className="bg-white hover:bg-gray-50 transition-colors group">
                  <SiswaTd sticky="sticky left-0" className="font-medium text-gray-900">
                    {index + 1}
                  </SiswaTd>
                  <SiswaTd sticky="sticky left-[60px]" className="text-xs">
                    <span className="font-medium text-[#fc809f]">{cell(s.jenis_pekerjaan)}</span>
                  </SiswaTd>
                  <SiswaTd sticky="sticky left-[200px]">
                    <div className="w-9 aspect-[3/4] bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center mx-auto">
                      {s.foto ? (
                        <img src={s.foto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-[10px]">—</span>
                      )}
                    </div>
                  </SiswaTd>
                  <SiswaTd
                    sticky="sticky left-[280px] admin-sticky-split-right"
                    className="font-medium text-gray-800"
                  >
                    {s.nama_lengkap}
                  </SiswaTd>
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
                  <SiswaTd cv>{cell(s.nama_katakana)}</SiswaTd>
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
                  {!readOnly && !showStatusSiswa && (
                    <SiswaActionTd>
                      <button type="button" onClick={() => setEditStudent(s)} className={EDIT_BTN} title="Edit Data">
                        <Pencil size={14} />
                        Edit
                      </button>
                    </SiswaActionTd>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </StickyHorizontalScroll>
      </div>

      {!readOnly && editStudent && onSave && (
        <LpkStudentEditModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSave={handleSave}
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
