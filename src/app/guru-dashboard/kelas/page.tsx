"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { ArrowLeft, Ban, CheckSquare, Pencil, Plus, School, Trash2, UserPlus, X } from "lucide-react";
import { toast } from "react-hot-toast";
import PortalPageShell from "@/components/PortalPageShell";
import KelasPertemuanField, { pertemuanInput } from "@/components/fti/KelasPertemuanField";
import FtiApiKelas from "@/lib/fti-api-kelas";
import FtiApiUser from "@/lib/fti-api-user";
import { LPK_PARTNERS } from "@/data/mock";
import { KELAS_CABANG, KELAS_JALUR, jalurLabel, kelasPlacementLabel, pertemuanRule } from "@/lib/fti-kelas-storage";
import { lpkAsalByUsername } from "../lpk-members";
import type { KelasCabang, KelasJalur, KelasRecord } from "@/types/student-account";

const ACTION_ICON = "inline-flex h-9 w-9 shrink-0 items-center justify-center border";

type StudentRow = {
  user_id: number;
  name: string;
  user_name: string;
  is_admin: number;
  is_active: number;
  id_kelas?: number | null;
  asal?: string;
};

export default function GuruKelasPage() {
  const [mounted, setMounted] = useState(false);
  const [kelasList, setKelasList] = useState<KelasRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCabang, setNewCabang] = useState<KelasCabang | "">("");
  const [newJalur, setNewJalur] = useState<KelasJalur | "">("");
  const [newPertemuan, setNewPertemuan] = useState("");
  const [savingCreate, setSavingCreate] = useState(false);

  const [editTarget, setEditTarget] = useState<KelasRecord | null>(null);
  const [editName, setEditName] = useState("");
  const [editCabang, setEditCabang] = useState<KelasCabang | "">("");
  const [editJalur, setEditJalur] = useState<KelasJalur | "">("");
  const [editPertemuan, setEditPertemuan] = useState("");
  const [people, setPeople] = useState<StudentRow[]>([]);
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [addQuery, setAddQuery] = useState("");
  const [addSource, setAddSource] = useState("semua");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deactivateTarget, setDeactivateTarget] = useState<KelasRecord | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [activateTarget, setActivateTarget] = useState<KelasRecord | null>(null);
  const [activating, setActivating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KelasRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadKelas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await FtiApiKelas().getListKelas();
      setKelasList(res?.status === 200 && Array.isArray(res.data) ? (res.data as KelasRecord[]) : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    void loadKelas();
  }, [loadKelas]);

  const chooseCreateJalur = (jalur: KelasJalur | "") => {
    setNewJalur(jalur);
    const rule = pertemuanRule(jalur);
    setNewPertemuan(rule ? String(rule.defaultSessions) : "");
  };

  const chooseEditJalur = (jalur: KelasJalur | "") => {
    setEditJalur(jalur);
    const rule = pertemuanRule(jalur);
    setEditPertemuan(rule ? String(editTarget?.jalur === jalur && editTarget.pertemuan ? editTarget.pertemuan : rule.defaultSessions) : "");
  };

  const readPertemuan = (jalur: KelasJalur | "", value: string) => {
    const rule = pertemuanRule(jalur);
    if (!rule) return null;
    const parsed = pertemuanInput(jalur, value);
    if (parsed == null || !Number.isFinite(parsed) || parsed < rule.min || parsed > rule.max) {
      toast.error(`Pertemuan ${rule.min}–${rule.max}`);
      return undefined;
    }
    return parsed;
  };

  const closeEditor = () => {
    setEditTarget(null);
    setPeople([]);
    setMemberIds([]);
    setAddQuery("");
    setAddSource("semua");
  };

  const openEditor = async (kelas: KelasRecord) => {
    setEditTarget(kelas);
    setEditName(kelas.nama_kelas);
    setEditCabang(kelas.cabang ?? "");
    setEditJalur(kelas.jalur ?? "");
    const rule = pertemuanRule(kelas.jalur);
    setEditPertemuan(rule ? String(kelas.pertemuan ?? rule.defaultSessions) : "");
    setAddQuery("");
    setAddSource("semua");
    try {
      const [activeRes, inactiveRes] = await Promise.all([
        FtiApiUser().getAllActiveUser(),
        FtiApiUser().getAllInactiveUser(),
      ]);
      const list = [...(Array.isArray(activeRes?.data) ? activeRes.data : []), ...(Array.isArray(inactiveRes?.data) ? inactiveRes.data : [])]
        .filter((user: StudentRow) => Number(user?.is_admin) === 0);
      const asal = lpkAsalByUsername();
      const withAsal = list.map((user) => ({
        ...user,
        asal: asal.get(String(user.user_name || "").trim().toUpperCase()) || "",
      }));
      setPeople(withAsal);
      setMemberIds(withAsal.filter((user) => user.id_kelas === kelas.id_kelas).map((user) => user.user_id));
    } catch {
      setPeople([]);
      setMemberIds([]);
      toast.error("Gagal memuat siswa di kelas ini.");
    }
  };

  const saveCreate = async () => {
    if (!newCabang) {
      toast.error("Pilih TC Bogor atau Jakarta");
      return;
    }
    if (!newName.trim()) {
      toast.error("Nama kelas tidak boleh kosong");
      return;
    }
    if (!newJalur) {
      toast.error("Pilih penilaian");
      return;
    }
    const pertemuan = readPertemuan(newJalur, newPertemuan);
    if (pertemuan === undefined) return;
    setSavingCreate(true);
    try {
      const res = await FtiApiKelas().postCreateKelas({
        nama_kelas: newName.trim(),
        cabang: newCabang,
        jalur: newJalur,
        pertemuan,
      });
      if (res?.status === 200) {
        toast.success(`Kelas "${newName.trim()}" berhasil dibuat.`);
        setCreateOpen(false);
        setNewName("");
        setNewCabang("");
        setNewJalur("");
        setNewPertemuan("");
        await loadKelas();
      } else {
        toast.error(res?.message || "Gagal membuat kelas.");
      }
    } finally {
      setSavingCreate(false);
    }
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    if (!editCabang) {
      toast.error("Pilih TC Bogor atau Jakarta");
      return;
    }
    if (!editName.trim()) {
      toast.error("Nama kelas tidak boleh kosong");
      return;
    }
    if (!editJalur) {
      toast.error("Pilih penilaian");
      return;
    }
    const pertemuan = readPertemuan(editJalur, editPertemuan);
    if (pertemuan === undefined) return;
    setSavingEdit(true);
    try {
      const res = await FtiApiKelas().putUpdateKelas({
        id_kelas: editTarget.id_kelas,
        nama_kelas: editName.trim(),
        cabang: editCabang,
        jalur: editJalur,
        pertemuan,
      });
      if (res?.status !== 200) {
        toast.error(res?.message || "Gagal memperbarui kelas.");
        return;
      }
      const previous = people.filter((user) => user.id_kelas === editTarget.id_kelas).map((user) => user.user_id);
      const added = memberIds.filter((id) => !previous.includes(id));
      const removed = previous.filter((id) => !memberIds.includes(id));
      if (added.length > 0) await FtiApiUser().putBulkAssignKelas({ user_ids: added, id_kelas: editTarget.id_kelas });
      if (removed.length > 0) await FtiApiUser().putBulkAssignKelas({ user_ids: removed, id_kelas: null });
      toast.success("Kelas dan siswanya berhasil diperbarui.");
      closeEditor();
      await loadKelas();
    } finally {
      setSavingEdit(false);
    }
  };

  const visible = kelasList.filter((kelas) => (showInactive ? kelas.is_active === 0 : kelas.is_active === 1));
  const members = people.filter((user) => memberIds.includes(user.user_id));
  const candidates = people.filter((user) => {
    if (Number(user.is_active) !== 1 || memberIds.includes(user.user_id)) return false;
    if (addSource === "fti" ? Boolean(user.asal) : addSource !== "semua" && user.asal !== addSource) return false;
    const query = addQuery.trim().toLowerCase();
    return !query || user.name.toLowerCase().includes(query) || user.user_name.toLowerCase().includes(query) || (user.asal || "").toLowerCase().includes(query);
  });

  return (
    <PortalPageShell>
      <main className="flex h-dvh min-h-0 flex-col overflow-hidden px-4 py-4 md:px-6">
        <header className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/guru-dashboard"
              className="border border-gray-300 bg-transparent p-3 text-gray-500 transition-colors hover:bg-gray-200/50 hover:text-gray-900"
              title="Kembali ke portal sensei"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Link>
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 font-serif text-3xl tracking-wide text-gray-900">
                <School className="shrink-0 text-primary-pink" size={26} strokeWidth={1.5} />
                <span className="truncate">
                  Kelas <span className="ml-1 font-sans text-lg font-normal tracking-normal text-gray-400">(クラス)</span>
                </span>
              </h1>
              <p className="mt-1 text-sm text-gray-500">Kelas yang sama dengan pengelolaan akun siswa. Akun tidak diatur dari sini.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-10 items-center gap-2 bg-primary-pink px-4 text-sm text-white hover:bg-[var(--primary-pink-hover)]"
          >
            <Plus size={16} strokeWidth={1.5} />
            Buat Kelas
          </button>
        </header>

        <section className="flex w-full min-h-0 max-h-full flex-col border border-gray-300 bg-white shadow-sm">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2.5">
            <span className="text-sm font-semibold text-gray-800">Daftar kelas</span>
            <div className="flex bg-gray-200 p-0.5">
              <button
                type="button"
                onClick={() => setShowInactive(false)}
                className={`px-4 py-1.5 text-sm ${!showInactive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
              >
                Aktif
              </button>
              <button
                type="button"
                onClick={() => setShowInactive(true)}
                className={`px-4 py-1.5 text-sm ${showInactive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
              >
                Nonaktif
              </button>
            </div>
          </div>
          <div className="min-h-0 max-h-[calc(100dvh-12rem)] overflow-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">Memuat data kelas…</p>
            ) : visible.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">
                {showInactive ? "Belum ada kelas nonaktif." : "Belum ada kelas aktif."}
              </p>
            ) : (
              <table className="w-full min-w-[760px] table-fixed border-collapse text-left text-[15px] whitespace-nowrap">
                <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 text-sm text-gray-700">
                  <tr>
                    <th className="w-[14%] px-4 py-3 font-semibold">TC</th>
                    <th className="w-[22%] px-4 py-3 font-semibold">Penilaian</th>
                    <th className="w-[18%] px-4 py-3 font-semibold">Nama Kelas</th>
                    <th className="w-[14%] px-4 py-3 font-semibold">Pertemuan</th>
                    <th className="w-[16%] px-4 py-3 font-semibold">Status</th>
                    <th className="w-[16%] px-4 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {visible.map((kelas) => (
                    <tr key={kelas.id_kelas} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-gray-700">{kelas.cabang || "Belum diisi"}</td>
                      <td className="px-4 py-3 text-gray-700">{jalurLabel(kelas.jalur)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{kelas.nama_kelas}</td>
                      <td className="px-4 py-3 tabular-nums text-gray-700">{kelas.pertemuan ?? "—"}</td>
                      <td className="px-4 py-3">
                        {kelas.is_active === 1 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-sm font-medium text-emerald-700">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-sm font-medium text-red-600">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center justify-center gap-1">
                          {kelas.is_active === 1 ? (
                            <>
                              <button
                                type="button"
                                title="Edit kelas"
                                aria-label="Edit kelas"
                                onClick={() => void openEditor(kelas)}
                                className={`${ACTION_ICON} border-primary-pink/30 bg-primary-pink-light/50 text-[#be185d]`}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                title="Nonaktifkan"
                                aria-label="Nonaktifkan"
                                onClick={() => setDeactivateTarget(kelas)}
                                className={`${ACTION_ICON} border-red-200 bg-red-50 text-red-700`}
                              >
                                <Ban size={15} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                title="Aktifkan"
                                aria-label="Aktifkan"
                                onClick={() => setActivateTarget(kelas)}
                                className={`${ACTION_ICON} border-emerald-200 bg-emerald-50 text-emerald-700`}
                              >
                                <CheckSquare size={15} />
                              </button>
                              <button
                                type="button"
                                title="Hapus permanen"
                                aria-label="Hapus permanen"
                                onClick={() => setDeleteTarget(kelas)}
                                className={`${ACTION_ICON} border-red-200 bg-red-50 text-red-700`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {mounted && createOpen
        ? createPortal(
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4">
              <div className="absolute inset-0" onClick={() => setCreateOpen(false)} aria-hidden />
              <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-lg border border-gray-200 bg-white p-6 shadow-2xl">
                <h2 className="mb-1 font-serif text-lg text-gray-900">Buat Kelas Baru</h2>
                <p className="mb-5 text-xs text-gray-500">Tentukan TC, nama kelas, dan penilaian. Magang, Flora Ikusei, dan Reguler punya jumlah pertemuan.</p>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">TC (Cabang)</span>
                    <select
                      value={newCabang}
                      onChange={(event) => setNewCabang(event.target.value as KelasCabang | "")}
                      className="mt-2 w-full border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-pink"
                    >
                      <option value="">Pilih Bogor atau Jakarta</option>
                      {KELAS_CABANG.map((cabang) => (
                        <option key={cabang} value={cabang}>{cabang}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Nama Kelas</span>
                    <input
                      type="text"
                      value={newName}
                      onChange={(event) => setNewName(event.target.value)}
                      placeholder="Contoh: Kelas Magang 1, Kelas Flora Ikusei 1..."
                      className="mt-2 w-full border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-pink"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Penilaian</span>
                    <select
                      value={newJalur}
                      onChange={(event) => chooseCreateJalur(event.target.value as KelasJalur | "")}
                      className="mt-2 w-full border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-pink"
                    >
                      <option value="">Pilih penilaian</option>
                      {KELAS_JALUR.map((jalur) => (
                        <option key={jalur.id} value={jalur.id}>{jalur.label}</option>
                      ))}
                    </select>
                  </label>
                  <KelasPertemuanField jalur={newJalur} value={newPertemuan} onChange={setNewPertemuan} />
                </div>
                <div className="mt-5 flex justify-end gap-3">
                  <button type="button" onClick={() => setCreateOpen(false)} className="border border-gray-300 px-4 py-2 text-xs uppercase tracking-widest text-gray-600">
                    Batal
                  </button>
                  <button type="button" onClick={() => void saveCreate()} disabled={savingCreate} className="bg-primary-pink px-4 py-2 text-xs uppercase tracking-widest text-white disabled:opacity-50">
                    {savingCreate ? "Menyimpan…" : "Simpan"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {mounted && editTarget
        ? createPortal(
            <div className="fixed inset-0 z-[125] flex items-center justify-center bg-black/45 p-4">
              <div className="absolute inset-0" onClick={closeEditor} aria-hidden />
              <div role="dialog" aria-modal="true" className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col border border-gray-200 bg-white shadow-2xl">
                <div className="shrink-0 border-b border-gray-100 p-5">
                  <h2 className="font-serif text-lg text-gray-900">Edit Kelas</h2>
                  <p className="mt-1 text-xs text-gray-500">Ubah data kelas dan siswa yang masuk kelas ini. Status akun tidak diubah dari sini.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <label className="block">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">TC</span>
                      <select
                        value={editCabang}
                        onChange={(event) => setEditCabang(event.target.value as KelasCabang | "")}
                        className="mt-1 w-full border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-pink"
                      >
                        <option value="">Pilih TC</option>
                        {KELAS_CABANG.map((cabang) => (
                          <option key={cabang} value={cabang}>{cabang}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Nama kelas</span>
                      <input
                        type="text"
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        className="mt-1 w-full border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-pink"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Penilaian</span>
                      <select
                        value={editJalur}
                        onChange={(event) => chooseEditJalur(event.target.value as KelasJalur | "")}
                        className="mt-1 w-full border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-pink"
                      >
                        <option value="">Pilih penilaian</option>
                        {KELAS_JALUR.map((jalur) => (
                          <option key={jalur.id} value={jalur.id}>{jalur.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="mt-3 max-w-xs">
                    <KelasPertemuanField jalur={editJalur} value={editPertemuan} onChange={setEditPertemuan} />
                  </div>
                </div>
                <div className="grid min-h-0 flex-1 gap-4 overflow-hidden p-5 md:grid-cols-2">
                  <div className="flex min-h-0 flex-col">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">Siswa dalam kelas ({members.length})</div>
                    <div className="min-h-0 flex-1 overflow-auto border border-gray-200">
                      {members.length === 0 ? (
                        <p className="px-3 py-6 text-center text-xs text-gray-400">Belum ada siswa di kelas ini.</p>
                      ) : (
                        members.map((user) => (
                          <div key={user.user_id} className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="truncate font-mono text-[11px] text-gray-500">
                                  {user.user_name}{user.asal ? ` · ${user.asal}` : ""}
                                </div>
                            </div>
                            <button
                              type="button"
                              title="Keluarkan dari kelas"
                              aria-label={`Keluarkan ${user.name}`}
                              onClick={() => setMemberIds((current) => current.filter((id) => id !== user.user_id))}
                              className={`${ACTION_ICON} border-red-200 bg-red-50 text-red-700`}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="flex min-h-0 flex-col">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">Tambah siswa</div>
                    <div className="mb-2 grid shrink-0 grid-cols-2 gap-2">
                      <input
                        type="search"
                        value={addQuery}
                        onChange={(event) => setAddQuery(event.target.value)}
                        placeholder="Cari nama atau ID Peserta"
                        className="min-w-0 border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-pink"
                      />
                      <select
                        aria-label="Asal siswa"
                        value={addSource}
                        onChange={(event) => setAddSource(event.target.value)}
                        className="min-w-0 cursor-pointer border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-pink"
                      >
                        <option value="semua">Semua</option>
                        <option value="fti">FTI</option>
                        {LPK_PARTNERS.map((partner) => (
                          <option key={partner.id} value={partner.name}>{partner.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="min-h-0 flex-1 overflow-auto border border-gray-200">
                      {candidates.length === 0 ? (
                        <p className="px-3 py-6 text-center text-xs text-gray-400">Tidak ada siswa yang bisa ditambahkan.</p>
                      ) : (
                        candidates.map((user) => {
                          const current = kelasList.find((kelas) => kelas.id_kelas === user.id_kelas);
                          return (
                            <div key={user.user_id} className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="truncate text-[11px] text-gray-500">
                                  {user.user_name}{user.asal ? ` · ${user.asal}` : ""} · {current ? kelasPlacementLabel(current) : "Belum ada kelas"}
                                </div>
                              </div>
                              <button
                                type="button"
                                title="Tambahkan ke kelas"
                                aria-label={`Tambahkan ${user.name}`}
                                onClick={() => setMemberIds((currentIds) => [...currentIds, user.user_id])}
                                className={`${ACTION_ICON} border-primary-pink/30 bg-primary-pink-light text-[#be185d]`}
                              >
                                <UserPlus size={14} />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 p-4">
                  <button type="button" onClick={closeEditor} className="border border-gray-300 px-4 py-2 text-xs uppercase tracking-widest text-gray-600">
                    Batal
                  </button>
                  <button type="button" onClick={() => void saveEdit()} disabled={savingEdit} className="bg-primary-pink px-4 py-2 text-xs uppercase tracking-widest text-white disabled:opacity-50">
                    {savingEdit ? "Menyimpan…" : "Simpan"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {mounted && deactivateTarget
        ? createPortal(
            <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4">
              <div className="absolute inset-0" onClick={() => setDeactivateTarget(null)} aria-hidden />
              <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-sm border border-gray-200 bg-white p-6 shadow-2xl">
                <h2 className="mb-2 font-serif text-lg text-gray-900">Nonaktifkan kelas?</h2>
                <p className="text-sm leading-relaxed text-gray-600">
                  Kelas <span className="font-semibold text-gray-900">&ldquo;{deactivateTarget.nama_kelas}&rdquo;</span> akan dinonaktifkan.
                  Siswa yang sudah masuk kelas ini tetap, tetapi kelas tidak bisa dipilih untuk penempatan baru.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setDeactivateTarget(null)} className="border border-gray-300 px-4 py-2 text-xs uppercase tracking-widest text-gray-600">
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={deactivating}
                    onClick={() => {
                      setDeactivating(true);
                      void FtiApiKelas()
                        .putDeleteKelas({ id_kelas: deactivateTarget.id_kelas })
                        .then(async (res) => {
                          if (res?.status === 200) {
                            toast.success(`Kelas "${deactivateTarget.nama_kelas}" berhasil dinonaktifkan.`);
                            setDeactivateTarget(null);
                            await loadKelas();
                          } else {
                            toast.error(res?.message || "Gagal menonaktifkan kelas.");
                          }
                        })
                        .finally(() => setDeactivating(false));
                    }}
                    className="bg-red-600 px-4 py-2 text-xs uppercase tracking-widest text-white disabled:opacity-50"
                  >
                    {deactivating ? "Memproses…" : "Nonaktifkan"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {mounted && activateTarget
        ? createPortal(
            <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4">
              <div className="absolute inset-0" onClick={() => setActivateTarget(null)} aria-hidden />
              <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-sm border border-gray-200 bg-white p-6 shadow-2xl">
                <h2 className="mb-2 font-serif text-lg text-gray-900">Aktifkan kelas?</h2>
                <p className="text-sm text-gray-600">
                  Kelas <span className="font-semibold text-gray-900">&ldquo;{activateTarget.nama_kelas}&rdquo;</span> akan diaktifkan kembali.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setActivateTarget(null)} className="border border-gray-300 px-4 py-2 text-xs uppercase tracking-widest text-gray-600">
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={activating}
                    onClick={() => {
                      setActivating(true);
                      void FtiApiKelas()
                        .putActivateKelas({ id_kelas: activateTarget.id_kelas })
                        .then(async (res) => {
                          if (res?.status === 200) {
                            toast.success(`Kelas "${activateTarget.nama_kelas}" berhasil diaktifkan.`);
                            setActivateTarget(null);
                            await loadKelas();
                          } else {
                            toast.error(res?.message || "Gagal mengaktifkan kelas.");
                          }
                        })
                        .finally(() => setActivating(false));
                    }}
                    className="bg-emerald-600 px-4 py-2 text-xs uppercase tracking-widest text-white disabled:opacity-50"
                  >
                    {activating ? "Memproses…" : "Aktifkan"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {mounted && deleteTarget
        ? createPortal(
            <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4">
              <div className="absolute inset-0" onClick={() => setDeleteTarget(null)} aria-hidden />
              <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-sm border border-gray-200 bg-white p-6 shadow-2xl">
                <h2 className="mb-2 font-serif text-lg text-red-600">Hapus Permanen Kelas?</h2>
                <p className="text-sm text-gray-600">
                  Kelas <span className="font-semibold text-gray-900">&ldquo;{deleteTarget.nama_kelas}&rdquo;</span> akan dihapus permanen.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setDeleteTarget(null)} className="border border-gray-300 px-4 py-2 text-xs uppercase tracking-widest text-gray-600">
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => {
                      setDeleting(true);
                      void FtiApiKelas()
                        .putHardDeleteKelas({ id_kelas: deleteTarget.id_kelas })
                        .then(async (res) => {
                          if (res?.status === 200) {
                            toast.success(`Kelas "${deleteTarget.nama_kelas}" berhasil dihapus permanen.`);
                            setDeleteTarget(null);
                            await loadKelas();
                          } else {
                            toast.error(res?.message || "Gagal menghapus kelas.");
                          }
                        })
                        .finally(() => setDeleting(false));
                    }}
                    className="bg-red-600 px-4 py-2 text-xs uppercase tracking-widest text-white disabled:opacity-50"
                  >
                    {deleting ? "Menghapus…" : "Hapus Permanen"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </PortalPageShell>
  );
}
