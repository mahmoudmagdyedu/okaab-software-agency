## 2026-09-21 - SSRF via Protocol-Relative URLs in Proxy Handlers

**Vulnerability:** Proxy endpoints handling incoming paths were constructing upstream URLs using `new URL(path, base)`. User-supplied paths starting with `//` or `/\\` were evaluated as protocol-relative URLs by Node.js WHATWG URL standard, replacing the target base origin with an arbitrary attacker-controlled domain (SSRF) and leaking sensitive headers like `Clerk-Secret-Key`.
**Learning:** `new URL(path, base)` treats leading double slashes or mixed slash-backslashes as protocol-relative URLs that override `base`.
**Prevention:** Aggressively strip leading slashes and backslashes using `.replace(/^[/\\]+/, '')` before prepending a single `/` when constructing URLs with user-controlled path segments.
