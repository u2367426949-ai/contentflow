import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — ContentFlow AI",
  description: "Conditions Générales de Vente du service ContentFlow AI.",
  robots: { index: false, follow: false },
};

const LAST_UPDATED = "15 juin 2026";

export default function CGVPage() {
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
            <FileText className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Conditions Générales de Vente</h1>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Préambule</h2>
            <p className="text-sm text-muted leading-relaxed">
              Les présentes Conditions Générales de Vente (CGV) régissent la fourniture du service
              ContentFlow AI, édité par Node IA Studio, auto-entrepreneur basé à Rouen, France.
              Toute souscription à un abonnement implique l&apos;acceptation sans réserve des présentes CGV.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Description du service</h2>
            <p className="text-sm text-muted leading-relaxed">
              ContentFlow AI est un service SaaS de transformation de contenu : l&apos;utilisateur
              soumet une URL d&apos;article et l&apos;IA génère automatiquement des posts adaptés pour
              LinkedIn, Twitter/X et Instagram.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Abonnements et tarifs</h2>
            <div className="bg-card border border-border/50 rounded-xl p-5 space-y-3 text-sm text-muted">
              <div>
                <p><strong className="text-foreground">Plan Gratuit :</strong> 0€ — 3 générations par mois</p>
              </div>
              <div>
                <p><strong className="text-foreground">Plan Pro :</strong> 9,99€ TTC/mois — Générations illimitées</p>
                <p className="text-xs text-muted-foreground mt-1">TVA non applicable, art. 293 B du CGI</p>
              </div>
            </div>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              Les prix sont affichés en euros (€) et sont susceptibles d&apos;être modifiés. Les
              abonnés sont informés de tout changement de tarif au moins 30 jours avant son entrée
              en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Paiement</h2>
            <p className="text-sm text-muted leading-relaxed">
              Le paiement est effectué en ligne par carte bancaire via Stripe, prestataire de
              paiement certifié PCI-DSS. L&apos;abonnement Pro est facturé mensuellement et se
              renouvelle automatiquement jusqu&apos;à résiliation. Le client peut annuler à tout
              moment depuis son espace ou via le portail Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Droit de rétractation</h2>
            <p className="text-sm text-muted leading-relaxed">
              Conformément à l&apos;article L.221-28 du Code de la consommation, le droit de
              rétractation ne s&apos;applique pas aux services pleinement exécutés avant la fin du
              délai de rétractation. En souscrivant, le client renonce expressément à ce droit
              pour bénéficier immédiatement du service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Responsabilité</h2>
            <p className="text-sm text-muted leading-relaxed">
              ContentFlow AI s&apos;engage à fournir le service avec diligence, dans le cadre d&apos;une
              obligation de moyens. Node IA Studio ne peut être tenu responsable des contenus
              générés par l&apos;IA, qui doivent être relus et validés par l&apos;utilisateur avant
              publication. La responsabilité de Node IA Studio est limitée au montant total de
              l&apos;abonnement payé par le client sur les 12 derniers mois.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Résiliation</h2>
            <p className="text-sm text-muted leading-relaxed">
              L&apos;abonnement Pro peut être résilié à tout moment par le client via le portail Stripe
              accessible depuis le menu utilisateur. La résiliation prend effet à la fin de la
              période de facturation en cours. Aucun remboursement n&apos;est dû pour la période en cours.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Droit applicable</h2>
            <p className="text-sm text-muted leading-relaxed">
              Les présentes CGV sont soumises au droit français. En cas de litige, les parties
              s&apos;efforceront de trouver une solution amiable. À défaut, les tribunaux compétents
              seront ceux du ressort de Rouen.
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
