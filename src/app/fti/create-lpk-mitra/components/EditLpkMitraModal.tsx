"use client";

import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { loadLpkAccounts, updateLpkAccount } from "@/lib/lpk-account-storage";

type Props = {
  accountId: string;
  initialName: string;
  initialUserName: string;
  initialKota: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditLpkMitraModal({
  accountId,
  initialName,
  initialUserName,
  initialKota,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState(initialName);
  const [userName, setUserName] = useState(initialUserName);
  const [kota, setKota] = useState(initialKota);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(initialName);
    setUserName(initialUserName);
    setKota(initialKota);
  }, [initialName, initialUserName, initialKota]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !userName.trim() || !kota.trim()) {
      toast.error("Mohon lengkapi semua field.");
      return;
    }

    const dup = loadLpkAccounts().some(
      (a) => a.id !== accountId && a.userName === userName.trim().toUpperCase()
    );
    if (dup) {
      toast.error("Username sudah dipakai akun LPK lain.");
      return;
    }

    setIsSaving(true);
    try {
      updateLpkAccount(accountId, {
        name: name.trim().toUpperCase(),
        userName: userName.trim().toUpperCase(),
        kota: kota.trim(),
      });
      toast.success("Data LPK Mitra berhasil diperbarui.");
      onSuccess();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const unchanged =
    name === initialName && userName === initialUserName && kota === initialKota;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <h3 className="text-sm font-semibold tracking-wide text-gray-800 uppercase">
            Edit Akun LPK Mitra
          </h3>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value.toUpperCase())}
              className="input-field font-mono uppercase"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Nama LPK
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Kota
            </label>
            <input
              type="text"
              value={kota}
              onChange={(e) => setKota(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || unchanged || !name.trim() || !userName.trim() || !kota.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-pink hover:bg-primary-pink-hover rounded-lg disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
