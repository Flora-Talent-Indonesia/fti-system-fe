/** Lampiran sertifikat: PDF saja. */
export const PDF_ACCEPT_INPUT = '.pdf';

/** Dokumen pendukung: hasil pindai PDF saja. */
export const DOC_ACCEPT_INPUT = '.pdf';

/** Foto 3×4: hanya gambar JPG/JPEG/PNG. */
export const PHOTO_ACCEPT_INPUT = '.jpg,.jpeg,.png';

const PDF_EXT_RE = /\.pdf$/i;
const DOC_EXT_RE = /\.pdf$/i;
const PHOTO_EXT_RE = /\.(png|jpe?g)$/i;

export function isPdfFileName(name: string): boolean {
  return PDF_EXT_RE.test(name.trim());
}

export function isAllowedPdfUpload(file: File): boolean {
  return isPdfFileName(file.name);
}

export function isAllowedDocUpload(file: File): boolean {
  return DOC_EXT_RE.test(file.name);
}

export function isAllowedPhotoUpload(file: File): boolean {
  return PHOTO_EXT_RE.test(file.name);
}

/** Teks untuk atribut `title` (tooltip) — lampiran sertifikat. */
export const TOOLTIP_CERT_PDF = 'Wajib PDF. JPG dan PNG tidak diterima.';

/** Teks untuk atribut `title` (tooltip) — dokumen pendukung. */
export const TOOLTIP_DOC_UPLOAD = 'Wajib hasil pindai PDF. JPG dan PNG tidak diterima.';

/** Teks untuk atribut `title` (tooltip) — foto 3×4. */
export const TOOLTIP_PHOTO_UPLOAD =
  'JPG, JPEG, atau PNG. Otomatis dikonversi ke WebP saat upload.';
