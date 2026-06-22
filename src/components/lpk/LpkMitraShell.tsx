"use client";

import type { ReactNode } from "react";
import PortalPageShell from "@/components/PortalPageShell";

type Props = {
  children: ReactNode;
  className?: string;
};

export { PortalPageBackground as LpkMitraBackground } from "@/components/PortalPageBackground";

export default function LpkMitraShell({ children, className }: Props) {
  return <PortalPageShell className={className}>{children}</PortalPageShell>;
}
