"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  activeSessionAccount,
  clearPortalSession,
  portalLabel,
  portalPathFor,
  seedPortalAccounts,
  setPortalSession,
  type PortalAccessId,
  type PortalAccount,
} from "@/lib/portal-accounts";

export function PortalAccessGate({ access, children }: { access: PortalAccessId; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [account, setAccount] = useState<PortalAccount | null>(null);
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");
  const [trackedAccess, setTrackedAccess] = useState(access);

  if (trackedAccess !== access) {
    setTrackedAccess(access);
    setState("checking");
  }

  useEffect(() => {
    seedPortalAccounts();
    const current = activeSessionAccount();
    if (!current) {
      clearPortalSession();
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setPortalSession(current);
    setAccount(current);
    setState(current.access.includes(access) ? "ok" : "denied");
  }, [access, pathname, router]);

  if (state === "ok" && account?.access.includes(access)) return children;

  if (state === "denied" && account) {
    const others = account.access.filter((item) => item !== access);
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fdf8fa] p-6 font-sans text-matte-black">
        <div className="w-full max-w-md border border-[#e5e7eb] bg-white px-8 py-10 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-text-gray">Akses ditolak</p>
          <h1 className="mt-3 font-serif text-2xl text-gray-900">{portalLabel(access)}</h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            Akun <span className="font-semibold text-[#be185d]">{account.displayName}</span> tidak punya akses ke{" "}
            {portalLabel(access)}.
          </p>
          {others.length > 0 ? (
            <div className="mt-6 space-y-2 text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Portal yang bisa dibuka</p>
              {others.map((item) => (
                <Link key={item} href={portalPathFor(item)} className="portal-btn block text-center">
                  <span>{portalLabel(item)}</span>
                </Link>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            className="btn-primary mt-6 w-full"
            onClick={() => {
              clearPortalSession();
              router.replace("/");
            }}
          >
            Keluar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fdf8fa] text-sm text-gray-500">
      Membuka halaman…
    </main>
  );
}
