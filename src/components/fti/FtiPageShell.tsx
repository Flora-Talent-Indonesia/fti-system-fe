import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import PortalPageShell from "@/components/PortalPageShell";

type FtiPageShellProps = {
  title: string;
  titleJa?: string;
  subtitle: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  stats?: { label: string; value: string | number }[];
};

export function FtiPageShell({
  title,
  titleJa,
  subtitle,
  backHref = "/fti",
  backLabel = "Kembali ke FTI",
  children,
  stats,
}: FtiPageShellProps) {
  return (
    <PortalPageShell>
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <Link
                href={backHref}
                className="p-3 bg-white hover:bg-primary-pink-light transition-colors border border-[#e5e7eb] text-text-gray hover:text-matte-black hover:border-primary-pink/40 shrink-0"
                title={backLabel}
              >
                <ArrowLeft size={20} strokeWidth={1.5} />
              </Link>
              <div>
                <h1 className="font-[family-name:var(--font-montserrat)] text-2xl md:text-3xl font-bold text-matte-black tracking-wide">
                  {title}
                </h1>
                {titleJa && (
                  <p className="text-sm text-text-gray mt-1 tracking-wide">{titleJa}</p>
                )}
                <p className="text-xs font-medium text-text-gray tracking-widest uppercase mt-2">
                  {subtitle}
                </p>
              </div>
            </div>

            <Link
              href="/fti"
              className="text-[10px] font-bold uppercase tracking-widest text-text-gray border border-[#e5e7eb] bg-white px-3 py-1.5 hover:border-primary-pink hover:text-primary-pink transition-colors self-start md:self-center"
            >
              FTI Portal
            </Link>
          </header>

          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="fti-panel px-5 py-4 bg-white"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-gray">
                    {stat.label}
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-montserrat)] text-2xl font-bold text-matte-black">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {children}
        </div>
      </div>
    </PortalPageShell>
  );
}

type FtiPanelProps = {
  title?: string;
  titleJa?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function FtiPanel({ title, titleJa, toolbar, children, className }: FtiPanelProps) {
  return (
    <div className={cn("fti-panel", className)}>
      {(title || toolbar) && (
        <div className="fti-panel-toolbar px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {title && (
            <div>
              <h2 className="font-[family-name:var(--font-montserrat)] text-sm font-bold text-matte-black uppercase tracking-wide">
                {title}
              </h2>
              {titleJa && <p className="text-xs text-text-gray mt-0.5">{titleJa}</p>}
            </div>
          )}
          {toolbar}
        </div>
      )}
      {children}
    </div>
  );
}

type FtiEmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export function FtiEmptyState({ icon, title, description }: FtiEmptyStateProps) {
  return (
    <div className="py-16 px-6 text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-primary-pink mb-4 border border-primary-pink/20 bg-primary-pink-light">
        {icon}
      </div>
      <h3 className="font-[family-name:var(--font-montserrat)] text-base font-bold text-matte-black mb-1">
        {title}
      </h3>
      <p className="text-sm text-text-gray max-w-sm">{description}</p>
    </div>
  );
}

export function FtiBadge({
  children,
  variant = "pink",
}: {
  children: React.ReactNode;
  variant?: "pink" | "gray" | "green";
}) {
  const styles = {
    pink: "bg-primary-pink-light text-[#be185d] border-primary-pink/30",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border",
        styles[variant]
      )}
    >
      {children}
    </span>
  );
}
