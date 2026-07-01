"use client";

import { useState } from "react";
import { X, Zap, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { PLANS } from "@/lib/plans";

interface QuotaPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  used: number;
  limit: number;
}

const CREATOR_FEATURES = [
  "Générations illimitées",
  "Clonage de votre style d'écriture",
  "Auto-publication LinkedIn",
  "Programmation de posts",
];

/**
 * Rich paywall shown the moment a free-plan user hits their monthly quota —
 * the highest-intent moment to convert, so it goes straight to checkout
 * instead of a plain error message.
 */
export function QuotaPaywallModal({ isOpen, onClose, used, limit }: QuotaPaywallModalProps) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleUpgrade() {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan: "creator" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
    } catch {
      /* fall through to close */
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">Quota gratuit atteint</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-sm text-muted">
            Vous avez utilisé vos {used}/{limit} générations gratuites ce
            mois-ci. Passez à Creator pour continuer à publier sans limite.
          </p>

          <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-bold text-foreground">{PLANS.creator.price}€</span>
              <span className="text-sm text-muted">/mois</span>
            </div>
            <ul className="space-y-2">
              {CREATOR_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground text-sm font-medium hover:bg-surface-hover transition-colors"
            >
              Plus tard
            </button>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Passer à Creator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
