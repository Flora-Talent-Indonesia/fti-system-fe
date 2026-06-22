import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ThProps = {
  jp: string;
  id: string;
  sticky?: string;
  cv?: boolean;
  className?: string;
};

export function SiswaTh({ jp, id, sticky, cv, className }: ThProps) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-4 font-semibold border border-gray-200 text-xs text-gray-700 uppercase",
        cv && "bg-pink-50/60",
        sticky,
        className
      )}
    >
      {jp}
      <br />
      <span className="text-[10px] text-gray-500 normal-case font-medium">{id}</span>
    </th>
  );
}

export function fmtGender(jk: string) {
  if (jk === "L") return "Laki-laki (男)";
  if (jk === "P") return "Perempuan (女)";
  return jk || "-";
}

export function fmtMata(kiri: string, kanan: string) {
  if (!kiri && !kanan) return "-";
  return `${kiri || "-"} / ${kanan || "-"}`;
}

export function cell(v: string | number | null | undefined) {
  if (v === null || v === undefined || v === "") return "-";
  return v;
}

const TD_BASE = "px-4 py-4 border border-gray-200 text-gray-600";

type TdProps = {
  children: ReactNode;
  sticky?: string;
  cv?: boolean;
  className?: string;
};

export function SiswaTd({ children, sticky, cv, className }: TdProps) {
  return (
    <td
      className={cn(
        TD_BASE,
        cv && "bg-pink-50/30",
        sticky && `${sticky} bg-white group-hover:bg-slate-50 z-10`,
        className
      )}
    >
      {children}
    </td>
  );
}
