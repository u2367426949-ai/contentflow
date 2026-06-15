import * as cheerio from "cheerio";

export interface RssItem {
  title: string;
  link: string;
  snippet: string;
  pubDate: string | null;
}

export interface RssFeed {
  title: string;
  items: RssItem[];
}

const UA =
  "Mozilla/5.0 (compatible; ContentFlowAI/1.0; +https://contentflow.app)";

function clean(text: string, max = 280): string {
  const t = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
}

/**
 * Fetch and parse an RSS 2.0 or Atom feed into a normalized list of items.
 * Supports the user picking which article to turn into a project.
 */
export async function fetchRssFeed(url: string): Promise<RssFeed> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/xml, */*" },
  });
  if (!res.ok) {
    throw new Error(`Impossible de charger le flux (${res.status}).`);
  }

  const xml = await res.text();
  const $ = cheerio.load(xml, { xmlMode: true });

  const feedTitle =
    $("channel > title").first().text().trim() ||
    $("feed > title").first().text().trim() ||
    "Flux RSS";

  const items: RssItem[] = [];

  // RSS 2.0
  $("item").each((_, el) => {
    const $el = $(el);
    const title = $el.find("title").first().text().trim();
    const link =
      $el.find("link").first().text().trim() ||
      $el.find("guid").first().text().trim();
    const desc =
      $el.find("description").first().text() ||
      $el.find("content\\:encoded").first().text() ||
      "";
    const pubDate = $el.find("pubDate").first().text().trim() || null;
    if (title && link) {
      items.push({ title, link, snippet: clean(desc), pubDate });
    }
  });

  // Atom
  if (items.length === 0) {
    $("entry").each((_, el) => {
      const $el = $(el);
      const title = $el.find("title").first().text().trim();
      const link =
        $el.find("link[rel='alternate']").first().attr("href") ||
        $el.find("link").first().attr("href") ||
        "";
      const desc =
        $el.find("summary").first().text() ||
        $el.find("content").first().text() ||
        "";
      const pubDate =
        $el.find("updated").first().text().trim() ||
        $el.find("published").first().text().trim() ||
        null;
      if (title && link) {
        items.push({ title, link, snippet: clean(desc), pubDate });
      }
    });
  }

  if (items.length === 0) {
    throw new Error("Aucun article trouvé dans ce flux RSS.");
  }

  return { title: feedTitle, items: items.slice(0, 20) };
}
