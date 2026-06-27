"use client";

import { X, MapPin, Building2, Briefcase, DollarSign, Calendar, CalendarDays, CircleCheck, CircleDot, Circle, CircleX, AlertCircle } from "lucide-react";
import type { LpkStudentRecord, TimelineEvent } from "@/types/lpk-student";
import { cn } from "@/lib/cn";

/* ───────────── helpers ───────────── */

function statusLabel(status: LpkStudentRecord["status"]) {
  if (status === "match_job") return "Sudah Lulus";
  if (status === "aktif") return "Sedang Dalam Pembelajaran";
  return "Tidak Lulus";
}

function statusColor(status: LpkStudentRecord["status"]) {
  if (status === "match_job") return "text-green-700 bg-green-50 border-green-200";
  if (status === "aktif") return "text-yellow-700 bg-yellow-50 border-yellow-200";
  return "text-red-700 bg-red-50 border-red-200";
}

function headerGradient(status: LpkStudentRecord["status"]) {
  if (status === "match_job") return "from-green-50 to-emerald-50/60";
  if (status === "aktif") return "from-yellow-50 to-amber-50/60";
  return "from-red-50 to-rose-50/60";
}

/* ───────────── timeline node ───────────── */

function timelineNodeStyle(ev: TimelineEvent) {
  switch (ev.status) {
    case "done":
      return {
        icon: <CircleCheck size={22} className="text-green-600" />,
        ring: "border-green-400 bg-green-50",
        line: "bg-green-400",
        labelColor: "text-gray-900",
        dateColor: "text-gray-500",
      };
    case "current":
      return {
        icon: <CircleDot size={22} className="text-yellow-600 animate-pulse" />,
        ring: "border-yellow-400 bg-yellow-50 shadow-[0_0_0_4px_rgba(250,204,21,0.2)]",
        line: "bg-yellow-300",
        labelColor: "text-yellow-800 font-bold",
        dateColor: "text-yellow-600",
      };
    case "upcoming":
      return {
        icon: <Circle size={22} className="text-gray-300" />,
        ring: "border-gray-200 bg-gray-50",
        line: "bg-gray-200",
        labelColor: "text-gray-400",
        dateColor: "text-gray-300",
      };
    case "failed":
      return {
        icon: <CircleX size={22} className="text-red-500" />,
        ring: "border-red-400 bg-red-50",
        line: "bg-red-300",
        labelColor: "text-red-700",
        dateColor: "text-red-400",
      };
  }
}

/* ───────────── timeline panel ───────────── */

function TimelinePanel({ events }: { events: TimelineEvent[] }) {
  if (!events.length) {
    return <p className="text-sm text-gray-400 italic">Belum ada data timeline.</p>;
  }

  return (
    <div className="border border-gray-200 bg-white shadow-sm">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600">
          📋 Historis Kegiatan Pembelajaran
        </h3>
      </div>
      <div className="p-5 overflow-x-auto">
        <div className="flex items-start gap-0 min-w-max">
          {events.map((ev, i) => {
            const style = timelineNodeStyle(ev);
            const isLast = i === events.length - 1;
            return (
              <div key={i} className="flex items-start">
                {/* Node */}
                <div className="flex flex-col items-center min-w-[120px] max-w-[140px]">
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                      style.ring
                    )}
                  >
                    {style.icon}
                  </div>
                  {/* Label */}
                  <p className={cn("mt-2 text-[11px] text-center leading-tight px-1", style.labelColor)}>
                    {ev.label}
                  </p>
                  {/* Date */}
                  {ev.date && (
                    <p className={cn("text-[10px] mt-0.5", style.dateColor)}>{ev.date}</p>
                  )}
                  {/* Note tooltip */}
                  {ev.note && (
                    <div className="mt-1.5 flex items-start gap-1 max-w-[130px]">
                      <AlertCircle size={11} className="shrink-0 mt-0.5 text-gray-400" />
                      <p className="text-[9px] text-gray-500 leading-tight">{ev.note}</p>
                    </div>
                  )}
                </div>
                {/* Connecting line */}
                {!isLast && (
                  <div className="flex items-center pt-[18px]">
                    <div className={cn("h-[2px] w-10", style.line)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────────── job placement panel (lulus only) ───────────── */

function JobPlacementPanel({ student }: { student: LpkStudentRecord }) {
  const jp = student.job_placement;
  if (!jp) return null;

  const rows = [
    { icon: <MapPin size={14} />, label: "Prefektur", value: jp.prefektur },
    { icon: <MapPin size={14} />, label: "Kota", value: jp.kota },
    { icon: <MapPin size={14} />, label: "Alamat Kerja", value: jp.alamat_kerja },
    { icon: <Building2 size={14} />, label: "Perusahaan", value: jp.nama_perusahaan },
    { icon: <Briefcase size={14} />, label: "Bidang Usaha", value: jp.bidang_usaha },
    { icon: <Briefcase size={14} />, label: "Posisi", value: jp.posisi },
    { icon: <DollarSign size={14} />, label: "Gaji", value: jp.gaji },
    { icon: <Calendar size={14} />, label: "Durasi Kontrak", value: jp.durasi_kontrak },
    { icon: <CalendarDays size={14} />, label: "Hari Libur", value: jp.hari_libur },
  ];

  return (
    <div className="border border-gray-200 bg-white shadow-sm">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600">
          🏢 Penempatan Kerja di Jepang
        </h3>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rows.map((r) => (
            <div key={r.label} className="flex items-start gap-2.5 border border-gray-100 rounded px-3 py-2.5 bg-gray-50/40">
              <span className="text-gray-400 mt-0.5 shrink-0">{r.icon}</span>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{r.label}</p>
                <p className="text-sm text-gray-900 font-medium leading-snug break-words">{r.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────── main modal ───────────── */

type Props = {
  student: LpkStudentRecord;
  onClose: () => void;
};

export default function StudentDetailsModal({ student, onClose }: Props) {
  const timeline = student.timeline ?? [];
  const sLabel = statusLabel(student.status);
  const sColor = statusColor(student.status);
  const hGradient = headerGradient(student.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
        {/* Header */}
        <div className={cn("flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r sticky top-0 z-10", hGradient)}>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              {student.foto && (
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                  <img src={student.foto} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 leading-tight">{student.nama_lengkap}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{student.no_peserta} · {student.nama_katakana}</p>
              </div>
            </div>
            <div className="mt-3">
              <span className={cn("inline-flex items-center px-3 py-1 text-[11px] font-semibold border", sColor)}>
                {sLabel}
              </span>
              <span className="ml-3 text-xs text-gray-500">
                Program: <strong className="text-gray-700">{student.jenis_pekerjaan || "-"}</strong>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 shrink-0 self-start"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Timeline */}
          <TimelinePanel events={timeline} />

          {/* Job placement (only for graduated students) */}
          {student.status === "match_job" && <JobPlacementPanel student={student} />}
        </div>
      </div>
    </div>
  );
}
