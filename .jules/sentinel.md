## 2026-03-30 - timingSafeEqual Buffer Byte Length Validation
**Vulnerability:** Comparing string character lengths (`expected.length === supplied.length`) before calling `crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))` can cause unhandled `TypeError` exceptions if `supplied` contains multi-byte UTF-8 characters whose byte length exceeds the expected buffer byte length.
**Learning:** `Buffer.from(str)` yields a Buffer whose byte length (`byteLength`) may differ from `str.length`. `timingSafeEqual` throws an exception when buffer byte lengths mismatch.
**Prevention:** Always instantiate `Buffer` objects first and compare `expectedBuf.byteLength === suppliedBuf.byteLength` on the `Buffer` instances prior to calling `timingSafeEqual`.
