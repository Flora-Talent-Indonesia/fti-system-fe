import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  href: string;
  icon: LucideIcon;
  title: string;
  titleJa?: string;
  cta: string;
  /** Kartu lebih rapat, untuk dashboard yang harus muat satu layar. */
  compact?: boolean;
  className?: string;
};

export default function LpkHubCard({ href, icon: Icon, title, titleJa, cta, compact = false, className }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden border border-gray-200/60 bg-white shadow-sm transition-colors duration-700 ease-out hover:border-primary-pink/40 hover:shadow-md",
        compact ? "p-5 md:p-6" : "p-10 md:p-14",
        className
      )}
    >
      <div className="absolute inset-0 z-0 -translate-x-full transform bg-primary-pink-light/40 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-0" />
      <div className={cn("relative z-10", compact && "flex h-full flex-col")}>
        <div
          className={cn(
            "flex items-center justify-center border border-primary-pink/25 bg-white text-primary-pink transition-colors duration-500 ease-out group-hover:bg-primary-pink group-hover:text-white",
            compact ? "mb-4 h-11 w-11" : "mb-8 h-14 w-14"
          )}
        >
          <Icon size={compact ? 20 : 24} strokeWidth={1.5} />
        </div>
        <h2
          className={cn(
            "mb-1 font-serif tracking-wide text-gray-900 transition-colors duration-500 group-hover:text-[#be185d]",
            compact ? "text-xl" : "text-2xl"
          )}
        >
          {title}
        </h2>
        {titleJa && (
          <p className={cn("text-xs font-medium tracking-widest text-gray-500", compact ? "mb-4" : "mb-6")}>
            {titleJa}
          </p>
        )}
        {!titleJa && <div className={compact ? "mb-4" : "mb-6"} />}
        <div className={cn("flex items-center text-xs font-semibold uppercase tracking-widest text-primary-pink", compact && "mt-auto pt-2")}>
          <span className="relative">
            {cta}
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary-pink transition-all duration-500 ease-out group-hover:w-full" />
          </span>
          <svg
            className="ml-3 h-4 w-4 transform transition-transform duration-500 ease-out group-hover:translate-x-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
