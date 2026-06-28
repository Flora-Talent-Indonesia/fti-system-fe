"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil } from "lucide-react";
import StickyHorizontalScroll from "@/components/StickyHorizontalScroll";
import DownloadFileButton from "@/components/lpk/DownloadFileButton";
import LpkStudentEditModal from "@/app/lpk-mitra/components/LpkStudentEditModal";
import {
  CertificateDataModal,
  ParentDataModal,
  PersonalDataModal,
} from "@/app/lpk-mitra/components/SubDataModals";
import { SiswaTh, SiswaTd, cell, fmtGender, fmtMata } from "@/app/lpk-mitra/components/table-helpers";
import type { LpkStudentRecord } from "@/types/lpk-student";

type Props = {
  students: LpkStudentRecord[];
  onSave?: (updated: LpkStudentRecord) => void;
  emptyMessage?: string;
  allowDownload?: boolean;
};

/** Tabel profil siswa — kolom selaras admin-dashboard/profil-siswa (Jukyu), tema FTI pink. */
export default function FtiProfilSiswaTable({
  students,
  onSave,
  emptyMessage = "Belum ada data siswa.",
  allowDownload = true,
}: Props) {
  const [editStudent, setEditStudent] = useState<LpkStudentRecord | null>(null);
  const [parentStudent, setParentStudent] = useState<LpkStudentRecord | null>(null);
  const [certStudent, setCertStudent] = useState<LpkStudentRecord | null>(null);
  const [personalStudent, setPersonalStudent] = useState<LpkStudentRecord | null>(null);

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
                <SiswaTh jp="NO" id="" sticky="sticky left-0 z-20 min-w-[60px] bg-gray-100" />
                <SiswaTh
                  jp="実習生番号"
                  id="No. Peserta"
                  sticky="sticky left-[60px] z-20 min-w-[130px] bg-gray-100"
                />
                <SiswaTh jp="写真" id="Foto" sticky="sticky left-[190px] z-20 min-w-[80px] bg-gray-100" />
                <SiswaTh
                  jp="実習生本名"
                  id="Nama Peserta Magang"
                  sticky="sticky left-[270px] z-20 min-w-[200px] bg-gray-100 shadow-[4px_0_10px_rgba(0,0,0,0.05)]"
                />
                <SiswaTh jp="カタカナ" id="Katakana" cv />
                <SiswaTh jp="親のデータ" id="Data Orang Tua" cv />
                <SiswaTh jp="呼称" id="Nama Panggilan" cv />
                <SiswaTh jp="何期生" id="Angkatan" />
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
                <SiswaTh jp="健康診断" id="File MCU (PDF)" />
                <SiswaTh jp="Admin MCU" id="Hasil Medical Checkup" cv />
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
                <SiswaTh jp="元LPK名" id="Asal LPK" />
                <SiswaTh jp="送り出し機関名" id="Nama SO" />
                <SiswaTh jp="組合名" id="Nama Kumiai" />
                <SiswaTh jp="企業名" id="Nama Perusahaan" />
                <SiswaTh jp="職種・作業" id="Jenis Pekerjaan" />
                <SiswaTh jp="保有資格" id="Sertifikat Dimiliki" cv />
                <SiswaTh jp="入学日" id="Tanggal Masuk Pelatihan" />
                <SiswaTh jp="卒業日" id="Tanggal Kelulusan" />
                <SiswaTh jp="入国予定日" id="Perkiraan Masuk (Jepang)" />
                <SiswaTh jp="出国日" id="Tanggal Keberangkatan" />
                <SiswaTh jp="個人データファイル" id="File Data Diri" cv />
                <th className="px-4 py-4 font-semibold border border-gray-200 sticky right-0 bg-gray-100 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] text-center text-xs uppercase z-20">
                  アクション
                  <br />
                  <span className="text-[10px] text-gray-500 normal-case font-medium">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s, index) => (
                <tr key={s.id} className="bg-white hover:bg-slate-50 transition-colors group">
                  <SiswaTd sticky="sticky left-0" className="font-medium text-gray-900">
                    {index + 1}
                  </SiswaTd>
                  <SiswaTd sticky="sticky left-[60px]" className="font-semibold text-primary-pink">
                    {s.no_peserta}
                  </SiswaTd>
                  <SiswaTd sticky="sticky left-[190px]">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center mx-auto">
                      {s.foto ? (
                        <img src={s.foto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-[10px]">—</span>
                      )}
                    </div>
                  </SiswaTd>
                  <SiswaTd
                    sticky="sticky left-[270px] shadow-[4px_0_10px_rgba(0,0,0,0.02)]"
                    className="font-medium text-gray-800"
                  >
                    {s.nama_lengkap}
                  </SiswaTd>
                  <SiswaTd cv>{cell(s.nama_katakana)}</SiswaTd>
                  <SiswaTd cv>
                    <button
                      type="button"
                      onClick={() => setParentStudent(s)}
                      className="px-3 py-1.5 text-xs font-medium text-primary-pink bg-primary-pink-light border border-primary-pink/30 hover:bg-primary-pink/20"
                    >
                      Lihat Data
                    </button>
                  </SiswaTd>
                  <SiswaTd cv>{cell(s.nama_panggilan)}</SiswaTd>
                  <SiswaTd>
                    {s.angkatan ? (
                      <span className="bg-primary-pink-light text-primary-pink text-xs px-2 py-1 border border-primary-pink/30">
                        {s.angkatan}
                      </span>
                    ) : (
                      "—"
                    )}
                  </SiswaTd>
                  <SiswaTd cv>{cell(s.kewarganegaraan)}</SiswaTd>
                  <SiswaTd>{cell(s.tanggal_lahir)}</SiswaTd>
                  <SiswaTd>{cell(s.umur)}{s.umur ? " thn" : ""}</SiswaTd>
                  <SiswaTd>{fmtGender(s.jenis_kelamin)}</SiswaTd>
                  <SiswaTd cv className="font-semibold">{cell(s.golongan_darah)}</SiswaTd>
                  <SiswaTd>{cell(s.status_pernikahan)}</SiswaTd>
                  <SiswaTd>{cell(s.agama)}</SiswaTd>
                  <SiswaTd>{cell(s.asal)}</SiswaTd>
                  <SiswaTd className="max-w-[200px] truncate">{cell(s.alamat)}</SiswaTd>
                  <SiswaTd cv>{cell(s.kode_pos)}</SiswaTd>
                  <SiswaTd cv>{cell(s.telepon)}</SiswaTd>
                  <SiswaTd cv>{cell(s.email)}</SiswaTd>
                  <SiswaTd>
                    {!s.mcu_pdf || s.mcu_pdf === "-" ? (
                      <span className="text-[11px] font-medium text-red-500 italic bg-red-50 px-2 py-1 border border-red-100">
                        Admin Perlu Upload Hasil MCU
                      </span>
                    ) : allowDownload ? (
                      <DownloadFileButton filename={s.mcu_pdf} studentName={s.nama_lengkap} />
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-primary-pink">
                        <Eye size={12} />
                        {s.mcu_pdf}
                      </span>
                    )}
                  </SiswaTd>
                  <SiswaTd cv>{cell(s.mcu)}</SiswaTd>
                  <SiswaTd>{cell(s.berat_badan)}{s.berat_badan ? " kg" : ""}</SiswaTd>
                  <SiswaTd>{cell(s.tinggi_badan)}{s.tinggi_badan ? " cm" : ""}</SiswaTd>
                  <SiswaTd cv>{fmtMata(s.mata_kiri, s.mata_kanan)}</SiswaTd>
                  <SiswaTd cv>{cell(s.berkacamata)}</SiswaTd>
                  <SiswaTd cv>{cell(s.tato)}</SiswaTd>
                  <SiswaTd cv>{cell(s.merokok)}</SiswaTd>
                  <SiswaTd cv>{cell(s.buta_warna)}</SiswaTd>
                  <SiswaTd cv>{cell(s.patah_tulang)}</SiswaTd>
                  <SiswaTd>{cell(s.hobi)}</SiswaTd>
                  <SiswaTd>{cell(s.tingkatan_pembelajaran)}</SiswaTd>
                  <SiswaTd>{cell(s.asal_lpk)}</SiswaTd>
                  <SiswaTd>{cell(s.nama_so)}</SiswaTd>
                  <SiswaTd>{cell(s.nama_kumiai)}</SiswaTd>
                  <SiswaTd className="font-medium text-gray-800">{cell(s.nama_perusahaan)}</SiswaTd>
                  <SiswaTd>{cell(s.jenis_pekerjaan)}</SiswaTd>
                  <SiswaTd cv>
                    <button
                      type="button"
                      onClick={() => setCertStudent(s)}
                      className="px-3 py-1.5 text-xs font-medium text-primary-pink bg-primary-pink-light border border-primary-pink/30"
                    >
                      Lihat Sertifikat
                    </button>
                  </SiswaTd>
                  <SiswaTd>{cell(s.tanggal_masuk_pelatihan)}</SiswaTd>
                  <SiswaTd>{cell(s.tanggal_kelulusan)}</SiswaTd>
                  <SiswaTd>{cell(s.perkiraan_masuk_jepang)}</SiswaTd>
                  <SiswaTd>{cell(s.tanggal_keberangkatan)}</SiswaTd>
                  <SiswaTd cv>
                    <button
                      type="button"
                      onClick={() => setPersonalStudent(s)}
                      className="px-3 py-1.5 text-xs font-medium text-primary-pink bg-primary-pink-light border border-primary-pink/30"
                    >
                      Lihat Data Diri
                    </button>
                  </SiswaTd>
                  <td className="px-4 py-4 border border-gray-200 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] text-center z-10">
                    <button
                      type="button"
                      onClick={() => setEditStudent(s)}
                      className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-sm font-medium text-primary-pink hover:text-white bg-primary-pink-light hover:bg-primary-pink border border-primary-pink/30 transition-colors"
                      title="Edit Data"
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
    </>
  );
}
