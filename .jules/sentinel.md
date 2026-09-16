## 2025-05-18 - Buffer length mismatch in timingSafeEqual causing unhandled RangeError DoS

**Vulnerability:** In `validSignature`, string lengths (`expected.length === supplied.length`) were compared before passing `Buffer.from(expected)` and `Buffer.from(supplied)` to `crypto.timingSafeEqual`. When an incoming signature contained multi-byte characters with matching string length (e.g. UTF-16 surrogate pairs), the Buffer byte lengths differed, causing `timingSafeEqual` to throw an unhandled `RangeError: Input buffers must have the same byte length` and crashing the request/server with an HTTP 500.

**Learning:** `string.length` measures UTF-16 code units, whereas Node's `Buffer.from(str)` allocates bytes based on UTF-8 encoding. Comparing string lengths before instantiating Buffers allows multi-byte characters to bypass the length check and trigger native RangeError exceptions inside `timingSafeEqual`.

**Prevention:** Always instantiate `Buffer` objects for both expected and supplied secrets/signatures first, and compare `expectedBuf.length === suppliedBuf.length` on the `Buffer` instances (which measures byte length) prior to calling `timingSafeEqual`.
