/**
 * Smart Search Utilities for Uzbek (Latin & Cyrillic) and English
 * Handles:
 * - Apostrophe variations (', ’, ‘, ʻ, ʼ, `, ´)
 * - Diacritic/punctuation stripping so "fargona" matches "Farg'ona" and "oktam" matches "Oʻktam"
 * - Multi-word / tokenized matching regardless of word order
 * - Whitespace trimming (safeguarding against mobile keyboard auto-space)
 */

export function normalizeSearchText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BB\u02BC\u00B4`'"]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripSearchPunctuation(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9а-яёўқғҳ]/gi, "");
}

export function smartMatchesSearch(
  target: string | (string | null | undefined)[],
  query: string | null | undefined
): boolean {
  if (!query || !query.trim()) return true;

  const rawTarget = Array.isArray(target)
    ? target.filter(Boolean).join(" ")
    : (target || "");

  const cleanQuery = normalizeSearchText(query);
  const queryTokens = cleanQuery.split(" ").filter(Boolean);
  if (queryTokens.length === 0) return true;

  const cleanTarget = normalizeSearchText(rawTarget);
  const strippedTarget = stripSearchPunctuation(rawTarget);

  return queryTokens.every((token) => {
    // 1. Direct normalized match (e.g. "o'ktam" in "o'ktam ali")
    if (cleanTarget.includes(token)) return true;

    // 2. Stripped match (e.g. "oktam" in "o'ktam", "#0012" in "0012", "bert" in "bert-agro")
    const strippedToken = stripSearchPunctuation(token);
    if (strippedToken && strippedTarget.includes(strippedToken)) return true;

    return false;
  });
}
