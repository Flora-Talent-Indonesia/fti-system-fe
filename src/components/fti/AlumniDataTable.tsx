"use client";

import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import StickyHorizontalScroll from "@/components/StickyHorizontalScroll";
import AlumniTableEditModal from "@/components/fti/AlumniTableEditModal";
import {
  SiswaTh,
  SiswaTd,
  SiswaActionTh,
  SiswaActionTd,
  cell,
  fmtGender,
} from "@/app/lpk-mitra/components/table-helpers";
import type { LpkStudentRecord } from "@/types/lpk-student";

const STICKY_TRACK_INSET = "calc((60px + 80px + 200px) * 0.9)";
const EDIT_BTN =
  "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#fc809f] hover:text-white bg-[#fc809f]/10 hover:bg-[#fc809f] rounded-lg transition-colors border border-[#fc809f]/20";

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

type Props = {
  students: LpkStudentRecord[];
  onSave?: (updated: LpkStudentRecord) => void;
  emptyMessage?: string;
};

/**
 * Kolom Data Alumni — mengikuti sheet tracking:
 * NO, Foto, Nama, Furigana, TSK, Tgl Rekrut, Gender, Sekolah/Alamat, Mensetsu, Naitei,
 * Certificates (JFT / SSW IDN / SSW JPN), LPK, Asal, Phone, Email,
 * No Paspor, Visa (tgl), COE (tgl), EKTKLN (tgl), Departure (tgl) + Action
 */
