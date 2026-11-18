import { Eye, FilePlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PortalPageShell from "@/components/PortalPageShell";
import PortalHubHeader from "@/components/PortalHubHeader";
import type { PortalSettingsItem } from "@/components/PortalHubHeader";
import LpkHubCard from "@/components/lpk/LpkHubCard";

const settingsItems: PortalSettingsItem[] = [
  {
    href: "/dokumen/ganti-password",
    label: "Ganti Password",
    labelJa: "パスワード変更",
  },
];

const menu: {
  href: string;
  icon: LucideIcon;
  title: string;
  titleJa: string;
  cta: string;
}[] = [
  {
    href: "/dokumen/data",
    icon: Eye,
    title: "Lihat Data",
    titleJa: "データ一覧",
    cta: "Lihat Data",
  },
  {
    href: "/dokumen/buat",
    icon: FilePlus,
    title: "Buat Dokumen",
    titleJa: "書類作成",
    cta: "Buat Dokumen",
  },
];

export default function DokumenHubPage() {
  return (
    <PortalPageShell className="h-dvh max-h-dvh min-h-0 overflow-hidden">
      <main className="flex h-dvh min-h-0 flex-col overflow-hidden px-4 pb-3 pt-8 sm:px-6 md:px-8 md:pb-4 md:pt-10">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col">
          <PortalHubHeader
            title="Portal Dokumen"
            titleJa="書類ポータル"
            welcomeName="Staff Dokumen"
            badge="Flora Talent Indonesia"
            settingsItems={settingsItems}
          />

          <div className="mt-3 flex min-h-0 flex-1 items-center">
            <div className="grid h-full max-h-[26rem] w-full min-h-0 grid-cols-1 gap-3 sm:grid-cols-2">
              {menu.map((item) => (
                <LpkHubCard
                  key={item.href}
                  compact
                  className="h-full"
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  titleJa={item.titleJa}
                  cta={item.cta}
                />
              ))}
            </div>
          </div>

          <p className="mt-2 shrink-0 text-center text-[10px] uppercase tracking-[0.3em] text-gray-400 select-none">
            桜 · Sakura · Flora Talent Indonesia
          </p>
        </div>
      </main>
    </PortalPageShell>
  );
}
