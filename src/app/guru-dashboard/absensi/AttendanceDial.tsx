"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AttendanceMark } from "./data";

export type DialChoice = AttendanceMark | "hapus";

const OPTIONS: { id: DialChoice; label: string }[] = [
  { id: "Hadir", label: "Hadir" },
  { id: "Izin", label: "Izin" },
  { id: "Sakit", label: "Sakit" },
  { id: "Alpha", label: "Alpha" },
  { id: "hapus", label: "Hapus" },
];

const CX = 120;
const CY = 120;
const RADIUS = 108;
const BIG = 0.28;
const EQUAL = 1 / OPTIONS.length;

function equalWeights() {
  return OPTIONS.map(() => EQUAL);
}

function emphasis(weight: number) {
  return Math.min(1, Math.max(0, (weight - EQUAL) / (BIG - EQUAL)));
}

function mixColor(t: number, target: [number, number, number]) {
  const channel = (from: number, to: number) => Math.round(from + (to - from) * t);
  return `rgb(${channel(255, target[0])} ${channel(255, target[1])} ${channel(255, target[2])})`;
}

function targetWeights(active: number | null) {
  if (active === null) return equalWeights();
  const small = (1 - BIG) / (OPTIONS.length - 1);
  return OPTIONS.map((_, index) => (index === active ? BIG : small));
}

function slicePath(startDeg: number, endDeg: number) {
  const start = ((startDeg - 90) * Math.PI) / 180;
  const end = ((endDeg - 90) * Math.PI) / 180;
  const x1 = CX + RADIUS * Math.cos(start);
  const y1 = CY + RADIUS * Math.sin(start);
  const x2 = CX + RADIUS * Math.cos(end);
  const y2 = CY + RADIUS * Math.sin(end);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

function sectorFromPoint(svg: SVGSVGElement, clientX: number, clientY: number, weights: number[]) {
  const rect = svg.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  if (Math.hypot(dx, dy) > (rect.width / 2) * (RADIUS / CX) + 10) return null;
  const fraction = (((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360) / 360;
  let covered = 0;
  for (let index = 0; index < weights.length; index += 1) {
    covered += weights[index];
    if (fraction <= covered + 0.0001) return index;
  }
  return weights.length - 1;
}

type AttendanceDialProps = {
  studentName: string;
  sessionLabel: string;
  currentMark?: AttendanceMark;
  anchorX: number;
  anchorY: number;
  onClose: () => void;
  onChoose: (choice: DialChoice) => void;
};

export default function AttendanceDial({
  studentName,
  sessionLabel,
  currentMark,
  anchorX,
  anchorY,
  onClose,
  onChoose,
}: AttendanceDialProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const weightsRef = useRef(equalWeights());
  const hoverRef = useRef<number | null>(null);
  const dragging = useRef(false);
  const [hover, setHover] = useState<number | null>(null);
  const [weights, setWeights] = useState(equalWeights());

  useEffect(() => {
    hoverRef.current = hover;
  }, [hover]);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const target = targetWeights(hoverRef.current);
      const current = weightsRef.current;
      let settled = true;
      const next = current.map((weight, index) => {
        const delta = target[index] - weight;
        if (Math.abs(delta) > 0.0015) settled = false;
        return weight + delta * 0.09;
      });
      weightsRef.current = next;
      setWeights(next);
      if (!settled) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [hover]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof window === "undefined") return null;

  const width = 268;
  const height = 360;
  const left = Math.min(window.innerWidth - width - 12, Math.max(12, anchorX - width / 2));
  const top = Math.min(window.innerHeight - height - 12, Math.max(12, anchorY - height / 2));

  const pointAt = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    return sectorFromPoint(svg, clientX, clientY, weightsRef.current);
  };

  let cursor = 0;
  const slices = weights.map((weight, index) => {
    const start = cursor * 360;
    const end = (cursor + weight) * 360;
    cursor += weight;
    const mid = ((start + end) / 2 - 90) * (Math.PI / 180);
    return {
      index,
      weight,
      path: slicePath(start, end),
      labelX: CX + Math.cos(mid) * 64,
      labelY: CY + Math.sin(mid) * 64,
    };
  });

  const active = hover === null ? null : OPTIONS[hover];

  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <button type="button" className="absolute inset-0 bg-black/25" aria-label="Tutup pilihan absensi" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Pilih absensi ${studentName}`}
        className="absolute border border-gray-300 bg-white shadow-xl"
        style={{ left, top, width }}
      >
        <div className="border-b border-gray-200 px-4 py-3">
          <p className="truncate text-sm font-semibold text-gray-900">{studentName}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-gray-400">
            {sessionLabel}
            {currentMark ? ` · sekarang ${currentMark}` : " · belum diisi"}
          </p>
        </div>
        <div className="px-4 pb-3 pt-2">
          <svg
            ref={svgRef}
            viewBox="0 0 240 240"
            className="mx-auto block h-[208px] w-[208px] touch-none select-none font-sans"
            aria-label="Geser kursor untuk memilih status"
          >
            <circle cx={CX} cy={CY} r={RADIUS} fill="#f4f4f5" />
            {[...slices]
              .sort((a, b) => a.weight - b.weight)
              .map((slice) => {
                const option = OPTIONS[slice.index];
                const grown = emphasis(slice.weight);
                const tone: [number, number, number] = option.id === "hapus" ? [244, 63, 94] : [16, 185, 129];
                return (
                  <path
                    key={option.id}
                    d={slice.path}
                    fill={mixColor(grown, tone)}
                    stroke="#d4d4d8"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                  />
                );
              })}
            {slices.map((slice) => {
              const option = OPTIONS[slice.index];
              const grown = emphasis(slice.weight);
              return (
                <text
                  key={`${option.id}-label`}
                  x={slice.labelX}
                  y={slice.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={mixColor(1 - grown, [63, 63, 70])}
                  fontSize={12 + grown * 1.5}
                  fontWeight={700}
                  pointerEvents="none"
                >
                  {option.label}
                </text>
              );
            })}
            <circle
              cx={CX}
              cy={CY}
              r={RADIUS}
              fill="#000"
              fillOpacity={0}
              className="cursor-pointer"
              onPointerDown={(event) => {
                event.preventDefault();
                dragging.current = true;
                event.currentTarget.setPointerCapture(event.pointerId);
                setHover(pointAt(event.clientX, event.clientY));
              }}
              onPointerMove={(event) => {
                const next = pointAt(event.clientX, event.clientY);
                if (next !== null) setHover(next);
                else if (!dragging.current) setHover(null);
              }}
              onPointerUp={(event) => {
                dragging.current = false;
                const next = pointAt(event.clientX, event.clientY);
                if (next !== null) onChoose(OPTIONS[next].id);
                else setHover(null);
              }}
              onPointerLeave={() => {
                if (!dragging.current) setHover(null);
              }}
              onPointerCancel={() => {
                dragging.current = false;
                setHover(null);
              }}
            />
          </svg>
          <p
            className={`mt-1 text-center text-sm font-semibold ${
              active === null ? "text-gray-400" : active.id === "hapus" ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {active ? active.label : "Arahkan kursor, lalu klik atau lepas"}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full border border-gray-300 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500 hover:border-primary-pink hover:text-primary-pink"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
