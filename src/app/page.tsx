import Image from "next/image";
import Link from "next/link";

const PORTAL_ITEMS = [
  { label: "LPK MITRA", href: "/lpk-mitra" },
  { label: "FTI", href: "/fti" },
  { label: "YS", href: "/ys" },
  { label: "Daftar Siswa", href: "/daftar-pribadi" },
  { label: "Guru", href: "/guru-dashboard" },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fdf8fa] flex items-center justify-center p-6 relative overflow-hidden font-sans text-matte-black">
      <div
        className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-11.046 8.954-20 20-20v2c-9.941 0-18 8.059-18 18s8.059 18 18 18v2c-11.046 0-20-8.954-20-20zm-20 0c0-11.046 8.954-20 20-20v2C10.059 2 2 10.059 2 20s8.059 18 18 18v2c-11.046 0-20-8.954-20-20z' fill='%23FC809F' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-lg bg-white p-8 sm:p-10 md:p-12 lg:p-16 border border-[#e5e7eb] flex flex-col items-center">
        <div className="w-56 sm:w-64 md:w-72 mb-6 md:mb-8">
          <Image
            src="/logo/logo-fti.png"
            alt="Flora Talent Indonesia"
            width={288}
            height={156}
            priority
            unoptimized
            className="w-full h-auto object-contain"
          />
        </div>

        <h2 className="text-[9px] md:text-[10px] font-semibold text-text-gray tracking-[0.25em] md:tracking-[0.3em] uppercase mb-6 md:mb-8 text-center">
          System Administration
        </h2>

        <div className="flex items-center w-full max-w-[200px] md:max-w-xs mb-6 md:mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#fc809f]/40 to-transparent" />
        </div>

        <div className="flex flex-col items-center gap-1.5 md:gap-2 mb-8 md:mb-12">
          <p className="font-[family-name:var(--font-montserrat)] text-base md:text-lg font-bold text-matte-black tracking-[0.2em] md:tracking-[0.25em] text-center uppercase">
            Flora Talent Indonesia
          </p>
        </div>

        <div className="w-full space-y-4">
          {PORTAL_ITEMS.map(({ label, href }) => (
            <Link key={label} href={href} className="portal-btn block text-center">
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
