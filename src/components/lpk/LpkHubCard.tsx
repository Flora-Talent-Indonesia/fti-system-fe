import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type Props = {
  href: string;
  icon: LucideIcon;
  title: string;
  titleJa?: string;
  cta: string;
};

export default function LpkHubCard({ href, icon: Icon, title, titleJa, cta }: Props) {
  return (
    <Link
      href={href}
      className="group block relative bg-white p-10 md:p-14 border border-gray-200/60 hover:border-primary-pink/40 transition-colors duration-700 ease-out overflow-hidden shadow-sm hover:shadow-md"
    >
      <div className="absolute inset-0 bg-primary-pink-light/40 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-0" />
      <div className="relative z-10">
        <div className="w-14 h-14 border border-primary-pink/25 flex items-center justify-center mb-8 text-primary-pink bg-white group-hover:bg-primary-pink group-hover:text-white transition-colors duration-500 ease-out">
          <Icon size={24} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-serif text-gray-900 mb-1 tracking-wide group-hover:text-[#be185d] transition-colors duration-500">
          {title}
        </h2>
        {titleJa && (
          <p className="text-xs text-gray-500 tracking-widest mb-6 font-medium">{titleJa}</p>
        )}
        {!titleJa && <div className="mb-6" />}
        <div className="flex items-center text-xs tracking-widest uppercase text-primary-pink font-semibold">
          <span className="relative">
            {cta}
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary-pink group-hover:w-full transition-all duration-500 ease-out" />
          </span>
          <svg
            className="w-4 h-4 ml-3 transform group-hover:translate-x-2 transition-transform duration-500 ease-out"
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
