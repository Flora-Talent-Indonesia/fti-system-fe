'use client';
import { FormField, FormSelect } from './FormControls';
import { CATATAN_ARU, CATATAN_NASHI } from '@/lib/cv-catatan';

const STATUS_OPTIONS = [
  { value: CATATAN_NASHI, label: 'なし / Tidak ada' },
  { value: CATATAN_ARU, label: 'あり / Ada' },
];

export function NashiAruDuration({
  label,
  status,
  tahun,
  bulan,
  onStatus,
  onTahun,
  onBulan,
}: {
  label: string;
  status: string;
  tahun: string;
  bulan: string;
  onStatus: (value: string) => void;
  onTahun: (value: string) => void;
  onBulan: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <FormSelect label={label} value={status} onChange={onStatus} options={STATUS_OPTIONS} />
      {status === CATATAN_ARU && (
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="年 / Tahun"
            value={tahun}
            onChange={(v) => onTahun(v.replace(/\D/g, '').slice(0, 2))}
            inputMode="numeric"
            autoUppercase={false}
            placeholder="0"
          />
          <FormField
            label="月 / Bulan"
            value={bulan}
            onChange={(v) => {
              const digits = v.replace(/\D/g, '').slice(0, 2);
              onBulan(digits === '' ? '' : String(Math.min(11, Number(digits))));
            }}
            inputMode="numeric"
            autoUppercase={false}
            placeholder="0"
          />
        </div>
      )}
    </div>
  );
}

export function NashiAruText({
  label,
  detailLabel,
  status,
  detail,
  onStatus,
  onDetail,
}: {
  label: string;
  detailLabel: string;
  status: string;
  detail: string;
  onStatus: (value: string) => void;
  onDetail: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <FormSelect label={label} value={status} onChange={onStatus} options={STATUS_OPTIONS} />
      {status === CATATAN_ARU && (
        <FormField
          label={detailLabel}
          value={detail}
          onChange={onDetail}
          type="textarea"
          rows={4}
          autoUppercase={false}
          placeholder="Tuliskan obat atau perawatan yang sedang dijalani"
        />
      )}
    </div>
  );
}
