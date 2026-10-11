import assert from "node:assert/strict";
import test from "node:test";

import { validSignature } from "./webhook.ts";

test("validSignature handles multi-byte signatures safely without throwing RangeError", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = "test-secret";
  // A string of 40 multi-byte characters with matching string length to a 40-hex hash string
  const multiByteSig = "sha1=" + "😀".repeat(40);
  assert.doesNotThrow(() => {
    const result = validSignature("test-body", multiByteSig);
    assert.equal(result, false);
  });
});
