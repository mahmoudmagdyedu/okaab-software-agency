## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-10-25 - Prevent DoS in timingSafeEqual validation
**Vulnerability:** Comparing string lengths instead of Buffer byte lengths prior to calling crypto.timingSafeEqual can cause an unhandled RangeError exception, leading to a Denial of Service (DoS) if an attacker provides a payload with multi-byte characters.
**Learning:** Node.js timingSafeEqual strictly requires identical byte lengths. String lengths do not correlate 1:1 with byte lengths when multi-byte characters are used.
**Prevention:** Always instantiate Buffer objects first.
**Action:** Compare the lengths of the instantiated Buffer objects (not strings) prior to comparison to avoid unhandled exceptions.
