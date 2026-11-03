1. **Fix `timingSafeEqual` vulnerability in `src/routes/api/youtube/webhook.ts`**
   - The current code checks if `expected.length === supplied.length` before calling `timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))`.
   - Because `expected` and `supplied` are strings, this checks the number of characters, not bytes.
   - If a multi-byte string is passed that matches the character length but has a different byte length, `timingSafeEqual` will throw an error `Input buffers must have the same byte length`, potentially crashing the server or allowing a DoS attack.
   - Fix: Store `Buffer.from(expected)` and `Buffer.from(supplied)` in variables, and compare their `.length` properties before calling `timingSafeEqual`.
   - Also add a comment explaining the security concern.
2. **Verify changes in `src/routes/api/youtube/webhook.ts`**
   - Use `cat src/routes/api/youtube/webhook.ts` to ensure the file was updated correctly.
3. **Write Sentinel learning to `.jules/sentinel.md`**
   - Use `date +%Y-%m-%d` to get the current date.
   - Append a new entry to `.jules/sentinel.md` with the date and title `Fix DoS vulnerability in timingSafeEqual`.
   - Document the vulnerability (string length check vs buffer byte length check) and how to prevent it.
   - The entry will look exactly like:
   ```markdown
   ## YYYY-MM-DD - Fix DoS vulnerability in timingSafeEqual
   **Vulnerability:** Comparing string lengths instead of buffer lengths before `timingSafeEqual` can lead to an unhandled exception (DoS) if strings have different byte lengths.
   **Learning:** `timingSafeEqual` strictly expects buffers of the exact same byte length.
   **Prevention:** Always compare `.length` of instantiated Buffer objects before calling `timingSafeEqual`.
   ```
4. **Verify Sentinel journal update**
   - Use `cat .jules/sentinel.md` to ensure the entry was added correctly.
5. **Format and lint modified files**
   - Use `npx prettier --write src/routes/api/youtube/webhook.ts`
   - Use `bun run eslint src/routes/api/youtube/webhook.ts`
6. **Run project checks**
   - Run `bun test`
   - Run `npm run test:security`
   - Run `NODE_PATH=node_modules npm run test:learning`
   - Run `npm run build`
7. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
8. **Create Pull Request**
   - PR Title: `🛡️ Sentinel: [HIGH] Fix DoS vulnerability in timingSafeEqual`
   - PR Description will include:
     * 🚨 Severity: HIGH
     * 💡 Vulnerability: Checking string length instead of Buffer byte length before calling `timingSafeEqual`.
     * 🎯 Impact: An attacker can send a forged signature with multi-byte characters that matches the expected character length but differs in byte length, causing an unhandled exception and crashing the server (DoS).
     * 🔧 Fix: Instantiate `Buffer.from()` first and compare their `.length` properties.
     * ✅ Verification: Verified test suites pass and build succeeds.
