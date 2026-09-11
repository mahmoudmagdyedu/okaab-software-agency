## 2024-05-24 - Unhandled Exception DoS in timingSafeEqual via mismatching lengths

**Vulnerability:** `crypto.timingSafeEqual` in Node.js throws an unhandled exception if the two `Buffer` objects supplied to it have different lengths. By supplying a string that causes a buffer of a different length, it was possible to trigger this exception and cause a Denial of Service (DoS). The code was previously checking the lengths of the original strings, which is insufficient because different strings can produce buffers of different lengths depending on the encoding and multi-byte characters.
**Learning:** Always compare the `.length` properties of the instantiated `Buffer` objects (not the original strings) prior to calling `timingSafeEqual`.
**Prevention:** Instantiate the buffers first, check their lengths for equality, and only if they match, pass them to `timingSafeEqual`.
