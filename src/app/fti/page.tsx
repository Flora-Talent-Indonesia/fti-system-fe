import { Briefcase, ClipboardList, GraduationCap, UserPlus, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PortalPageShell from "@/components/PortalPageShell";
import PortalHubHeader from "@/components/PortalHubHeader";
import type { PortalSettingsItem } from "@/components/PortalHubHeader";
import LpkHubCard from "@/components/lpk/LpkHubCard";

const FTI_DISPLAY_NAME = "Admin FTI";

const settingsItems: PortalSettingsItem[] = [
  {
    href: "/fti/student-account-management",
    label: "Student Account Management",
    labelJa: "学生アカウント管理",
  },
  {
    href: "/fti/change-password",
    label: "Change Password",
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
    href: "/fti/lpk-mitra",
    icon: Users,
    title: "Daftar LPK Mitra",
    titleJa: "LPKミトラ一覧",
    cta: "Lihat Daftar",
  },
  {
    href: "/fti/job-assignment",
    icon: Briefcase,
    title: "Job Assignment",
    titleJa: "ジョブ割り当て",
    cta: "Kelola Job",
  },
  {
    href: "/fti/create-lpk-mitra",
    icon: UserPlus,
    title: "Buat Akun LPK Mitra",
    titleJa: "LPKミトラアカウント作成",
    cta: "Kelola Akun",
  },
  {
    href: "/fti/data-siswa-fti",
    icon: ClipboardList,
    title: "Data Siswa FTI",
    titleJa: "FTI学生データ",
    cta: "Lihat Profil",
  },
  {
    href: "/fti/data-alumni",
    icon: GraduationCap,
    title: "Data Alumni",
    titleJa: "卒業生データ",
    cta: "Lihat Data",
  },
  {
    href: "/fti/add-account",
    icon: UserPlus,
    title: "Buat Akun Siswa",
    titleJa: "学生アカウント作成",
    cta: "Tambah Akun",
  },
];

export default function FtiHubPage() {
  return (
    <PortalPageShell className="h-dvh max-h-dvh min-h-0 overflow-hidden">
      <main className="flex h-dvh min-h-0 flex-col overflow-hidden px-4 pb-3 pt-8 sm:px-6 md:px-8 md:pb-4 md:pt-10">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col">
          <PortalHubHeader
            title="Portal FTI"
            titleJa="フローラ・タレント・ポータル"
            welcomeName={FTI_DISPLAY_NAME}
            badge="Flora Talent Indonesia"
            settingsItems={settingsItems}
          />

          <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:grid-rows-2 md:gap-8">
            {menu.map((item) => (
              <LpkHubCard
                key={item.href}
                compact
                className="h-full min-h-0"
                href={item.href}
                icon={item.icon}
                title={item.title}
                titleJa={item.titleJa}
                cta={item.cta}
              />
            ))}
          </div>

          <p className="mt-2 shrink-0 text-center text-[10px] uppercase tracking-[0.3em] text-gray-400 select-none">
            桜 · Sakura · Flora Talent Indonesia
          </p>
        </div>
      </main>
    </PortalPageShell>
  );
}
