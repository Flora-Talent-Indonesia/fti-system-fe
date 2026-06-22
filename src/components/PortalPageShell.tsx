import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { PortalPageBackground } from "./PortalPageBackground";

type Props = {
  children: ReactNode;
  className?: string;
  sakura?: boolean;
};

export default function PortalPageShell({ children, className, sakura = true }: Props) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[#fdf8fa] font-sans text-gray-800 relative overflow-hidden",
        className
      )}
    >
      <PortalPageBackground sakura={sakura} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
