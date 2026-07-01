import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";
import { SeoLandingPage } from "@/components/SeoLandingPage";

const TITLE = "Alternative à Taplio moins chère et multi-plateforme — ContentFlow AI";
const DESCRIPTION =
  "ContentFlow AI est une alternative à Taplio à partir de 29€/mois (vs 65€/mois), multi-plateforme (LinkedIn, X, Instagram) avec clonage de style et boucle de performance IA.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/alternatives/taplio" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://contentflow-ai-node-ia.vercel.app/alternatives/taplio",
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
    question: "Qu'est-ce qui différencie ContentFlow AI de Taplio ?",
    answer:
      "Taplio est un outil LinkedIn-only à 65€/mois. ContentFlow AI démarre à 29€/mois, couvre LinkedIn, Twitter/X et Instagram depuis une seule source, et propose en plus une boucle de performance : l'IA apprend de vos statistiques d'engagement réelles pour optimiser vos prochains posts.",
  },
  {
    question: "ContentFlow AI clone-t-il mon style d'écriture comme Taplio ?",
    answer:
      "Oui. Collez 2 à 5 de vos meilleurs posts, l'IA extrait votre ton, votre structure et votre vocabulaire pour écrire de nouveaux posts dans votre style exact — disponible dès le plan Creator (29€/mois).",
  },
  {
    question: "Puis-je migrer facilement depuis Taplio ?",
    answer:
      "Il n'y a rien à migrer : créez un compte gratuit, collez vos meilleurs posts existants pour cloner votre style, et connectez votre compte LinkedIn pour l'auto-publication. Aucun engagement, annulation à tout moment.",
  },
  {
    question: "ContentFlow AI a-t-il un plan gratuit ?",
    answer:
      "Oui, 5 générations par mois gratuites sans carte bancaire, sur les trois plateformes. Taplio n'offre pas d'équivalent gratuit.",
  },
];

const COMPARISON = [
  { feature: "Prix d'entrée", taplio: "65€/mois", contentflow: "29€/mois" },
  { feature: "Plateformes", taplio: "LinkedIn uniquement", contentflow: "LinkedIn, X, Instagram" },
  { feature: "Clonage de style", taplio: true, contentflow: true },
  { feature: "Auto-publication", taplio: true, contentflow: true },
  { feature: "Boucle de performance IA", taplio: false, contentflow: true },
  { feature: "Plan gratuit", taplio: false, contentflow: true },
];

export default function AlternativeTaplioPage() {
  return (
    <SeoLandingPage
      kicker="Alternative à Taplio"
      title={
        <>
          L&apos;alternative à Taplio
          <br />
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #f97316 100%)" }}
          >
            multi-plateforme, moins chère
          </span>
        </>
      }
      subtitle="29€/mois vs 65€/mois. LinkedIn, X et Instagram au lieu de LinkedIn seul. Et une IA qui apprend de vos performances réelles."
      bullets={["2 mois offerts en annuel", "Sans engagement", "Plan gratuit disponible"]}
      faq={FAQ}
      ctaLabel="Essayer gratuitement"
    >
      {/* ─── Comparison table ─── */}
      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-accent mb-3 text-center">
            Comparatif
          </p>
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface">
                  <th className="text-left font-semibold text-muted-foreground p-4">Fonctionnalité</th>
                  <th className="text-center font-semibold text-muted-foreground p-4">Taplio</th>
                  <th className="text-center font-bold text-accent p-4">ContentFlow AI</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-card" : "bg-background"}>
                    <td className="p-4 text-foreground/90">{row.feature}</td>
                    <td className="p-4 text-center text-muted">
                      {typeof row.taplio === "boolean" ? (
                        row.taplio ? (
                          <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        row.taplio
                      )}
                    </td>
                    <td className="p-4 text-center font-medium text-foreground">
                      {typeof row.contentflow === "boolean" ? (
                        row.contentflow ? (
                          <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        row.contentflow
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Tarifs Taplio constatés publiquement en 2026, à titre indicatif.{" "}
            <Link href="/upgrade" className="text-accent hover:text-accent-hover">
              Voir les tarifs ContentFlow AI
            </Link>
          </p>
        </div>
      </section>
    </SeoLandingPage>
  );
}
