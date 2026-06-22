import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PortalPageShell from "@/components/PortalPageShell";

type Props = {
  children: React.ReactNode;
};

/** Shell halaman dalam portal YS (bukan hub). */
export default function YsPortalShell({ children }: Props) {
  return <PortalPageShell sakura>{children}</PortalPageShell>;
}

type YsPageHeaderProps = {
  titleJa: string;
  titleEn: string;
  subtitleJa?: string;
  subtitleEn?: string;
  backHref?: string;
};

export function YsPageHeader({
  titleJa,
  titleEn,
  subtitleJa,
  subtitleEn,
  backHref = "/ys",
}: YsPageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Link
          href={backHref}
          className="p-3 bg-transparent hover:bg-gray-200/50 transition-colors border border-gray-300 text-gray-500 hover:text-gray-900 rounded-lg shrink-0"
          title="戻る / Back"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-gray-900 tracking-wide">{titleJa}</h1>
          <p className="text-xs font-medium text-gray-500 tracking-widest uppercase mt-1">{titleEn}</p>
          {subtitleJa && (
            <p className="mt-2 text-sm text-gray-700 leading-relaxed max-w-2xl">{subtitleJa}</p>
          )}
          {subtitleEn && (
            <p className="mt-1 text-sm text-gray-500 leading-relaxed max-w-2xl">{subtitleEn}</p>
          )}
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-pink border border-primary-pink/30 bg-primary-pink-light px-2.5 py-1 self-start">
        日本のパートナー · Japan Partner
      </span>
    </header>
  );
}
