"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, LogOut, Settings, Users } from "lucide-react";
import LpkMitraShell from "@/components/lpk/LpkMitraShell";
import LpkHubCard from "@/components/lpk/LpkHubCard";
import { useLiveClock } from "@/hooks/use-live-clock";
import { formatJapaneseDateTime } from "@/lib/format-japanese-datetime";
import { isMouExpired, mouDaysLeft, seedLpkAccountsIfEmpty } from "@/lib/lpk-account-storage";
import type { LpkMitraAccount } from "@/types/lpk-account";

/** Nama LPK untuk demo FE — nanti dari auth / profil login. */
const LPK_DISPLAY_NAME = "LPK Mitra Sukabumi";

export default function LpkMitraHubPage() {
  const now = useLiveClock();
  const [account, setAccount] = useState<LpkMitraAccount | null>(null);

  useEffect(() => {
    setAccount(seedLpkAccountsIfEmpty().find((item) => item.id === "lpk-01") ?? null);
  }, []);

  const days = account ? mouDaysLeft(account) : null;

  return (
    <LpkMitraShell className="h-dvh max-h-dvh min-h-0 overflow-hidden">
      <main className="flex h-dvh min-h-0 flex-col overflow-hidden px-4 pb-3 pt-8 sm:px-6 md:px-8 md:pb-4 md:pt-10">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200/80 pb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <Link
                  href="/"
                  className="shrink-0 rounded-md border border-gray-200 bg-white p-1.5 text-gray-700 transition-colors hover:border-primary-pink/40 hover:bg-primary-pink-light"
                  title="Kembali ke portal"
                  aria-label="Kembali ke portal Flora Talent Indonesia"
                >
                  <Settings size={18} strokeWidth={1.5} />
                </Link>
                <Image
                  src="/logo/logo-fti.png"
                  alt="Flora Talent Indonesia"
                  width={120}
                  height={48}
                  className="h-7 w-auto object-contain"
                  unoptimized
                />
                <span className="hidden border border-primary-pink/30 bg-primary-pink-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-pink sm:inline">
                  Flora Talent Indonesia
                </span>
              </div>
              <div className="mt-2 flex flex-col gap-2.5">
                <h1 className="font-serif text-xl tracking-wide text-gray-900 leading-none md:text-2xl">
                  LPK Mitra Dashboard
                </h1>
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gray-500 leading-none">
                  パートナーLPKポータル
                </p>
                <p className="text-sm text-gray-800 leading-none">
                  Selamat datang,{" "}
                  <span className="font-semibold text-[#be185d]">{LPK_DISPLAY_NAME}</span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-600 transition-colors hover:border-red-800 hover:bg-red-800 hover:text-white"
              >
                <LogOut size={15} />
                Keluar
              </Link>
              <div className="text-right">
                <p className="text-[10px] font-semibold tracking-wide text-gray-500">
                  Servertime
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                  日時 / WIB
                </p>
                <p className="font-[family-name:var(--font-inter)] text-xs font-medium leading-snug text-gray-900 md:text-sm">
                  {now ? formatJapaneseDateTime(now) : "—"}
                </p>
              </div>
            </div>
          </header>

          <div className="mt-3 flex min-h-0 flex-1 items-center">
            <div className="grid h-full max-h-[26rem] w-full min-h-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <LpkHubCard
                compact
                className="h-full"
                href="/lpk-mitra/siswa"
                icon={Users}
                title="Kelola Siswa"
                titleJa="実習生管理"
                cta="Kelola Siswa"
              />
              <LpkHubCard
                compact
                className="h-full"
                href="/lpk-mitra/kyujin"
                icon={FileText}
              title="Job"
              titleJa="ジョブ"
              cta="Lihat Job"
              />
            </div>
          </div>

          <section className="mt-3 shrink-0 border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-700">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="font-serif text-base text-gray-900">MOU</h2>
              <p>Berlaku sampai: {account?.mouEnd || "belum diisi FTI"}</p>
              <p>Sisa hari: {days == null ? "—" : days}</p>
              <p>
                Contact person: {account?.contactName || "—"} · {account?.contactPhone || "—"}
              </p>
              <p>Berkas: {account?.mouFileName || "—"}</p>
            </div>
            {account && isMouExpired(account) && (
              <p className="mt-1 text-red-700">
                MOU berakhir. Login LPK ditutup sampai FTI memperpanjang tanggal. Data siswa tidak dihapus.
              </p>
            )}
          </section>

          <p className="mt-2 shrink-0 border border-primary-pink/20 bg-white/70 px-4 py-2 text-xs text-gray-700">
            <strong>Mode testing:</strong> Semua data masih dummy untuk pengujian frontend. Siswa tidak
            memiliki akses login — input sepenuhnya oleh admin LPK Mitra.
          </p>

          <p className="mt-2 shrink-0 text-center text-[10px] uppercase tracking-[0.3em] text-gray-400 select-none">
            桜 · Sakura · Flora Talent Indonesia
          </p>
        </div>
      </main>
    </LpkMitraShell>
  );
}
