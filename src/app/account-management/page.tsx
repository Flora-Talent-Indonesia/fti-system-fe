"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  CheckSquare,
  Eye,
  EyeOff,
  KeyRound,
  Pencil,
  Save,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "react-hot-toast";
import PortalPageShell from "@/components/PortalPageShell";
import SearchField from "@/components/SearchField";
import {
  PORTAL_ACCESS_OPTIONS,
  createPortalAccount,
  deletePortalAccount,
  portalLabel,
  seedPortalAccounts,
  updatePortalAccount,
  updatePortalAccountPassword,
  type PortalAccessId,
  type PortalAccount,
} from "@/lib/portal-accounts";

function formatWhen(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AccessPicker({
  value,
  onChange,
  lockFti = false,
  dense = false,
}: {
  value: PortalAccessId[];
  onChange: (next: PortalAccessId[]) => void;
  lockFti?: boolean;
  dense?: boolean;
}) {
  const toggle = (id: PortalAccessId) => {
    if (lockFti && id === "fti") return;
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  };

  return (
    <div className={dense ? "grid grid-cols-2 gap-1.5" : "grid grid-cols-1 gap-2"}>
      {PORTAL_ACCESS_OPTIONS.map((option) => {
        const locked = lockFti && option.id === "fti";
        const checked = locked || value.includes(option.id);
        return (
          <label
            key={option.id}
            className={`flex items-center gap-2 border px-2.5 text-sm ${
              dense ? "py-1" : "gap-3 px-3 py-2.5"
            } ${
              checked ? "border-primary-pink/40 bg-primary-pink-light" : "border-gray-200 bg-white"
            } ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <input
              type="checkbox"
              className="accent-[#fc809f]"
              checked={checked}
              disabled={locked}
              onChange={() => toggle(option.id)}
            />
            <span className="font-medium text-gray-800">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}

function AccessBadges({ access }: { access: PortalAccessId[] }) {
  if (access.length === 0) return <span className="text-xs text-gray-400">Tidak ada</span>;
  return (
    <div className="flex max-w-xs flex-wrap gap-1">
      {access.map((id) => (
        <span
          key={id}
          className="inline-flex border border-primary-pink/30 bg-primary-pink-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#be185d]"
        >
          {portalLabel(id)}
        </span>
      ))}
    </div>
  );
}

export default function AccountManagementPage() {
  const [accounts, setAccounts] = useState<PortalAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [access, setAccess] = useState<PortalAccessId[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editAccount, setEditAccount] = useState<PortalAccount | null>(null);
  const [passwordAccount, setPasswordAccount] = useState<PortalAccount | null>(null);

  const refresh = useCallback(() => {
    setAccounts(seedPortalAccounts());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const pool = accounts.filter((account) => (showInactive ? !account.isActive : account.isActive));
    const query = search.trim().toLowerCase();
    const matched = query
      ? pool.filter((account) => {
          const portals = account.access.map(portalLabel).join(" ").toLowerCase();
          return (
            account.displayName.toLowerCase().includes(query) ||
            account.userName.toLowerCase().includes(query) ||
            portals.includes(query)
          );
        })
      : pool;
    return [...matched].sort(
      (a, b) => Number(b.protected) - Number(a.protected) || a.displayName.localeCompare(b.displayName, "id")
    );
  }, [accounts, search, showInactive]);

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Password dan konfirmasi tidak cocok.");
      return;
    }
    setSaving(true);
    const result = createPortalAccount({ displayName, userName, password, access });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(`Akun ${result.account.userName} dibuat. Portal: ${result.account.access.map(portalLabel).join(", ")}.`);
    setDisplayName("");
    setUserName("");
    setPassword("");
    setConfirmPassword("");
    setAccess([]);
    refresh();
  };

  const toggleActive = (account: PortalAccount) => {
    const result = updatePortalAccount(account.id, { isActive: !account.isActive });
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(account.isActive ? "Akun dinonaktifkan. Data tetap tersimpan." : "Akun diaktifkan kembali.");
    refresh();
  };

  const removeAccount = (account: PortalAccount) => {
    if (!confirm(`Hapus permanen akun ${account.userName}?`)) return;
    const result = deletePortalAccount(account.id);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Akun dihapus.");
    refresh();
  };

  return (
    <PortalPageShell className="h-dvh max-h-dvh min-h-0 overflow-hidden">
      <main className="flex h-dvh min-h-0 flex-col overflow-hidden px-4 pb-2 pt-4 md:px-6 md:pt-5">
        <header className="mb-3 flex shrink-0 items-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-gray-300 p-2 text-gray-500 transition-colors hover:bg-gray-200/50 hover:text-gray-900"
            aria-label="Kembali ke portal"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <KeyRound className="shrink-0 text-primary-pink" size={20} strokeWidth={1.5} />
              <h1 className="font-serif text-2xl leading-none tracking-wide text-gray-900">Account Management</h1>
            </div>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-gray-500">
              Superadmin mengatur akun dan portal yang boleh dibuka
            </p>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="flex min-h-0 flex-col lg:col-span-4">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200/60 bg-white p-3 shadow-sm">
              <h2 className="mb-1 flex shrink-0 items-center gap-2 font-serif text-base text-gray-900">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-pink" />
                Buat akun
              </h2>
              <p className="mb-2 shrink-0 text-[11px] leading-snug text-gray-500">
                Satu portal saja, atau beberapa sekaligus. Login belum mengikuti centang ini.
              </p>

              <form onSubmit={handleCreate} className="flex min-h-0 flex-1 flex-col gap-2">
                <label className="block shrink-0">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                    Nama tampilan
                  </span>
                  <input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="input-field !px-3 !py-1.5"
                    placeholder="Siti Rahma"
                    required
                  />
                </label>

                <label className="block shrink-0">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                    Username
                  </span>
                  <input
                    value={userName}
                    onChange={(event) => setUserName(event.target.value.toUpperCase())}
                    className="input-field !px-3 !py-1.5 font-mono uppercase"
                    placeholder="SITI"
                    autoComplete="off"
                    required
                  />
                </label>

                <div className="shrink-0">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                    Portal yang boleh dibuka
                  </span>
                  <AccessPicker dense value={access} onChange={setAccess} />
                </div>

                <div className="grid shrink-0 grid-cols-2 gap-2">
                  <PasswordInput
                    compact
                    label="Password"
                    value={password}
                    shown={showPassword}
                    onChange={setPassword}
                    onToggle={() => setShowPassword((value) => !value)}
                    placeholder="Min. 4"
                  />
                  <div>
                    <PasswordInput
                      compact
                      label="Konfirmasi"
                      value={confirmPassword}
                      shown={showConfirm}
                      onChange={setConfirmPassword}
                      onToggle={() => setShowConfirm((value) => !value)}
                      placeholder="Ulangi"
                      invalid={mismatch}
                    />
                    {mismatch ? <p className="mt-1 text-[10px] font-medium text-red-500">Tidak cocok.</p> : null}
                  </div>
                </div>

                <div className="mt-auto shrink-0 border-t border-gray-100 pt-2">
                  <button
                    type="submit"
                    disabled={saving || mismatch}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-pink px-4 py-2 text-xs font-medium uppercase tracking-widest text-white hover:bg-primary-pink-hover disabled:opacity-50"
                  >
                    <Save size={15} strokeWidth={1.5} />
                    {saving ? "Menyimpan…" : "Simpan akun"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="flex min-h-0 flex-col lg:col-span-8">
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm">
              <div className="flex shrink-0 flex-col justify-between gap-2 border-b border-gray-100 p-3 sm:flex-row sm:items-center">
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                  <SearchField
                    variant="box"
                    className="w-full sm:max-w-xs"
                    placeholder="Cari akun"
                    value={search}
                    onChange={setSearch}
                  />
                  <select
                    value={showInactive ? "1" : "0"}
                    onChange={(event) => setShowInactive(event.target.value === "1")}
                    className="input-field !py-1.5 cursor-pointer sm:max-w-[180px]"
                  >
                    <option value="0">Akun aktif</option>
                    <option value="1">Akun nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto">
                {loading ? (
                  <div className="p-16 text-center text-sm text-gray-500">Memuat akun…</div>
                ) : filtered.length === 0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center text-gray-400">
                    <UserPlus size={48} strokeWidth={1} className="mb-4 opacity-30" />
                    <p className="text-sm font-medium">Tidak ada akun</p>
                    <p className="mt-2 max-w-sm text-xs leading-relaxed">
                      {showInactive ? "Belum ada akun yang dinonaktifkan." : "Buat akun baru di formulir sebelah kiri."}
                    </p>
                  </div>
                ) : (
                  <table className="w-full whitespace-nowrap text-left text-sm">
                    <thead className="sticky top-0 z-10 border-b border-gray-200/80 bg-gray-100/80 text-[11px] uppercase text-gray-600">
                      <tr>
                        <th className="w-10 px-3 py-2 text-center font-semibold">No</th>
                        <th className="px-3 py-2 font-semibold">Username</th>
                        <th className="px-3 py-2 font-semibold">Nama</th>
                        <th className="px-3 py-2 font-semibold">Akses login</th>
                        <th className="px-3 py-2 font-semibold">Diperbarui</th>
                        <th className="sticky right-0 border-l border-gray-200/80 bg-gray-100/80 px-3 py-2 text-center font-semibold">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((account, index) => (
                        <tr key={account.id} className="group transition-colors hover:bg-primary-pink-light/20">
                          <td className="px-3 py-2 text-center text-gray-500">{index + 1}</td>
                          <td className="px-3 py-2 font-mono font-medium text-[#be185d]">
                            {account.userName}
                            {account.protected ? (
                              <span className="ml-2 align-middle text-[10px] font-sans font-semibold uppercase tracking-wide text-gray-400">
                                Utama
                              </span>
                            ) : null}
                          </td>
                          <td className="px-3 py-2 font-medium text-gray-900">{account.displayName}</td>
                          <td className="px-3 py-2">
                            <AccessBadges access={account.access} />
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-600">{formatWhen(account.updatedAt)}</td>
                          <td className="sticky right-0 border-l border-gray-100 bg-white px-2 py-1.5 text-center group-hover:bg-primary-pink-light/20">
                            <div className="inline-flex flex-nowrap items-center justify-center gap-1">
                              {!showInactive ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setEditAccount(account)}
                                    className="inline-flex items-center gap-1 rounded-md border border-primary-pink/30 bg-primary-pink-light px-2 py-1 text-[11px] font-medium text-primary-pink hover:bg-primary-pink/20"
                                  >
                                    <Pencil size={13} />
                                    Akses
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPasswordAccount(account)}
                                    className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700 hover:bg-amber-100"
                                  >
                                    <KeyRound size={13} />
                                    Password
                                  </button>
                                  {!account.protected ? (
                                    <button
                                      type="button"
                                      onClick={() => toggleActive(account)}
                                      className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100"
                                    >
                                      <Ban size={13} />
                                      Nonaktifkan
                                    </button>
                                  ) : null}
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => toggleActive(account)}
                                    className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                                  >
                                    <CheckSquare size={13} />
                                    Aktifkan
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeAccount(account)}
                                    className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100"
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

        <p className="mt-1.5 shrink-0 text-center text-[10px] text-gray-500">
          Belum diaktifkan. Halaman ini untuk superadmin. Login belum mengikuti centang portal.
        </p>
      </main>

      {editAccount ? (
        <EditAccessModal
          key={editAccount.id}
          account={editAccount}
          onClose={() => setEditAccount(null)}
          onSaved={() => {
            setEditAccount(null);
            refresh();
          }}
        />
      ) : null}
      {passwordAccount ? (
        <PasswordModal
          key={passwordAccount.id}
          account={passwordAccount}
          onClose={() => setPasswordAccount(null)}
          onSaved={() => setPasswordAccount(null)}
        />
      ) : null}
    </PortalPageShell>
  );
}

function PasswordInput({
  label,
  value,
  shown,
  onChange,
  onToggle,
  placeholder,
  invalid = false,
  compact = false,
}: {
  label: string;
  value: string;
  shown: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  placeholder: string;
  invalid?: boolean;
  compact?: boolean;
}) {
  return (
    <label className="block">
      <span
        className={`block font-semibold uppercase tracking-wider text-gray-600 ${
          compact ? "mb-1 text-[10px]" : "mb-2 text-xs"
        }`}
      >
        {label}
      </span>
      <div className="relative">
        <input
          type={shown ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`input-field font-mono ${compact ? "!px-3 !py-1.5 pr-9" : "pr-12"} ${invalid ? "border-red-500 bg-red-50" : ""}`}
          placeholder={placeholder}
          autoComplete="new-password"
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className={`absolute bottom-0 right-0 top-0 text-gray-400 hover:text-primary-pink ${compact ? "px-2" : "px-4"}`}
          aria-label={shown ? "Sembunyikan password" : "Tampilkan password"}
        >
          {shown ? <EyeOff size={compact ? 15 : 18} /> : <Eye size={compact ? 15 : 18} />}
        </button>
      </div>
    </label>
  );
}

function EditAccessModal({
  account,
  onClose,
  onSaved,
}: {
  account: PortalAccount;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(account.displayName);
  const [nameUser, setNameUser] = useState(account.userName);
  const [picked, setPicked] = useState<PortalAccessId[]>(account.access);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const result = updatePortalAccount(account.id, {
      displayName: name,
      userName: nameUser,
      access: picked,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Akses akun diperbarui.");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <form onSubmit={save} className="w-full max-w-md border border-gray-200 bg-white p-6 shadow-xl">
        <h2 className="font-serif text-xl text-gray-900">Ubah akses</h2>
        <p className="mt-1 text-xs text-gray-500">{account.userName}</p>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">Nama tampilan</span>
            <input value={name} onChange={(event) => setName(event.target.value)} className="input-field" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">Username</span>
            <input
              value={nameUser}
              onChange={(event) => setNameUser(event.target.value.toUpperCase())}
              className="input-field font-mono uppercase disabled:cursor-not-allowed disabled:bg-gray-50"
              disabled={account.protected}
              required
            />
          </label>
          <AccessPicker value={picked} onChange={setPicked} lockFti={account.protected} />
          {account.protected ? (
            <p className="text-xs leading-relaxed text-gray-500">
              Akun contoh ADMIN tetap tercatat punya akses FTI. Centang ini belum dipakai untuk login.
            </p>
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="border border-gray-300 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
            Batal
          </button>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}

function PasswordModal({
  account,
  onClose,
  onSaved,
}: {
  account: PortalAccount;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [shown, setShown] = useState(false);
  const [saving, setSaving] = useState(false);
  const mismatch = confirmPassword.length > 0 && nextPassword !== confirmPassword;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (nextPassword !== confirmPassword) {
      toast.error("Password dan konfirmasi tidak sama.");
      return;
    }
    setSaving(true);
    const result = updatePortalAccountPassword(account.id, nextPassword);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(`Password ${account.userName} diperbarui.`);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <form onSubmit={save} className="w-full max-w-md border border-gray-200 bg-white p-6 shadow-xl">
        <h2 className="font-serif text-xl text-gray-900">Ubah password</h2>
        <p className="mt-1 font-mono text-xs text-[#be185d]">{account.userName}</p>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">Password baru</span>
            <div className="relative">
              <input
                type={shown ? "text" : "password"}
                value={nextPassword}
                onChange={(event) => setNextPassword(event.target.value)}
                className="input-field pr-12 font-mono"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShown((value) => !value)}
                className="absolute bottom-0 right-0 top-0 px-4 text-gray-400 hover:text-primary-pink"
                aria-label={shown ? "Sembunyikan password" : "Tampilkan password"}
              >
                {shown ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">Konfirmasi</span>
            <input
              type={shown ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={`input-field font-mono ${mismatch ? "border-red-500 bg-red-50" : ""}`}
              autoComplete="new-password"
              required
            />
            {mismatch ? <p className="mt-1.5 text-[10px] font-medium text-red-500">Password tidak cocok.</p> : null}
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="border border-gray-300 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
            Batal
          </button>
          <button type="submit" disabled={saving || mismatch} className="btn-primary disabled:opacity-50">
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
