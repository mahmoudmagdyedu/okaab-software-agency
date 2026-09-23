
## 2026-09-23 - [SSRF in Node.js via new URL()]
**Vulnerability:** Constructing a URL using `new URL(path, base)` in Node.js can lead to SSRF if `path` begins with `//` or `/\`, as Node.js evaluates it as overriding the protocol-relative URL, substituting the domain of `base` with the domain from `path`. This was found in the Clerk proxy route (`/__clerk/$.ts` and `/clerk-proxy/$.ts`).
**Learning:** Always aggressively strip leading slashes and backslashes from user-provided paths using `.replace(/^[/\\]+/, '')` before passing it to `new URL(path, base)` to prevent origin overrides.
**Prevention:** When proxying endpoints or building URLs with user input as the path, ensure `path` is sanitized so it cannot start with `//` or `/\`.
