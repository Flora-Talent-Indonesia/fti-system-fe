"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { FtiPageShell } from "@/components/fti/FtiPageShell";
import {
  FTI_ADMIN_DEFAULT_PASSWORD,
  loadFtiAdminAccount,
  updateFtiAdminPassword,
  type FtiAdminAccount,
} from "@/lib/fti-admin-account";

export default function ChangePasswordPage() {
  const [account, setAccount] = useState<FtiAdminAccount | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAccount(loadFtiAdminAccount());
  }, []);

  const mismatch = confirmPassword.length > 0 && nextPassword !== confirmPassword;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentPassword) {
      toast.error("Masukkan password saat ini.");
      return;
    }
    if (nextPassword.trim().length < 4) {
      toast.error("Password baru minimal 4 karakter.");
      return;
    }
    if (nextPassword !== confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak sama.");
      return;
    }

    setSaving(true);
    const result = updateFtiAdminPassword(currentPassword, nextPassword);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    setAccount(loadFtiAdminAccount());
    setCurrentPassword("");
    setNextPassword("");
    setConfirmPassword("");
    toast.success("Password akun berhasil diperbarui.");
  };

  return (
    <FtiPageShell
      title="Change Password"
      titleJa="パスワード変更"
      subtitle="Ubah password akun Admin FTI"
    >
      <form onSubmit={handleSubmit} className="max-w-md border border-gray-200 bg-white p-6">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
              Username
            </label>
            <input
              type="text"
              value={account?.userName ?? ""}
              disabled
              className="input-field cursor-not-allowed bg-gray-50 font-mono text-gray-500"
            />
          </div>

          <PasswordField
            label="Password saat ini"
            value={currentPassword}
            shown={showCurrent}
            onChange={setCurrentPassword}
            onToggle={() => setShowCurrent((value) => !value)}
            autoComplete="current-password"
          />
          <PasswordField
            label="Password baru"
            value={nextPassword}
            shown={showNext}
            onChange={setNextPassword}
            onToggle={() => setShowNext((value) => !value)}
            autoComplete="new-password"
          />
          <PasswordField
            label="Konfirmasi password baru"
            value={confirmPassword}
            shown={showConfirm}
            onChange={setConfirmPassword}
            onToggle={() => setShowConfirm((value) => !value)}
            autoComplete="new-password"
            invalid={mismatch}
          />
          {mismatch && (
            <p className="text-[10px] font-medium text-red-500">Password tidak cocok.</p>
          )}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-gray-500">
          {account?.password === FTI_ADMIN_DEFAULT_PASSWORD
            ? `Mode testing. Username ${account.userName}, password awal ${FTI_ADMIN_DEFAULT_PASSWORD}.`
            : "Password tersimpan di browser ini dan dipakai saat login dengan username admin."}
        </p>

        <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
          <button
            type="submit"
            disabled={saving || mismatch}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-pink px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-pink-hover)] disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Menyimpan…" : "Simpan password"}
          </button>
        </div>
      </form>
    </FtiPageShell>
  );
}

function PasswordField({
  label,
  value,
  shown,
  onChange,
  onToggle,
  autoComplete,
  invalid = false,
}: {
  label: string;
  value: string;
  shown: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  autoComplete: string;
  invalid?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
        {label}
      </label>
      <div className="relative">
        <input
          type={shown ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className={`input-field pr-12 font-mono ${invalid ? "border-red-500 bg-red-50" : ""}`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={shown ? `Sembunyikan ${label}` : `Tampilkan ${label}`}
          className="absolute bottom-0 right-0 top-0 px-4 text-gray-400 hover:text-primary-pink"
        >
          {shown ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
