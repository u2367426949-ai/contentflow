"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Star,
  ArrowLeft,
  Crown,
  Loader2,
  Mic,
} from "lucide-react";
import { PLANS, type PaidPlan } from "@/lib/plans";

interface Tier {
  id: PaidPlan;
  highlight?: boolean;
  tagline: string;
  features: string[];
}

const TIERS: Tier[] = [
  {
    id: "creator",
    tagline: "Pour créateurs qui publient sur LinkedIn",
    features: [
      "Générations illimitées",
      "1 voix de marque (clonage de style)",
      "Auto-publication LinkedIn",
      "Programmation de posts",
      "Sources multiples : URL, YouTube, RSS, texte",
    ],
  },
  {
    id: "pro",
    highlight: true,
    tagline: "Pour les pros multi-plateformes",
    features: [
      "Tout Creator, plus :",
      "Multi-plateforme : LinkedIn, X, Instagram",
      "3 voix de marque",
      "Analytics & boucle de performance",
      "Support prioritaire",
    ],
  },
  {
    id: "agency",
    tagline: "Pour agences et multi-clients",
    features: [
      "Tout Pro, plus :",
      "10 voix de marque",
      "Gestion multi-clients",
      "White label",
      "Support dédié",
    ],
  },
];

export default function UpgradePage() {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<PaidPlan | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("free");

  useEffect(() => {
    if (!isSignedIn) return;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setCurrentPlan((await res.json()).plan || "free");
      } catch {
        /* ignore */
      }
    })();
  }, [isSignedIn, getToken]);

  async function handleCheckout(plan: PaidPlan) {
    setLoadingPlan(plan);
    try {
      const token = await getToken();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur: " + (data.error || "Impossible de créer la session"));
      }
    } catch {
      alert("Erreur de connexion");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm mb-6">
            <Mic className="w-3.5 h-3.5" />
            <span>Le cerveau éditorial qui apprend votre voix</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Choisissez votre plan
          </h1>
          <p className="text-muted max-w-xl mx-auto text-base md:text-lg">
            Clonez votre style, publiez automatiquement sur LinkedIn et analysez
            vos performances. Sans engagement, annulez à tout moment.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 items-stretch">
          {TIERS.map((tier) => {
            const config = PLANS[tier.id];
            const isCurrent = currentPlan === tier.id;
            return (
              <div
                key={tier.id}
                className={`relative p-8 rounded-2xl bg-card border-2 flex flex-col ${
                  tier.highlight
                    ? "border-accent/30 shadow-xl shadow-accent/5"
                    : "border-border"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-white text-sm font-medium flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" /> Recommandé
                  </div>
                )}

                <div className="text-center mb-6 pt-2">
                  <div className="text-sm font-medium text-muted mb-1">
                    {config.name}
                  </div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {config.price} €
                    </span>
                    <span className="text-muted">/mois</span>
                  </div>
                  <p className="text-xs text-muted mt-2">{tier.tagline}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-2.5 text-sm ${
                        f.endsWith(":") ? "text-foreground font-medium" : "text-muted"
                      }`}
                    >
                      {!f.endsWith(":") && (
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      )}
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(tier.id)}
                  disabled={loadingPlan !== null || isCurrent}
                  className={`block w-full text-center py-3.5 rounded-xl font-semibold text-base transition-all disabled:opacity-50 ${
                    tier.highlight
                      ? "bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20"
                      : "bg-surface text-foreground hover:bg-surface-hover border border-border"
                  }`}
                >
                  {isCurrent ? (
                    "Plan actuel"
                  ) : loadingPlan === tier.id ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Redirection...
                    </span>
                  ) : isSignedIn ? (
                    `Choisir ${config.name}`
                  ) : (
                    "Créer un compte"
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Free plan note */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border/50 text-sm text-muted">
            <Sparkles className="w-4 h-4 text-accent" />
            Plan Free : {PLANS.free.genQuota} générations/mois, publication
            manuelle, sans voix de marque.
          </div>
        </div>

        {/* Why it's better */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/5 text-accent text-xs font-medium">
            <Crown className="w-3.5 h-3.5" />
            Taplio et AuthoredUp sont à 65€/mois, LinkedIn uniquement. Creator
            démarre à 29€, multi-plateforme + clonage de voix.
          </div>
        </div>
      </div>
    </div>
  );
}
