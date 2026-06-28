"use client";

import Image from "next/image";
import Link from "next/link";
import { Briefcase, GraduationCap, LogOut, Settings, UserPlus, Users, UserCog, ClipboardList } from "lucide-react";
import PortalPageShell from "@/components/PortalPageShell";
import LpkHubCard from "@/components/lpk/LpkHubCard";
import { useLiveClock } from "@/hooks/use-live-clock";
import { formatJapaneseDateTime } from "@/lib/format-japanese-datetime";

const FTI_DISPLAY_NAME = "Admin FTI";

export default function FtiHubPage() {
  const now = useLiveClock();

  return (
    <PortalPageShell>
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
                    Portal FTI
                  </h1>
                  <p className="mt-1 text-xs tracking-[0.25em] text-gray-500 uppercase font-medium">
                    フローラ・タレント・ポータル
                  </p>
                  <p className="mt-3 text-sm text-gray-800 leading-relaxed">
                    Selamat datang,{" "}
                    <span className="font-semibold text-[#be185d]">{FTI_DISPLAY_NAME}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-1 pl-0 sm:pl-11">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  日時 / Tanggal &amp; waktu (WIB)
                </p>
                <p className="text-base text-gray-900 leading-relaxed font-medium">
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
              href="/fti/lpk-mitra"
              icon={Users}
              title="Daftar LPK Mitra"
              titleJa="LPKミトラ一覧"
              cta="Lihat Daftar"
            />
            <LpkHubCard
              href="/fti/job-assignment"
              icon={Briefcase}
              title="Job Assignment"
              titleJa="ジョブ割り当て"
              cta="Kelola Job"
            />
            <LpkHubCard
              href="/fti/create-lpk-mitra"
              icon={UserPlus}
              title="Buat Akun LPK Mitra"
              titleJa="LPKミトラアカウント作成"
              cta="Kelola Akun"
            />
            <LpkHubCard
              href="/fti/data-siswa-fti"
              icon={ClipboardList}
              title="Data Siswa FTI"
              titleJa="FTI学生データ"
              cta="Lihat Profil"
            />
            <LpkHubCard
              href="/fti/data-alumni"
              icon={GraduationCap}
              title="Data Alumni"
              titleJa="卒業生データ"
              cta="Lihat Data"
            />
            <LpkHubCard
              href="/fti/add-account"
              icon={UserPlus}
              title="Buat Akun Siswa"
              titleJa="学生アカウント作成"
              cta="Tambah Akun"
            />
            <LpkHubCard
              href="/fti/student-account-management"
              icon={UserCog}
              title="Student Account Management"
              titleJa="学生アカウント管理"
              cta="Kelola Akun"
            />
          </div>

          <p className="mt-10 text-center text-[10px] tracking-[0.3em] uppercase text-gray-400 select-none">
            桜 · Sakura · Flora Talent Indonesia
          </p>
        </div>
      </main>
    </PortalPageShell>
  );
}
