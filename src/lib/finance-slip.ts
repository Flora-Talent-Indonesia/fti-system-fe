import type { FinanceInvoice, InvoiceLine } from "@/lib/finance-storage";
import { studentFileName } from "@/lib/student-file-name";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DIGITS = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];

type SlipKind = "invoice" | "kwitansi";

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dateParts(value: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (dateOnly) return { year: Number(dateOnly[1]), month: Number(dateOnly[2]), day: Number(dateOnly[3]) };
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return { year: parsed.getFullYear(), month: parsed.getMonth() + 1, day: parsed.getDate() };
}

function formatSlash(value: string) {
  const parts = dateParts(value);
  if (!parts) return "-";
  return `${String(parts.day).padStart(2, "0")}/${String(parts.month).padStart(2, "0")}/${parts.year}`;
}

function formatEnglish(value: string) {
  const parts = dateParts(value);
  if (!parts) return "";
  const date = new Date(parts.year, parts.month - 1, parts.day);
  return `${WEEKDAYS[date.getDay()]}, ${String(parts.day).padStart(2, "0")} ${MONTHS[parts.month - 1]} ${parts.year}`;
}

function money(amount: number) {
  return new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

function spell(n: number): string {
  if (n < 12) return DIGITS[n];
  if (n < 20) return `${spell(n - 10)} Belas`;
  if (n < 100) return `${spell(Math.floor(n / 10))} Puluh ${spell(n % 10)}`.replace(/\s+/g, " ").trim();
  if (n < 200) return `Seratus ${spell(n - 100)}`.replace(/\s+/g, " ").trim();
  if (n < 1000) return `${spell(Math.floor(n / 100))} Ratus ${spell(n % 100)}`.replace(/\s+/g, " ").trim();
  if (n < 2000) return `Seribu ${spell(n - 1000)}`.replace(/\s+/g, " ").trim();
  if (n < 1_000_000) return `${spell(Math.floor(n / 1000))} Ribu ${spell(n % 1000)}`.replace(/\s+/g, " ").trim();
  if (n < 1_000_000_000) return `${spell(Math.floor(n / 1_000_000))} Juta ${spell(n % 1_000_000)}`.replace(/\s+/g, " ").trim();
  return `${spell(Math.floor(n / 1_000_000_000))} Miliar ${spell(n % 1_000_000_000)}`.replace(/\s+/g, " ").trim();
}

export function terbilangRupiah(amount: number) {
  const value = Math.round(Math.abs(amount));
  if (value === 0) return "Nol Rupiah";
  return `${spell(value)} Rupiah`;
}

function dueValue(line: InvoiceLine) {
  if (line.dueAt) return formatSlash(line.dueAt);
  if (line.dueDate) return formatSlash(line.dueDate);
  return "-";
}

export function renderFinanceSlip(kind: SlipKind, invoice: FinanceInvoice, line: InvoiceLine, origin: string) {
  const receipt = kind === "kwitansi";
  const issued = receipt ? line.paidAt || new Date().toISOString() : invoice.createdAt;
  const description = invoice.programName ? `${line.label} — ${invoice.programName}` : line.label;
  const amount = money(line.amount);
  const totalCell = (text: string, mark = false) =>
    `<td class="rp"><table class="pair"><tr><td class="cur">Rp</td><td class="val${mark ? " mark" : ""}">${text}</td></tr></table></td>`;
  const blankTotal = receipt ? "<td></td>" : totalCell("-", true);
  const blanks = Array.from({ length: 4 }, () => `<tr><td></td><td></td><td></td>${blankTotal}</tr>`).join("");
  const meta = receipt
    ? `<div class="meta short">
        <div>TANGGAL</div><div>:</div><div>${esc(formatSlash(issued))}</div>
        <div>NO. KUITANSI</div><div>:</div><div>${esc(line.receiptNo || "-")}</div>
      </div>`
    : `<div class="meta">
        <div>TANGGAL</div><div>:</div><div>${esc(formatSlash(issued))}</div>
        <div>NO. INVOICE</div><div>:</div><div>${esc(invoice.number)}</div>
        <div>TANGGAL JATUH TEMPO</div><div>:</div><div>${esc(dueValue(line))}</div>
      </div>`;
  const party = receipt
    ? `<div class="party"><div class="label">DIBAYARKAN OLEH :</div><div>${esc(invoice.studentName)}</div></div>`
    : `<div class="party"><div class="label">KEPADA :</div><div>${esc(invoice.studentName)}</div></div>`;
  const summary = receipt
    ? `<div class="words"><div class="label">TERBILANG :</div><div>${esc(terbilangRupiah(line.amount))}</div></div>
       <div class="sum"><span class="lab">TOTAL</span><span class="cur">Rp</span><b>${amount}</b></div>`
    : `<div class="sum sub"><span class="lab">SUBTOTAL</span><span class="cur">Rp</span><b>${amount}</b></div>`;
  const written = (line.note || "").trim();
  const noteBody = written ? `<div class="body">${esc(written)}</div>` : `<div class="dash">-</div>`;
  const note = receipt
    ? `<div class="note lower"><div class="label">CATATAN :</div>${noteBody}</div>
       <div class="thanks">どうもありがとうございます</div>`
    : `<div class="note"><div class="label">Catatan :</div>${noteBody}</div>
       <div class="bank">
         <b>Harap transfer ke rekening kami:</b>
         <p>SMBC Jakarta HO</p>
         <p>Nomor Rekening : 08003000282</p>
         <p>SWIFT CODE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: SUNIIDJA</p>
         <p>PT. FLORA TALENT INDONESIA</p>
       </div>`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>${esc(studentFileName(receipt ? "Kwitansi" : "Invoice", invoice.studentName))}</title>
  <style>
    @page { size: letter; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { margin: 0; padding: 0; background: #fff; }
    body { font-family: "Times New Roman", Times, serif; color: #000; }
    .sheet { position: relative; width: 612pt; height: 792pt; overflow: hidden; }
    .top, .foot { position: absolute; left: 1.6pt; width: 609.3pt; display: flex; align-items: center; justify-content: center; font-size: 20pt; font-weight: 700; }
    .top { top: 1.1pt; height: 30.5pt; }
    .foot { height: 14pt; }
    .invoice .top, .invoice .foot, .invoice .head th, .invoice .sum { background: #8ea9db; color: #000; }
    .invoice .foot { top: 777.4pt; }
    .kwitansi .top, .kwitansi .foot { background: #44546a; color: #fff; }
    .kwitansi .foot { top: 773.4pt; height: 18.2pt; }
    .kwitansi .head th, .kwitansi .sum, .kwitansi .words { background: #b4c6e7; color: #000; }
    .brand { position: absolute; left: 1.6pt; top: 31.4pt; width: 609.3pt; height: 100.1pt; background: #d6dce4; }
    .logo { position: absolute; left: 11pt; top: 15pt; width: 159.8pt; height: 63.3pt; object-fit: fill; }
    .company { position: absolute; left: 200pt; top: 15.6pt; width: 425pt; text-align: center; font-size: 11pt; font-weight: 400; line-height: 14.15pt; }
    .company strong { font-size: 11pt; font-weight: 700; }
    .meta, .party, .note { position: absolute; background: #d6dce4; }
    .meta { left: 278.2pt; top: 145.4pt; width: 332.7pt; height: 54.5pt; display: grid; grid-template-columns: 176.8pt 10.3pt 1fr; align-content: center; padding: 0 8pt 0 2.7pt; font-size: 11pt; font-weight: 700; line-height: 18.15pt; }
    .meta.short { height: 36.4pt; }
    .party { left: 14.3pt; top: 213.8pt; width: 264pt; height: 42.3pt; padding: 1.3pt 8pt 0 1.9pt; font-size: 11pt; font-weight: 400; }
    .party .label, .note .label, .words .label, .bank b { font-weight: 700; }
    .party div + div { margin-top: 8pt; }
    .lines-wrap { position: absolute; left: 13.32pt; top: 269.52pt; width: 569.64pt; }
    table.lines { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .lines th, .lines td { border: 1.92pt solid #000; height: 19.32pt; padding: 0 4pt; font-size: 11pt; font-weight: 400; background: #d6dce4; vertical-align: middle; text-align: center; }
    .lines th { height: 20.1pt; font-weight: 700; }
    .lines td.num { text-align: right; padding-right: 4.5pt; }
    .lines td.rp { padding: 0; }
    .lines table.pair { width: 100%; height: 100%; border-collapse: collapse; table-layout: fixed; }
    .lines table.pair td { border: none; background: transparent; height: 17pt; padding: 0; font-size: 11pt; font-weight: 400; vertical-align: middle; }
    .lines table.pair .cur { width: 28pt; text-align: left; padding-left: 4.9pt; }
    .lines table.pair .val { text-align: right; padding-right: 6.5pt; }
    .lines table.pair .val.mark { padding-right: 17.2pt; }
    .lines col.c1 { width: 263.88pt; }
    .lines col.c2 { width: 71.4pt; }
    .lines col.c3 { width: 116.52pt; }
    .lines col.c4 { width: 117.84pt; }
    .sum { position: absolute; left: 349.6pt; top: 405.1pt; width: 232.5pt; height: 35.8pt; font-size: 12pt; font-weight: 700; }
    .sum .lab, .sum .cur, .sum b { position: absolute; top: 0; bottom: 0; display: flex; align-items: center; }
    .sum .lab { left: 2pt; }
    .sum .cur { left: 122.5pt; }
    .sum b { right: 6.2pt; }
    .kwitansi .sum { height: 26.6pt; }
    .kwitansi .sum .lab { left: 0; width: 116.5pt; justify-content: center; }
    .words { position: absolute; left: 14.3pt; top: 405.1pt; width: 264pt; height: 74.7pt; padding: 6.5pt 8pt 0; text-align: center; font-size: 12pt; font-weight: 700; }
    .words div + div { margin-top: 24.4pt; font-size: 11pt; }
    .note { left: 14.3pt; top: 452.8pt; width: 567.8pt; height: 78.6pt; padding: 4.4pt 8pt 0 1.9pt; font-size: 11pt; }
    .note.lower { top: 491.6pt; }
    .dash { position: absolute; left: 0; right: 0; top: 42.9pt; text-align: center; font-weight: 400; }
    .note .body { margin-top: 8pt; font-weight: 400; font-size: 11pt; line-height: 14pt; white-space: pre-wrap; }
    .bank { position: absolute; left: 16.2pt; top: 540.6pt; width: 260pt; font-size: 11pt; font-weight: 400; line-height: 18.7pt; }
    .bank p { margin: 0; }
    .bank p:first-of-type { margin-top: 8.3pt; }
    .thanks { position: absolute; left: 35.6pt; top: 578.3pt; font-family: "Yu Gothic", "Yu Gothic UI", Meiryo, "MS PGothic", sans-serif; font-size: 12pt; font-weight: 700; }
    .sign { position: absolute; left: 0; top: 0; width: 612pt; height: 792pt; }
    .sign .when { position: absolute; left: 327pt; width: 278pt; text-align: center; font-size: 12pt; font-weight: 400; white-space: nowrap; }
    .invoice .sign .when { top: 606.7pt; }
    .kwitansi .sign .when { top: 608.2pt; }
    .sign img { position: absolute; left: 433.8pt; width: 102.2pt; height: 84.6pt; object-fit: fill; margin: 0; }
    .invoice .sign img { top: 632.2pt; }
    .kwitansi .sign img { top: 633.6pt; }
    .sign .name, .sign .role { position: absolute; left: 366pt; width: 200pt; text-align: center; font-family: Cambria, "Times New Roman", serif; font-size: 11pt; font-weight: 700; }
    .invoice .sign .name { top: 721.2pt; }
    .kwitansi .sign .name { top: 722.6pt; }
    .invoice .sign .role { top: 735.1pt; }
    .kwitansi .sign .role { top: 736.5pt; }
    .sign .name span { border-bottom: 0.9pt solid #000; }
    @media print {
      .sheet, .lines-wrap, table.lines, .lines tr { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="sheet ${receipt ? "kwitansi" : "invoice"}">
    <div class="top">${receipt ? "KUITANSI" : "INVOICE"}</div>
    <div class="brand">
      <img class="logo" src="${esc(origin)}/finance/logo.png" alt="Flora" />
      <div class="company">
        <strong>PT. FLORA TALENT INDONESIA</strong><br />
        Jl. RS. Fatmawati, Pusat Niaga Duta Mas Fatmawati, Blok A1 No.1,<br />
        Kel. Cipete Utara, Kec. Kebayoran Baru Jakarta Selatan - 12150<br />
        ysfloraindonesia.com | Telp. 0812-8770-8515
      </div>
    </div>
    ${meta}
    ${party}
    <div class="lines-wrap">
    <table class="lines">
      <colgroup><col class="c1" /><col class="c2" /><col class="c3" /><col class="c4" /></colgroup>
      <thead>
        <tr class="head"><th>KETERANGAN</th><th>QTY</th><th>HARGA</th><th>TOTAL</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>${esc(description)}</td>
          <td>1</td>
          <td class="num">${amount}</td>
          ${totalCell(amount)}
        </tr>
        ${blanks}
      </tbody>
    </table>
    </div>
    ${summary}
    ${note}
    <div class="sign">
      <div class="when">${esc(formatEnglish(issued))}</div>
      <img src="${esc(origin)}/finance/ttd.png" alt="" />
      <div class="name"><span>LENI NOVIANTI</span></div>
      <div class="role">FINANCE</div>
    </div>
    <div class="foot"></div>
  </div>
  <script>
    Promise.all([...document.images].map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => { img.onload = img.onerror = resolve; })))
      .then(() => window.print());
  </script>
</body>
</html>`;
}
