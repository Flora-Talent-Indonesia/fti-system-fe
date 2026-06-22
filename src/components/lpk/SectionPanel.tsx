import type { ReactNode } from "react";

export default function SectionPanel({
  title,
  children,
  extraHeader,
}: {
  title: string;
  children: ReactNode;
  extraHeader?: ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{title}</h3>
        {extraHeader}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
