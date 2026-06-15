"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Star,
  Zap,
  Infinity,
  MessageSquare,
  ArrowLeft,
  Shield,
  Crown,
  Loader2,
} from "lucide-react";

const FEATURES = [
  {
    icon: <Infinity className="w-5 h-5" />,
    title: "Générations illimitées",
    desc: "Plus de limite mensuelle. Générez autant de posts que vous voulez.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Tous les formats",
    desc: "LinkedIn, Twitter, Instagram et bientôt plus de plateformes.",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Personnalisation du ton",
    desc: "Choisissez le ton : professionnel, décontracté, humoristique, inspirant.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Support prioritaire",
    desc: "Une question ? Notre équipe vous répond en moins de 2h.",
  },
];

export default function UpgradePage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!isSignedIn) {
      router.push("/sign-up");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur: " + (data.error || "Impossible de créer la session"));
      }
    } catch (err) {
      alert("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm mb-6">
            <Crown className="w-3.5 h-3.5" />
            <span>Passer en Pro</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Débloquez tout le potentiel
          </h1>
          <p className="text-muted max-w-xl mx-auto text-base md:text-lg">
            Vous avez utilisé vos 3 générations gratuites ce mois-ci. Passez en
            Pro pour continuer à créer du contenu sans limite.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto mb-16">
          <div className="relative p-8 rounded-2xl bg-card border-2 border-accent/30 shadow-xl shadow-accent/5">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-white text-sm font-medium flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> Recommandé
            </div>

            <div className="text-center mb-8 pt-2">
              <div className="text-sm font-medium text-muted mb-1">Plan Pro</div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-foreground">9,99 €</span>
                <span className="text-muted">/mois</span>
              </div>
              <p className="text-xs text-muted mt-2">Sans engagement, annulez à tout moment</p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Générations illimitées",
                "Tous les formats sociaux",
                "Personnalisation du ton",
                "Historique illimité",
                "Support prioritaire",
                "Sans publicité",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-muted">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="block w-full text-center py-3.5 rounded-xl bg-accent text-white font-semibold text-base hover:bg-accent-hover transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirection...
                </span>
              ) : (
                isSignedIn ? "Passer en Pro" : "Créer un compte"
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Paiement sécurisé • Sans engagement
            </p>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-xl bg-card border border-border/50 hover:border-border transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-3 text-accent">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
