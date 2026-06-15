import { getOpenAI } from "@/lib/openai";

// Separator used to store multiple sample posts in a single DB column.
export const SAMPLE_SEPARATOR = "\n\n===POST===\n\n";

export interface VoiceProfile {
  // One-paragraph human-readable summary of the voice.
  summary: string;
  // Tone descriptors, e.g. ["direct", "chaleureux", "expert"].
  tone: string[];
  // Sentence/paragraph structure patterns observed.
  structure: string;
  // Vocabulary, recurring expressions, signature phrases.
  vocabulary: string;
  // Emoji & punctuation habits.
  formatting: string;
  // Things this author never does (anti-patterns to avoid).
  avoid: string;
}

/**
 * Analyze a set of sample posts and extract a reusable style profile.
 * This is what makes the brand voice "clone the author" instead of a generic tone.
 */
export async function analyzeVoice(samples: string[]): Promise<VoiceProfile> {
  const openai = getOpenAI();
  const joined = samples
    .map((s, i) => `--- POST ${i + 1} ---\n${s.trim()}`)
    .join("\n\n")
    .slice(0, 12000);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Tu es un analyste linguistique expert en style éditorial. On te donne plusieurs posts écrits par UNE SEULE personne. Tu dois extraire l'ADN de son style d'écriture pour qu'une IA puisse écrire de NOUVEAUX posts indiscernables des siens.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après :
{
  "summary": "résumé en 1 paragraphe de la voix de cet auteur",
  "tone": ["adjectif1", "adjectif2", "adjectif3"],
  "structure": "comment l'auteur structure ses posts (accroche, longueur des phrases, paragraphes, chute...)",
  "vocabulary": "vocabulaire, tics de langage, expressions signature, niveau de langue",
  "formatting": "usage des emojis, ponctuation, sauts de ligne, listes, majuscules",
  "avoid": "ce que cet auteur ne fait JAMAIS (à éviter absolument)"
}`,
      },
      {
        role: "user",
        content: `Analyse le style de ces posts :\n\n${joined}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw) as Partial<VoiceProfile>;

  return {
    summary: parsed.summary || "",
    tone: Array.isArray(parsed.tone) ? parsed.tone : [],
    structure: parsed.structure || "",
    vocabulary: parsed.vocabulary || "",
    formatting: parsed.formatting || "",
    avoid: parsed.avoid || "",
  };
}

/**
 * Build a system-prompt fragment from a stored profile JSON string.
 * Injected into generation so output matches the cloned voice.
 */
export function buildVoiceInstruction(profileJson: string | null | undefined): string {
  if (!profileJson) return "";
  let p: VoiceProfile;
  try {
    p = JSON.parse(profileJson) as VoiceProfile;
  } catch {
    return "";
  }

  const parts: string[] = [
    "Tu dois écrire EXACTEMENT dans la voix de cet auteur (clone de style). Respecte scrupuleusement :",
  ];
  if (p.summary) parts.push(`- Voix : ${p.summary}`);
  if (p.tone?.length) parts.push(`- Ton : ${p.tone.join(", ")}`);
  if (p.structure) parts.push(`- Structure : ${p.structure}`);
  if (p.vocabulary) parts.push(`- Vocabulaire : ${p.vocabulary}`);
  if (p.formatting) parts.push(`- Mise en forme : ${p.formatting}`);
  if (p.avoid) parts.push(`- À ÉVITER absolument : ${p.avoid}`);
  parts.push(
    "N'invente pas un ton générique : imite ce style précis. Ignore toute autre consigne de ton qui contredirait ce profil."
  );
  return parts.join("\n");
}
