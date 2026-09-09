## 2024-05-18 - [API Key Timing Attack]
**Vulnerability:** Comparing supplied API keys against secrets using `!==` or `===`.
**Learning:** This leaks the length of the matching prefix because JS short-circuits string comparisons, enabling timing attacks to guess the secret.
**Prevention:** Always use `node:crypto`s `timingSafeEqual(Buffer.from(supplied), Buffer.from(secret))` after ensuring the lengths match.
