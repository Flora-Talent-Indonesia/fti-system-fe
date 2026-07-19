"use client";

import Link from "next/link";
import { BookOpen, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { formatJapaneseDateTime } from "@/lib/format-japanese-datetime";
import { useLiveClock } from "@/hooks/use-live-clock";

export default function GuruDashboardPage() {
  const [userLabel, setUserLabel] = useState("");
  const serverNow = useLiveClock();

  useEffect(() => {
    setUserLabel("Sensei");
  }, []);

  const menuItems = [
    {
      href: "/guru-dashboard/progress-belajar",
      label: "Progress Belajar",
      sub: "Input & pantau nilai siswa",
      icon: <BookOpen size={24} strokeWidth={1.5} />,
    },
  ];

  return (
    <main className="min-h-screen bg-[#fdf8fa] font-sans text-[#1a1a1a] p-6 md:p-12 relative overflow-hidden">
      <div
        className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-11.046 8.954-20 20-20v2c-9.941 0-18 8.059-18 18s8.059 18 18 18v2c-11.046 0-20-8.954-20-20zm-20 0c0-11.046 8.954-20 20-20v2C10.059 2 2 10.059 2 20s8.059 18 18 18v2c-11.046 0-20-8.954-20-20z' fill='%23FC809F' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pb-8 border-b border-[#e5e7eb]">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-[#1a1a1a] tracking-wide">
              Sensei Dashboard
            </h1>
            <p className="mt-2 text-sm text-[#6b7280]">
              ようこそ <span className="font-medium text-[#be185d]">{userLabel}</span>
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-3">
            <div className="text-left sm:text-right order-2 sm:order-1">
              <p className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-1">
                Tanggal & waktu (WIB)
              </p>
              <p className="text-sm font-medium text-[#1a1a1a] tabular-nums">
                {serverNow ? formatJapaneseDateTime(serverNow) : "—"}
              </p>
            </div>
            <Link
              href="/"
              className="shrink-0 inline-flex items-center gap-2 self-start rounded-md border border-[#e5e7eb] bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-[#6b7280] hover:bg-red-800 hover:border-red-800 hover:text-white transition-colors order-1 sm:order-2"
            >
              <LogOut size={16} />
              Keluar
            </Link>
          </div>
        </header>

        <div className="mt-10 grid sm:grid-cols-1 max-w-md gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group block relative bg-white p-10 md:p-12 border border-[#e5e7eb] hover:border-[#fc809f]/50 transition-colors duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#fc809f]/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out z-0" />
              <div className="relative z-10">
                <div className="w-12 h-12 border border-[#fc809f]/30 flex items-center justify-center mb-6 text-[#fc809f] bg-white group-hover:bg-[#fc809f] group-hover:text-white transition-colors duration-500">
                  {item.icon}
                </div>
                <h2 className="text-xl font-serif text-[#1a1a1a] mb-2">{item.label}</h2>
                <p className="text-xs text-[#6b7280]">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
