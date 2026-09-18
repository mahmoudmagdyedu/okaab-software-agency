## 2025-02-27 - [crypto.timingSafeEqual DoS Vulnerability]
**Vulnerability:** A Denial of Service (DoS) vulnerability existed in `src/routes/api/youtube/webhook.ts` where `expected.length === supplied.length` was used to compare strings before passing them to `timingSafeEqual`.
**Learning:** Checking string length does not guarantee equal byte length in Node.js Buffers if multi-byte characters are present. `crypto.timingSafeEqual` will synchronously throw an unhandled exception if the Buffer byte lengths do not match, causing the application to crash or return a 500 error.
**Prevention:** Always convert strings to Buffers first (e.g., `Buffer.from(string)`), and then compare the `.length` property of the resulting Buffer objects before calling `timingSafeEqual`.
