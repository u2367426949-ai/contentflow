import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de Confidentialité — ContentFlow AI",
  description: "Comment ContentFlow AI collecte, utilise et protège vos données personnelles.",
  robots: { index: false, follow: false },
};

const LAST_UPDATED = "15 juin 2026";

export default function PolitiqueConfidentialitePage() {
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
            <Lock className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Politique de Confidentialité</h1>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Données collectées</h2>
            <p className="text-sm text-muted leading-relaxed">
              ContentFlow AI collecte uniquement les données nécessaires au fonctionnement du service :
              adresse email (via Clerk), URLs d&apos;articles soumises, contenus générés par l&apos;IA,
              et informations de paiement (gérées exclusivement par Stripe).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Finalité du traitement</h2>
            <p className="text-sm text-muted leading-relaxed">
              Vos données sont utilisées exclusivement pour : fournir le service de génération de
              contenu, gérer votre compte et abonnement, améliorer le service, et vous informer des
              mises à jour importantes. Aucune donnée n&apos;est revendue à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Base légale</h2>
            <p className="text-sm text-muted leading-relaxed">
              Le traitement de vos données repose sur : l&apos;exécution du contrat (fourniture du
              service), votre consentement (cookies, communications marketing), et l&apos;intérêt
              légitime (amélioration du service, sécurité).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Durée de conservation</h2>
            <p className="text-sm text-muted leading-relaxed">
              Les données de votre compte sont conservées tant que votre compte est actif. Les
              projets et contenus générés sont supprimés dans les 30 jours suivant la suppression
              de votre compte. Les données de paiement sont gérées par Stripe selon leur propre
              politique de rétention.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Vos droits</h2>
            <div className="bg-card border border-border/50 rounded-xl p-5 space-y-2 text-sm text-muted">
              <p>• <strong className="text-foreground">Accès :</strong> consulter vos données à tout moment</p>
              <p>• <strong className="text-foreground">Rectification :</strong> corriger des données inexactes</p>
              <p>• <strong className="text-foreground">Suppression :</strong> demander l&apos;effacement de vos données</p>
              <p>• <strong className="text-foreground">Portabilité :</strong> récupérer vos données dans un format structuré</p>
              <p>• <strong className="text-foreground">Opposition :</strong> vous opposer au traitement de vos données</p>
            </div>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              Pour exercer ces droits, contactez-nous à{" "}
              <a href="mailto:contact@node-ia.com" className="text-accent hover:text-accent-hover">
                contact@node-ia.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Cookies</h2>
            <p className="text-sm text-muted leading-relaxed">
              ContentFlow AI utilise des cookies essentiels pour l&apos;authentification (Clerk) et
              le fonctionnement du service. Aucun cookie de tracking publicitaire n&apos;est utilisé.
              Vous pouvez configurer vos préférences de cookies via la bannière affichée lors de
              votre première visite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Sécurité</h2>
            <p className="text-sm text-muted leading-relaxed">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
              protéger vos données : chiffrement en transit (HTTPS), authentification sécurisée
              (Clerk), base de données chiffrée (Neon PostgreSQL).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Contact DPO</h2>
            <p className="text-sm text-muted leading-relaxed">
              Pour toute question relative à la protection de vos données, contactez le responsable
              de traitement : Node IA Studio — contact@node-ia.com — Rouen, France.
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
