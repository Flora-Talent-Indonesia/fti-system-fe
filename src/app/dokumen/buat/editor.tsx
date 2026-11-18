"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, FileText, Loader2, Trash2, UserPlus } from "lucide-react";
import SearchField from "@/components/SearchField";
import { toast } from "react-hot-toast";
import { CenteredPortal } from "@/components/CenteredPortal";
import {
  COE_GROUPS,
  SHARED_FIELDS,
  isCoeDateField,
  applySharedToMembers,
  blankCoeBatch,
  coeBatchProgress,
  downloadCoe,
  draftFromStudent,
  type CoeBatch,
  type CoeDocStatus,
  type CoeDraft,
  type CoeShared,
} from "@/lib/coe-batch";
import { createCoeBatch, getCoeBatch, newMemberId, updateCoeBatch } from "@/lib/coe-batch-storage";
import { omitInactiveAccounts } from "@/lib/fti-student-account-storage";
import { loadFtiDataSiswaStudents } from "@/lib/fti-data-siswa-storage";
import { seedLpkStudentsIfEmpty } from "@/lib/lpk-student-storage";
import type { LpkStudentRecord } from "@/types/lpk-student";

function CoeInput({
  field,
  value,
  disabled,
  onChange,
}: {
  field: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const date = isCoeDateField(field);
  const shown = date && !/^\d{4}-\d{2}-\d{2}$/.test(value) ? "" : value;

  return (
    <input
      type={date ? "date" : "text"}
      className="input-field disabled:bg-gray-50 disabled:text-gray-600"
      disabled={disabled}
      value={shown}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-left">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
      {children}
    </label>
  );
}

function StatusBadge({ status }: { status: CoeDocStatus }) {
  const styles = {
    selesai: "bg-emerald-50 text-emerald-800",
    draft: "bg-amber-50 text-amber-800",
    belum: "bg-gray-100 text-gray-600",
  } as const;
  const label = { selesai: "Selesai", draft: "Draft", belum: "Belum" } as const;
  return (
    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles[status]}`}>
      {label[status]}
    </span>
  );
}

export function BuatDokumenEditor() {
  const router = useRouter();
  const params = useSearchParams();
  const batchId = params.get("id") ?? "";
  const seenId = useRef<string | undefined>(undefined);
  const formRef = useRef<HTMLElement>(null);
  const [batch, setBatch] = useState<CoeBatch | null>(null);
  const [ready, setReady] = useState(false);
  const [students, setStudents] = useState<LpkStudentRecord[]>([]);
  const [editingShared, setEditingShared] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [query, setQuery] = useState("");
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  useEffect(() => {
    const fti = loadFtiDataSiswaStudents();
    const mitra = seedLpkStudentsIfEmpty();
    const ids = new Set(fti.map((student) => student.id));
    setStudents(omitInactiveAccounts([...fti, ...mitra.filter((student) => !ids.has(student.id))]));
  }, []);

  useEffect(() => {
    const previous = seenId.current;
    seenId.current = batchId;
    const justCreated = previous === "" && batchId !== "";
    if (!batchId) {
      setBatch(blankCoeBatch());
      setEditingShared(true);
      setActiveMemberId(null);
      setReady(true);
      return;
    }
    setBatch(getCoeBatch(batchId));
    if (!justCreated) {
      setEditingShared(false);
      setActiveMemberId(null);
    }
    setReady(true);
  }, [batchId]);

  const activeMember = batch?.members.find((member) => member.id === activeMemberId) ?? null;

  const matches = useMemo(() => {
    if (!batch) return [];
    const taken = new Set(batch.members.map((member) => member.studentId));
    const q = query.trim().toLowerCase();
    return students
      .filter((student) => !taken.has(student.id))
      .filter((student) => {
        if (!q) return true;
        return `${student.nama_lengkap} ${student.no_peserta} ${student.nama_katakana}`.toLowerCase().includes(q);
      })
      .slice(0, 8);
  }, [batch, query, students]);

  const write = (next: CoeBatch, message?: string): CoeBatch | null => {
    setSaving(true);
    try {
      if (!next.id) {
        const created = createCoeBatch(next);
        setBatch(created);
        router.replace(`/dokumen/buat?id=${created.id}`);
        if (message) toast.success(message);
        return created;
      }
      const updated = updateCoeBatch(next.id, next);
      if (!updated) {
        toast.error("Batch tidak ditemukan.");
        return null;
      }
      setBatch(updated);
      if (message) toast.success(message);
      return updated;
    } finally {
      setSaving(false);
    }
  };

  const setDraft = (memberId: string, key: keyof CoeDraft, value: string) => {
    setBatch((current) => {
      if (!current) return current;
      return {
        ...current,
        members: current.members.map((member) =>
          member.id === memberId
            ? { ...member, draft: { ...member.draft, [key]: value } as CoeDraft }
            : member
        ),
      };
    });
  };

  const setShared = (key: keyof CoeShared, value: string) => {
    setBatch((current) => (current ? { ...current, shared: { ...current.shared, [key]: value } } : current));
  };

  const openMember = (memberId: string) => {
    setActiveMemberId(memberId);
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const addStudent = (student: LpkStudentRecord) => {
    if (!batch || saving) return;
    if (batch.members.some((member) => member.studentId === student.id)) {
      toast.error(`${student.nama_lengkap} sudah ada di batch ini.`);
      return;
    }
    const memberId = newMemberId();
    const next: CoeBatch = {
      ...batch,
      members: [
        ...batch.members,
        {
          id: memberId,
          studentId: student.id,
          noPeserta: student.no_peserta,
          nama: student.nama_lengkap,
          status: "belum",
          draft: draftFromStudent(student, batch.shared),
        },
      ],
    };
    const saved = write(next, `${student.nama_lengkap} ditambahkan.`);
    if (saved) openMember(memberId);
  };

  const removeMember = (memberId: string, nama: string) => {
    if (!batch) return;
    if (!window.confirm(`Hapus ${nama} dari batch?`)) return;
    const next = { ...batch, members: batch.members.filter((member) => member.id !== memberId) };
    if (activeMemberId === memberId) setActiveMemberId(null);
    if (batch.id) write(next, `${nama} dihapus dari batch.`);
    else setBatch(next);
  };

  const saveShared = () => {
    if (!batch) return;
    const saved = write(batch, "Data batch disimpan.");
    if (saved) setEditingShared(false);
  };

  const copyShared = () => {
    if (!batch) return;
    if (batch.members.length === 0) {
      toast.error("Tambah siswa dulu.");
      return;
    }
    if (!window.confirm("Data bersama yang terisi akan disalin ke lembar COE semua siswa. Identitas siswa tidak berubah.")) {
      return;
    }
    const next = applySharedToMembers(batch);
    if (batch.id) write(next, "Data bersama disalin ke semua lembar.");
    else {
      setBatch(next);
      toast.success("Data bersama disalin. Simpan batch agar tidak hilang.");
    }
  };

  const saveSheet = (status: CoeDocStatus) => {
    if (!batch || !activeMember) return;
    const next: CoeBatch = {
      ...batch,
      members: batch.members.map((member) =>
        member.id === activeMember.id ? { ...member, nama: member.draft.nama || member.nama, status } : member
      ),
    };
    write(next, status === "selesai" ? "Lembar COE ditandai selesai." : "Lembar COE disimpan.");
  };

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fdf8fa] text-sm text-gray-500">
        Membuka dokumen…
      </main>
    );
  }

  if (!batch) {
    return (
      <CenteredPortal eyebrow="Dokumen" title="Batch tidak ditemukan" backHref="/dokumen/data" backLabel="Kembali">
        <p className="text-sm text-gray-500">Batch ini tidak ada di browser ini.</p>
      </CenteredPortal>
    );
  }

  const locked = !editingShared || saving;

  return (
    <CenteredPortal
      eyebrow="Berkas kerja"
      title={batch.name.trim() || "Buat Dokumen"}
      description={batch.id ? coeBatchProgress(batch) : "Satu batch untuk satu pengiriman. Lembar tiap siswa berbentuk COE."}
      backHref={batch.id ? "/dokumen/data" : "/dokumen"}
      backLabel="Kembali"
    >
      <section className="border border-gray-300 bg-white p-6">
        <div className={`flex flex-col gap-3 sm:flex-row sm:justify-between ${editingShared ? "sm:items-end" : "sm:items-center"}`}>
          <div className="min-w-0 flex-1">
            {editingShared ? (
              <Field label="Nama batch">
                <input
                  className="input-field"
                  value={batch.name}
                  disabled={saving}
                  placeholder="Contoh: Batch Agustus 2026"
                  onChange={(event) => setBatch({ ...batch, name: event.target.value })}
                />
              </Field>
            ) : (
              <p className="text-sm text-[#be185d]">{coeBatchProgress(batch)}</p>
            )}
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => (editingShared ? saveShared() : setEditingShared(true))}
            className="inline-flex h-[43px] shrink-0 items-center justify-center gap-2 self-end border border-gray-300 bg-white px-4 text-xs font-bold uppercase tracking-widest text-gray-700 hover:border-primary-pink hover:text-[#be185d] disabled:opacity-60 sm:self-auto"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {editingShared ? "Simpan data" : "Edit data"}
          </button>
        </div>
      </section>

      <section className="border border-gray-300 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Building2 size={16} className="text-primary-pink" />
          <h2 className="font-serif text-xl text-gray-900">Data bersama</h2>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          Dipakai sebagai awal lembar COE saat siswa ditambahkan. Identitas siswa tetap milik masing-masing.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Jalur">
            <select
              className="input-field disabled:bg-gray-50 disabled:text-gray-600"
              disabled={locked}
              value={batch.shared.jalur}
              onChange={(event) => setShared("jalur", event.target.value === "ikusei" ? "ikusei" : "tg")}
            >
              <option value="tg">Tokutei Ginou</option>
              <option value="ikusei">Ikusei Shuro</option>
            </select>
          </Field>
          {SHARED_FIELDS.map(([key, label]) => (
            <Field key={key} label={label}>
              <CoeInput field={key} disabled={locked} value={batch.shared[key]} onChange={(value) => setShared(key, value)} />
            </Field>
          ))}
          <div className="sm:col-span-2">
            <Field label="Catatan internal">
              <input
                className="input-field disabled:bg-gray-50 disabled:text-gray-600"
                disabled={locked}
                value={batch.note}
                placeholder="Opsional. Tidak masuk berkas COE."
                onChange={(event) => setBatch({ ...batch, note: event.target.value })}
              />
            </Field>
          </div>
        </div>
        {editingShared ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-primary" disabled={saving} onClick={saveShared}>
              Simpan
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={copyShared}
              className="border border-gray-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-700"
            >
              Salin ke semua siswa
            </button>
          </div>
        ) : null}
      </section>

      <section className="border border-gray-300 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-xl text-gray-900">Siswa dalam batch</h2>
            <p className="mt-1 text-xs text-gray-500">{batch.members.length} orang</p>
          </div>
          <button
            type="button"
            onClick={() => setShowPicker((open) => !open)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <UserPlus size={14} />
            {showPicker ? "Tutup pencarian" : "Tambah siswa"}
          </button>
        </div>
        {showPicker ? (
          <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-4">
            <Field label="Cari siswa">
              <SearchField variant="box" value={query} onChange={setQuery} />
            </Field>
            <ul className="mt-3 divide-y divide-gray-200 border border-gray-200 bg-white">
              {matches.length === 0 ? (
                <li className="px-3 py-3 text-sm text-gray-500">Tidak ada siswa yang bisa ditambahkan.</li>
              ) : (
                matches.map((student) => (
                  <li key={student.id}>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => addStudent(student)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-primary-pink-light disabled:opacity-60"
                    >
                      <span>
                        <span className="block text-sm text-gray-900">{student.nama_lengkap}</span>
                        <span className="block text-xs text-gray-500">
                          {student.no_peserta || "Tanpa nomor"} · {student.jenis_kelamin || "—"}
                        </span>
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary-pink">Tambah</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : null}
        {batch.members.length === 0 ? (
          showPicker ? null : (
            <p className="px-6 py-10 text-center text-sm text-gray-500">Belum ada siswa. Tambah dari data siswa.</p>
          )
        ) : (
          <ul className="divide-y divide-gray-100">
            {batch.members.map((member, index) => (
              <li key={member.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    <span className="mr-2 text-gray-400">{index + 1}.</span>
                    {member.nama}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {member.noPeserta || "—"} · {member.draft.kelamin || "—"} · {member.draft.tanggalLahir || "—"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={member.status} />
                  <button
                    type="button"
                    onClick={() => openMember(member.id)}
                    className="border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-primary-pink hover:text-[#be185d]"
                  >
                    {member.status === "belum" ? "Buat dokumen" : "Buka dokumen"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMember(member.id, member.nama)}
                    className="border border-rose-100 bg-rose-50 p-1.5 text-rose-700"
                    title="Hapus dari batch"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section ref={formRef} className="scroll-mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-primary-pink" />
          <h2 className="font-serif text-xl text-gray-900">Lembar COE</h2>
        </div>
        {!activeMember ? (
          <p className="border border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-500">
            Pilih siswa, lalu isi lembar COE. Bukan formulir imigrasi resmi.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border border-gray-300 bg-white px-6 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{activeMember.nama}</p>
                <p className="mt-0.5 text-xs text-gray-500">Isi dari atas ke bawah, lalu simpan atau unduh.</p>
              </div>
              <StatusBadge status={activeMember.status} />
            </div>
            <section className="space-y-4 border border-gray-300 bg-white p-6">
              <h3 className="text-center font-serif text-xl text-gray-900">Jalur</h3>
              <Field label="Jalur">
                <select
                  className="input-field"
                  value={activeMember.draft.jalur}
                  onChange={(event) => setDraft(activeMember.id, "jalur", event.target.value === "ikusei" ? "ikusei" : "tg")}
                >
                  <option value="tg">Tokutei Ginou</option>
                  <option value="ikusei">Ikusei Shuro</option>
                </select>
              </Field>
            </section>
            {COE_GROUPS.map((group) => (
              <section key={group.title} className="space-y-4 border border-gray-300 bg-white p-6">
                <h3 className="text-center font-serif text-xl text-gray-900">{group.title}</h3>
                {group.fields.map(([key, label]) => (
                  <Field key={key} label={label}>
                    <CoeInput
                      field={key}
                      value={String(activeMember.draft[key])}
                      onChange={(value) => setDraft(activeMember.id, key, value)}
                    />
                  </Field>
                ))}
              </section>
            ))}
            <div className="flex flex-col gap-3">
              <button type="button" className="btn-primary w-full" disabled={saving} onClick={() => saveSheet("draft")}>
                Simpan lembar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => saveSheet("selesai")}
                className="w-full border border-gray-300 bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest"
              >
                Tandai selesai
              </button>
              <button type="button" className="btn-primary w-full" onClick={() => downloadCoe(activeMember.draft, "print")}>
                Unduh PDF
              </button>
              <button
                type="button"
                className="w-full border border-gray-300 bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest"
                onClick={() => downloadCoe(activeMember.draft, "doc")}
              >
                Unduh Word
              </button>
              <p className="text-center text-xs leading-relaxed text-gray-500">
                PDF lewat dialog cetak browser. Word berupa berkas .doc dari lembar yang sama.
              </p>
            </div>
          </>
        )}
      </section>
    </CenteredPortal>
  );
}
