## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-11 - Safe Buffer Length Check in timingSafeEqual Webhook Verification

**Vulnerability:** Comparing string lengths (`expected.length === supplied.length`) instead of Buffer byte lengths before calling `crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))` can cause unhandled RangeError exceptions or timing discrepancies if multi-byte characters are supplied.
**Learning:** `crypto.timingSafeEqual` strictly enforces that both Buffer arguments have identical byte lengths (`byteLength`). A string character count does not necessarily match its UTF-8 Buffer byte length.
**Prevention:** Always instantiate Buffers first, compare their `.length` (byte length), and then invoke `crypto.timingSafeEqual` only when byte lengths match.
