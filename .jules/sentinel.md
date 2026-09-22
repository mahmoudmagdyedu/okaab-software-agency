## 2024-05-24 - SSRF via Node.js URL Construction
**Vulnerability:** Constructing `new URL(path, base)` in Node.js allows Server-Side Request Forgery (SSRF) if user-provided paths can start with `//` or `/\`. Node.js evaluates these as overriding protocol-relative URLs, meaning `new URL("//evil.com", "http://localhost:3000")` evaluates to `http://evil.com` instead of a subpath.
**Learning:** `replace(/^\/+/, "")` is insufficient because it doesn't strip backslashes (which browsers and Node.js often normalize). It is critical to use `replace(/^[\/\\]+/, "")` to prevent arbitrary host overrides when constructing upstream proxied URLs.
**Prevention:** Aggressively strip both leading slashes and backslashes `path.replace(/^[\/\\]+/, '')` before constructing URLs to ensure user input is always appended as a subpath.

## 2024-05-24 - DoS Risk in timingSafeEqual
**Vulnerability:** Passing `Buffer` objects of unequal lengths to `crypto.timingSafeEqual` in Node.js throws an unhandled `RangeError: Input buffers must have the same byte length`. If lengths of the buffers aren't checked before calling this, an attacker can crash the server (DoS) by sending an invalid signature length.
**Learning:** Checking `expected.length === supplied.length` before `Buffer.from()` is unsafe because string lengths (character counts) are not guaranteed to exactly match buffer byte lengths (depending on encoding or characters).
**Prevention:** Always compare `buffer.length` of the actual instantiated `Buffer` objects, not the original strings, immediately prior to calling `timingSafeEqual`.
