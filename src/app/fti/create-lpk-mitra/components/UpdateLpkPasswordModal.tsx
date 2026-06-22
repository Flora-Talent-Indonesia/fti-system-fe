"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Save, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { updateLpkAccount } from "@/lib/lpk-account-storage";

type Props = {
  accountId: string;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function UpdateLpkPasswordModal({
  accountId,
  userName,
  onClose,
  onSuccess,
}: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [accountId]);

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Password tidak boleh kosong.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Password dan konfirmasi tidak sama.");
      return;
    }

    setIsSaving(true);
    try {
      updateLpkAccount(accountId, { password: password.trim() });
      toast.success(`Password berhasil diperbarui untuk ${userName}.`);
      onSuccess();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <h3 className="text-sm font-semibold tracking-wide text-gray-800 uppercase">
            Ubah Password LPK
          </h3>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              value={userName}
              disabled
              className="input-field font-mono bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-12 font-mono"
                placeholder="Password baru"
                required
                autoFocus
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`input-field pr-12 font-mono ${mismatch ? "border-red-500 bg-red-50" : ""}`}
                placeholder="Ulangi password"
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
            {mismatch && (
              <p className="text-[10px] text-red-500 mt-1.5 font-medium">Password tidak cocok.</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || !password.trim() || mismatch}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-pink hover:bg-primary-pink-hover rounded-lg disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving ? "Menyimpan…" : "Simpan Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
