import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";

const TITLE = "Générateur de post LinkedIn IA gratuit — ContentFlow AI";
const DESCRIPTION =
  "Générez des posts LinkedIn professionnels en 10 secondes à partir d'un article, d'une vidéo YouTube ou d'un texte. Clonage de votre style d'écriture, gratuit jusqu'à 5 posts/mois.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/outils/generateur-post-linkedin" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://contentflow-ai-node-ia.vercel.app/outils/generateur-post-linkedin",
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
    question: "Comment fonctionne le générateur de post LinkedIn ?",
    answer:
      "Collez l'URL d'un article, d'une vidéo YouTube ou collez directement votre texte. L'IA extrait les points clés et rédige un post LinkedIn de 250 à 300 mots, structuré avec une accroche, des paragraphes courts et une question finale pour maximiser l'engagement.",
  },
  {
    question: "Le générateur peut-il écrire dans mon propre style ?",
    answer:
      "Oui. Avec le clonage de style (plan Creator et supérieur), collez 2 à 5 de vos meilleurs posts LinkedIn : l'IA analyse votre ton, votre vocabulaire et votre structure pour écrire de nouveaux posts indiscernables des vôtres — pas un ton générique.",
  },
  {
    question: "Est-ce gratuit ?",
    answer:
      "Oui, 5 générations par mois sont gratuites sans carte bancaire. Pour publier automatiquement sur LinkedIn, programmer vos posts ou cloner votre style, les plans payants démarrent à 29€/mois.",
  },
  {
    question: "Puis-je publier directement depuis l'outil ?",
    answer:
      "Oui, en connectant votre compte LinkedIn (OAuth officiel), vos posts programmés sont publiés automatiquement à l'heure choisie — pas besoin de copier-coller.",
  },
];

export default function GenerateurPostLinkedInPage() {
  return (
    <SeoLandingPage
      kicker="Générateur de post LinkedIn IA"
      title={
        <>
          Générez des posts LinkedIn
          <br />
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #f97316 100%)" }}
          >
            qui vous ressemblent
          </span>
        </>
      }
      subtitle="Collez un article ou une vidéo, obtenez un post LinkedIn prêt à publier en 10 secondes — dans votre style, pas un ton générique."
      bullets={["5 posts/mois gratuits", "Clonage de style", "Auto-publication LinkedIn"]}
      faq={FAQ}
    />
  );
}
