## 2026-10-13 - [DoS Risk in timingSafeEqual]
**Vulnerability:** Comparing string lengths instead of Buffer lengths before calling crypto.timingSafeEqual can cause unhandled exceptions (DoS).
**Learning:** Multi-byte characters can cause strings of the same length to produce Buffers of different lengths, crashing timingSafeEqual.
**Prevention:** Always instantiate Buffers first, and compare their lengths before using timingSafeEqual.
