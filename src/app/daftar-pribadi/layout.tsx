"use client";

import { useEffect } from "react";
import { setActivePortal } from "@/lib/portal-session";

export default function DaftarPribadiLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setActivePortal("fti");
  }, []);

  return children;
}
