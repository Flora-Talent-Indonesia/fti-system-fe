const TIMEZONE = "Asia/Jakarta";

export function formatJapaneseDateTime(d: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
}
