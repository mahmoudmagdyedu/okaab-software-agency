/**
 * Escapes MS SQL Server LIKE wildcard characters ('[', '%', '_') in user input.
 * Security Note: '[' MUST be escaped first to prevent double-escaping brackets introduced by
 * subsequent replacements and to prevent wildcard pattern injection (e.g., '[a-z]').
 */
export function escapeLikeWildcards(value: string): string {
  return value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]");
}
