'use client';
import { Plus, Trash2 } from 'lucide-react';
import { FormField, FormSelect } from './FormControls';
import type { AnggotaKeluarga } from '../types';
import { HUBUNGAN_OPTIONS } from '@/lib/cv-hubungan';
import { PEKERJAAN_OPTIONS, withCurrentOption } from '@/lib/cv-referensi';
import { blankKeluarga } from '@/lib/cv-slots';

interface Props {
  items: AnggotaKeluarga[];
  onChange: (items: AnggotaKeluarga[]) => void;
  errors?: Record<string, string>;
}

export default function StepKeluarga({ items, onChange, errors = {} }: Props) {
  const rows = items.map((item, index) => ({ ...blankKeluarga(index), ...item, umur: item.umur ?? '' }));

  const update = (id: string, patch: Partial<AnggotaKeluarga>) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const remove = (id: string) => onChange(rows.filter((row) => row.id !== id));

  const add = () => onChange([...rows, { ...blankKeluarga(rows.length), id: crypto.randomUUID() }]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Tambah anggota keluarga. Baris bisa dihapus. Minimal satu anggota saat lanjut.</p>
        <button type="button" onClick={add} className="flex items-center gap-2 px-4 py-2 bg-primary-pink text-white text-sm font-medium rounded-xl hover:bg-[var(--primary-pink-hover)] transition">
          <Plus size={16} /> Tambah
        </button>
      </div>
      {errors['keluarga-empty'] && (
        <p className="text-sm text-red-600">{errors['keluarga-empty']}</p>
      )}
      {rows.length === 0 && (
        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          Belum ada anggota keluarga
        </div>
      )}
      {rows.map((item, idx) => {
        const filled = Boolean(item.hubungan || item.nama_anggota || item.umur || item.pekerjaan);
        return (
          <div key={item.id || idx} id={`keluarga-${item.id}`} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary-pink">家族 #{idx + 1}</span>
              <button type="button" onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 transition" aria-label="Hapus baris">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormSelect
                id={`field-keluarga-hubungan-${item.id}`}
                label="続柄 / Hubungan"
                value={item.hubungan}
                onChange={(v) => update(item.id, { hubungan: v })}
                options={HUBUNGAN_OPTIONS}
                required={filled}
                error={errors[`keluarga-${item.id}-hubungan`]}
              />
              <FormField
                id={`field-keluarga-nama-${item.id}`}
                label="氏名 / Nama"
                value={item.nama_anggota}
                onChange={(v) => update(item.id, { nama_anggota: v })}
                placeholder="Nama lengkap"
                required={filled}
                error={errors[`keluarga-${item.id}-nama_anggota`]}
              />
              <FormField
                id={`field-keluarga-umur-${item.id}`}
                label="年齢 / Umur (tahun)"
                value={item.umur ?? ''}
                onChange={(v) => update(item.id, { umur: v.replace(/\D/g, '') })}
                type="number"
                placeholder="Contoh: 55"
                required={filled}
                autoUppercase={false}
                error={errors[`keluarga-${item.id}-umur`]}
              />
              <FormSelect
                id={`field-keluarga-pekerjaan-${item.id}`}
                label="仕事内容 / Pekerjaan"
                value={item.pekerjaan}
                onChange={(v) => update(item.id, { pekerjaan: v })}
                options={withCurrentOption(PEKERJAAN_OPTIONS, item.pekerjaan)}
                required={filled}
                error={errors[`keluarga-${item.id}-pekerjaan`]}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
