import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PortalPageShell from "@/components/PortalPageShell";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  leading?: ReactNode;
  children: ReactNode;
};

export function CenteredPortal({
  eyebrow,
  title,
  description,
  backHref = "/",
  backLabel = "Kembali",
  leading,
  children,
}: Props) {
  return (
    <PortalPageShell>
      <main className="p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              {leading}
              <div className="min-w-0">
                {eyebrow ? (
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-pink">{eyebrow}</p>
                ) : null}
                <h1 className={`font-serif text-2xl tracking-wide text-gray-900 md:text-3xl ${eyebrow ? "mt-2" : ""}`}>
                  {title}
                </h1>
                {description ? <p className="mt-2 max-w-2xl text-sm text-gray-500">{description}</p> : null}
              </div>
            </div>
            <Link
              href={backHref}
              className="inline-flex shrink-0 items-center gap-2 self-start border border-gray-300 bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-gray-600 hover:border-gray-900 hover:text-gray-900"
            >
              <ArrowLeft size={16} />
              {backLabel}
            </Link>
          </header>
          <div className="space-y-6">{children}</div>
        </div>
      </main>
    </PortalPageShell>
  );
}
