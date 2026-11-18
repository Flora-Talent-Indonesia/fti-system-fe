"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "react-hot-toast";
import type { CVData, DokumenPendukung } from "@/components/cv-form/types";
import { BULAN_OPTIONS } from "@/components/cv-form/defaults";
import { DOC_ACCEPT_INPUT, isAllowedDocUpload } from "@/components/cv-form/file-upload-rules";
import { hubunganToJapanese } from "@/lib/cv-hubungan";
import { isKeluargaFilled, isPendidikanFilled, isPekerjaanFilled, isSertifikatFilled } from "@/lib/cv-slots";
import { downloadDemoDocument } from "@/lib/download-document";
import { studentFileName } from "@/lib/student-file-name";
import { SUPPORTING_DOCS, docShortLabel } from "@/lib/supporting-docs";

const DOC_BTN =
  "inline-flex shrink-0 items-center gap-1.5 border border-primary-pink px-3 py-1.5 text-xs uppercase tracking-widest text-primary-pink transition-colors hover:bg-primary-pink hover:text-white";

function bulanLabel(v: string): string {
  return BULAN_OPTIONS.find((b) => b.value === v)?.label ?? v ?? "—";
}

function ym(year?: string, month?: string): string {
  const parts = [bulanLabel(month ?? ""), year].map((part) => (part ?? "").trim()).filter(Boolean);
  return parts.join(" ") || "—";
}

function yaTidakLabel(value: unknown): string {
  const str = String(value).trim().toLowerCase();
  if (str === "ya" || str === "1") return "Ya (はい)";
  if (str === "tidak" || str === "0") return "Tidak (いいえ)";
  return "—";
}

function adaTidakLabel(value: unknown): string {
  const str = String(value).trim().toLowerCase();
  if (str === "ada" || str === "1") return "Ada (あり)";
  if (str === "tidak ada" || str === "0") return "Tidak ada (無し)";
  return "—";
}

function butaWarnaLabel(value: unknown): string {
  const str = String(value).trim().toLowerCase();
  if (str === "buta warna total" || str === "1") return "Buta warna total (全色)";
  if (str === "buta warna parsial" || str === "2") return "Buta warna parsial (部分的)";
  if (str === "tidak buta warna" || str === "3") return "Tidak buta warna (色盲なし)";
  return "—";
}

function jumlahRokokLabel(value: unknown): string {
  if (value == null) return "—";
  return `${value} Batang / hari`;
}

function statusKelulusanLabel(value: unknown): string {
  switch (Number(value)) {
    case 0:
      return "Tidak lulus";
    case 1:
      return "Lulus";
    default:
      return String(value ?? "—");
  }
}

function jenisKelaminLabel(v: string): string {
  const norm = (v || "").trim().toUpperCase();
  if (norm === "LAKI-LAKI" || norm === "L") return "Laki-laki (男)";
  if (norm === "PEREMPUAN" || norm === "P") return "Perempuan (女)";
  return v || "—";
}

function Row({ label, value }: { label: string; value: unknown }) {
  const str = value != null ? String(value) : "";
  const show = str.trim();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,200px)_1fr] gap-1 sm:gap-4 py-2.5 border-b border-gray-100 last:border-0 text-sm">
      <dt className="text-text-gray font-medium">{label}</dt>
      <dd className="text-matte-black break-words">{show || "—"}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-primary-pink mb-4 pb-2 border-b border-primary-pink/15">
      {children}
    </h3>
  );
}

function hasDoc(value: string): boolean {
  const text = value.trim();
  return text.length > 0 && text !== "-";
}

function downloadDoc(value: string, sessionUrl: string | undefined, studentName: string, kind: string) {
  const raw = value.startsWith("data:") || value.startsWith("blob:") ? "dokumen.pdf" : value;
  const ext = raw.match(/(\.[a-z0-9]{2,5})$/i)?.[1] || ".pdf";
  const name = `${studentFileName(kind, studentName)}${ext}`;
  if (sessionUrl || value.startsWith("data:") || value.startsWith("blob:") || /^https?:/i.test(value)) {
    const a = document.createElement("a");
    a.href = sessionUrl || value;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }
  downloadDemoDocument(name, studentName);
}

