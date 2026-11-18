"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { seedLpkAccountsIfEmpty } from "@/lib/lpk-account-storage";
import type { LpkMitraAccount } from "@/types/lpk-account";

export type JobFormData = {
  title: string;
  description: string;
  company: string;
  pengirim: string;
  deadlineDokumen: string;
  tanggalMansetsu: string;
  kuota: number | null;
  kyujinPdf: string;
  visibleLpkIds: string[];
};

type Props = {
  title: string;
  initial?: Partial<JobFormData>;
  onClose: () => void;
  onSave: (data: JobFormData) => void;
  submitLabel?: string;
};

export default function JobFormModal({
  title,
  initial,
  onClose,
  onSave,
  submitLabel = "Simpan",
}: Props) {
  const [accounts, setAccounts] = useState<LpkMitraAccount[]>([]);
  useEffect(() => {
    setAccounts(seedLpkAccountsIfEmpty());
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const kuotaRaw = String(fd.get("kuota") || "").trim();
    onSave({
      title: String(fd.get("title") || "").trim(),
      description: String(fd.get("description") || "").trim(),
      company: String(fd.get("company") || "").trim(),
      pengirim: String(fd.get("pengirim") || "").trim(),
      deadlineDokumen: String(fd.get("deadlineDokumen") || ""),
      tanggalMansetsu: String(fd.get("tanggalMansetsu") || ""),
      kuota: kuotaRaw ? parseInt(kuotaRaw, 10) : null,
      kyujinPdf: String(fd.get("kyujinPdf") || ""),
      visibleLpkIds: fd.getAll("visibleLpkIds").map(String),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-[min(680px,94vw)] border border-gray-300 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="font-serif text-xl text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} className="border border-gray-300 p-2 text-gray-500 hover:text-gray-900" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-4 gap-y-3 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Job Title *</label>
            <input name="title" required defaultValue={initial?.title ?? ""} className="input-field" placeholder="Contoh: Kaigo" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Perusahaan</label>
            <input name="company" defaultValue={initial?.company ?? ""} className="input-field" placeholder="Nama kaisha" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nama Pengirim</label>
            <input name="pengirim" defaultValue={initial?.pengirim ?? ""} className="input-field" placeholder="Kumiai untuk Magang, TSK untuk TG" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Kuota *</label>
            <input name="kuota" required inputMode="numeric" defaultValue={initial?.kuota ?? ""} className="input-field" placeholder="0" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Deadline Dokumen *</label>
            <input name="deadlineDokumen" type="date" required defaultValue={initial?.deadlineDokumen ?? ""} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tgl Mansetsu *</label>
            <input name="tanggalMansetsu" type="date" required defaultValue={initial?.tanggalMansetsu ?? ""} className="input-field" />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              name="description"
              required
              rows={2}
              defaultValue={initial?.description ?? ""}
              className="input-field resize-none"
              placeholder="Deskripsi singkat job..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">PDF Kyujin</label>
            <input name="kyujinPdf" defaultValue={initial?.kyujinPdf ?? ""} className="input-field" placeholder="Nama file PDF" />
            <input
              type="file"
              accept=".pdf"
              className="mt-2 text-sm"
              onChange={(e) => {
                const input = e.currentTarget.form?.elements.namedItem("kyujinPdf");
                if (input instanceof HTMLInputElement && e.target.files?.[0]) {
                  input.value = e.target.files[0].name;
                }
              }}
            />
          </div>
          <fieldset>
            <legend className="mb-1 text-sm font-medium text-gray-700">Tampil di LPK</legend>
            <div className="space-y-1">
              {accounts.map((account) => (
                <label key={account.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="visibleLpkIds"
                    value={account.id}
                    defaultChecked={(initial?.visibleLpkIds ?? []).includes(account.id)}
                  />
                  {account.name}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="col-span-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="border border-gray-300 px-4 py-2 text-sm">
              Batal
            </button>
            <button type="submit" className="bg-primary-pink px-4 py-2 text-sm font-medium text-white hover:bg-primary-pink-hover">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
