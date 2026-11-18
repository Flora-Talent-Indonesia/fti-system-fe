'use client';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FormField, FormSelect, YmdFields } from './FormControls';
import type { Sertifikat } from '../types';
import { BULAN_OPTIONS, TAHUN_OPTIONS } from '../defaults';
import { SERTIFIKAT_OPTIONS, withCurrentOption } from '@/lib/cv-referensi';
import { PDF_ACCEPT_INPUT, TOOLTIP_CERT_PDF, isAllowedPdfUpload } from '../file-upload-rules';
import { FileRuleTooltip } from './FileRuleTooltip';

interface Props {
  items: Sertifikat[];
  onChange: (items: Sertifikat[]) => void;
  onFileChange?: (id: string, file: File | null) => void;
  errors?: Record<string, string>;
}

const STATUS_KELULUSAN_OPTIONS = [
  { value: '合格', label: 'Lulus (合格)' },
  { value: '不合格', label: 'Tidak Lulus (不合格)' },
];

const emptyItem = (): Sertifikat => ({
  id: crypto.randomUUID(),
  tahun_diperoleh: '', bulan_diperoleh: '', tanggal_diperoleh: '',
  nama_sertifikat: '', status_kelulusan: '', keterangan_skor: '', foto_sertifikat: '',
});

export default function StepSertifikat({ items, onChange, onFileChange, errors = {} }: Props) {
  const add = () => onChange([...items, emptyItem()]);
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, key: keyof Sertifikat, val: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [key]: val } : i)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">免許・資格・運転免許を追加してください。</p>
        <button onClick={add} className="flex items-center gap-2 px-4 py-2 bg-primary-pink text-white text-sm font-medium rounded-xl hover:bg-[var(--primary-pink-hover)] transition">
          <Plus size={16} /> Tambah
        </button>
      </div>
      {items.length === 0 && (
        <div
          id="field-sertifikat-empty"
          className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl"
        >
          資格データなし / Belum ada sertifikat / lisensi
        </div>
      )}
      {items.map((item, idx) => (
        <div key={item.id} id={`sertifikat-${item.id}`} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary-pink">免許・資格 #{idx + 1}</span>
            <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 transition"><Trash2 size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              id={`field-sertifikat-nama-${item.id}`}
              label="免許・資格 / Nama Sertifikat"
              value={item.nama_sertifikat}
              onChange={(v) => update(item.id, 'nama_sertifikat', v)}
              options={withCurrentOption(SERTIFIKAT_OPTIONS, item.nama_sertifikat)}
              required
              className="sm:col-span-2"
              error={errors[`sertifikat-${item.id}-nama_sertifikat`]}
            />
            <FormSelect
              id={`field-sertifikat-status-${item.id}`}
              label="合否 / Status Kelulusan"
              value={item.status_kelulusan}
              onChange={(v) => update(item.id, 'status_kelulusan', v)}
              options={STATUS_KELULUSAN_OPTIONS}
              placeholder="Pilih status..."
              error={errors[`sertifikat-${item.id}-status_kelulusan`]}
            />
            <FormField
              id={`field-sertifikat-skor-${item.id}`}
              label="スコア / Skor (opsional)"
              value={item.keterangan_skor}
              onChange={(v) => update(item.id, 'keterangan_skor', v)}
              placeholder="Contoh: 245 Poin"
              error={errors[`sertifikat-${item.id}-keterangan_skor`]}
            />
            <YmdFields
              idPrefix={`field-sertifikat-tanggal-${item.id}`}
              label="取得 / Diperoleh"
              year={item.tahun_diperoleh}
              month={item.bulan_diperoleh}
              onYear={(v) => update(item.id, 'tahun_diperoleh', v)}
              onMonth={(v) => update(item.id, 'bulan_diperoleh', v)}
              yearOptions={TAHUN_OPTIONS}
              monthOptions={BULAN_OPTIONS}
            />
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <div className="text-sm font-medium text-slate-700 inline-flex items-center gap-1.5">
                <span>File Sertifikat (PDF)</span>
                <span className="text-red-500">*</span>
                <FileRuleTooltip text={TOOLTIP_CERT_PDF} />
              </div>
              <input
                id={`field-sertifikat-file-${item.id}`}
                type="file"
                accept={PDF_ACCEPT_INPUT}
                title={TOOLTIP_CERT_PDF}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (file && !isAllowedPdfUpload(file)) {
                    toast.error('Lampiran sertifikat wajib berupa PDF.');
                    e.target.value = '';
                    update(item.id, 'foto_sertifikat', '');
                    onFileChange?.(item.id, null);
                    return;
                  }
                  update(item.id, 'foto_sertifikat', file?.name || '');
                  onFileChange?.(item.id, file);
                }}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent transition file:mr-3 file:border-0 file:bg-primary-pink-light file:text-primary-pink file:px-3 file:py-1.5 file:rounded-lg file:cursor-pointer ${
                  errors[`sertifikat-${item.id}-foto_sertifikat`] ? 'border-red-400' : 'border-slate-200'
                }`}
              />
              <p className="text-xs text-slate-500">
                {item.foto_sertifikat ? `Terpilih: ${item.foto_sertifikat}` : 'Belum ada PDF dipilih'}
              </p>
              {errors[`sertifikat-${item.id}-foto_sertifikat`] && (
                <p className="text-xs text-red-600">{errors[`sertifikat-${item.id}-foto_sertifikat`]}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
