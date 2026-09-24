## 2024-05-24 - SSRF via Node.js URL Protocol-Relative Parsing
**Vulnerability:** Node.js `new URL(path, base)` allows Server-Side Request Forgery (SSRF) if `path` starts with `//` or `/\`. In this proxy, unvalidated paths from client requests effectively hijacked the upstream URL host.
**Learning:** The URL parser in Node evaluates `//evil.com` as a protocol-relative URL, overriding the provided base URL entirely instead of appending to its path.
**Prevention:** Aggressively strip leading slashes and backslashes (e.g., `.replace(/^[/\\]+/, '')`) from user-controlled paths *before* passing them to `new URL()`.
