## 2026-09-14 - Fix crypto.timingSafeEqual unhandled RangeError DoS

**Vulnerability:** In `validSignature` (`src/routes/api/youtube/webhook.ts`), a Denial of Service (DoS) vulnerability existed when validating signatures. The code compared the `length` property of strings before passing them to `Buffer.from()` and `crypto.timingSafeEqual`. If an attacker provided a multi-byte character (like an emoji) in the signature, the string length could match while the byte length differed. This caused `crypto.timingSafeEqual` to throw an unhandled `RangeError: Input buffers must have the same byte length`, crashing the server and leading to a DoS.

**Learning:** When using `crypto.timingSafeEqual` with strings, comparing string lengths is insufficient because multi-byte characters have different byte counts. The equality check must compare the byte length of the instantiated `Buffer` objects, not the original strings. This pattern is easily missed and can be exploited by an attacker submitting carefully crafted inputs with multi-byte characters.

**Prevention:** Always instantiate `Buffer` objects first and compare their `byteLength` property before passing them to `crypto.timingSafeEqual`. Alternatively, use a utility function like `safeCompare` that handles this correctly under the hood.
