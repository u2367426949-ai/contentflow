import { getOpenAI } from "@/lib/openai";

// Minimum number of measured posts on a platform before computing an insight.
export const MIN_MEASURED_POSTS = 3;

export interface MeasuredPost {
  content: string;
  publishedAt: Date | null;
  impressions: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
}

export interface PerformanceProfile {
  // One-paragraph human-readable summary of what performs for this author.
  summary: string;
  // Hook styles that drive engagement (first lines that work).
  hooks: string;
  // Topics/angles that resonate with this audience.
  topics: string;
  // Structural patterns of top posts (length, lists, line breaks...).
  structure: string;
  // Patterns observed in low performers (to avoid).
  avoid: string;
  // 2-3 concrete recommendations for the next posts.
  recommendations: string[];
}

/**
 * Engagement score used to rank posts against each other.
 * Comments/shares weigh more than likes; impressions are informative only.
 */
export function engagementScore(p: MeasuredPost): number {
  return (p.likes || 0) + 3 * (p.comments || 0) + 5 * (p.shares || 0);
}

/**
 * Analyze measured posts and extract what actually performs for this author.
 * This is the "performance loop": the result is re-injected into future
 * generations so the AI writes more of what works and less of what flops.
 */
export async function analyzePerformance(
  platform: string,
  posts: MeasuredPost[]
): Promise<PerformanceProfile> {
  const ranked = [...posts].sort((a, b) => engagementScore(b) - engagementScore(a));

  const describe = (p: MeasuredPost) =>
    [
      `Impressions: ${p.impressions ?? "?"} | J'aime: ${p.likes ?? 0} | Commentaires: ${p.comments ?? 0} | Partages: ${p.shares ?? 0}`,
      p.publishedAt ? `Publié le: ${p.publishedAt.toISOString()}` : null,
      `Contenu:\n${p.content.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");

  const top = ranked.slice(0, 5);
  const bottom = ranked.length > 5 ? ranked.slice(-3) : [];

  const corpus = [
    "=== POSTS LES PLUS PERFORMANTS ===",
    ...top.map((p, i) => `--- TOP ${i + 1} ---\n${describe(p)}`),
    ...(bottom.length
      ? [
          "=== POSTS LES MOINS PERFORMANTS ===",
          ...bottom.map((p, i) => `--- FLOP ${i + 1} ---\n${describe(p)}`),
        ]
      : []),
  ]
    .join("\n\n")
    .slice(0, 14000);

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Tu es un analyste de croissance social media. On te donne les posts ${platform} d'UN auteur avec leurs statistiques d'engagement réelles. Compare les posts qui performent à ceux qui performent moins et extrais des patterns ACTIONNABLES (pas des généralités type "poste régulièrement").

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après :
{
  "summary": "résumé en 1 paragraphe de ce qui fait performer cet auteur",
  "hooks": "les types d'accroches (premières lignes) qui génèrent de l'engagement chez lui",
  "topics": "les sujets et angles qui résonnent avec son audience",
  "structure": "les patterns de structure des tops (longueur, listes, sauts de ligne, question finale...)",
  "avoid": "les patterns observés dans les posts qui performent mal",
  "recommendations": ["recommandation concrète 1", "recommandation concrète 2", "recommandation concrète 3"]
}`,
      },
      {
        role: "user",
        content: `Analyse ces posts et leurs stats :\n\n${corpus}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw) as Partial<PerformanceProfile>;

  return {
    summary: parsed.summary || "",
    hooks: parsed.hooks || "",
    topics: parsed.topics || "",
    structure: parsed.structure || "",
    avoid: parsed.avoid || "",
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
  };
}

/**
 * Build a system-prompt fragment from a stored insight JSON string.
 * Injected into generation so new posts lean into what already performs.
 */
export function buildPerformanceInstruction(
  insightJson: string | null | undefined,
  platform?: string
): string {
  if (!insightJson) return "";
  let p: PerformanceProfile;
  try {
    p = JSON.parse(insightJson) as PerformanceProfile;
  } catch {
    return "";
  }

  const parts: string[] = [
    `Données de performance réelles de cet auteur${platform ? ` sur ${platform}` : ""} (issues de ses posts publiés) — exploite-les :`,
  ];
  if (p.hooks) parts.push(`- Accroches qui marchent : ${p.hooks}`);
  if (p.topics) parts.push(`- Sujets qui résonnent : ${p.topics}`);
  if (p.structure) parts.push(`- Structures gagnantes : ${p.structure}`);
  if (p.avoid) parts.push(`- Patterns à éviter (posts qui floppent) : ${p.avoid}`);
  if (p.recommendations?.length)
    parts.push(`- Recommandations : ${p.recommendations.join(" / ")}`);
  parts.push(
    "Applique ces enseignements sans les mentionner explicitement dans le post."
  );
  return parts.join("\n");
}
