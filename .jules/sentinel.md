
## 2024-05-18 - [Node.js URL Constructor Protocol-Relative SSRF]
**Vulnerability:** Constructing a `new URL(path, base)` in Node.js where `path` is user-controlled can lead to Server-Side Request Forgery (SSRF). Node.js evaluates paths starting with `//` or `/\` as protocol-relative URLs, meaning they override the base domain (e.g. `new URL("/\\evil.com", "https://api.com")` resolves to `https://evil.com/`).
**Learning:** Standard string stripping like `.replace(/^\/+/, "")` or `.replace(/^\//, "")` is insufficient because backslashes are also treated as path separators by the WHATWG URL parser before domain overriding occurs.
**Prevention:** Aggressively strip both leading slashes and backslashes using `.replace(/^[/\\]+/, "")` before passing user-controlled paths into the `new URL()` constructor.
