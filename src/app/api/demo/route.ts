import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export const runtime = "nodejs";

const DEMO_ARTICLE = `
L'intelligence artificielle transforme radicalement le paysage du marketing digital en 2026.
Les entreprises qui adoptent l'IA constatent une augmentation moyenne de 40% de leur productivité
et une réduction de 60% du temps consacré à la création de contenu. Les outils de génération
automatique permettent désormais de produire des posts optimisés pour chaque plateforme sociale
en quelques secondes plutôt qu'en plusieurs heures.
`;

function extractText(val: unknown): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    return String(obj.post || obj.caption || obj.content || obj.text || JSON.stringify(val));
  }
  return String(val || "");
}

export async function GET(req: NextRequest) {
  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert marketing. Génère 3 posts réseaux sociaux pour cet article. Format JSON STRICT avec 3 clés: linkedin (string), twitter (string), instagram (string). Chaque valeur doit être une string, pas un objet. Pas de markdown, pas de texte hors JSON.",
        },
        { role: "user", content: DEMO_ARTICLE },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);

    return NextResponse.json({
      success: true,
      posts: {
        linkedin: extractText(parsed.linkedin),
        twitter: extractText(parsed.twitter),
        instagram: extractText(parsed.instagram),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
