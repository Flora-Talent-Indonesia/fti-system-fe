"use client";

import { FormField, FormSelect } from "@/components/cv-form/components/FormControls";
import { LPK_PROGRAM_OPTIONS } from "@/lib/placement";

type Schedule = {
  tanggal_masuk_pelatihan: string;
  tanggal_kelulusan: string;
  perkiraan_masuk_jepang: string;
  tanggal_keberangkatan: string;
};

type Props = {
  program: string;
  onProgram: (value: string) => void;
  job: string;
  onJob: (value: string) => void;
  asalLpk: string;
  /** Tanggal pelatihan hanya diubah FTI. Kosongkan di form tambah siswa. */
  schedule?: Schedule;
  onSchedule?: (patch: Partial<Schedule>) => void;
  scheduleEditable?: boolean;
};

export default function LpkProgramFields({
  program,
  onProgram,
  job,
  onJob,
  asalLpk,
  schedule,
  onSchedule,
  scheduleEditable = false,
}: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Program dipilih LPK. Asal LPK terisi otomatis. Job ditulis sebagai nama job - lokasi supaya FTI
        mudah membaca data, misalnya PM - Gunma atau PM - Ichikawa.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <FormSelect
          label="Program"
          value={program}
          onChange={onProgram}
          options={[...LPK_PROGRAM_OPTIONS]}
          placeholder="Pilih program"
        />
        <FormField
          label="Asal LPK"
          value={asalLpk}
          onChange={() => {}}
          readOnly
          hint="Terisi otomatis dari akun LPK"
        />
        <FormField
          label="Job"
          value={job}
          onChange={onJob}
          autoUppercase={false}
          placeholder="PM - Gunma"
          hint="Nama job - lokasi"
          className="md:col-span-2"
        />
        {schedule && (
          <>
            <FormField
              label="Tanggal Masuk Pelatihan"
              type="date"
              value={schedule.tanggal_masuk_pelatihan}
              onChange={(v) => onSchedule?.({ tanggal_masuk_pelatihan: v })}
              disabled={!scheduleEditable}
              hint={scheduleEditable ? undefined : "Diisi oleh FTI"}
            />
            <FormField
              label="Tanggal Kelulusan"
              type="date"
              value={schedule.tanggal_kelulusan}
              onChange={(v) => onSchedule?.({ tanggal_kelulusan: v })}
              disabled={!scheduleEditable}
              hint={scheduleEditable ? undefined : "Diisi oleh FTI"}
            />
            <FormField
              label="Perkiraan Masuk Jepang"
              type="date"
              value={schedule.perkiraan_masuk_jepang}
              onChange={(v) => onSchedule?.({ perkiraan_masuk_jepang: v })}
              disabled={!scheduleEditable}
              hint={scheduleEditable ? undefined : "Diisi oleh FTI"}
            />
            <FormField
              label="Tanggal Keberangkatan"
              type="date"
              value={schedule.tanggal_keberangkatan}
              onChange={(v) => onSchedule?.({ tanggal_keberangkatan: v })}
              disabled={!scheduleEditable}
              hint={scheduleEditable ? undefined : "Diisi oleh FTI"}
            />
          </>
        )}
      </div>
      {!schedule && (
        <p className="text-xs text-gray-500">
          Tanggal masuk pelatihan, tanggal kelulusan, perkiraan masuk Jepang, dan tanggal keberangkatan
          diisi oleh FTI.
        </p>
      )}
    </div>
  );
}
