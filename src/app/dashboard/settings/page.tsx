"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import {
  Loader2,
  Share2,
  PlugZap,
  Unplug,
  Lock,
  Crown,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { getPlan } from "@/lib/plans";

interface ConnectionStatus {
  connected: boolean;
  name?: string;
  expiresAt?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [plan, setPlan] = useState<string>("free");
  const [linkedin, setLinkedin] = useState<ConnectionStatus>({ connected: false });
  const [twitter, setTwitter] = useState<ConnectionStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [disconnectingTwitter, setDisconnectingTwitter] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const autoPublish = getPlan(plan).autoPublish;

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (isLoaded && isSignedIn) {
      load();
    }
    const params = new URLSearchParams(window.location.search);
    const linkedinParam = params.get("linkedin");
    const twitterParam = params.get("twitter");
    if (linkedinParam === "connected") {
      setNotice({ type: "success", message: "Compte LinkedIn connecté avec succès." });
    } else if (linkedinParam === "error") {
      setNotice({
        type: "error",
        message: params.get("message") || "La connexion à LinkedIn a échoué.",
      });
    } else if (twitterParam === "connected") {
      setNotice({ type: "success", message: "Compte X connecté avec succès." });
    } else if (twitterParam === "error") {
      setNotice({
        type: "error",
        message: params.get("message") || "La connexion à X a échoué.",
      });
    }
    if (linkedinParam || twitterParam) {
      window.history.replaceState({}, "", "/dashboard/settings");
    }
  }, [isLoaded, isSignedIn]);

  async function load() {
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [uRes, sRes] = await Promise.all([
        fetch("/api/user/me", { headers }),
        fetch("/api/social-accounts", { headers }),
      ]);
      if (uRes.ok) setPlan((await uRes.json()).plan || "free");
      if (sRes.ok) {
        const data = await sRes.json();
        setLinkedin(data.linkedin || { connected: false });
        setTwitter(data.twitter || { connected: false });
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Déconnecter votre compte LinkedIn ?")) return;
    setDisconnecting(true);
    try {
      const token = await getToken();
      await fetch("/api/auth/linkedin/disconnect", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setLinkedin({ connected: false });
    } finally {
      setDisconnecting(false);
    }
  }

  async function handleDisconnectTwitter() {
    if (!confirm("Déconnecter votre compte X ?")) return;
    setDisconnectingTwitter(true);
    try {
      const token = await getToken();
      await fetch("/api/auth/twitter/disconnect", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTwitter({ connected: false });
    } finally {
      setDisconnectingTwitter(false);
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight flex items-center gap-2.5">
            <Share2 className="w-7 h-7 text-accent" />
            Connexions
          </h1>
          <p className="text-muted max-w-xl">
            Connectez vos réseaux sociaux pour que ContentFlow publie vos posts
            programmés automatiquement.
          </p>
        </div>

        {notice && (
          <div
            className={`mb-6 p-4 rounded-xl border text-sm flex items-center gap-2 ${
              notice.type === "success"
                ? "bg-success/5 border-success/20 text-success"
                : "bg-error/5 border-error/20 text-error"
            }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            {notice.message}
          </div>
        )}

        {!autoPublish ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-accent" />
            </div>
            <p className="text-foreground font-medium mb-2">
              La publication automatique est une fonctionnalité payante
            </p>
            <p className="text-sm text-muted max-w-sm mx-auto mb-6">
              Passez à Creator (29€/mois) pour connecter LinkedIn et publier vos
              posts programmés automatiquement.
            </p>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-all"
            >
              <Crown className="w-4 h-4" />
              Débloquer
            </Link>
          </div>
        ) : (
          <div className="p-6 bg-card border border-border/50 rounded-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center">
                  <span className="text-[#0A66C2] font-bold text-lg">in</span>
                </div>
                <div>
                  <h3 className="text-foreground font-semibold">LinkedIn</h3>
                  {linkedin.connected ? (
                    <p className="text-xs text-success flex items-center gap-1 mt-0.5">
                      <PlugZap className="w-3 h-3" />
                      Connecté{linkedin.name ? ` — ${linkedin.name}` : ""}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">Non connecté</p>
                  )}
                </div>
              </div>
              {linkedin.connected ? (
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground text-sm font-medium hover:bg-surface-hover transition-all disabled:opacity-50"
                >
                  {disconnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Unplug className="w-4 h-4" />
                  )}
                  Déconnecter
                </button>
              ) : (
                <a
                  href="/api/auth/linkedin/start"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-all whitespace-nowrap shadow-sm shadow-accent/20"
                >
                  <PlugZap className="w-4 h-4" />
                  Connecter LinkedIn
                </a>
              )}
            </div>

            {linkedin.connected && (
              <p className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground leading-relaxed">
                Vos posts LinkedIn programmés seront publiés automatiquement à
                l&apos;heure prévue. Si votre session expire, reconnectez votre
                compte ici.
              </p>
            )}
          </div>
        )}

        {autoPublish && (
          <div className="mt-4 p-6 bg-card border border-border/50 rounded-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-sky-400/10 flex items-center justify-center">
                  <span className="text-sky-400 font-bold text-lg">X</span>
                </div>
                <div>
                  <h3 className="text-foreground font-semibold">Twitter / X</h3>
                  {twitter.connected ? (
                    <p className="text-xs text-success flex items-center gap-1 mt-0.5">
                      <PlugZap className="w-3 h-3" />
                      Connecté{twitter.name ? ` — ${twitter.name}` : ""}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">Non connecté</p>
                  )}
                </div>
              </div>
              {twitter.connected ? (
                <button
                  onClick={handleDisconnectTwitter}
                  disabled={disconnectingTwitter}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground text-sm font-medium hover:bg-surface-hover transition-all disabled:opacity-50"
                >
                  {disconnectingTwitter ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Unplug className="w-4 h-4" />
                  )}
                  Déconnecter
                </button>
              ) : (
                <a
                  href="/api/auth/twitter/start"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-all whitespace-nowrap shadow-sm shadow-accent/20"
                >
                  <PlugZap className="w-4 h-4" />
                  Connecter X
                </a>
              )}
            </div>

            {twitter.connected && (
              <p className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground leading-relaxed">
                Vos posts X programmés seront publiés automatiquement à
                l&apos;heure prévue. Si votre session expire, reconnectez votre
                compte ici.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
