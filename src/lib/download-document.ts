"use client";

/** Unduh file dummy (mode FE testing) — nama file sesuai metadata siswa. */
export function downloadDemoDocument(filename: string, studentName?: string) {
  const safeName = filename.trim() || "dokumen.pdf";
  const body = [
    "Flora Talent Indonesia — dokumen demo (mode testing)",
    studentName ? `Peserta: ${studentName}` : "",
    `File: ${safeName}`,
    "",
    "Konten asli akan tersedia setelah integrasi backend / storage.",
  ]
    .filter(Boolean)
    .join("\n");

  const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeName.includes(".") ? safeName : `${safeName}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
