"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  Building2,
  CheckSquare,
  Edit,
  Eye,
  EyeOff,
  Key,
  Save,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import SearchField from "@/components/SearchField";
import PortalPageShell from "@/components/PortalPageShell";
import type { LpkMitraAccount } from "@/types/lpk-account";
import {
  createLpkAccount,
  deleteLpkAccountPermanent,
  formatLpkAccountDate,
  loadLpkAccounts,
  seedLpkAccountsIfEmpty,
  updateLpkAccount,
} from "@/lib/lpk-account-storage";
import EditLpkMitraModal from "./components/EditLpkMitraModal";
import UpdateLpkPasswordModal from "./components/UpdateLpkPasswordModal";

export default function CreateLpkMitraPage() {
  const [lpkName, setLpkName] = useState("");
  const [lpkUsername, setLpkUsername] = useState("");
  const [lpkKota, setLpkKota] = useState("");
  const [lpkPassword, setLpkPassword] = useState("");
  const [lpkConfirmPassword, setLpkConfirmPassword] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [mouStart, setMouStart] = useState("");
  const [mouEnd, setMouEnd] = useState("");
  const [mouFileName, setMouFileName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [accounts, setAccounts] = useState<LpkMitraAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState("");

  const [editAccount, setEditAccount] = useState<LpkMitraAccount | null>(null);
  const [passwordAccount, setPasswordAccount] = useState<LpkMitraAccount | null>(null);

  const refresh = useCallback(() => {
    setAccounts(loadLpkAccounts());
    setLoading(false);
  }, []);

  useEffect(() => {
    seedLpkAccountsIfEmpty();
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const pool = accounts.filter((a) => (showInactive ? !a.isActive : a.isActive));
    const q = search.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.userName.toLowerCase().includes(q) ||
        a.kota.toLowerCase().includes(q)
    );
  }, [accounts, showInactive, search]);

  const passwordMismatch =
    lpkConfirmPassword.length > 0 && lpkPassword !== lpkConfirmPassword;

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lpkName.trim() || !lpkUsername.trim() || !lpkKota.trim() || !lpkPassword.trim()) {
      toast.error("Mohon lengkapi semua field terlebih dahulu.");
      return;
    }
    if (lpkPassword !== lpkConfirmPassword) {
      toast.error("Password dan konfirmasi tidak cocok.");
      return;
    }

    const userName = lpkUsername.trim().toUpperCase();
    if (loadLpkAccounts().some((a) => a.userName === userName)) {
      toast.error("Username sudah dipakai.");
      return;
    }

    setIsSaving(true);
    try {
      createLpkAccount({
        name: lpkName,
        userName,
        kota: lpkKota,
        password: lpkPassword.trim(),
        contactName,
        contactPhone,
        mouStart,
        mouEnd,
        mouFileName,
      });
      toast.success(`Berhasil membuat akun LPK: ${lpkName.trim().toUpperCase()}`);
      setLpkName("");
      setLpkUsername("");
      setLpkKota("");
      setLpkPassword("");
      setLpkConfirmPassword("");
      setContactName("");
      setContactPhone("");
      setMouStart("");
      setMouEnd("");
      setMouFileName("");
      refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = (account: LpkMitraAccount) => {
    updateLpkAccount(account.id, { isActive: !account.isActive });
    toast.success(`Akun LPK berhasil di${account.isActive ? "nonaktifkan" : "aktifkan"}.`);
    refresh();
  };

  const handleDeletePermanent = (account: LpkMitraAccount) => {
    if (!confirm(`Hapus permanen akun ${account.name}?`)) return;
    deleteLpkAccountPermanent(account.id);
    toast.success("Akun LPK dihapus permanen.");
    refresh();
  };

  return (
    <PortalPageShell fill>
      <main className="flex h-full min-h-0 flex-col overflow-hidden px-4 pb-3 pt-4 md:px-6 md:pb-4 md:pt-5">
        <header className="mb-2 flex shrink-0 flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/fti"
              className="p-3 bg-transparent hover:bg-gray-200/50 transition-colors border border-gray-300 text-gray-500 hover:text-gray-900 rounded-lg"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <UserPlus className="text-primary-pink" size={28} strokeWidth={1.5} />
                <h1 className="text-3xl font-serif text-gray-900 tracking-wide">Manajemen Akun LPK Mitra</h1>
              </div>
              <p className="mt-1 text-xs font-medium uppercase tracking-widest text-gray-500">
                Buat dan kelola akun login portal LPK Mitra
              </p>
              <p className="mt-1 text-[11px] text-gray-400">
                Mode testing — data akun LPK disimpan di localStorage browser.
              </p>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden lg:grid-cols-12 lg:grid-rows-1">
          <div className="min-h-0 lg:col-span-4">
            <div className="flex h-full min-h-0 flex-col overflow-hidden border border-gray-200/60 bg-white p-4 shadow-sm rounded-xl">
              <h2 className="mb-3 flex shrink-0 items-center gap-2 font-serif text-lg text-gray-900">
                <span className="w-1.5 h-1.5 bg-primary-pink rounded-full" />
                Form Buat Akun LPK
              </h2>

              <form onSubmit={handleSaveAccount} className="space-y-1.5 [&_.input-field]:!py-1.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                    Nama LPK Mitra
                  </label>
                  <input
                    type="text"
                    value={lpkName}
                    onChange={(e) => setLpkName(e.target.value)}
                    className="input-field"
                    placeholder="LPK Mitra Sukabumi"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={lpkUsername}
                    onChange={(e) => setLpkUsername(e.target.value.toUpperCase())}
                    className="input-field font-mono uppercase"
                    placeholder="LPK-SUKABUMI"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                    Kota
                  </label>
                  <input
                    type="text"
                    value={lpkKota}
                    onChange={(e) => setLpkKota(e.target.value)}
                    className="input-field"
                    placeholder="Sukabumi"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Contact person
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="input-field"
                      placeholder="Nama penanggung jawab"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Telepon
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="input-field"
                      placeholder="08…"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Mulai MOU
                    </label>
                    <input type="date" value={mouStart} onChange={(e) => setMouStart(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Akhir MOU
                    </label>
                    <input type="date" value={mouEnd} onChange={(e) => setMouEnd(e.target.value)} className="input-field" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                    PDF MOU
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    className="text-sm"
                    onChange={(e) => setMouFileName(e.target.files?.[0]?.name ?? "")}
                  />
                  {mouFileName && <p className="text-xs text-gray-500 mt-1">{mouFileName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={lpkPassword}
                        onChange={(e) => setLpkPassword(e.target.value)}
                        className="input-field pr-10 font-mono"
                        placeholder="lpk123"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 bottom-0 px-2.5 text-gray-400 hover:text-primary-pink"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Konfirmasi
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={lpkConfirmPassword}
                        onChange={(e) => setLpkConfirmPassword(e.target.value)}
                        className={`input-field pr-10 font-mono ${passwordMismatch ? "border-red-500 bg-red-50" : ""}`}
                        placeholder="lpk123"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-0 top-0 bottom-0 px-2.5 text-gray-400 hover:text-primary-pink"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordMismatch && (
                      <p className="mt-1 text-[10px] font-medium text-red-500">Password tidak cocok.</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving || passwordMismatch}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-pink px-6 py-2.5 text-xs font-medium uppercase tracking-widest text-white hover:bg-primary-pink-hover disabled:opacity-50"
                  >
                    <Save size={16} strokeWidth={1.5} />
                    {isSaving ? "Menyimpan…" : "Simpan Akun LPK"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="flex min-h-0 flex-col overflow-hidden lg:col-span-8">
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm">
              <div className="flex shrink-0 flex-col justify-between gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
                <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-4 w-full">
                  <SearchField
                    variant="box"
                    className="w-full sm:max-w-xs"
                    placeholder="Cari LPK"
                    value={search}
                    onChange={setSearch}
                  />

                  <div className="relative w-full sm:max-w-[220px]">
                    <select
                      value={showInactive ? "1" : "0"}
                      onChange={(e) => setShowInactive(e.target.value === "1")}
                      className="input-field appearance-none pr-10 cursor-pointer"
                    >
                      <option value="0">LPK Aktif</option>
                      <option value="1">LPK Nonaktif</option>
                    </select>
                    <Users className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-gray-600 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${showInactive ? "bg-red-500" : "bg-emerald-500"}`} />
                  {showInactive ? "Nonaktif" : "Aktif"}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto">
                {loading ? (
                  <div className="p-16 text-center text-sm text-gray-500">Memuat daftar LPK…</div>
                ) : filtered.length === 0 ? (
                  <div className="flex h-full min-h-40 flex-col items-center justify-center p-8 text-center text-gray-400">
                    <Building2 size={48} strokeWidth={1} className="mb-4 opacity-30" />
                    <p className="text-sm font-medium">Tidak ada data LPK Mitra</p>
                    <p className="text-xs mt-2 max-w-sm leading-relaxed">
                      {showInactive
                        ? "Belum ada akun LPK yang dinonaktifkan."
                        : "Buat akun LPK baru di formulir sebelah kiri."}
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs text-gray-600 uppercase bg-gray-100/80 border-b border-gray-200/80 sticky top-0">
                      <tr>
                        <th className="px-6 py-4 font-semibold w-12 text-center">No</th>
                        <th className="px-6 py-4 font-semibold">Username</th>
                        <th className="px-6 py-4 font-semibold">Nama LPK</th>
                        <th className="px-6 py-4 font-semibold">Kota</th>
                        <th className="px-6 py-4 font-semibold">Created</th>
                        <th className="px-6 py-4 font-semibold">Updated</th>
                        <th className="px-6 py-4 font-semibold">Created By</th>
                        <th className="px-6 py-4 font-semibold text-center sticky right-0 bg-gray-100/80 border-l border-gray-200/80 z-10">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((a, i) => (
                        <tr key={a.id} className="group hover:bg-primary-pink-light/20 transition-colors">
                          <td className="px-6 py-4 text-center text-gray-500">{i + 1}</td>
                          <td className="px-6 py-4 font-mono font-medium text-[#be185d]">{a.userName}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">{a.name}</td>
                          <td className="px-6 py-4 text-gray-600">{a.kota}</td>
                          <td className="px-6 py-4 text-gray-600 text-xs">{formatLpkAccountDate(a.createdAt)}</td>
                          <td className="px-6 py-4 text-gray-600 text-xs">{formatLpkAccountDate(a.updatedAt)}</td>
                          <td className="px-6 py-4 text-gray-600 text-xs">{a.createdBy}</td>
                          <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-primary-pink-light/20 border-l border-gray-100 z-10">
                            <div className="inline-flex items-center justify-center gap-1.5 flex-wrap">
                              {!showInactive ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setEditAccount(a)}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-primary-pink border border-primary-pink/30 bg-primary-pink-light hover:bg-primary-pink/20 rounded-md"
                                  >
                                    <Edit size={13} />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPasswordAccount(a)}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 rounded-md"
                                  >
                                    <Key size={13} />
                                    Password
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleActive(a)}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 rounded-md"
                                  >
                                    <Ban size={13} />
                                    Nonaktifkan
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleActive(a)}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-md"
                                  >
                                    <CheckSquare size={13} />
                                    Aktifkan
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePermanent(a)}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 rounded-md"
                                  >
                                    <Trash2 size={13} />
                                    Hapus
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
            </div>
          </div>
        </div>
      </main>

      {editAccount && (
        <EditLpkMitraModal
          accountId={editAccount.id}
          initialName={editAccount.name}
          initialUserName={editAccount.userName}
          initialKota={editAccount.kota}
          onClose={() => setEditAccount(null)}
          onSuccess={refresh}
        />
      )}

      {passwordAccount && (
        <UpdateLpkPasswordModal
          accountId={passwordAccount.id}
          userName={passwordAccount.userName}
          onClose={() => setPasswordAccount(null)}
          onSuccess={() => {}}
        />
      )}
    </PortalPageShell>
  );
}
