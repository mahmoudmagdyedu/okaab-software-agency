/* تنسيق موحّد — كل الأرقام تُعرض داخل كلاس `num` بخط JetBrains Mono */

export function formatSar(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatInt(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ar-SA-u-nu-latn", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
