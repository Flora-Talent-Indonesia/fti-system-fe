"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import SectionPanel from "@/components/lpk/SectionPanel";
import DownloadFileButton from "@/components/lpk/DownloadFileButton";
import { fmtGender, cell } from "@/app/lpk-mitra/components/table-helpers";
import {
  fmtJalurPendaftaran,
  getKota,
  getNamaPerusahaan,
  getPrefektur,
  statusSiswaColor,
  statusSiswaLabel,
} from "@/lib/alumni-display-utils";
import type { LpkStudentRecord } from "@/types/lpk-student";

const TABS = [
  { id: "biodata", label: "Profil & Kontak", icon: "👤" },
  { id: "pendidikan", label: "Riwayat Pendidikan", icon: "🎓" },
  { id: "pekerjaan", label: "Riwayat Pekerjaan", icon: "💼" },
  { id: "sertifikat", label: "Sertifikat & Lisensi", icon: "🏆" },
  { id: "keluarga", label: "Keluarga", icon: "👨‍👩‍👧‍👦" },
  { id: "dokumen", label: "Dokumen & MCU", icon: "📎" },
  { id: "qualification", label: "Qualification", icon: "🌟" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function ViewField({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold tracking-wide text-gray-600 uppercase mb-1.5">{label}</p>
      <div className="text-sm text-gray-900 bg-white border border-gray-200 px-3 py-2 min-h-[38px] break-words">
        {value === null || value === undefined || value === "" ? "—" : value}
      </div>
    </div>
  );
}

function EmptyTab({ message }: { message: string }) {
  return <p className="text-sm text-gray-500 italic py-4">{message}</p>;
}

export default function AlumniFullDataModal({
  student,
  onClose,
  allowDownload = true,
}: {
  student: LpkStudentRecord;
  onClose: () => void;
  allowDownload?: boolean;
}) {
  const [tab, setTab] = useState<TabId>("biodata");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const jp = student.job_placement;
  const sLabel = statusSiswaLabel(student.status);
  const sColor = statusSiswaColor(student.status);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-6xl max-h-[92vh] bg-white border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80 flex-shrink-0">
          <div className="min-w-0">
            <h2 className="text-xl font-serif text-gray-900">Data Lengkap Alumni</h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate">
              {student.nama_lengkap} · {student.no_peserta}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-semibold border ${sColor}`}>
                {sLabel}
              </span>
              <span className="text-xs text-gray-500">
                Jalur: <strong className="text-gray-700">{fmtJalurPendaftaran(student.asal_lpk)}</strong>
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 shrink-0">
            <X size={22} />
          </button>
        </div>

        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto flex-shrink-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                tab === t.id
                  ? "border-primary-pink text-primary-pink bg-white font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/80"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
          {tab === "biodata" && (
            <>
              <SectionPanel title="Foto & Identitas Inti">
                <div className="grid md:grid-cols-[200px_1fr] gap-6">
                  <div className="w-40 h-52 border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center mx-auto md:mx-0">
                    {student.foto ? (
                      <img src={student.foto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl text-gray-300">👤</span>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ViewField label="No Peserta" value={student.no_peserta} />
                    <ViewField label="NIK" value={student.nik} />
                    <ViewField label="Angkatan" value={student.angkatan} />
                    <ViewField label="Nama Lengkap" value={student.nama_lengkap} />
                    <ViewField label="Nama Katakana" value={student.nama_katakana} />
                    <ViewField label="Nama Panggilan" value={student.nama_panggilan} />
                    <ViewField label="Kewarganegaraan" value={student.kewarganegaraan} />
                    <ViewField label="Tanggal Lahir" value={student.tanggal_lahir} />
                    <ViewField label="Umur" value={student.umur} />
                    <ViewField label="Jenis Kelamin" value={fmtGender(student.jenis_kelamin)} />
                    <ViewField label="Golongan Darah" value={student.golongan_darah} />
                    <ViewField label="Status Pernikahan" value={student.status_pernikahan} />
                    <ViewField label="Agama" value={student.agama} />
                  </div>
                </div>
              </SectionPanel>

              <SectionPanel title="Kontak & Alamat">
                <div className="grid md:grid-cols-2 gap-4">
                  <ViewField label="Asal (Tempat Lahir)" value={student.asal} />
                  <ViewField label="Kode Pos" value={student.kode_pos} />
                  <ViewField label="Telepon" value={student.telepon} />
                  <ViewField label="Email" value={student.email} />
                  <ViewField label="Alamat" value={student.alamat} className="md:col-span-2" />
                </div>
              </SectionPanel>

              <SectionPanel title="身体・健康 / Medis & Fisik">
                <div className="grid md:grid-cols-3 gap-4">
                  <ViewField label="Berat Badan (kg)" value={student.berat_badan} />
                  <ViewField label="Tinggi Badan (cm)" value={student.tinggi_badan} />
                  <div />
                  <ViewField label="Visus Mata Kiri" value={student.mata_kiri} />
                  <ViewField label="Kondisi Mata Kiri" value={student.kondisi_mata_kiri} />
                  <div />
                  <ViewField label="Visus Mata Kanan" value={student.mata_kanan} />
                  <ViewField label="Kondisi Mata Kanan" value={student.kondisi_mata_kanan} />
                  <div />
                  <ViewField label="Berkacamata" value={student.berkacamata} />
                  <ViewField label="Buta Warna" value={student.buta_warna} />
                  <div />
                  <ViewField label="Tato" value={student.tato} />
                  <ViewField label="Patah Tulang" value={student.patah_tulang} />
                  <ViewField label="Merokok" value={student.merokok} />
                  {student.merokok === "Ya" && (
                    <ViewField label="Frekuensi Merokok" value={student.frequensi_merokok} />
                  )}
                  <ViewField label="Hobi" value={student.hobi} className="md:col-span-2" />
                </div>
              </SectionPanel>

              <SectionPanel title="Penempatan & Jadwal">
                <div className="grid md:grid-cols-2 gap-4">
                  <ViewField label="Tingkatan Pembelajaran" value={student.tingkatan_pembelajaran} />
                  <ViewField label="Asal LPK" value={student.asal_lpk} />
                  <ViewField label="Jalur Pendaftaran" value={fmtJalurPendaftaran(student.asal_lpk)} />
                  <ViewField label="Nama SO" value={student.nama_so} />
                  <ViewField label="Nama Kumiai" value={student.nama_kumiai} />
                  <ViewField label="Program / Jenis Pekerjaan" value={student.jenis_pekerjaan} />
                  <ViewField label="Nama Perusahaan (Di Jepang)" value={getNamaPerusahaan(student)} />
                  <ViewField label="Prefektur" value={getPrefektur(student)} />
                  <ViewField label="Kota" value={getKota(student)} />
                  <ViewField label="Tanggal Masuk Pelatihan" value={student.tanggal_masuk_pelatihan} />
                  <ViewField label="Perkiraan Masuk Jepang" value={student.perkiraan_masuk_jepang} />
                  <ViewField label="Tanggal Keberangkatan" value={student.tanggal_keberangkatan} />
                  <ViewField label="Tanggal Kelulusan" value={student.tanggal_kelulusan} />
                </div>
              </SectionPanel>

              {jp && (
                <SectionPanel title="Detail Penempatan Kerja di Jepang">
                  <div className="grid md:grid-cols-2 gap-4">
                    <ViewField label="Alamat Kerja" value={jp.alamat_kerja} className="md:col-span-2" />
                    <ViewField label="Bidang Usaha" value={jp.bidang_usaha} />
                    <ViewField label="Posisi" value={jp.posisi} />
                    <ViewField label="Gaji" value={jp.gaji} />
                    <ViewField label="Durasi Kontrak" value={jp.durasi_kontrak} />
                    <ViewField label="Hari Libur" value={jp.hari_libur} className="md:col-span-2" />
                  </div>
                </SectionPanel>
              )}
            </>
          )}

          {tab === "pendidikan" && (
            <SectionPanel title="Riwayat Pendidikan">
              {!student.pendidikan?.length ? (
                <EmptyTab message="Belum ada riwayat pendidikan." />
              ) : (
                <div className="space-y-4">
                  {student.pendidikan.map((p, i) => (
                    <div key={i} className="border border-gray-200 bg-white p-4 grid md:grid-cols-2 gap-3">
                      <ViewField label="Nama Sekolah" value={p.nama_sekolah} />
                      <ViewField label="Tingkat Pendidikan" value={p.tingkat_pendidikan} />
                      <ViewField label="Jurusan" value={p.jurusan} />
                      <ViewField
                        label="Periode"
                        value={`${cell(p.bulan_masuk)}/${cell(p.tahun_masuk)} — ${cell(p.bulan_lulus)}/${cell(p.tahun_lulus)}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </SectionPanel>
          )}

          {tab === "pekerjaan" && (
            <SectionPanel title="Riwayat Pekerjaan">
              {!student.pekerjaan?.length ? (
                <EmptyTab message="Belum ada riwayat pekerjaan." />
              ) : (
                <div className="space-y-4">
                  {student.pekerjaan.map((p, i) => (
                    <div key={i} className="border border-gray-200 bg-white p-4 grid md:grid-cols-2 gap-3">
                      <ViewField label="Nama Perusahaan" value={p.nama_perusahaan} />
                      <ViewField label="Posisi" value={p.posisi_pekerjaan} />
                      <ViewField label="Status Pekerjaan" value={p.status_pekerjaan} />
                      <ViewField
                        label="Periode"
                        value={`${cell(p.bulan_mulai)}/${cell(p.tahun_mulai)} — ${cell(p.bulan_selesai)}/${cell(p.tahun_selesai)}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </SectionPanel>
          )}

          {tab === "sertifikat" && (
            <SectionPanel title="Sertifikat & Lisensi">
              {!student.sertifikat?.length && !student.sertifikat_dimiliki?.length ? (
                <EmptyTab message="Belum ada sertifikat." />
              ) : (
                <div className="space-y-3">
                  {(student.sertifikat?.length
                    ? student.sertifikat
                    : student.sertifikat_dimiliki.map((n) => ({ nama_sertifikat: n }))
                  ).map((s, i) => (
                    <div key={i} className="border border-gray-200 bg-white p-4 grid md:grid-cols-2 gap-3">
                      <ViewField label="Nama Sertifikat" value={s.nama_sertifikat} />
                      {"status_kelulusan" in s && (
                        <ViewField
                          label="Status Kelulusan"
                          value={s.status_kelulusan === 1 ? "Lulus" : s.status_kelulusan === 0 ? "Tidak Lulus" : "—"}
                        />
                      )}
                      {"score" in s && <ViewField label="Skor / Keterangan" value={s.score} />}
                      {"bulan_diperoleh" in s && (
                        <ViewField
                          label="Diperoleh"
                          value={`${cell(s.bulan_diperoleh)}/${cell(s.tahun_diperoleh)}`}
                        />
                      )}
                      {"sertifikat" in s && s.sertifikat && (
                        <div className="md:col-span-2">
                          {allowDownload ? (
                            <DownloadFileButton
                              filename={String(s.sertifikat)}
                              studentName={student.nama_lengkap}
                            />
                          ) : (
                            <ViewField label="File Sertifikat" value={s.sertifikat} />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionPanel>
          )}

          {tab === "keluarga" && (
            <SectionPanel title="Data Orang Tua / Keluarga">
              {!student.keluarga?.length ? (
                <EmptyTab message="Belum ada data keluarga." />
              ) : (
                <ul className="space-y-3">
                  {student.keluarga.map((k, i) => (
                    <li key={i} className="border border-gray-200 bg-white p-4 grid md:grid-cols-2 gap-3">
                      <ViewField label="Nama" value={k.nama} />
                      <ViewField label="Hubungan" value={k.hubungan} />
                      <ViewField label="Umur" value={k.umur} />
                      <ViewField label="Status Pekerjaan" value={k.status_pekerjaan} />
                    </li>
                  ))}
                </ul>
              )}
            </SectionPanel>
          )}

          {tab === "dokumen" && (
            <div className="space-y-6">
              <SectionPanel title="Dokumen Pendukung">
                <div className="grid md:grid-cols-2 gap-4">
                  {(
                    [
                      { key: "dokumen_ktp", label: "KTP" },
                      { key: "dokumen_kk", label: "Kartu Keluarga (KK)" },
                      { key: "dokumen_akte", label: "Akte Kelahiran" },
                      { key: "dokumen_ijazah", label: "Ijazah Terakhir" },
                    ] as const
                  ).map(({ key, label }) => (
                    <div key={key}>
                      <p className="text-xs font-semibold tracking-wide text-gray-600 uppercase mb-1.5">{label}</p>
                      {student[key] ? (
                        allowDownload ? (
                          <DownloadFileButton filename={student[key]} studentName={student.nama_lengkap} />
                        ) : (
                          <ViewField label="" value={student[key]} />
                        )
                      ) : (
                        <ViewField label="" value="—" />
                      )}
                    </div>
                  ))}
                </div>
              </SectionPanel>
              <SectionPanel title="Hasil Medical Check Up (MCU)">
                <ViewField label="Hasil MCU" value={student.mcu} />
                <div className="mt-4">
                  <p className="text-xs font-semibold tracking-wide text-gray-600 uppercase mb-1.5">File MCU</p>
                  {student.mcu_pdf ? (
                    allowDownload ? (
                      <DownloadFileButton filename={student.mcu_pdf} studentName={student.nama_lengkap} />
                    ) : (
                      <ViewField label="" value={student.mcu_pdf} />
                    )
                  ) : (
                    <ViewField label="" value="—" />
                  )}
                </div>
              </SectionPanel>
            </div>
          )}

          {tab === "qualification" && (
            <SectionPanel title="Qualification & Program">
              <div className="grid md:grid-cols-2 gap-4">
                <ViewField label="Program Magang" value={student.jenis_pekerjaan} />
                <ViewField label="Tingkatan Pembelajaran" value={student.tingkatan_pembelajaran} />
                <ViewField label="Status Siswa" value={sLabel} />
                <ViewField label="Jalur Pendaftaran" value={fmtJalurPendaftaran(student.asal_lpk)} />
              </div>
              {student.sertifikat_dimiliki?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold tracking-wide text-gray-600 uppercase mb-2">
                    Sertifikat Dimiliki
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {student.sertifikat_dimiliki.map((s) => (
                      <span
                        key={s}
                        className="inline-flex px-2.5 py-1 text-xs font-medium bg-primary-pink-light text-primary-pink border border-primary-pink/30"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {student.timeline?.length ? (
                <div className="mt-6">
                  <p className="text-xs font-semibold tracking-wide text-gray-600 uppercase mb-3">
                    Historis Kegiatan
                  </p>
                  <ul className="space-y-2">
                    {student.timeline.map((ev, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm border border-gray-200 bg-white px-3 py-2">
                        <span className="text-gray-500 shrink-0">{ev.date || "—"}</span>
                        <span className="text-gray-900 font-medium">{ev.label}</span>
                        {ev.note && <span className="text-gray-500 text-xs">({ev.note})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <EmptyTab message="Belum ada data qualification tambahan." />
              )}
            </SectionPanel>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