function SupportingDocRow({
  label,
  value,
  studentName,
  onUpload,
}: {
  label: string;
  value: string;
  studentName: string;
  onUpload: (filename: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionUrl = useRef<string | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const uploaded = hasDoc(value);

  useEffect(() => {
    return () => {
      if (sessionUrl.current) URL.revokeObjectURL(sessionUrl.current);
    };
  }, []);

  return (
    <li className="flex items-center justify-between gap-3 border border-gray-100 px-3 py-2.5">
      <span className="min-w-0 font-medium text-text-gray">{label}</span>
      <div className="flex shrink-0 flex-wrap justify-end gap-2">
        {uploaded ? (
          <button
            type="button"
            onClick={() => downloadDoc(value, localUrl ?? undefined, studentName, docShortLabel(label))}
            className={DOC_BTN}
          >
            Download
          </button>
        ) : null}
        <button type="button" onClick={() => inputRef.current?.click()} className={DOC_BTN}>
          {uploaded ? "Reupload" : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={DOC_ACCEPT_INPUT}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            if (!isAllowedDocUpload(file)) {
              toast.error("Dokumen pendukung wajib hasil pindai PDF.");
              return;
            }
            if (sessionUrl.current) URL.revokeObjectURL(sessionUrl.current);
            const nextUrl = URL.createObjectURL(file);
            sessionUrl.current = nextUrl;
            setLocalUrl(nextUrl);
            onUpload(file.name);
            toast.success(
              `${docShortLabel(label)} berhasil ${uploaded ? "diganti" : "diunggah"}.`
            );
          }}
        />
      </div>
    </li>
  );
}

export default function ProfileCvSections({
  data,
  onUploadDoc,
}: {
  data: CVData;
  onUploadDoc?: (key: keyof DokumenPendukung, filename: string) => void;
}) {
  const i = data.informasi_dasar;
  const f = data.fisik_kesehatan;
  const d = data.dokumen;

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle>Informasi dasar</SectionTitle>
        <dl>
          <Row label="NIK" value={i.nik} />
          <Row label="No. peserta" value={i.no_peserta} />
          <Row label="Nama lengkap" value={i.nama_lengkap} />
          <Row label="Nama katakana" value={i.nama_katakana} />
          <Row label="呼称 / Nama panggilan" value={i.yobisho} />
          <Row label="Umur" value={i.umur} />
          <Row label="Jenis kelamin" value={jenisKelaminLabel(i.jenis_kelamin)} />
          <Row label="Kewarganegaraan" value={i.kewarganegaraan} />
          <Row label="出身地 / Tempat lahir" value={i.tempat_lahir} />
          <Row label="利き手 / Tangan dominan" value={i.tangan_dominan} />
          <Row label="Tanggal lahir" value={i.tanggal_lahir} />
          <Row label="Golongan darah" value={i.golongan_darah} />
          <Row label="Agama" value={i.agama} />
          <Row label="Status pernikahan" value={i.status_pernikahan} />
          <Row label="Alamat lengkap" value={i.alamat_lengkap} />
          <Row label="Kode pos" value={i.kode_pos} />
          <Row label="Nomor telepon" value={i.nomor_telepon} />
          <Row label="Email" value={i.email} />
        </dl>
      </section>

      <section>
        <SectionTitle>Meta dokumen</SectionTitle>
        <dl>
          <Row label="Tanggal pembuatan CV" value={data.meta.tanggal_pembuatan_cv} />
        </dl>
      </section>

      <section>
        <SectionTitle>Dokumen pendukung</SectionTitle>
        <ul className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          {SUPPORTING_DOCS.map((doc) =>
            onUploadDoc ? (
              <SupportingDocRow
                key={doc.cvKey}
                label={doc.label}
                value={d[doc.cvKey] || ""}
                studentName={i.nama_lengkap}
                onUpload={(filename) => onUploadDoc(doc.cvKey, filename)}
              />
            ) : (
              <li
                key={doc.cvKey}
                className="flex items-center justify-between gap-3 border border-gray-100 px-3 py-2.5"
              >
                <span className="font-medium text-text-gray">{doc.label}</span>
                {hasDoc(d[doc.cvKey] || "") ? (
                  <button
                    type="button"
                    onClick={() => downloadDoc(d[doc.cvKey], undefined, i.nama_lengkap, docShortLabel(doc.label))}
                    className={DOC_BTN}
                  >
                    Download
                  </button>
                ) : (
                  <span className="text-xs italic text-text-gray">Belum diunggah</span>
                )}
              </li>
            )
          )}
        </ul>
      </section>

      <section>
        <SectionTitle>Fisik & kesehatan</SectionTitle>
        <dl>
          <Row label="Tinggi badan (cm)" value={f.tinggi_badan} />
          <Row label="Berat badan (kg)" value={f.berat_badan} />
          <Row label="Visus mata kiri" value={f.visus_mata_kiri} />
          <Row label="Kondisi mata kiri" value={f.kondisi_mata_kiri} />
          <Row label="Visus mata kanan" value={f.visus_mata_kanan} />
          <Row label="Kondisi mata kanan" value={f.kondisi_mata_kanan} />
          <Row label="Berkacamata" value={yaTidakLabel(f.berkacamata)} />
          <Row label="Tato" value={adaTidakLabel(f.tato)} />
          <Row label="Merokok" value={yaTidakLabel(f.merokok)} />
          <Row label="Minum alkohol" value={yaTidakLabel(f.minum_alkohol)} />
          <Row label="Jumlah rokok" value={jumlahRokokLabel(f.jumlah_rokok)} />
          <Row label="Buta warna" value={butaWarnaLabel(f.buta_warna)} />
          <Row label="Riwayat patah tulang" value={adaTidakLabel(f.riwayat_patah_tulang)} />
          <Row label="Hobi" value={f.hobi} />
        </dl>
      </section>

      <section>
        <SectionTitle>Riwayat pendidikan</SectionTitle>
        {data.pendidikan.filter(isPendidikanFilled).length === 0 ? (
          <p className="text-sm text-text-gray">Belum ada data.</p>
        ) : (
          <ul className="space-y-4">
            {data.pendidikan.filter(isPendidikanFilled).map((p, idx) => (
              <li
                key={p.id || idx}
                className="border border-primary-pink/10 rounded-lg p-4 bg-primary-pink-light/30 text-sm space-y-1"
              >
                <p className="font-semibold text-matte-black">{p.nama_sekolah || "—"}</p>
                <p className="text-text-gray">
                  {p.tingkat_pendidikan}
                  {p.jurusan ? ` · ${p.jurusan}` : ""}
                </p>
                <p className="text-text-gray text-xs">
                  {ym(p.tahun_masuk, p.bulan_masuk)} — {ym(p.tahun_lulus, p.bulan_lulus)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle>Riwayat pekerjaan</SectionTitle>
        {data.pekerjaan.filter(isPekerjaanFilled).length === 0 ? (
          <p className="text-sm text-text-gray">Belum ada data.</p>
        ) : (
          <ul className="space-y-4">
            {data.pekerjaan.filter(isPekerjaanFilled).map((p, idx) => (
              <li
                key={p.id || idx}
                className="border border-primary-pink/10 rounded-lg p-4 bg-primary-pink-light/30 text-sm space-y-1"
              >
                <p className="font-semibold text-matte-black">{p.nama_perusahaan || "—"}</p>
                <p className="text-text-gray">
                  {p.jenis_pekerjaan || p.posisi_pekerjaan}
                  {p.status_pekerjaan ? ` · ${p.status_pekerjaan}` : ""}
                </p>
                {p.deskripsi_pekerjaan ? <p className="text-text-gray">{p.deskripsi_pekerjaan}</p> : null}
                <p className="text-text-gray text-xs">
                  {ym(p.tahun_mulai, p.bulan_mulai)} — {ym(p.tahun_selesai, p.bulan_selesai)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle>Sertifikat</SectionTitle>
        {data.sertifikat.filter(isSertifikatFilled).length === 0 ? (
          <p className="text-sm text-text-gray">Belum ada data.</p>
        ) : (
          <ul className="space-y-4">
            {data.sertifikat.filter(isSertifikatFilled).map((s, idx) => (
              <li
                key={s.id || idx}
                className="border border-primary-pink/10 rounded-lg p-4 bg-primary-pink-light/30 text-sm space-y-1"
              >
                <p className="font-semibold text-matte-black">{s.nama_sertifikat || "—"}</p>
                <p className="text-text-gray">
                  {statusKelulusanLabel(s.status_kelulusan)}
                  {s.keterangan_skor ? ` · ${s.keterangan_skor}` : ""}
                </p>
                <p className="text-text-gray text-xs">
                  {ym(s.tahun_diperoleh, s.bulan_diperoleh)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle>Susunan keluarga</SectionTitle>
        {data.keluarga.filter(isKeluargaFilled).length === 0 ? (
          <p className="text-sm text-text-gray">Belum ada data.</p>
        ) : (
          <ul className="space-y-4">
            {data.keluarga.filter(isKeluargaFilled).map((k, idx) => (
              <li
                key={k.id || idx}
                className="border border-primary-pink/10 rounded-lg p-4 bg-primary-pink-light/30 text-sm space-y-1"
              >
                <p className="text-xs font-medium text-text-gray uppercase tracking-wide">
                  {hubunganToJapanese(k.hubungan) || "—"}
                </p>
                <p className="font-semibold text-matte-black break-words">{k.nama_anggota || "—"}</p>
                <p className="text-text-gray">
                  {k.umur ? `${k.umur} th` : "—"}
                  {k.pekerjaan ? ` · ${k.pekerjaan}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
