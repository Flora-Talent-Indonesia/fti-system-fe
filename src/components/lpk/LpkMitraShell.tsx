"use client";

import type { ReactNode } from "react";
import PortalPageShell from "@/components/PortalPageShell";

type Props = {
  children: ReactNode;
  className?: string;
  fill?: boolean;
};

export { PortalPageBackground as LpkMitraBackground } from "@/components/PortalPageBackground";

export default function LpkMitraShell({ children, className, fill }: Props) {
  return (
    <PortalPageShell className={className} fill={fill}>
      {children}
    </PortalPageShell>
  );
}
