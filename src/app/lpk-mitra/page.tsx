"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, Settings, Users } from "lucide-react";
import LpkMitraShell from "@/components/lpk/LpkMitraShell";
import LpkHubCard from "@/components/lpk/LpkHubCard";
import { useLiveClock } from "@/hooks/use-live-clock";
import { formatJapaneseDateTime } from "@/lib/format-japanese-datetime";

/** Nama LPK untuk demo FE — nanti dari auth / profil login. */
const LPK_DISPLAY_NAME = "LPK Mitra Sukabumi";

export default function LpkMitraHubPage() {
  const now = useLiveClock();

  return (
    <LpkMitraShell>
      <main className="p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4 pb-8 border-b border-gray-200/80">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-3">
                <Link
                  href="/"
                  className="shrink-0 rounded-md border border-gray-200 bg-white p-2 text-gray-700 hover:bg-primary-pink-light hover:border-primary-pink/40 transition-colors mt-1"
                  title="Kembali ke portal"
                  aria-label="Kembali ke portal Flora Talent Indonesia"
                >
                  <Settings size={20} strokeWidth={1.5} />
                </Link>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <Image
                      src="/logo/logo-fti.png"
                      alt="Flora Talent Indonesia"
                      width={120}
                      height={48}
                      className="h-8 w-auto object-contain"
                      unoptimized
                    />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-pink border border-primary-pink/30 bg-primary-pink-light px-2.5 py-1">
                      Flora Talent Indonesia
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-serif text-gray-900 tracking-wide">
                    LPK Mitra Dashboard
                  </h1>
                  <p className="mt-1 text-xs tracking-[0.25em] text-gray-500 uppercase font-medium">
                    パートナーLPKポータル
                  </p>
                  <p className="mt-3 text-sm text-gray-800 leading-relaxed">
                    Selamat datang,{" "}
                    <span className="font-semibold text-[#be185d]">{LPK_DISPLAY_NAME}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-1 pl-0 sm:pl-11">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  日時 / Tanggal &amp; waktu (WIB)
                </p>
                <p className="text-base text-gray-900 leading-relaxed font-medium font-[family-name:var(--font-inter)]">
                  {now ? formatJapaneseDateTime(now) : "—"}
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="shrink-0 inline-flex items-center gap-2 self-start rounded-md border border-gray-200 bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-gray-600 hover:bg-red-800 hover:border-red-800 hover:text-white transition-colors"
            >
              <LogOut size={16} />
              Keluar
            </Link>
          </header>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <LpkHubCard
              href="/lpk-mitra/siswa"
              icon={Users}
              title="Kelola Siswa"
              titleJa="実習生管理"
              cta="Kelola Siswa"
            />
          </div>

          <div className="mt-10 border border-primary-pink/20 bg-white/70 backdrop-blur-sm px-5 py-4 text-sm text-gray-700 shadow-sm">
            <strong>Mode testing:</strong> Semua data masih dummy untuk pengujian frontend. Siswa
            tidak memiliki akses login — input sepenuhnya oleh admin LPK Mitra.
          </div>

          <p className="mt-8 text-center text-[10px] tracking-[0.3em] uppercase text-gray-400 select-none">
            桜 · Sakura · Flora Talent Indonesia
          </p>
        </div>
      </main>
    </LpkMitraShell>
  );
}
