/* تنسيق موحّد — كل الأرقام تُعرض داخل كلاس `num` بخط JetBrains Mono */

// Performance optimization: Cache Intl formatter instances at module scope
// to avoid recreating formatters on every call during frequent UI render loops.
const sarFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const intFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("ar-SA-u-nu-latn", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatSar(value: number): string {
  return sarFormatter.format(value);
}

export function formatInt(value: number): string {
  return intFormatter.format(value);
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}
