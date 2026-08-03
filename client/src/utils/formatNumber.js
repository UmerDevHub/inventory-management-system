/**
 * Compact number formatter for stat cards.
 * Prevents overflow when values reach millions or billions.
 *
 * Examples:
 *   999        → "999"
 *   1,000      → "1K"
 *   45,300     → "45.3K"
 *   1,200,000  → "1.2M"
 *   2,400,000,000 → "2.4B"
 */
export const compactNumber = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "0";

  if (Math.abs(num) >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString();
};

/**
 * Compact currency formatter for monetary stat cards.
 * Always prefixes with "$".
 *
 * Examples:
 *   1000       → "$1K"
 *   21200      → "$21.2K"
 *   1100000    → "$1.1M"
 *   1000000000 → "$1B"
 */
export const compactCurrency = (value) => {
  return "$" + compactNumber(value);
};
