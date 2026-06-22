import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";

type PortalShellProps = {
  portal: "LPK MITRA" | "FTI" | "YS";
  locale?: string;
  children: React.ReactNode;
};

const PORTAL_META = {
  "LPK MITRA": { href: "/lpk-mitra", lang: "Bahasa Indonesia" },
  FTI: { href: "/fti", lang: "Indonesia + 日本語" },
  YS: { href: "/ys", lang: "日本語 + English" },
} as const;

export function PortalShell({ portal, locale, children }: PortalShellProps) {
  const meta = PORTAL_META[portal];

  return (
    <div className="min-h-screen bg-[#fdf8fa]">
      <header className="bg-white border-b border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-gray hover:text-primary-pink transition-colors"
            >
              <ArrowLeft size={16} />
              Portal
            </Link>
            <span className="hidden sm:block text-[#e5e7eb]">|</span>
            <Link
              href={meta.href}
              className="font-[family-name:var(--font-montserrat)] text-sm font-bold text-matte-black uppercase tracking-wide hover:text-primary-pink transition-colors"
            >
              {portal}
            </Link>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-text-gray border border-[#e5e7eb] px-3 py-1">
            {locale ?? meta.lang}
          </span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  titleJa?: string;
  titleEn?: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, subtitle, titleJa, titleEn, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 className="font-[family-name:var(--font-montserrat)] text-2xl font-bold text-matte-black uppercase tracking-wide">
          {title}
        </h1>
        {titleJa && (
          <p className="mt-1 text-sm text-text-gray tracking-wide">{titleJa}</p>
        )}
        {titleEn && (
          <p className="mt-1 text-sm text-text-gray tracking-wide">{titleEn}</p>
        )}
        {subtitle && <p className="mt-2 text-sm text-text-gray max-w-2xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

type HubCardProps = {
  href: string;
  title: string;
  description: string;
  titleJa?: string;
  titleEn?: string;
};

export function HubCard({ href, title, description, titleJa, titleEn }: HubCardProps) {
  return (
    <Link
      href={href}
      className="block bg-white border border-[#e5e7eb] p-6 hover:border-primary-pink transition-colors group"
    >
      <h2 className="font-[family-name:var(--font-montserrat)] text-base font-bold text-matte-black uppercase tracking-wide group-hover:text-primary-pink transition-colors">
        {title}
      </h2>
      {titleJa && <p className="mt-1 text-xs text-text-gray">{titleJa}</p>}
      {titleEn && <p className="mt-1 text-xs text-text-gray">{titleEn}</p>}
      <p className="mt-3 text-sm text-text-gray leading-relaxed">{description}</p>
    </Link>
  );
}

type StatusBadgeProps = {
  status: "aktif" | "match_job" | "rekrut";
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const map = {
    aktif: { label: "Aktif", className: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]" },
    match_job: { label: "Match Job", className: "bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]" },
    rekrut: { label: "Rekrut", className: "bg-[#fff5f8] text-[#be185d] border-[#fbcfe8]" },
  };
  const item = map[status];

  return (
    <span
      className={cn(
        "inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 border",
        item.className
      )}
    >
      {item.label}
    </span>
  );
}
