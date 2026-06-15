import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Mentions Légales — ContentFlow AI",
  description: "Mentions légales du service ContentFlow AI.",
  robots: { index: false, follow: false },
};

const LAST_UPDATED = "15 juin 2026";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Mentions Légales</h1>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Éditeur du site</h2>
            <div className="bg-card border border-border/50 rounded-xl p-5 space-y-2 text-sm text-muted">
              <p><strong className="text-foreground">Raison sociale :</strong> Node IA Studio</p>
              <p><strong className="text-foreground">Statut juridique :</strong> Auto-entrepreneur</p>
              <p><strong className="text-foreground">Adresse :</strong> Rouen, France</p>
              <p><strong className="text-foreground">Email :</strong> contact@node-ia.com</p>
              <p><strong className="text-foreground">Site web :</strong> https://node-ia.com</p>
              <p><strong className="text-foreground">Directeur de publication :</strong> Responsable Node IA Studio</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Hébergement</h2>
            <div className="bg-card border border-border/50 rounded-xl p-5 space-y-2 text-sm text-muted">
              <p><strong className="text-foreground">Hébergeur :</strong> Vercel Inc.</p>
              <p><strong className="text-foreground">Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
              <p><strong className="text-foreground">Site web :</strong> https://vercel.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Propriété intellectuelle</h2>
            <p className="text-sm text-muted leading-relaxed">
              L&apos;ensemble du contenu du site ContentFlow AI (textes, images, code source, design) est
              la propriété exclusive de Node IA Studio. Toute reproduction, même partielle, est interdite
              sans autorisation préalable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Données personnelles</h2>
            <p className="text-sm text-muted leading-relaxed">
              Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d&apos;un droit
              d&apos;accès, de rectification et de suppression de vos données. Pour toute demande,
              contactez contact@node-ia.com. Consultez notre{" "}
              <Link href="/politique-de-confidentialite" className="text-accent hover:text-accent-hover">
                Politique de Confidentialité
              </Link>.
            </p>
          </section>

          <p className="text-xs text-muted-foreground pt-4">
            Dernière mise à jour : {LAST_UPDATED}
          </p>
        </div>
      </div>
    </div>
  );
}
