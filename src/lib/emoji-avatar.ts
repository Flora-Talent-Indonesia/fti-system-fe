/** Avatar placeholder SVG berisi emoji — untuk dummy foto siswa (FE only). */
export function emojiAvatarDataUrl(emoji: string, bg = "#FFF5F8"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="200" viewBox="0 0 160 200"><rect fill="${bg}" width="160" height="200" rx="4"/><text x="80" y="108" text-anchor="middle" font-size="72">${emoji}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
