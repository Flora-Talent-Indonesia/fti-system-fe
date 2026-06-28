"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, UserRound, ArrowLeft } from "lucide-react";
import LpkHubCard from "@/components/lpk/LpkHubCard";
import { useLiveClock } from "@/hooks/use-live-clock";
import { formatJapaneseDateTime } from "@/lib/format-japanese-datetime";
import { getDaftarPribadiDisplayName, hasDaftarPribadiCv } from "@/lib/daftar-pribadi-storage";

export default function DaftarPribadiPage() {
  const now = useLiveClock();
  const [userLabel, setUserLabel] = useState("Siswa");
  const [hasCv, setHasCv] = useState(false);

  useEffect(() => {
    setUserLabel(getDaftarPribadiDisplayName());
    setHasCv(hasDaftarPribadiCv());
  }, []);

  return (
    <main className="min-h-screen bg-[#fdf8fa] font-sans text-matte-black p-6 md:p-12 relative overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none fti-pattern" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between pb-8 border-b border-[#e5e7eb]">
          <div className="min-w-0 flex-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-gray hover:text-primary-pink transition-colors mb-6"
            >
              <ArrowLeft size={14} />
              Portal utama
            </Link>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 shrink-0 border border-primary-pink/25 flex items-center justify-center bg-white p-2">
                <Image
                  src="/logo/logo-fti.png"
                  alt="FTI"
                  width={48}
                  height={48}
                  unoptimized
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h1 className="font-[family-name:var(--font-montserrat)] text-2xl md:text-3xl font-bold text-matte-black tracking-wide uppercase">
                  Daftar Pribadi
                </h1>
                <p className="mt-2 text-sm text-text-gray">
                  ようこそ <span className="font-medium text-matte-black">{userLabel}</span>
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-gray">
                Tanggal & waktu (WIB)
              </p>
              <p className="text-sm text-matte-black font-medium">
                {now ? formatJapaneseDateTime(now) : "—"}
              </p>
            </div>
          </div>
        </header>

        {!hasCv ? (
          <div className="mt-8 mb-2 flex items-start gap-3 bg-primary-pink-light border border-primary-pink/25 px-4 py-3 text-sm text-[#be185d]">
            <span className="font-semibold">Belum ada CV:</span>
            <span>
              Lengkapi form CV terlebih dahulu agar profil Anda dapat ditampilkan.
            </span>
          </div>
        ) : null}

        <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-3xl">
          <LpkHubCard
            href="/daftar-pribadi/cv-form"
            icon={FileText}
            title="CV"
            titleJa="履歴書フォーム"
            cta="Isi / Edit CV"
          />
          <LpkHubCard
            href="/daftar-pribadi/profil"
            icon={UserRound}
            title="Profil"
            titleJa="プロフィール"
            cta="Lihat profil"
          />
        </div>
      </div>
    </main>
  );
}
