"use client";

import { clearActivePortal, getActivePortal } from "@/lib/portal-session";

export default function DokumenLayout({ children }: { children: React.ReactNode }) {
  if (typeof window !== "undefined" && getActivePortal() === "fti") {
    clearActivePortal();
  }

  return children;
}
