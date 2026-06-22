"use client";

import { useEffect } from "react";
import { setActivePortal } from "@/lib/portal-session";

export default function FtiLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setActivePortal("fti");
  }, []);

  return children;
}
