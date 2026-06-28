"use client";

import { useMemo, useState } from "react";
import { Eye, Info, Pencil } from "lucide-react";
import StickyHorizontalScroll from "@/components/StickyHorizontalScroll";
import LpkCvPreviewModal from "@/app/lpk-mitra/components/LpkCvPreviewModal";
import AlumniFullDataModal from "@/components/fti/AlumniFullDataModal";
import AlumniTableEditModal from "@/components/fti/AlumniTableEditModal";
import { SiswaTh, SiswaTd, cell } from "@/app/lpk-mitra/components/table-helpers";
import {
  fmtJalurPendaftaran,
  getKota,
  getNamaPerusahaan,
  getPrefektur,
  statusSiswaColor,
  statusSiswaLabel,
} from "@/lib/alumni-display-utils";
import type { LpkStudentRecord } from "@/types/lpk-student";

type Props = {
  students: LpkStudentRecord[];
  onSave?: (updated: LpkStudentRecord) => void;
  emptyMessage?: string;
  allowDownload?: boolean;
};

export default function AlumniDataTable({
  students,
  onSave,
  emptyMessage = "Belum ada alumni.",
  allowDownload = true,
}: Props) {
  const [editStudent, setEditStudent] = useState<LpkStudentRecord | null>(null);
  const [fullDataStudent, setFullDataStudent] = useState<LpkStudentRecord | null>(null);
  const [cvPreviewStudent, setCvPreviewStudent] = useState<LpkStudentRecord | null>(null);

  const rows = useMemo(() => students, [students]);

  const handleSave = (updated: LpkStudentRecord) => {
    onSave?.(updated);
    setEditStudent(null);
  };

  if (rows.length === 0) {
    return (
      <div className="py-20 text-center bg-white border border-gray-200/60 shadow-sm">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200/60 relative shadow-sm">
        <StickyHorizontalScroll>
          <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <SiswaTh jp="プログラム" id="Program" sticky="sticky left-0 z-20 min-w-[140px] bg-gray-100" />
                <SiswaTh jp="写真" id="Foto" sticky="sticky left-[140px] z-20 min-w-[80px] bg-gray-100" />
                <SiswaTh
                  jp="実習生本名"
                  id="Nama Peserta"
                  sticky="sticky left-[220px] z-20 min-w-[200px] bg-gray-100 shadow-[4px_0_10px_rgba(0,0,0,0.05)]"
                />
                <SiswaTh jp="登録ルート" id="Jalur Pendaftaran" className="min-w-[150px] bg-gray-100" />
                <SiswaTh jp="学生のステータス" id="Status Siswa" className="min-w-[180px] bg-gray-100" />
                <SiswaTh jp="履歴書" id="Preview CV" cv className="text-center min-w-[100px]" />
                <SiswaTh jp="会社名" id="Nama Perusahaan" className="min-w-[180px] bg-gray-100" />
                <SiswaTh jp="都道府県" id="Prefektur" className="min-w-[140px] bg-gray-100" />
                <SiswaTh jp="市区町村" id="Kota" className="min-w-[140px] bg-gray-100" />
                <SiswaTh jp="詳細データ" id="Data Lengkap" className="text-center min-w-[100px] bg-gray-100" />
                <th className="px-4 py-4 font-semibold border border-gray-200 sticky right-0 bg-gray-100 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] text-center text-xs uppercase z-20">
                  アクション
                  <br />
                  <span className="text-[10px] text-gray-500 normal-case font-medium">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="bg-white hover:bg-slate-50 transition-colors group">
                  <SiswaTd sticky="sticky left-0" className="text-xs">
                    <span className="font-medium text-primary-pink">{cell(s.jenis_pekerjaan)}</span>
                  </SiswaTd>
                  <SiswaTd sticky="sticky left-[140px]">
                    <div className="w-9 aspect-[3/4] bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center mx-auto">
                      {s.foto ? (
                        <img src={s.foto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-[10px]">—</span>
                      )}
                    </div>
                  </SiswaTd>
                  <SiswaTd
                    sticky="sticky left-[220px] shadow-[4px_0_10px_rgba(0,0,0,0.02)]"
                    className="font-medium text-gray-800"
                  >
                    {s.nama_lengkap}
                  </SiswaTd>
                  <SiswaTd>
                    <span className="font-medium text-primary-pink">{fmtJalurPendaftaran(s.asal_lpk)}</span>
                  </SiswaTd>
                  <SiswaTd className="text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-[10px] font-semibold border ${statusSiswaColor(s.status)}`}
                    >
                      {statusSiswaLabel(s.status)}
                    </span>
                  </SiswaTd>
                  <SiswaTd cv className="text-center">
                    <button
                      type="button"
                      onClick={() => setCvPreviewStudent(s)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-pink bg-primary-pink-light border border-primary-pink/30 hover:bg-primary-pink/20"
                      title="Preview CV"
                    >
                      <Eye size={14} />
                      Lihat
                    </button>
                  </SiswaTd>
                  <SiswaTd>{cell(getNamaPerusahaan(s))}</SiswaTd>
                  <SiswaTd>{cell(getPrefektur(s))}</SiswaTd>
                  <SiswaTd>{cell(getKota(s))}</SiswaTd>
                  <SiswaTd className="text-center">
                    <button
                      type="button"
                      onClick={() => setFullDataStudent(s)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-500 border border-gray-300 hover:border-primary-pink hover:text-primary-pink hover:bg-primary-pink-light transition-colors"
                      title="Lihat data lengkap"
                    >
                      <Info size={16} strokeWidth={2.5} />
                    </button>
                  </SiswaTd>
                  <td className="px-4 py-4 border border-gray-200 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] text-center z-10">
                    <button
                      type="button"
                      onClick={() => setEditStudent(s)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 hover:border-primary-pink hover:text-primary-pink"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </StickyHorizontalScroll>
      </div>

      {editStudent && onSave && (
        <AlumniTableEditModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSave={handleSave}
        />
      )}
      {fullDataStudent && (
        <AlumniFullDataModal
          student={fullDataStudent}
          onClose={() => setFullDataStudent(null)}
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
    </>
  );
}
