/** Reads the current response nonce for elements mounted after hydration. */
export function getDocumentNonce(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const element = document.querySelector<HTMLScriptElement | HTMLStyleElement>(
    "script[nonce], style[nonce]",
  );
  return element?.nonce || undefined;
}
