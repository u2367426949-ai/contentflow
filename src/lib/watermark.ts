// Free-plan output carries a small watermark — a distribution/upgrade lever,
// not a technical limitation. Paid plans never see it.
const WATERMARK_LONG = "\n\n— Généré avec ContentFlow AI";
const WATERMARK_SHORT = " · via ContentFlow AI";
const TWITTER_MAX = 280;

/** Append the free-plan watermark, respecting Twitter's 280-char limit. */
export function applyWatermark(platform: string, content: string): string {
  const trimmed = content.trimEnd();
  if (!trimmed) return trimmed;

  if (platform === "twitter") {
    const budget = TWITTER_MAX - WATERMARK_SHORT.length;
    const base =
      trimmed.length > budget ? `${trimmed.slice(0, budget - 1).trimEnd()}…` : trimmed;
    return `${base}${WATERMARK_SHORT}`;
  }

  return `${trimmed}${WATERMARK_LONG}`;
}
