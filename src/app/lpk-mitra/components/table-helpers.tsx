import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const SiswaTableToneContext = createContext(false);

/** Header lebih ringan: bahasa Jepang di atas, label Indonesia di bawah. */
export function SiswaTableTone({
  soft,
  children,
}: {
  soft?: boolean;
  children: ReactNode;
}) {
  return <SiswaTableToneContext.Provider value={Boolean(soft)}>{children}</SiswaTableToneContext.Provider>;
}

type ThProps = {
  jp: string;
  id: string;
  sticky?: string;
  cv?: boolean;
  className?: string;
};

/** Header selaras progress-belajar / admin-data-table */
export function SiswaTh({ jp, id, sticky, cv, className }: ThProps) {
  const soft = useContext(SiswaTableToneContext);
  return (
    <th
      scope="col"
      className={cn(
        soft
          ? "border-b border-r border-gray-200 px-3 py-2.5 text-left align-bottom font-normal"
          : "px-4 py-4 font-semibold border-b border-gray-200 border-r text-xs text-gray-700 uppercase",
        cv ? "bg-blue-50" : soft ? "bg-gray-50" : "bg-gray-100",
        sticky,
        className
      )}
    >
      {soft ? (
        <>
          <span className="block text-[10px] font-medium leading-tight tracking-normal text-gray-400 normal-case">
            {jp}
          </span>
          {id ? (
            <span className="mt-0.5 block text-[11px] font-semibold leading-tight tracking-normal text-gray-700 normal-case">
              {id}
            </span>
          ) : null}
        </>
      ) : (
        <>
          {jp}
          {id ? (
            <>
              <br />
              <span className="text-[10px] text-gray-500 normal-case font-medium">{id}</span>
            </>
          ) : null}
        </>
      )}
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

const TD_BASE = "px-4 py-4 border-r text-gray-600";

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
        cv && "bg-slate-50",
        sticky && `${sticky} bg-white group-hover:bg-slate-50 z-10`,
        className
      )}
    >
      {children}
    </td>
  );
}

/** Header kolom Aksi sticky kanan — pola progress-belajar */
export function SiswaActionTh({ label = "Aksi", jp, leading }: { label?: string; jp?: string; leading?: ReactNode }) {
  const soft = useContext(SiswaTableToneContext);
  return (
    <th
      scope="col"
      className={cn(
        "sticky top-0 right-0 admin-sticky-split-left text-center z-30",
        soft
          ? "border-b border-gray-200 bg-gray-50 px-3 py-2.5 font-normal"
          : "px-4 py-4 font-semibold border-b border-gray-200 bg-gray-100 text-xs uppercase"
      )}
    >
      {soft ? (
        <>
          {jp ? (
            <span className="block text-[10px] font-medium leading-tight tracking-normal text-gray-400 normal-case">
              {jp}
            </span>
          ) : null}
          <span className="mt-0.5 block text-[11px] font-semibold leading-tight tracking-normal text-gray-700 normal-case">
            {label}
          </span>
        </>
      ) : jp ? (
        <>
          {jp}
          <br />
          <span className="text-[10px] text-gray-500 normal-case font-medium">{label}</span>
        </>
      ) : (
        <span className="inline-flex items-center justify-center gap-2">
          {leading}
          {label}
        </span>
      )}
    </th>
  );
}

/** Cell aksi sticky kanan */
export function SiswaActionTd({ children }: { children: ReactNode }) {
  return (
    <td className="px-4 py-4 sticky right-0 bg-white admin-sticky-split-left group-hover:bg-slate-50 transition-colors text-center z-10">
      {children}
    </td>
  );
}
