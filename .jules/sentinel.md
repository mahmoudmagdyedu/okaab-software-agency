## 2025-05-24 - SSRF Prevention in Upstream Proxy URL Construction
**Vulnerability:** Node.js `new URL(path, base)` interprets paths starting with double slashes or backslashes (`//`, `/\`, `\\`) as protocol-relative URLs or scheme overrides, replacing the `base` origin and making requests to arbitrary external servers (SSRF).
**Learning:** Simply trimming leading `/` with `path.replace(/^\/+/, '')` or string concatenation is insufficient when backslashes `\` or leading `//` are present.
**Prevention:** Always sanitize user-derived path strings with `.replace(/^[/\\]+/, '')` and validate `upstreamUrl.origin === targetOrigin` before constructing upstream proxy requests.
