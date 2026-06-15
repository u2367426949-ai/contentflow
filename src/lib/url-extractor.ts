import * as cheerio from "cheerio";

export interface ExtractedContent {
  text: string;
  title: string | null;
}

export async function extractUrlContent(url: string): Promise<ExtractedContent> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; ContentFlowAI/1.0; +https://contentflow.app)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Extract the page title
  const rawTitle =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $("title").text() ||
    $("h1").first().text() ||
    null;

  const title = rawTitle?.trim().replace(/\s+/g, " ") || null;

  // Remove unwanted elements
  $("script, style, nav, footer, header, aside, iframe, .ad, .ads, .advertisement").remove();

  // Try common article selectors
  const selectors = [
    "article",
    '[role="main"]',
    "main",
    ".post-content",
    ".entry-content",
    ".article-content",
    ".content",
    "#content",
    "body",
  ];

  let text = "";
  for (const selector of selectors) {
    const el = $(selector);
    if (el.length > 0) {
      text = el.text();
      break;
    }
  }

  // Clean up whitespace
  text = text
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();

  // Limit content length
  if (text.length > 15000) {
    text = text.slice(0, 15000);
  }

  return { text, title };
}
