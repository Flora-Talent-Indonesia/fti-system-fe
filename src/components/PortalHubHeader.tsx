"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { useLiveClock } from "@/hooks/use-live-clock";
import { formatJapaneseDateTime } from "@/lib/format-japanese-datetime";

export type PortalSettingsItem = {
  href: string;
  label: string;
  labelJa?: string;
};

type PortalHubHeaderProps = {
  title: string;
  titleJa: string;
  welcomeName: string;
  badge: string;
  welcomePrefix?: string;
  dateLabel?: string;
  backHref?: string;
  backLabel?: string;
  logoutHref?: string;
  logoutLabel?: string;
  settingsItems?: PortalSettingsItem[];
};

export default function PortalHubHeader({
  title,
  titleJa,
  welcomeName,
  badge,
  welcomePrefix = "Selamat datang,",
  dateLabel = "日時 / WIB",
  backHref = "/",
  backLabel = "Kembali ke portal Flora Talent Indonesia",
  logoutHref = "/",
  logoutLabel = "Keluar",
  settingsItems = [],
}: PortalHubHeaderProps) {
  const now = useLiveClock();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const hasSettingsMenu = settingsItems.length > 0;

  useEffect(() => {
    if (!settingsOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) setSettingsOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [settingsOpen]);

  return (
    <header className="relative z-20 flex shrink-0 items-start justify-between gap-4 border-b border-gray-200/80 pb-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          {hasSettingsMenu ? (
            <div className="relative" ref={settingsRef}>
              <button
                type="button"
                aria-expanded={settingsOpen}
                aria-haspopup="menu"
                aria-label="Pengaturan"
                title="Pengaturan"
                onClick={() => setSettingsOpen((open) => !open)}
                className="shrink-0 rounded-md border border-gray-200 bg-white p-1.5 text-gray-700 transition-colors hover:border-primary-pink/40 hover:bg-primary-pink-light"
              >
                <Settings size={18} strokeWidth={1.5} />
              </button>
              {settingsOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-30 mt-2 w-72 border border-gray-200 bg-white py-1 shadow-md"
                >
                  {settingsItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setSettingsOpen(false)}
                      className="block px-4 py-2.5 transition-colors hover:bg-primary-pink-light"
                    >
                      <span className="block text-sm text-gray-900">{item.label}</span>
                      {item.labelJa && (
                        <span className="mt-0.5 block text-[10px] uppercase tracking-widest text-gray-500">
                          {item.labelJa}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              href={backHref}
              className="shrink-0 rounded-md border border-gray-200 bg-white p-1.5 text-gray-700 transition-colors hover:border-primary-pink/40 hover:bg-primary-pink-light"
              title="Kembali ke portal"
              aria-label={backLabel}
            >
              <Settings size={18} strokeWidth={1.5} />
            </Link>
          )}
          <Image
            src="/logo/logo-fti.png"
            alt="Flora Talent Indonesia"
            width={120}
            height={48}
            className="h-7 w-auto object-contain"
            unoptimized
          />
          <span className="hidden border border-primary-pink/30 bg-primary-pink-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-pink sm:inline">
            {badge}
          </span>
        </div>
        <div className="mt-2 flex flex-col gap-2.5">
          <h1 className="font-serif text-xl leading-none tracking-wide text-gray-900 md:text-2xl">
            {title}
          </h1>
          <p className="text-[10px] font-medium uppercase leading-none tracking-[0.22em] text-gray-500">
            {titleJa}
          </p>
          <p className="text-sm leading-none text-gray-800">
            {welcomePrefix}{" "}
            <span className="font-semibold text-[#be185d]">{welcomeName}</span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <Link
          href={logoutHref}
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-600 transition-colors hover:border-red-800 hover:bg-red-800 hover:text-white"
        >
          <LogOut size={15} />
          {logoutLabel}
        </Link>
        <div className="text-right">
          <p className="text-[10px] font-semibold tracking-wide text-gray-500">
            Servertime
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
            {dateLabel}
          </p>
          <p className="font-[family-name:var(--font-inter)] text-xs font-medium leading-snug text-gray-900 md:text-sm">
            {now ? formatJapaneseDateTime(now) : "—"}
          </p>
        </div>
      </div>
    </header>
  );
}
