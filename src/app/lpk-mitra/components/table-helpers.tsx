import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ThProps = {
  jp: string;
  id: string;
  sticky?: string;
  cv?: boolean;
  className?: string;
};

/** Header selaras progress-belajar / admin-data-table */
export function SiswaTh({ jp, id, sticky, cv, className }: ThProps) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-4 font-semibold border-b border-gray-200 border-r text-xs text-gray-700 uppercase",
        cv ? "bg-pink-50/60" : "bg-gray-100",
        sticky,
        className
      )}
    >
      {jp}
      {id ? (
        <>
          <br />
          <span className="text-[10px] text-gray-500 normal-case font-medium">{id}</span>
        </>
      ) : null}
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

const TD_BASE = "px-4 py-3 border-r text-gray-600";

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
        sticky && `${sticky} bg-white group-hover:bg-gray-50 z-10`,
        className
      )}
    >
      {children}
    </td>
  );
}

/** Header kolom Aksi sticky kanan — pola progress-belajar */
export function SiswaActionTh({ label = "Aksi", jp }: { label?: string; jp?: string }) {
  return (
    <th
      scope="col"
      className="px-4 py-4 font-semibold border-b border-gray-200 sticky right-0 bg-gray-100 admin-sticky-split-left text-center text-xs uppercase z-20"
    >
      {jp ? (
        <>
          {jp}
          <br />
          <span className="text-[10px] text-gray-500 normal-case font-medium">{label}</span>
        </>
      ) : (
        label
      )}
    </th>
  );
}

/** Cell aksi sticky kanan */
export function SiswaActionTd({ children }: { children: ReactNode }) {
  return (
    <td className="px-4 py-3 sticky right-0 bg-white admin-sticky-split-left group-hover:bg-gray-50 transition-colors text-center z-10">
      {children}
    </td>
  );
}
