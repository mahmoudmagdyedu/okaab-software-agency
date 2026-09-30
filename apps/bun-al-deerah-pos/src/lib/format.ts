/* تنسيق موحّد — كل الأرقام تُعرض داخل كلاس `num` بخط JetBrains Mono */

// ⚡ Bolt Performance Optimization:
// Caching Intl formatters to avoid expensive implicit instantiation
// when formatting large numbers of items in lists/renders.

const sarFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatSar(value: number): string {
  return sarFormatter.format(value);
}

const intFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function formatInt(value: number): string {
  return intFormatter.format(value);
}

const dateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

const timeFormatter = new Intl.DateTimeFormat("ar-SA-u-nu-latn", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}
