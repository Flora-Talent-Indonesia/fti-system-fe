'use client';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { FormField, FormSelect, YmdFields } from './FormControls';
import type { RiwayatPendidikan } from '../types';
import { BULAN_OPTIONS, TAHUN_OPTIONS } from '../defaults';
import { JURUSAN_OPTIONS, withCurrentOption } from '@/lib/cv-referensi';
import {
  PENDIDIKAN_SLOTS,
  type PendidikanSlotKey,
  arrangePendidikan,
  isPendidikanFilled,
} from '@/lib/cv-slots';

interface Props {
  items: RiwayatPendidikan[];
  onChange: (items: RiwayatPendidikan[]) => void;
  errors?: Record<string, string>;
}

const SMA_TINGKAT = [
  { value: 'SMA', label: '高校 / SMA' },
  { value: 'SMK', label: '専門高校 / SMK' },
];
const UNIV_TINGKAT = [
  { value: 'D3', label: '大学（3年）/ D3' },
  { value: 'S1', label: '大学（4年）/ S1' },
];
const ALL_TINGKAT = [
  { value: 'SD', label: '小学校 / SD' },
  { value: 'SMP', label: '中学校 / SMP' },
  ...SMA_TINGKAT,
  ...UNIV_TINGKAT,
];

export default function StepPendidikan({ items, onChange, errors = {} }: Props) {
  const { slots, overflow } = arrangePendidikan(items);
  const [opened, setOpened] = useState<PendidikanSlotKey[]>([]);

  useEffect(() => {
    const { slots: next } = arrangePendidikan(items);
    setOpened((prev) => prev.filter((key) => {
      const index = PENDIDIKAN_SLOTS.findIndex((slot) => slot.key === key);
      return index >= 0 && !isPendidikanFilled(next[index]);
    }));
  }, [items]);

  const commit = (nextSlots: RiwayatPendidikan[], nextOverflow: RiwayatPendidikan[]) => {
    onChange([...nextSlots, ...nextOverflow].filter(isPendidikanFilled));
  };

  const patchSlot = (index: number, patch: Partial<RiwayatPendidikan>) => {
    const next = slots.map((item, i) => (i === index ? { ...item, ...patch } : item));
    commit(next, overflow);
  };

  const removeSlot = (key: PendidikanSlotKey, item: RiwayatPendidikan) => {
    setOpened((prev) => prev.filter((open) => open !== key));
    onChange(items.filter((row) => row.id !== item.id));
  };

  const visible = slots
    .map((item, index) => ({ item, index, slot: PENDIDIKAN_SLOTS[index] }))
    .filter(({ item, slot }) => isPendidikanFilled(item) || opened.includes(slot.key));
  const hidden = PENDIDIKAN_SLOTS.filter((slot, index) => !isPendidikanFilled(slots[index]) && !opened.includes(slot.key));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Isi jenjang yang dilalui. Jenjang yang tidak dicantumkan bisa dihapus, sama seperti sertifikat.
        </p>
        {hidden.length > 0 && (
          <select
            aria-label="Tambah jenjang"
            value=""
            onChange={(event) => {
              const key = event.target.value as PendidikanSlotKey;
              if (!key) return;
              setOpened((prev) => (prev.includes(key) ? prev : [...prev, key]));
            }}
            className="border border-slate-200 bg-white rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-pink"
          >
            <option value="">Tambah jenjang</option>
            {hidden.map((slot) => (
              <option key={slot.key} value={slot.key}>{slot.heading}</option>
            ))}
          </select>
        )}
      </div>
      {errors['pendidikan-empty'] && (
        <p className="text-sm text-red-600">{errors['pendidikan-empty']}</p>
      )}
      {visible.length === 0 && overflow.length === 0 && (
        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          Belum ada riwayat pendidikan
        </div>
      )}
      {visible.map(({ item, index, slot }) => {
        const filled = isPendidikanFilled(item);
        const tingkatOptions = slot.key === 'sma' ? SMA_TINGKAT : slot.key === 'univ' ? UNIV_TINGKAT : [];
        return (
          <div key={slot.key} id={`pendidikan-${item.id}`} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary-pink">{slot.heading}</span>
              <button type="button" onClick={() => removeSlot(slot.key, item)} className="text-red-400 hover:text-red-600 transition" aria-label={`Hapus ${slot.heading}`}>
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tingkatOptions.length > 0 && (
                <FormSelect
                  id={`field-pendidikan-tingkat-${item.id}`}
                  label="学歴 / Jenjang"
                  value={item.tingkat_pendidikan}
                  onChange={(v) => patchSlot(index, { tingkat_pendidikan: v })}
                  options={tingkatOptions}
                  required={filled}
                  error={errors[`pendidikan-${item.id}-tingkat_pendidikan`]}
                />
              )}
              <FormField
                id={`field-pendidikan-nama-${item.id}`}
                label="学校名 / Nama Sekolah"
                value={item.nama_sekolah}
                onChange={(v) => patchSlot(index, { nama_sekolah: v })}
                placeholder="Contoh: SMAN 1 Bandung"
                required={filled}
                className={tingkatOptions.length === 0 ? 'sm:col-span-2' : ''}
                error={errors[`pendidikan-${item.id}-nama_sekolah`]}
              />
              {slot.needsJurusan && (
                <FormSelect
                  id={`field-pendidikan-jurusan-${item.id}`}
                  label="専攻 / Jurusan"
                  value={item.jurusan}
                  onChange={(v) => patchSlot(index, { jurusan: v })}
                  options={withCurrentOption(JURUSAN_OPTIONS, item.jurusan)}
                  required={filled}
                  className="sm:col-span-2"
                  error={errors[`pendidikan-${item.id}-jurusan`]}
                />
              )}
              <YmdFields
                idPrefix={`field-pendidikan-masuk-${item.id}`}
                label="入学 / Masuk"
                year={item.tahun_masuk}
                month={item.bulan_masuk}
                onYear={(v) => patchSlot(index, { tahun_masuk: v })}
                onMonth={(v) => patchSlot(index, { bulan_masuk: v })}
                yearOptions={TAHUN_OPTIONS}
                monthOptions={BULAN_OPTIONS}
                yearError={errors[`pendidikan-${item.id}-tahun_masuk`]}
                monthError={errors[`pendidikan-${item.id}-bulan_masuk`]}
              />
              <YmdFields
                idPrefix={`field-pendidikan-lulus-${item.id}`}
                label="卒業 / Lulus"
                year={item.tahun_lulus}
                month={item.bulan_lulus}
                onYear={(v) => patchSlot(index, { tahun_lulus: v })}
                onMonth={(v) => patchSlot(index, { bulan_lulus: v })}
                yearOptions={TAHUN_OPTIONS}
                monthOptions={BULAN_OPTIONS}
                yearError={errors[`pendidikan-${item.id}-tahun_lulus`]}
                monthError={errors[`pendidikan-${item.id}-bulan_lulus`]}
              />
            </div>
          </div>
        );
      })}
      {overflow.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            Riwayat di luar empat jenjang tidak dicetak di CV. Pindahkan ke slot yang sesuai, atau hapus.
          </p>
          {overflow.map((item, idx) => (
            <div key={item.id || idx} className="border border-amber-200 rounded-2xl p-5 bg-amber-50/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-amber-900">Di luar slot #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((row) => row.id !== item.id))}
                  className="text-red-400 hover:text-red-600 transition"
                  aria-label="Hapus riwayat di luar slot"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  label="Jenjang"
                  value={item.tingkat_pendidikan}
                  onChange={(v) => {
                    const next = overflow.map((row) => (row.id === item.id ? { ...row, tingkat_pendidikan: v } : row));
                    commit(slots, next);
                  }}
                  options={ALL_TINGKAT}
                />
                <FormField
                  label="Nama Sekolah"
                  value={item.nama_sekolah}
                  onChange={(v) => {
                    const next = overflow.map((row) => (row.id === item.id ? { ...row, nama_sekolah: v } : row));
                    commit(slots, next);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
