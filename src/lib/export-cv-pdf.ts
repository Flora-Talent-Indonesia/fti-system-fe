"use client";

async function embedImagesAsDataUrl(root: HTMLElement) {
  const images = root.querySelectorAll<HTMLImageElement>("img");
  await Promise.all(
    Array.from(images).map(async (img) => {
      const src = img.src;
      if (!src || src.startsWith("data:")) return;
      try {
        const resp = await fetch(src);
        const blob = await resp.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        img.src = dataUrl;
      } catch {
        /* keep original src */
      }
    })
  );
}

function buildPrintHtml(bodyContent: string, title: string) {
  const safeTitle = title.replace(/\.pdf$/i, "");
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>${safeTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 0; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 210mm; margin: 0; padding: 0; background: #fff;
      font-family: "Noto Sans JP", "Meiryo", "MS Gothic", sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .cv-print-page {
      width: 210mm; min-height: 297mm; margin: 0 auto; padding: 28px 24px;
      page-break-after: always; break-after: page;
    }
    .cv-print-page.cv-print-sheet { padding: 0; }
    .cv-print-page:last-child { page-break-after: auto; break-after: auto; }
    [data-cv-sheet] {
      width: 210mm !important;
      height: 297mm !important;
      min-height: 297mm !important;
      max-height: 297mm !important;
      overflow: hidden !important;
      break-inside: avoid;
      page-break-inside: avoid;
      font-weight: 400;
      font-synthesis: none;
      text-rendering: geometricPrecision;
    }
    [data-cv-sheet] table {
      border-collapse: separate !important;
      border-spacing: 0 !important;
      width: 100% !important;
    }
    [data-cv-sheet] td {
      font-weight: 400 !important;
      font-size: 11px !important;
      line-height: 1.35 !important;
      background-clip: padding-box;
    }
    @media print {
      html, body { width: 210mm; }
      .cv-print-page {
        width: 210mm !important; min-height: 297mm !important;
        margin: 0 !important; padding: 28px 24px !important;
      }
      .cv-print-page.cv-print-sheet { padding: 0 !important; }
    }
    @media screen {
      body { display: flex; flex-direction: column; align-items: center; background: #e5e7eb; padding: 20px 0; }
      .cv-print-page { background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,0.15); margin-bottom: 20px; }
    }
  </style>
</head>
<body>${bodyContent}</body>
</html>`;
}

function openPrintWindow(blobUrl: string) {
  const printWindow = window.open(blobUrl, "_blank");
  if (!printWindow) {
    alert("Popup diblokir browser. Izinkan popup lalu coba lagi.");
    URL.revokeObjectURL(blobUrl);
    return;
  }
  printWindow.addEventListener("load", () => {
    const triggerPrint = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 400);
    };
    if (printWindow.document.fonts?.ready) {
      printWindow.document.fonts.ready.then(triggerPrint);
    } else {
      setTimeout(triggerPrint, 1500);
    }
  });
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

export async function exportCVToPDF(elementId: string, fileName = "CV") {
  const el = document.getElementById(elementId);
  if (!el) {
    console.error(`Element #${elementId} tidak ditemukan.`);
    return false;
  }
  return exportCvPages([el], fileName);
}

/** Satu atau banyak CV dibuka di jendela cetak. Browser menyimpannya sebagai PDF. */
function collectSheets(root: HTMLElement): HTMLElement[] {
  const sheets = Array.from(root.querySelectorAll<HTMLElement>("[data-cv-sheet]"));
  return sheets.length ? sheets : [root];
}

export async function exportCvPages(pages: HTMLElement[], fileName = "CV") {
  if (!pages.length) return false;
  const chunks: string[] = [];
  for (const page of pages) {
    const clone = page.cloneNode(true) as HTMLElement;
    await embedImagesAsDataUrl(clone);
    const sheets = collectSheets(clone);
    const split = sheets.length > 0 && sheets[0] !== clone;
    for (const sheet of sheets) {
      const pageClass = split ? "cv-print-page cv-print-sheet" : "cv-print-page";
      const html = split ? sheet.outerHTML : clone.innerHTML;
      chunks.push(`<div class="${pageClass}">${html}</div>`);
      if (!split) break;
    }
  }
  const title = fileName.replace(/\.pdf$/i, "");
  const html = buildPrintHtml(chunks.join(""), title);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  openPrintWindow(URL.createObjectURL(blob));
  return true;
}
