const configuredBasePath = import.meta.env["VITE_APP_BASE_PATH"]?.trim() ?? "";

export const APP_BASE_PATH =
  configuredBasePath === "/" ? "" : configuredBasePath.replace(/^\/*/, "/").replace(/\/+$/, "");

export function withBasePath(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${APP_BASE_PATH}${normalizedPath}` || "/";
}
