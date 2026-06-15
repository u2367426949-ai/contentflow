import type { ExtractedContent } from "@/lib/url-extractor";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

/** Extract the 11-char video id from any common YouTube URL form. */
export function parseYouTubeId(input: string): string | null {
  const url = input.trim();
  // Already a bare id.
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;#39;|&#39;/g, "'")
    .replace(/&amp;quot;|&quot;/g, '"')
    .replace(/&amp;amp;|&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

interface CaptionTrack {
  baseUrl: string;
  languageCode?: string;
  kind?: string;
}

/**
 * Fetch the transcript of a YouTube video without an API key by reading the
 * caption tracks embedded in the watch page, then fetching the timedtext XML.
 */
export async function extractYouTubeTranscript(
  input: string
): Promise<ExtractedContent> {
  const id = parseYouTubeId(input);
  if (!id) {
    throw new Error("URL YouTube invalide.");
  }

  const watchRes = await fetch(`https://www.youtube.com/watch?v=${id}`, {
    headers: { "User-Agent": UA, "Accept-Language": "fr,en;q=0.8" },
  });
  if (!watchRes.ok) {
    throw new Error(`Impossible de charger la vidéo (${watchRes.status}).`);
  }
  const html = await watchRes.text();

  // Title
  const titleMatch =
    html.match(/<meta property="og:title" content="([^"]+)"/) ||
    html.match(/"title":"([^"]+)"/);
  const title = titleMatch ? decodeEntities(titleMatch[1]) : null;

  // Caption tracks live inside ytInitialPlayerResponse.
  const tracksMatch = html.match(/"captionTracks":(\[.*?\])/);
  if (!tracksMatch) {
    throw new Error(
      "Aucun sous-titre disponible pour cette vidéo (transcript introuvable)."
    );
  }

  let tracks: CaptionTrack[];
  try {
    // The JSON uses & for & — JSON.parse handles the unicode escape.
    tracks = JSON.parse(tracksMatch[1]) as CaptionTrack[];
  } catch {
    throw new Error("Erreur lors de la lecture des sous-titres.");
  }
  if (!tracks.length) {
    throw new Error("Aucun sous-titre disponible pour cette vidéo.");
  }

  // Prefer French, then English, then anything; prefer manual over ASR.
  const pick =
    tracks.find((t) => t.languageCode === "fr" && t.kind !== "asr") ||
    tracks.find((t) => t.languageCode === "en" && t.kind !== "asr") ||
    tracks.find((t) => t.languageCode === "fr") ||
    tracks.find((t) => t.languageCode === "en") ||
    tracks[0];

  const baseUrl = pick.baseUrl.replace(/\\u0026/g, "&");
  const xmlRes = await fetch(baseUrl, { headers: { "User-Agent": UA } });
  if (!xmlRes.ok) {
    throw new Error("Impossible de récupérer le transcript.");
  }
  const xml = await xmlRes.text();

  const segments = [...xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map((m) =>
    decodeEntities(m[1])
  );
  let text = segments.join(" ").replace(/\s+/g, " ").trim();

  if (!text) {
    throw new Error("Le transcript est vide.");
  }
  if (text.length > 15000) text = text.slice(0, 15000);

  return { text, title };
}
