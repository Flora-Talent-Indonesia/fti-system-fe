"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { FtiPageShell } from "@/components/fti/FtiPageShell";
import {
  isMouExpired,
  loadLpkAccounts,
  mouDaysLeft,
  seedLpkAccountsIfEmpty,
  updateLpkAccount,
} from "@/lib/lpk-account-storage";
import { seedJobsIfEmpty } from "@/lib/job-storage";
import type { LpkMitraAccount } from "@/types/lpk-account";
import type { Job } from "@/types";

export default function FtiLpkListPage() {
  const [accounts, setAccounts] = useState<LpkMitraAccount[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [sort, setSort] = useState<"shortest" | "longest">("shortest");
  const [editing, setEditing] = useState<LpkMitraAccount | null>(null);

  const reload = () => setAccounts(seedLpkAccountsIfEmpty());

  useEffect(() => {
    reload();
    setJobs(seedJobsIfEmpty());
  }, []);

  const visible = useMemo(() => {
    const list = accounts.filter((account) => {
      const inactive = !account.isActive || isMouExpired(account);
      return showInactive ? inactive : !inactive;
    });
    return list.sort((a, b) => {
      const left = mouDaysLeft(a) ?? 99999;
      const right = mouDaysLeft(b) ?? 99999;
      return sort === "shortest" ? left - right : right - left;
    });
  }, [accounts, showInactive, sort]);

  return (
    <FtiPageShell
      title="Daftar LPK Mitra"
      titleJa="LPKミトラ一覧"
      subtitle="MOU, sisa kerja sama, dan kyujin yang terlihat oleh LPK"
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <button type="button" className="px-3 py-2 border border-gray-300 text-xs uppercase tracking-wider" onClick={() => setShowInactive((v) => !v)}>
          {showInactive ? "Lihat LPK aktif" : "LPK nonaktif"}
        </button>
        <select className="px-3 py-2 border border-gray-300 text-xs" value={sort} onChange={(e) => setSort(e.target.value as "shortest" | "longest")}>
          <option value="shortest">Sisa MOU terpendek</option>
          <option value="longest">Sisa MOU terlama</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <aside className="bg-white border border-gray-200 p-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Kyujin</h2>
          <ul className="space-y-2 text-sm">
            {jobs.map((job) => (
              <li key={job.id}>
                <span className="font-medium">{job.title}</span>
                <span className="block text-xs text-gray-500">{job.kyujinPdf || "PDF belum ada"}</span>
              </li>
            ))}
          </ul>
        </aside>
        <div className="grid md:grid-cols-2 gap-4">
          {visible.map((account) => {
            const days = mouDaysLeft(account);
            const expired = isMouExpired(account);
            return (
              <article key={account.id} className="bg-white border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Building2 className="text-primary-pink mb-3" size={20} />
                    <h2 className="font-serif text-lg">{account.name}</h2>
                    <p className="mt-1 text-sm font-semibold tracking-wide text-primary-pink">{account.code}</p>
                    <p className="text-sm text-gray-500">{account.kota}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 ${expired || !account.isActive ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                    {expired || !account.isActive ? "Nonaktif" : "Aktif"}
                  </span>
                </div>
                <p className="text-sm mt-3">MOU berakhir: {account.mouEnd || "belum diisi"}</p>
                <p className="text-sm text-gray-600">Sisa: {days === null ? "—" : `${days} hari`}</p>
                <p className="text-sm text-gray-600">CP: {account.contactName || "—"} {account.contactPhone || ""}</p>
                <p className="text-xs text-gray-500 mt-1">{account.mouFileName || "File MOU belum ada"}</p>
                <div className="mt-4 flex items-center justify-between">
                  <button type="button" className="text-xs uppercase tracking-wider text-primary-pink" onClick={() => setEditing(account)}>
                    Update MOU
                  </button>
                  <Link href={`/fti/lpk-mitra/${account.id}`} className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-primary-pink">
                    Siswa <ChevronRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {editing && (
        <MouDialog
          account={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updateLpkAccount(editing.id, patch);
            toast.success("MOU diperbarui.");
            setEditing(null);
            reload();
          }}
        />
      )}
    </FtiPageShell>
  );
}

function MouDialog({
  account,
  onClose,
  onSave,
}: {
  account: LpkMitraAccount;
  onClose: () => void;
  onSave: (patch: Partial<LpkMitraAccount>) => void;
}) {
  const [contactName, setContactName] = useState(account.contactName ?? "");
  const [contactPhone, setContactPhone] = useState(account.contactPhone ?? "");
  const [mouStart, setMouStart] = useState(account.mouStart ?? "");
  const [mouEnd, setMouEnd] = useState(account.mouEnd ?? "");
  const [mouFileName, setMouFileName] = useState(account.mouFileName ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <form
        className="bg-white w-full max-w-md p-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ contactName, contactPhone, mouStart, mouEnd, mouFileName });
        }}
      >
        <h2 className="font-serif text-xl">Update MOU</h2>
        <input className="input-field" placeholder="Contact person" value={contactName} onChange={(e) => setContactName(e.target.value)} />
        <input className="input-field" placeholder="Telepon CP" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        <label className="text-xs text-gray-500">Mulai<input type="date" className="input-field" value={mouStart} onChange={(e) => setMouStart(e.target.value)} /></label>
        <label className="text-xs text-gray-500">Berakhir<input type="date" className="input-field" value={mouEnd} onChange={(e) => setMouEnd(e.target.value)} /></label>
        <input className="input-field" placeholder="Nama file PDF MOU" value={mouFileName} onChange={(e) => setMouFileName(e.target.value)} />
        <input type="file" accept=".pdf" onChange={(e) => setMouFileName(e.target.files?.[0]?.name ?? mouFileName)} />
        <div className="flex justify-end gap-2">
          <button type="button" className="px-3 py-2 border" onClick={onClose}>Batal</button>
          <button type="submit" className="btn-primary">Simpan</button>
        </div>
      </form>
    </div>
  );
}
