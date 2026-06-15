"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { CheckCircle2, Sparkles, Loader2, Crown, ArrowRight } from "lucide-react";

export default function SuccessContent() {
  const { getToken } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [retries, setRetries] = useState(0);
  const maxRetries = 8;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tryActivate() {
      for (let i = 0; i < maxRetries; i++) {
        if (cancelled) return;
        setRetries(i + 1);

        try {
          const token = await getToken();
          const res = await fetch("/api/stripe/verify-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (data.success) {
            setStatus("success");
            return;
          }

          console.log("Retry", i + 1, data);
        } catch (e) {
          console.error("Retry error", e);
        }

        await new Promise((r) => {
          timerRef.current = setTimeout(r, 2500);
        });
      }

      if (!cancelled) {
        setStatus("error");
      }
    }

    tryActivate();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [getToken]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Activation de votre compte Pro...
            </h1>
            <p className="text-muted text-sm">
              Vérification du paiement en cours.
            </p>
            {retries > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Tentative {retries}/{maxRetries}
              </p>
            )}
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm mb-4">
              <Crown className="w-3.5 h-3.5" />
              Compte Pro activé
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Paiement confirmé !
            </h1>
            <p className="text-muted mb-8">
              Générations illimitées débloquées. Profitez de ContentFlow Pro !
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-all shadow-md shadow-accent/20"
            >
              <Sparkles className="w-4 h-4" />
              Aller au dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Paiement reçu
            </h1>
            <p className="text-muted text-sm mb-6">
              Votre paiement Stripe est confirmé. Si l'activation automatique a échoué,
              utilisez le bouton dans votre menu utilisateur.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-all shadow-md shadow-accent/20"
            >
              <ArrowRight className="w-4 h-4" />
              Aller au dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
