import { Suspense } from "react";
import { BuatDokumenEditor } from "./editor";

export default function BuatDokumenPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#fdf8fa] text-sm text-gray-500">
          Membuka dokumen…
        </main>
      }
    >
      <BuatDokumenEditor />
    </Suspense>
  );
}
