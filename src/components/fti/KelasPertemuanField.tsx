import { pertemuanRule } from "@/lib/fti-kelas-storage";
import type { KelasJalur } from "@/types/student-account";

type Props = {
  jalur: KelasJalur | "";
  value: string;
  onChange: (value: string) => void;
};

export default function KelasPertemuanField({ jalur, value, onChange }: Props) {
  const rule = pertemuanRule(jalur);
  if (!rule) return null;
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Total pertemuan</span>
      <input
        type="number"
        min={rule.min}
        max={rule.max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-pink"
      />
      <span className="mt-1 block text-xs text-gray-400">{rule.hint}</span>
    </label>
  );
}

export function pertemuanInput(jalur: KelasJalur | "", value: string): number | null {
  const rule = pertemuanRule(jalur);
  if (!rule || !jalur) return null;
  return Number(value);
}
