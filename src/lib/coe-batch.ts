import type { LpkStudentRecord } from "@/types/lpk-student";
import { studentFileName } from "@/lib/student-file-name";

export type CoeDocStatus = "belum" | "draft" | "selesai";

export type CoeDraft = {
  jalur: "ikusei" | "tg";
  nama: string;
  katakana: string;
  kelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  kewarganegaraan: string;
  paspor: string;
  alamat: string;
  kontak: string;
  bidang: string;
  jabatan: string;
  sertifikat: string;
  perusahaan: string;
  alamatPerusahaan: string;
  teleponPerusahaan: string;
  cp: string;
  lembaga: string;
  gaji: string;
  jamKerja: string;
  mulaiKerja: string;
  nomorKyujin: string;
  tanggalKyujin: string;
  mcu: string;
  butaWarna: string;
};

export type CoeShared = Pick<
  CoeDraft,
  | "jalur"
  | "bidang"
  | "jabatan"
  | "lembaga"
  | "gaji"
  | "jamKerja"
  | "mulaiKerja"
  | "perusahaan"
  | "alamatPerusahaan"
  | "teleponPerusahaan"
  | "cp"
  | "nomorKyujin"
  | "tanggalKyujin"
>;

export type CoeBatchMember = {
  id: string;
  studentId: string;
  noPeserta: string;
  nama: string;
  status: CoeDocStatus;
  draft: CoeDraft;
};

export type CoeBatch = {
  id: string;
  name: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  shared: CoeShared;
  members: CoeBatchMember[];
};

export const COE_GROUPS: Array<{ title: string; fields: Array<[keyof CoeDraft, string]> }> = [
  {
    title: "Identitas",
    fields: [
      ["nama", "Nama paspor"],
      ["katakana", "Katakana"],
      ["kelamin", "Jenis kelamin"],
      ["tempatLahir", "Tempat lahir"],
      ["tanggalLahir", "Tanggal lahir"],
      ["paspor", "Nomor paspor"],
      ["alamat", "Alamat Indonesia"],
      ["kontak", "Kontak darurat"],
    ],
  },
  {
    title: "Pekerjaan",
    fields: [
      ["bidang", "Bidang kerja"],
      ["jabatan", "Jabatan"],
      ["sertifikat", "N3 / JFT / SSW"],
      ["lembaga", "TSK atau Kumiai"],
      ["gaji", "Gaji"],
      ["jamKerja", "Jam kerja"],
      ["mulaiKerja", "Tanggal mulai"],
    ],
  },
  {
    title: "Perusahaan dan berkas",
    fields: [
      ["perusahaan", "Perusahaan"],
      ["alamatPerusahaan", "Alamat perusahaan"],
      ["teleponPerusahaan", "Telepon perusahaan"],
      ["cp", "Contact person"],
      ["nomorKyujin", "Nomor kyujin"],
      ["tanggalKyujin", "Tanggal kyujin"],
      ["mcu", "Hasil MCU"],
      ["butaWarna", "Buta warna"],
    ],
  },
];

const COE_DATE_FIELDS = new Set<keyof CoeDraft>(["tanggalLahir", "mulaiKerja", "tanggalKyujin"]);

export function isCoeDateField(key: string) {
  return COE_DATE_FIELDS.has(key as keyof CoeDraft);
}

export const SHARED_FIELDS: Array<[Exclude<keyof CoeShared, "jalur">, string]> = [
  ["bidang", "Bidang kerja"],
  ["jabatan", "Jabatan"],
  ["lembaga", "TSK atau Kumiai"],
  ["gaji", "Gaji"],
  ["jamKerja", "Jam kerja"],
  ["mulaiKerja", "Tanggal mulai"],
  ["perusahaan", "Perusahaan"],
  ["alamatPerusahaan", "Alamat perusahaan"],
  ["teleponPerusahaan", "Telepon perusahaan"],
  ["cp", "Contact person"],
  ["nomorKyujin", "Nomor kyujin"],
  ["tanggalKyujin", "Tanggal kyujin"],
];

export const EMPTY_COE: CoeDraft = {
  jalur: "tg",
  nama: "",
  katakana: "",
  kelamin: "",
  tempatLahir: "",
  tanggalLahir: "",
  kewarganegaraan: "Indonesia",
  paspor: "",
  alamat: "",
  kontak: "",
  bidang: "",
  jabatan: "",
  sertifikat: "",
  perusahaan: "",
  alamatPerusahaan: "",
  teleponPerusahaan: "",
  cp: "",
  lembaga: "",
  gaji: "",
  jamKerja: "",
  mulaiKerja: "",
  nomorKyujin: "",
  tanggalKyujin: "",
  mcu: "",
  butaWarna: "",
};

export function emptyShared(): CoeShared {
  return {
    jalur: "tg",
    bidang: "",
    jabatan: "",
    lembaga: "",
    gaji: "",
    jamKerja: "",
    mulaiKerja: "",
    perusahaan: "",
    alamatPerusahaan: "",
    teleponPerusahaan: "",
    cp: "",
    nomorKyujin: "",
    tanggalKyujin: "",
  };
}

