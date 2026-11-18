'use client';
import { Plus, Trash2 } from 'lucide-react';
import { FormField, FormSelect, YmdFields } from './FormControls';
import type { RiwayatPekerjaan } from '../types';
import { BULAN_OPTIONS, TAHUN_OPTIONS } from '../defaults';
import { PEKERJAAN_OPTIONS, withCurrentOption } from '@/lib/cv-referensi';
import { blankPekerjaan, hydratePekerjaan } from '@/lib/cv-slots';

interface Props {
  items: RiwayatPekerjaan[];
  onChange: (items: RiwayatPekerjaan[]) => void;
  errors?: Record<string, string>;
}

const STATUS_OPTIONS = [
  { value: 'Magang', label: '実習 / Magang' },
  { value: 'Karyawan Kontrak', label: '契約社員 / Karyawan Kontrak' },
  { value: 'Karyawan Tetap', label: '正社員 / Karyawan Tetap' },
];

export default function StepPekerjaan({ items, onChange, errors = {} }: Props) {
  const rows = items.map((item, index) => {
    const row = hydratePekerjaan(item);
    return { ...row, id: item.id || row.id || `pekerjaan-${index + 1}` };
  });

  const update = (id: string, patch: Partial<RiwayatPekerjaan>) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const remove = (id: string) => onChange(rows.filter((row) => row.id !== id));

  const add = () => onChange([...rows, { ...blankPekerjaan(rows.length), id: crypto.randomUUID() }]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Tambah riwayat kerja yang ingin dicetak. Baris bisa dihapus.</p>
        <button type="button" onClick={add} className="flex items-center gap-2 px-4 py-2 bg-primary-pink text-white text-sm font-medium rounded-xl hover:bg-[var(--primary-pink-hover)] transition">
          <Plus size={16} /> Tambah
        </button>
      </div>
      {rows.length === 0 && (
        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          職歴なし / Belum ada riwayat pekerjaan
        </div>
      )}
      {rows.map((item, idx) => {
        const jenisValue = item.jenis_pekerjaan || '';
        const legacyPosisi = !jenisValue && item.posisi_pekerjaan ? item.posisi_pekerjaan : '';
        return (
          <div key={item.id || idx} id={`pekerjaan-${item.id}`} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary-pink">職歴 #{idx + 1}</span>
              <button type="button" onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 transition" aria-label="Hapus baris">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                id={`field-pekerjaan-nama-${item.id}`}
                label="会社名 / Nama Perusahaan"
                value={item.nama_perusahaan}
                onChange={(v) => update(item.id, { nama_perusahaan: v })}
                placeholder="PT. Contoh Indonesia"
                error={errors[`pekerjaan-${item.id}-nama_perusahaan`]}
              />
              <FormSelect
                id={`field-pekerjaan-status-${item.id}`}
                label="雇用形態 / Status Pekerjaan"
                value={item.status_pekerjaan}
                onChange={(v) => update(item.id, { status_pekerjaan: v })}
                options={STATUS_OPTIONS}
                error={errors[`pekerjaan-${item.id}-status_pekerjaan`]}
              />
              <FormSelect
                id={`field-pekerjaan-jenis-${item.id}`}
                label="仕事 / Jenis Pekerjaan"
                value={jenisValue || legacyPosisi}
                onChange={(v) => update(item.id, { jenis_pekerjaan: v })}
                options={withCurrentOption(PEKERJAAN_OPTIONS, jenisValue || legacyPosisi)}
                className="sm:col-span-2"
              />
              <FormField
                id={`field-pekerjaan-deskripsi-${item.id}`}
                label="仕事内容 / Deskripsi Pekerjaan"
                value={item.deskripsi_pekerjaan ?? ''}
                onChange={(v) => update(item.id, { deskripsi_pekerjaan: v })}
                type="textarea"
                placeholder="Jelaskan pekerjaan yang dilakukan"
                autoUppercase={false}
                className="sm:col-span-2"
              />
              <YmdFields
                idPrefix={`field-pekerjaan-mulai-${item.id}`}
                label="入社 / Mulai"
                year={item.tahun_mulai}
                month={item.bulan_mulai}
                onYear={(v) => update(item.id, { tahun_mulai: v })}
                onMonth={(v) => update(item.id, { bulan_mulai: v })}
                yearOptions={TAHUN_OPTIONS}
                monthOptions={BULAN_OPTIONS}
                yearError={errors[`pekerjaan-${item.id}-tahun_mulai`]}
                monthError={errors[`pekerjaan-${item.id}-bulan_mulai`]}
              />
              <YmdFields
                idPrefix={`field-pekerjaan-selesai-${item.id}`}
                label="退職 / Selesai"
                year={item.tahun_selesai}
                month={item.bulan_selesai}
                onYear={(v) => update(item.id, { tahun_selesai: v })}
                onMonth={(v) => update(item.id, { bulan_selesai: v })}
                yearOptions={TAHUN_OPTIONS}
                monthOptions={BULAN_OPTIONS}
                yearError={errors[`pekerjaan-${item.id}-tahun_selesai`]}
                monthError={errors[`pekerjaan-${item.id}-bulan_selesai`]}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
