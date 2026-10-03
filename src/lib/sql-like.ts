/**
 * Sanitizes user input for MS SQL Server LIKE queries by escaping wildcard characters.
 *
 * Security Concern: Standard SQL parameterization prevents SQL injection but does not
 * escape LIKE wildcards ('[', '%', and '_'). In MS SQL Server, '[' is used to define character
 * ranges/sets. Unescaped '[' can cause pattern matching behavior bypasses or query syntax errors
 * (e.g., 'The pattern supplied to the LIKE operator is invalid').
 *
 * Replacing '[' first with '[[]' ensures that subsequent replacements for '%' and '_'
 * do not re-escape the brackets introduced during wildcard sanitization.
 */
export function sanitizeLikePattern(pattern: string): string {
  return pattern.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]");
}
