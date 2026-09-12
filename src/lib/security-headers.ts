// Security headers applied at the real SSR boundary (src/server.ts).

export type ResponseSecurityOptions = {
  dev?: boolean;
  secureRequest?: boolean;
  frameOption?: "DENY" | "SAMEORIGIN";
};

export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function buildCsp(nonce: string, { dev = false }: ResponseSecurityOptions = {}): string {
  const scriptSources = [`'nonce-${nonce}'`, "'strict-dynamic'"];
  if (dev) scriptSources.push("'self'", "'unsafe-eval'");

  const directives: Array<[string, string[]]> = [
    ["default-src", ["'self'"]],
    ["base-uri", ["'self'"]],
    ["object-src", ["'none'"]],
    ["frame-ancestors", ["'none'"]],
    ["form-action", ["'self'"]],
    ["script-src", scriptSources],
    ["script-src-attr", ["'none'"]],
    // Clerk's prebuilt UI currently requires inline styles. Keep that
    // compatibility allowance isolated from the executable-script policy.
    ["style-src", ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"]],
    [
      "img-src",
      [
        "'self'",
        "data:",
        "blob:",
        "https://i.ytimg.com",
        "https://*.supabase.co",
        "https://img.clerk.com",
      ],
    ],
    ["font-src", ["'self'", "data:", "https://fonts.gstatic.com"]],
    [
      "connect-src",
      [
        "'self'",
        "https://cqxloxfxxwuhdkppjcpr.supabase.co",
        "https://fuzkonswngdogylzvivw.supabase.co",
        "wss://cqxloxfxxwuhdkppjcpr.supabase.co",
        "wss://fuzkonswngdogylzvivw.supabase.co",
        "https://*.clerk.accounts.dev",
        "https://*.clerk.com",
        "https://clerk-telemetry.com",
        "https://*.clerk-telemetry.com",
        "https://*.protect.clerk.com:*",
        "https://challenges.cloudflare.com",
        "https://www.youtube.com",
        "https://www.youtube-nocookie.com",
        ...(dev ? ["ws:", "wss:", "http://localhost:*"] : []),
      ],
    ],
    [
      "frame-src",
      [
        "'self'",
        "https://www.youtube.com",
        "https://www.youtube-nocookie.com",
        "https://*.supabase.co",
        "https://*.clerk.accounts.dev",
        "https://*.clerk.com",
        "https://*.protect.clerk.com",
        "https://challenges.cloudflare.com",
      ],
    ],
    ["worker-src", ["'self'", "blob:"]],
    ["manifest-src", ["'self'"]],
  ];

  const policy = directives.map(([name, values]) => `${name} ${values.join(" ")}`).join("; ");
  return dev ? policy : `${policy}; upgrade-insecure-requests`;
}

export const HSTS_VALUE = "max-age=31536000; includeSubDomains; preload";

export function applyBaseSecurityHeaders(
  headers: Headers,
  { secureRequest = false, frameOption = "DENY" }: ResponseSecurityOptions = {},
) {
  for (const name of ["server", "via", "x-powered-by"]) headers.delete(name);
  for (const name of [...headers.keys()]) {
    if (name.startsWith("x-clerk-")) headers.delete(name);
  }

  if (secureRequest) headers.set("strict-transport-security", HSTS_VALUE);
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", frameOption);
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
}

export function applyHtmlSecurityHeaders(
  headers: Headers,
  nonce: string,
  options: ResponseSecurityOptions = {},
) {
  applyBaseSecurityHeaders(headers, options);
  headers.set("content-security-policy", buildCsp(nonce, options));
}

export function injectNonceIntoTags(html: string, nonce: string): string {
  return html.replace(/<(script|style)\b([^>]*)>/gi, (_match, tag: string, attrs: string) => {
    const cleaned = attrs.replace(/\snonce\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
    return `<${tag}${cleaned} nonce="${nonce}">`;
  });
}

export function nonceTransformStream(
  body: ReadableStream<Uint8Array>,
  nonce: string,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let carry = "";

  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        const text = carry + decoder.decode(chunk, { stream: true });
        const lastOpen = text.lastIndexOf("<");
        let ready = text;
        carry = "";
        if (
          lastOpen !== -1 &&
          text.indexOf(">", lastOpen) === -1 &&
          text.length - lastOpen <= 4096
        ) {
          ready = text.slice(0, lastOpen);
          carry = text.slice(lastOpen);
        }
        if (ready) controller.enqueue(encoder.encode(injectNonceIntoTags(ready, nonce)));
      },
      flush(controller) {
        const tail = carry + decoder.decode();
        if (tail) controller.enqueue(encoder.encode(injectNonceIntoTags(tail, nonce)));
      },
    }),
  );
}
