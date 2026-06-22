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
  Search,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
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
      });
      toast.success(`Berhasil membuat akun LPK: ${lpkName.trim().toUpperCase()}`);
      setLpkName("");
      setLpkUsername("");
      setLpkKota("");
      setLpkPassword("");
      setLpkConfirmPassword("");
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
    <PortalPageShell>
      <main className="p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              <p className="text-xs font-medium text-gray-500 tracking-widest uppercase mt-1">
                Buat dan kelola akun login portal LPK Mitra
              </p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="bg-white p-6 border border-gray-200/60 shadow-sm rounded-xl">
              <h2 className="text-lg font-serif text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary-pink rounded-full" />
                Form Buat Akun LPK
              </h2>

              <form onSubmit={handleSaveAccount} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
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
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
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
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
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

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={lpkPassword}
                      onChange={(e) => setLpkPassword(e.target.value)}
                      className="input-field pr-12 font-mono"
                      placeholder="lpk123"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 bottom-0 px-4 text-gray-400 hover:text-primary-pink"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={lpkConfirmPassword}
                      onChange={(e) => setLpkConfirmPassword(e.target.value)}
                      className={`input-field pr-12 font-mono ${passwordMismatch ? "border-red-500 bg-red-50" : ""}`}
                      placeholder="lpk123"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-0 bottom-0 px-4 text-gray-400 hover:text-primary-pink"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordMismatch && (
                    <p className="text-[10px] text-red-500 mt-1.5 font-medium">Password tidak cocok.</p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSaving || passwordMismatch}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-xs tracking-widest uppercase font-medium text-white bg-primary-pink hover:bg-primary-pink-hover rounded-lg disabled:opacity-50"
                  >
                    <Save size={16} strokeWidth={1.5} />
                    {isSaving ? "Menyimpan…" : "Simpan Akun LPK"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white border border-gray-200/60 shadow-sm rounded-xl min-h-[500px] flex flex-col overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-4 w-full">
                  <div className="relative group w-full sm:max-w-xs">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-pink"
                      size={18}
                    />
                    <input
                      type="search"
                      placeholder="Cari nama / username / kota…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>

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

              <div className="flex-1 overflow-x-auto">
                {loading ? (
                  <div className="p-16 text-center text-gray-500 text-sm">Memuat daftar LPK…</div>
                ) : filtered.length === 0 ? (
                  <div className="min-h-[300px] flex flex-col items-center justify-center text-gray-400 p-8 text-center">
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

        <p className="mt-6 text-xs text-gray-500 text-center">
          Mode testing — data akun LPK disimpan di localStorage browser.
        </p>
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