export default function AlumniDataTable({
  students,
  onSave,
  emptyMessage = "Belum ada alumni.",
}: Props) {
  const [editStudent, setEditStudent] = useState<LpkStudentRecord | null>(null);

  const rows = useMemo(() => students, [students]);

  const handleSave = (updated: LpkStudentRecord) => {
    onSave?.(updated);
    setEditStudent(null);
  };

  if (rows.length === 0) {
    return (
      <div className="py-20 text-center bg-white border border-gray-300 shadow-sm">
        <p className="text-gray-500">{emptyMessage}</p>
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
              <tr className="bg-gray-50 border-b border-gray-200">
                <th colSpan={10} className="px-4 py-2 border-r border-gray-200 bg-gray-100 sticky left-0 z-20 admin-sticky-split-right" />
                <th
                  colSpan={3}
                  className="px-4 py-2 border-r border-gray-200 text-center font-semibold text-[#fc809f] bg-[#fc809f]/10"
                >
                  CERTIFICATES
                </th>
                <th colSpan={9} className="px-4 py-2 border-r border-gray-200 bg-gray-100" />
                <th className="px-4 py-2 sticky right-0 bg-gray-100 admin-sticky-split-left" />
              </tr>
              <tr>
                <SiswaTh jp="NO" id="" sticky="sticky left-0 z-20 min-w-[60px] bg-gray-100" />
                <SiswaTh jp="写真" id="Foto" sticky="sticky left-[60px] z-20 min-w-[80px] bg-gray-100" />
                <SiswaTh
                  jp="氏名"
                  id="Nama"
                  sticky="sticky left-[140px] z-20 min-w-[200px] bg-gray-100 admin-sticky-split-right"
                />
                <SiswaTh jp="フリガナ" id="Furigana" className="min-w-[160px]" />
                <SiswaTh jp="TSK" id="" className="min-w-[100px]" />
                <SiswaTh jp="日付" id="Tgl Rekrut" className="min-w-[120px]" />
                <SiswaTh jp="性別" id="Gender" className="min-w-[110px]" />
                <SiswaTh jp="学校名" id="Alamat" className="min-w-[200px]" />
                <SiswaTh jp="面接日" id="Mensetsu" className="min-w-[120px]" />
                <SiswaTh jp="内定日" id="Naitei" className="min-w-[120px]" />
                <SiswaTh jp="JFT BASIC A2" id="" className="min-w-[120px] bg-[#fc809f]/10/40 text-center" />
                <SiswaTh jp="SSW IDN" id="" className="min-w-[100px] bg-[#fc809f]/10/40 text-center" />
                <SiswaTh jp="SSW JPN" id="" className="min-w-[100px] bg-[#fc809f]/10/40 text-center" />
                <SiswaTh jp="LPK" id="" className="min-w-[150px]" />
                <SiswaTh jp="出身" id="Asal Kota" className="min-w-[120px]" />
                <SiswaTh jp="PHONE" id="Number" className="min-w-[140px]" />
                <SiswaTh jp="EMAIL" id="" className="min-w-[180px]" />
                <SiswaTh jp="NO PASPOR" id="" className="min-w-[140px]" />
                <SiswaTh jp="VISA" id="Tanggal" className="min-w-[120px]" />
                <SiswaTh jp="COE" id="Tanggal" className="min-w-[120px]" />
                <SiswaTh jp="EKTKLN" id="Tanggal" className="min-w-[120px]" />
                <SiswaTh jp="DEPARTURE" id="Tanggal" className="min-w-[120px]" />
                <SiswaActionTh jp="アクション" label="Action" />
              </tr>
            </thead>
            <tbody>
              {rows.map((s, index) => (
                <tr key={s.id} className="bg-white hover:bg-gray-50 transition-colors group">
                  <SiswaTd sticky="sticky left-0" className="font-medium text-gray-900 text-center">
                    {index + 1}
                  </SiswaTd>
                  <SiswaTd sticky="sticky left-[60px]">
                    <div className="w-9 aspect-[3/4] bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center mx-auto">
                      {s.foto ? (
                        <img src={s.foto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-[10px]">—</span>
                      )}
                    </div>
                  </SiswaTd>
                  <SiswaTd
                    sticky="sticky left-[140px] admin-sticky-split-right"
                    className="font-medium text-gray-800"
                  >
                    {s.nama_lengkap}
                  </SiswaTd>
                  <SiswaTd>{cell(s.nama_katakana)}</SiswaTd>
                  <SiswaTd>{cell(s.tsk)}</SiswaTd>
                  <SiswaTd>{cell(s.tanggal_rekrut)}</SiswaTd>
                  <SiswaTd>{fmtGender(s.jenis_kelamin)}</SiswaTd>
                  <SiswaTd className="max-w-[220px] truncate">{cell(getSekolahNama(s))}</SiswaTd>
                  <SiswaTd>{cell(s.tanggal_mensetsu)}</SiswaTd>
                  <SiswaTd>{cell(s.tanggal_naitei)}</SiswaTd>
                  <SiswaTd className="text-center bg-[#fc809f]/5/30">
                    <StatusPill value={s.cert_jft_basic_a2} />
                  </SiswaTd>
                  <SiswaTd className="text-center bg-[#fc809f]/5/30">
                    <StatusPill value={s.cert_ssw_idn} />
                  </SiswaTd>
                  <SiswaTd className="text-center bg-[#fc809f]/5/30">
                    <StatusPill value={s.cert_ssw_jpn} />
                  </SiswaTd>
                  <SiswaTd>
                    <span className="font-medium text-[#fc809f]">{cell(s.asal_lpk)}</span>
                  </SiswaTd>
                  <SiswaTd>{cell(s.asal)}</SiswaTd>
                  <SiswaTd>{cell(s.telepon)}</SiswaTd>
                  <SiswaTd>{cell(s.email)}</SiswaTd>
                  <SiswaTd className="font-mono text-xs">{cell(s.dokumen_paspor)}</SiswaTd>
                  <SiswaTd>{cell(s.dokumen_visa)}</SiswaTd>
                  <SiswaTd>{cell(s.dokumen_coe)}</SiswaTd>
                  <SiswaTd>{cell(s.dokumen_ektkln)}</SiswaTd>
                  <SiswaTd>{cell(s.tanggal_keberangkatan)}</SiswaTd>
                  <SiswaActionTd>
                    <button
                      type="button"
                      onClick={() => setEditStudent(s)}
                      className={EDIT_BTN}
                      title="Edit Data"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                  </SiswaActionTd>
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
    </>
  );
}
