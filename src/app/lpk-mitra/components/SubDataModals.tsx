"use client";

import { Download, X } from "lucide-react";
import DownloadFileButton from "@/components/lpk/DownloadFileButton";
import type { LpkStudentRecord } from "@/types/lpk-student";

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80 sticky top-0">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ParentDataModal({
  student,
  onClose,
}: {
  student: LpkStudentRecord;
  onClose: () => void;
}) {
  return (
    <ModalShell title="Data Orang Tua / Keluarga" onClose={onClose}>
      {!student.keluarga?.length ? (
        <p className="text-sm text-gray-500">Belum ada data keluarga.</p>
      ) : (
        <ul className="space-y-3">
          {student.keluarga.map((k, i) => (
            <li key={i} className="border border-gray-200 p-3 text-sm">
              <p className="font-semibold text-gray-900">{k.nama || "-"}</p>
              <p className="text-gray-600 mt-1">
                {k.hubungan || "-"} · {k.umur ? `${k.umur} thn` : "-"} · {k.status_pekerjaan || "-"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </ModalShell>
  );
}

export function CertificateDataModal({
  student,
  onClose,
  allowDownload = false,
}: {
  student: LpkStudentRecord;
  onClose: () => void;
  allowDownload?: boolean;
}) {
  const items = student.sertifikat?.length
    ? student.sertifikat
    : student.sertifikat_dimiliki.map((n) => ({ nama_sertifikat: n }));

  return (
    <ModalShell title="Sertifikat Dimiliki" onClose={onClose}>
      {!items.length ? (
        <p className="text-sm text-gray-500">Belum ada sertifikat.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((s, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 border border-gray-200 px-3 py-2 text-sm"
            >
              <div>
                {s.nama_sertifikat || "-"}
                {"score" in s && s.score ? (
                  <span className="text-gray-500 ml-2">({s.score})</span>
                ) : null}
              </div>
              {allowDownload && "sertifikat" in s && s.sertifikat ? (
                <DownloadFileButton
                  filename={s.sertifikat}
                  studentName={student.nama_lengkap}
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </ModalShell>
  );
}

export function PersonalDataModal({
  student,
  onClose,
  allowDownload = false,
}: {
  student: LpkStudentRecord;
  onClose: () => void;
  allowDownload?: boolean;
}) {
  const docs = [
    { label: "KTP", value: student.dokumen_ktp },
    { label: "KK (Kartu Keluarga)", value: student.dokumen_kk },
    { label: "Akte Kelahiran", value: student.dokumen_akte },
    { label: "Ijazah Terakhir", value: student.dokumen_ijazah },
    { label: "MCU", value: student.mcu_pdf },
  ];

  return (
    <ModalShell title="File Data Diri" onClose={onClose}>
      <ul className="space-y-2 text-sm">
        {docs.map((d) => (
          <li
            key={d.label}
            className="flex items-center justify-between gap-3 border border-gray-200 px-3 py-2"
          >
            <span className="font-medium shrink-0">{d.label}</span>
            {allowDownload && d.value ? (
              <DownloadFileButton filename={d.value} studentName={student.nama_lengkap} />
            ) : (
              <span className="text-gray-600 truncate">{d.value || "Belum diunggah"}</span>
            )}
          </li>
        ))}
      </ul>
      {allowDownload && (
        <p className="mt-4 text-[10px] text-gray-500 flex items-center gap-1">
          <Download size={12} />
          Admin FTI dapat mengunduh semua dokumen peserta.
        </p>
      )}
    </ModalShell>
  );
}
