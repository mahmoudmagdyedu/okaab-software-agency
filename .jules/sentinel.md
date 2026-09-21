
## 2025-02-14 - SSRF in Path-based URL Construction
**Vulnerability:** Constructing upstream proxy URLs using `new URL(path, base)` is vulnerable to SSRF if the user-controlled `path` begins with `//` or `\\`. The `URL` constructor treats this as a protocol-relative absolute URL and completely ignores the `base` parameter.
**Learning:** In the Clerk proxy and downstream reverse proxies (mawid, bun-al-deerah), an attacker could supply `//evil.com` to bypass the intended host restriction, leading to SSRF.
**Prevention:** Always strip leading forward and backward slashes (e.g., `.replace(/^[/\\]+/, '')`) from user-provided paths *before* using them as the path component in a `new URL()` constructor.
