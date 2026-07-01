import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";

const TITLE = "Générateur de post Twitter / X IA gratuit — ContentFlow AI";
const DESCRIPTION =
  "Générez des posts Twitter/X percutants en 10 secondes à partir d'un article ou d'une vidéo. Format optimisé 280 caractères, hashtags pertinents, auto-publication. Gratuit jusqu'à 5 posts/mois.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/outils/generateur-post-twitter" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://contentflow-ai-node-ia.vercel.app/outils/generateur-post-twitter",
    siteName: "ContentFlow AI",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const FAQ = [
  {
    question: "Comment générer un post Twitter/X avec l'IA ?",
    answer:
      "Collez l'URL d'un article, d'une vidéo YouTube ou votre texte. L'IA condense le contenu en un post de 280 caractères maximum, percutant, avec 2 à 3 hashtags pertinents — prêt à copier-coller ou publier automatiquement.",
  },
  {
    question: "L'outil publie-t-il directement sur X ?",
    answer:
      "Oui. En connectant votre compte X (OAuth 2.0 officiel), vos posts programmés sont publiés automatiquement à l'heure choisie via le plan Creator ou supérieur.",
  },
  {
    question: "Puis-je aussi générer pour LinkedIn et Instagram en même temps ?",
    answer:
      "Oui, chaque génération produit un post adapté à LinkedIn, Twitter/X et Instagram simultanément, à partir de la même source — un seul article devient trois posts adaptés au format et au ton de chaque plateforme.",
  },
  {
    question: "Combien coûte le générateur de posts Twitter ?",
    answer:
      "5 générations par mois sont gratuites, sans carte bancaire. Pour des générations illimitées, la programmation et l'auto-publication, les plans démarrent à 29€/mois — contre 65€/mois chez les outils LinkedIn-only comme Taplio.",
  },
];

export default function GenerateurPostTwitterPage() {
  return (
    <SeoLandingPage
      kicker="Générateur de post Twitter / X IA"
      title={
        <>
          Des posts X percutants
          <br />
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #f97316 100%)" }}
          >
            en 10 secondes
          </span>
        </>
      }
      subtitle="Collez un article ou une vidéo, obtenez un post Twitter/X optimisé — 280 caractères, hashtags pertinents, prêt à publier."
      bullets={["5 posts/mois gratuits", "Format 280 caractères", "Auto-publication X"]}
      faq={FAQ}
    />
  );
}
