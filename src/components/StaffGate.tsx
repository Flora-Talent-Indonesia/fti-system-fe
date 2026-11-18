"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { staffPortalUnlocked, type StaffPortal } from "@/lib/staff-gate";

export function StaffGate({ path, children }: { path: StaffPortal; children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!staffPortalUnlocked(path)) {
      router.replace(`/login?next=${encodeURIComponent(path)}`);
      return;
    }
    setReady(true);
  }, [path, router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fdf8fa] text-sm text-gray-500">
        Membuka halaman…
      </main>
    );
  }

  return children;
}
