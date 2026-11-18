import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { PortalPageBackground } from "./PortalPageBackground";

type Props = {
  children: ReactNode;
  className?: string;
  sakura?: boolean;
  /** Tinggi pas satu layar; isi yang lebih panjang di-scroll di dalam halaman. */
  fill?: boolean;
};

export default function PortalPageShell({ children, className, sakura = true, fill = false }: Props) {
  return (
    <div
      className={cn(
        "bg-[#fdf8fa] font-sans text-gray-800 relative overflow-hidden",
        fill ? "h-dvh max-h-dvh" : "min-h-screen",
        className
      )}
    >
      <PortalPageBackground sakura={sakura} />
      <div className={cn("relative z-10", fill && "h-full min-h-0")}>{children}</div>
    </div>
  );
}
