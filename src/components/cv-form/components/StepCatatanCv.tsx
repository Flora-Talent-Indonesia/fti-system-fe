'use client';
import { FormField } from './FormControls';
import { NashiAruDuration, NashiAruText } from './NashiAruFields';
import type { CatatanCv } from '../types';
import { CATATAN_NASHI, displayNashiAruStatus } from '@/lib/cv-catatan';

interface Props {
  data: CatatanCv;
  onChange: (data: CatatanCv) => void;
}

export default function StepCatatanCv({ data, onChange }: Props) {
  const set = (patch: Partial<CatatanCv>) => onChange({ ...data, ...patch });
  const medisStatus = displayNashiAruStatus(data.keterangan_medis_status, data.keterangan_medis);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100">
          海外への渡航履歴 / Riwayat ke Luar Negeri
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="field-periode-luar-negeri"
            label="渡航時期 / Kapan"
            value={data.periode_luar_negeri}
            onChange={(v) => set({ periode_luar_negeri: v })}
            type="textarea"
            autoUppercase={false}
            placeholder="Contoh: 2024年6月, atau kosongkan jika belum pernah"
          />
          <FormField
            id="field-tujuan-luar-negeri"
            label="渡航目的 / Tujuan"
            value={data.tujuan_luar_negeri}
            onChange={(v) => set({ tujuan_luar_negeri: v })}
            type="textarea"
            autoUppercase={false}
            placeholder="Contoh: 観光 / wisata"
          />
        </div>
        <NashiAruDuration
          label="特定技能残日数 / Sisa Masa Kerja Tokutei Ginou"
          status={data.sisa_hari_tokutei}
          tahun={data.sisa_tahun ?? ''}
          bulan={data.sisa_bulan ?? ''}
          onStatus={(value) =>
            set(
              value === CATATAN_NASHI
                ? { sisa_hari_tokutei: value, sisa_tahun: '', sisa_bulan: '' }
                : { sisa_hari_tokutei: value },
            )
          }
          onTahun={(value) => set({ sisa_tahun: value })}
          onBulan={(value) => set({ sisa_bulan: value })}
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100">
          日本での目標 / Tujuan ke Jepang
        </h3>
        <p className="text-sm text-slate-500">Bisa diubah lagi nanti dari halaman profil siswa.</p>
        <FormField
          id="field-tujuan-jepang"
          label="Alasan ingin bekerja di Jepang dan di bidang ini"
          value={data.tujuan_ke_jepang}
          onChange={(v) => set({ tujuan_ke_jepang: v })}
          type="textarea"
          rows={6}
          autoUppercase={false}
          placeholder="Tuliskan alasan yang meyakinkan, misalnya pengalaman di bidang yang sama."
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100">
          追加情報 / Keterangan Tambahan
        </h3>
        <NashiAruText
          label="Apakah sedang dalam perawatan medis atau mengonsumsi obat tertentu?"
          detailLabel="Obat atau perawatan"
          status={medisStatus}
          detail={medisStatus === CATATAN_NASHI ? '' : data.keterangan_medis}
          onStatus={(value) =>
            set(
              value === CATATAN_NASHI
                ? { keterangan_medis_status: value, keterangan_medis: '' }
                : {
                    keterangan_medis_status: value,
                    keterangan_medis: data.keterangan_medis === CATATAN_NASHI ? '' : data.keterangan_medis,
                  },
            )
          }
          onDetail={(value) => set({ keterangan_medis_status: 'あり', keterangan_medis: value })}
        />
      </section>
    </div>
  );
}
