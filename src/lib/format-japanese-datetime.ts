const TIMEZONE = "Asia/Jakarta";

export function formatJapaneseDateTime(d: Date): string {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}年${value("month")}月${value("day")}日 ${value("hour")}:${value("minute")}:${value("second")}`;
}
