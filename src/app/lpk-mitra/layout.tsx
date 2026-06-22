"use client";

import { useEffect } from "react";
import { setActivePortal } from "@/lib/portal-session";

export default function LpkMitraLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setActivePortal("lpk");
  }, []);

  return children;
}
