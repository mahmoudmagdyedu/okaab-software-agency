## 2026-08-23 - Prevent SSRF in Node.js Reverse Proxy URL Construction

**Vulnerability:** User-controlled paths containing leading double-slashes or backslashes (e.g., `//evil.com` or `/\evil.com`) in `new URL(path, base)` cause Node.js URL parser to override `base`'s origin with the attacker's host, causing proxy endpoints to send requests (with sensitive headers like `Clerk-Secret-Key`) to external attacker domains.

**Learning:** `new URL(path, base)` interprets paths beginning with `//` or `/\` or `\\` as protocol-relative host overrides rather than relative path components on `base`.

**Prevention:** Aggressively strip leading slashes and backslashes using `path.replace(/^[/\\]+/, '')` before constructing the URL, and validate that `upstreamUrl.origin` matches the intended upstream base origin before making the proxy request.
