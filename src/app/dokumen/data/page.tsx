"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, Plus, Trash2 } from "lucide-react";
import SearchField from "@/components/SearchField";
import { toast } from "react-hot-toast";
import { CenteredPortal } from "@/components/CenteredPortal";
import { coeBatchProgress } from "@/lib/coe-batch";
import { deleteCoeBatch, listCoeBatches } from "@/lib/coe-batch-storage";
import type { CoeBatch } from "@/lib/coe-batch";

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export default function LihatDataDokumenPage() {
  const router = useRouter();
  const [rows, setRows] = useState<CoeBatch[]>([]);
  const [search, setSearch] = useState("");
  const [ready, setReady] = useState(false);

  const reload = () => setRows(listCoeBatches());

  useEffect(() => {
    reload();
    setReady(true);
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((batch) => {
      const haystack = [
        batch.name,
        batch.shared.perusahaan,
        ...batch.members.flatMap((member) => [member.nama, member.noPeserta]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [rows, search]);

  const remove = (batch: CoeBatch) => {
    if (!window.confirm(`Hapus batch "${batch.name}"?`)) return;
    if (!deleteCoeBatch(batch.id)) {
      toast.error("Batch tidak ditemukan.");
      return;
    }
    toast.success("Batch dihapus.");
    reload();
  };

  return (
    <CenteredPortal
      eyebrow="Dokumen"
      title="Lihat Data"
      description="Batch pengiriman yang sudah dibuat. Buka untuk mengubah data bersama dan lembar COE siswa."
      backHref="/dokumen"
      backLabel="Kembali"
    >
      <div className="flex justify-end">
        <Link href="/dokumen/buat" className="btn-primary inline-flex items-center gap-2">
          <Plus size={14} />
          Buat dokumen
        </Link>
      </div>

      <section className="border border-gray-300 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
            {ready ? `${filtered.length} batch` : "…"}
          </p>
          <SearchField
            variant="box"
            className="w-full sm:w-64"
            placeholder="Cari batch"
            value={search}
            onChange={setSearch}
          />
        </div>

        {!ready ? (
          <p className="px-5 py-10 text-sm text-gray-500">Memuat batch…</p>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary-pink/20 bg-primary-pink-light text-primary-pink">
              <Layers size={22} strokeWidth={1.5} />
            </span>
            <p className="mt-3 font-serif text-base text-gray-900">
              {rows.length === 0 ? "Belum ada batch" : "Tidak ada batch yang cocok"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {rows.length === 0
                ? "Buat batch untuk mengelompokkan siswa satu pengiriman, lalu isi lembar COE."
                : "Coba kata kunci lain."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((batch) => (
              <li key={batch.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => router.push(`/dokumen/buat?id=${batch.id}`)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm font-medium text-gray-900">{batch.name}</p>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {batch.shared.perusahaan || "Perusahaan belum diisi"}
                    {" · "}
                    {batch.members.length} siswa
                    {batch.updatedAt ? ` · ${formatWhen(batch.updatedAt)}` : ""}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-[#be185d]">{coeBatchProgress(batch)}</p>
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/dokumen/buat?id=${batch.id}`)}
                    className="border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-primary-pink hover:text-[#be185d]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(batch)}
                    className="border border-rose-100 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100"
                    title="Hapus batch"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </CenteredPortal>
  );
}
