import { describe, expect, it } from "bun:test";

export function sanitizeLikeSearch(search: string): string {
  return search.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]");
}

describe("MS SQL LIKE search sanitization", () => {
  it("escapes open bracket '[' first so brackets added for % and _ are not double escaped", () => {
    const input = "test_user%[admin]";
    const escaped = sanitizeLikeSearch(input);
    expect(escaped).toBe("test[_]user[%][[]admin]");
  });

  it("handles standalone brackets correctly", () => {
    const input = "[abc]";
    const escaped = sanitizeLikeSearch(input);
    expect(escaped).toBe("[[]abc]");
  });

  it("handles empty string and normal text without modification", () => {
    expect(sanitizeLikeSearch("")).toBe("");
    expect(sanitizeLikeSearch("john.doe@example.com")).toBe("john.doe@example.com");
  });
});