export function blankCoeBatch(): CoeBatch {
  const now = new Date().toISOString();
  return {
    id: "",
    name: "",
    note: "",
    createdAt: now,
    updatedAt: now,
    shared: emptyShared(),
    members: [],
  };
}

export function coeBatchProgress(batch: CoeBatch): string {
  const total = batch.members.length;
  if (total === 0) return "Belum ada siswa";
  const done = batch.members.filter((member) => member.status === "selesai").length;
  const draft = batch.members.filter((member) => member.status === "draft").length;
  return `COE ${done}/${total}${draft ? ` · ${draft} draft` : ""}`;
}

function jalurFromStudent(student: LpkStudentRecord, fallback: "ikusei" | "tg"): "ikusei" | "tg" {
  if (student.program === "ikusei" || student.program === "tg") return student.program;
  return fallback;
}

export function draftFromStudent(student: LpkStudentRecord, shared: CoeShared): CoeDraft {
  const jalur = jalurFromStudent(student, shared.jalur);
  const base: CoeDraft = {
    ...EMPTY_COE,
    jalur,
    nama: student.nama_lengkap,
    katakana: student.nama_katakana,
    kelamin: student.jenis_kelamin,
    tempatLahir: student.asal,
    tanggalLahir: student.tanggal_lahir,
    kewarganegaraan: student.kewarganegaraan || "Indonesia",
    paspor: student.dokumen_paspor ?? "",
    alamat: student.alamat,
    kontak: [student.kontak_darurat_nama, student.kontak_darurat_hubungan, student.kontak_darurat_telepon]
      .filter(Boolean)
      .join(" · "),
    bidang: student.jenis_pekerjaan,
    sertifikat: (student.sertifikat_dimiliki ?? []).filter(Boolean).join(", "),
    perusahaan: student.nama_perusahaan,
    lembaga: jalur === "tg" ? student.tsk ?? "" : student.nama_kumiai,
    mcu: student.mcu_pdf,
    butaWarna: student.buta_warna,
  };
  return mergeShared(base, shared);
}

/** Field bersama yang terisi menimpa lembar siswa. Field kosong tidak menghapus isian siswa. */
export function mergeShared(draft: CoeDraft, shared: CoeShared): CoeDraft {
  const next: CoeDraft = { ...draft, jalur: shared.jalur };
  for (const [key] of SHARED_FIELDS) {
    if (shared[key].trim()) next[key] = shared[key];
  }
  return next;
}

export function applySharedToMembers(batch: CoeBatch): CoeBatch {
  return {
    ...batch,
    members: batch.members.map((member) => ({
      ...member,
      draft: mergeShared(member.draft, batch.shared),
    })),
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function coeSheetHtml(draft: CoeDraft): string {
  const rows = [
    ["Jalur", draft.jalur === "tg" ? "Tokutei Ginou" : "Ikusei Shuro"],
    ["Nama paspor", draft.nama],
    ["Katakana", draft.katakana],
    ["Jenis kelamin", draft.kelamin],
    ["Tempat / tanggal lahir", `${draft.tempatLahir} / ${draft.tanggalLahir}`],
    ["Kewarganegaraan", draft.kewarganegaraan],
    ["Nomor paspor", draft.paspor],
    ["Alamat Indonesia", draft.alamat],
    ["Kontak darurat", draft.kontak],
    ["Bidang / jabatan", `${draft.bidang} / ${draft.jabatan}`],
    ["N3 / JFT / SSW", draft.sertifikat],
    ["Perusahaan", draft.perusahaan],
    ["Alamat perusahaan", draft.alamatPerusahaan],
    ["Telepon / CP", `${draft.teleponPerusahaan} / ${draft.cp}`],
    ["TSK / Kumiai", draft.lembaga],
    ["Gaji / jam kerja", `${draft.gaji} / ${draft.jamKerja}`],
    ["Mulai kerja", draft.mulaiKerja],
    ["Kyujin", `${draft.nomorKyujin} / ${draft.tanggalKyujin}`],
    ["MCU / buta warna", `${draft.mcu} / ${draft.butaWarna}`],
  ];
  const body = rows
    .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value || "—")}</td></tr>`)
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Berkas COE</title>
    <style>
      body { font-family: "Times New Roman", serif; color: #111; }
      h1 { font-size: 18px; margin-bottom: 4px; }
      p { font-size: 12px; color: #444; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #222; padding: 6px 8px; font-size: 12px; text-align: left; vertical-align: top; }
      th { width: 28%; background: #f6f6f6; }
      ul { font-size: 12px; }
    </style></head><body>
    <h1>FTI — Flora Talent Indonesia</h1>
    <p>Berkas kerja internal pengajuan COE. Bukan formulir imigrasi resmi.</p>
    <table>${body}</table>
    <h2 style="font-size:14px">Checklist lampiran</h2>
    <ul>
      <li>Kontrak kerja</li><li>Syarat kerja</li><li>MCU</li><li>Sertifikat ujian</li><li>Paspor</li><li>Foto</li>
    </ul>
    </body></html>`;
}

export function downloadCoe(draft: CoeDraft, kind: "doc" | "print") {
  const preview = coeSheetHtml(draft);
  if (kind === "doc") {
    const blob = new Blob([preview], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coe-${draft.nama || "siswa"}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(preview);
  win.document.close();
  win.focus();
  win.print();
}
