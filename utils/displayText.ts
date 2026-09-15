/** Keep activity saved by earlier app versions consistent with the current UI. */
export function withoutEmoji(value: string): string {
  return value
    .replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F\u200D\u20E3]/gu, '')
    .replace(/ {2,}/g, ' ')
    .trim();
}
