"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Download, FileText, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { LPK_PARTNERS } from "@/data/mock";
import { FTI_KELAS_OPTIONS } from "@/data/dummy-fti-students";
import { downloadStudentExcel } from "@/lib/export-siswa-excel";
import type { LpkStudentRecord } from "@/types/lpk-student";

const FIELD =
  "mt-2 w-full border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-[#fc809f] focus:outline-none";

function choiceStyle(active: boolean): CSSProperties {
  return {
    borderStyle: "solid",
    borderColor: active ? "#fc809f" : "#d1d5db",
    borderWidth: active ? 3 : 1,
    padding: active ? "6px 10px" : "8px 12px",
    background: active ? "#fff5f8" : "#fff",
    color: active ? "#c2185b" : "#4b5563",
  };
}

type Format = "cv" | "excel";
type Scope = "all" | "pick";

type Props = {
  ftiStudents: LpkStudentRecord[];
  mitraStudents: LpkStudentRecord[];
  initialSumber: string;
  initialKelas: string;
  initialFormat?: Format;
  lockSumber?: boolean;
  onExportCv: (students: LpkStudentRecord[]) => void;
  onClose: () => void;
};

export default function DataSiswaExportModal({
  ftiStudents,
  mitraStudents,
  initialSumber,
  initialKelas,
  initialFormat = "excel",
  lockSumber = false,
  onExportCv,
  onClose,
}: Props) {
  const [format, setFormat] = useState<Format>(initialFormat);
  const [scope, setScope] = useState<Scope>("all");
  const [sumber, setSumber] = useState(initialSumber || "fti");
  const [kelas, setKelas] = useState(initialKelas || "Semua");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [pickQuery, setPickQuery] = useState("");

  const pool = useMemo(() => {
    if (sumber === "fti") return ftiStudents;
    if (sumber === "all-mitra") return mitraStudents;
    if (sumber === "semua") return [...ftiStudents, ...mitraStudents];
    return mitraStudents.filter((student) => student.asal_lpk === sumber);
  }, [ftiStudents, mitraStudents, sumber]);

  const rows = useMemo(() => {
    return pool.filter((student) => {
      if (sumber === "fti" && kelas !== "Semua" && student.kelas !== kelas) return false;
      return true;
    });
  }, [kelas, pool, sumber]);

  useEffect(() => {
    setPicked((current) => {
      const ids = new Set(rows.map((row) => row.id));
      const next = new Set([...current].filter((id) => ids.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [rows]);

  const listed = useMemo(() => {
    const q = pickQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (student) =>
        student.nama_lengkap.toLowerCase().includes(q) || student.no_peserta.toLowerCase().includes(q)
    );
  }, [pickQuery, rows]);

  const targets = useMemo(() => {
    if (scope === "all") return rows;
    return rows.filter((student) => picked.has(student.id));
  }, [picked, rows, scope]);

  const togglePicked = (id: string) => {
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const download = () => {
    if (targets.length === 0) {
      toast.error("Pilih minimal satu siswa.");
      return;
    }
    if (format === "cv") {
      onExportCv(targets);
      onClose();
      return;
    }
    const sumberLabel =
      sumber === "fti"
        ? "Siswa_FTI"
        : sumber === "all-mitra"
          ? "Semua_LPK_Mitra"
          : sumber === "semua"
            ? "Semua"
            : sumber;
    const parts = [sumberLabel];
    if (targets.length === 1) parts.push(targets[0].no_peserta || targets[0].nama_lengkap);
    else {
      if (sumber === "fti" && kelas !== "Semua") parts.push(kelas);
      if (scope === "pick") parts.push(`${targets.length}_siswa`);
    }
    downloadStudentExcel(targets, parts.join("_"));
    toast.success(`${targets.length} siswa diunduh ke Excel.`);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
      <button type="button" className="absolute inset-0" aria-label="Tutup" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col border border-gray-300 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="font-serif text-xl text-gray-900">Unduh Data Siswa</h2>
          <button type="button" onClick={onClose} className="border border-gray-300 p-2 text-gray-500 hover:text-gray-900" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 overflow-auto p-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Bentuk file</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" aria-pressed={format === "cv"} onClick={() => setFormat("cv")} className="text-xs font-semibold uppercase tracking-widest" style={choiceStyle(format === "cv")}>
                <FileText size={14} className="mr-2 inline" />
                CV
              </button>
              <button type="button" aria-pressed={format === "excel"} onClick={() => setFormat("excel")} className="text-xs font-semibold uppercase tracking-widest" style={choiceStyle(format === "excel")}>
                <Download size={14} className="mr-2 inline" />
                Excel
              </button>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Cakupan</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  ["all", "Semua"],
                  ["pick", "Pilih"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={scope === value}
                  onClick={() => setScope(value)}
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={choiceStyle(scope === value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {lockSumber ? (
            <p className="border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">Sumber: {sumber}</p>
          ) : (
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Sumber</span>
              <select
                value={sumber}
                onChange={(event) => {
                  setSumber(event.target.value);
                  setKelas("Semua");
                  setPickQuery("");
                }}
                className={FIELD}
              >
                <option value="semua">Semua data</option>
                <option value="fti">Siswa FTI</option>
                <option value="all-mitra">Semua LPK Mitra</option>
                {LPK_PARTNERS.map((partner) => (
                  <option key={partner.id} value={partner.name}>
                    {partner.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {sumber === "fti" && (
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Kelas</span>
              <select value={kelas} onChange={(event) => setKelas(event.target.value)} className={FIELD}>
                <option value="Semua">Semua Kelas</option>
                {FTI_KELAS_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          )}
          {scope === "pick" && (
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Pilih siswa</span>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#c2185b]"
                  onClick={() => setPicked(new Set(listed.map((student) => student.id)))}
                >
                  Pilih yang tampil
                </button>
              </div>
              <input
                value={pickQuery}
                onChange={(event) => setPickQuery(event.target.value)}
                placeholder="Cari nama atau nomor"
                className={FIELD}
              />
              <ul className="mt-2 max-h-48 overflow-auto border border-gray-200">
                {listed.map((student) => (
                  <li key={student.id} className="border-b border-gray-100 last:border-b-0">
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={picked.has(student.id)}
                        onChange={() => togglePicked(student.id)}
                      />
                      <span>
                        {student.no_peserta} — {student.nama_lengkap}
                      </span>
                    </label>
                  </li>
                ))}
                {listed.length === 0 && <li className="px-3 py-3 text-sm text-gray-500">Tidak ada siswa.</li>}
              </ul>
            </div>
          )}
          <p className="border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {targets.length} siswa akan diunduh sebagai {format === "cv" ? "CV" : "Excel"}.
            {format === "cv" ? " CV terbuka di jendela cetak, lalu simpan sebagai PDF." : ""}
          </p>
        </div>
        <div className="flex justify-end border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={download}
            disabled={targets.length === 0}
            aria-label={format === "cv" ? "Unduh CV" : "Unduh Excel"}
            title={format === "cv" ? "Unduh CV" : "Unduh Excel"}
            className="flex h-11 w-11 items-center justify-center border border-gray-300 bg-white text-gray-700 hover:border-gray-500 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
