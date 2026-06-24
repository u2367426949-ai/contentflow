"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "#0A66C2",
  twitter: "#1d9bf0",
  instagram: "#e1306c",
};

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  twitter: "Twitter / X",
  instagram: "Instagram",
};

export function DemoSection() {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");

  async function runDemo() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/demo");
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      } else {
        setError(data.error || "Erreur");
      }
    } catch {
      setError("Erreur réseau.");
    }
    setLoading(false);
  }

  return (
    <section className="py-20 px-4 border-t border-border bg-surface/20">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-accent mb-3">Démo live</p>
        <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">Essayez sans inscription</h2>
        <p className="text-muted mb-10 max-w-md mx-auto text-sm">
          Découvrez ContentFlow AI en un clic — pas de compte requis.
        </p>

        <div className="bg-card border border-border rounded-3xl p-6 text-left">
          {posts ? (
            <div className="space-y-3 animate-fade-in-up">
              {["linkedin", "twitter", "instagram"].map((platform) => (
                <div key={platform} className="p-5 rounded-2xl bg-background border border-border">
                  <div
                    className="text-xs font-bold mb-3 uppercase tracking-wider"
                    style={{ color: PLATFORM_COLORS[platform] }}
                  >
                    {PLATFORM_LABELS[platform]}
                  </div>
                  <p className="text-sm text-muted whitespace-pre-wrap leading-relaxed">{posts[platform]}</p>
                </div>
              ))}
              <button
                onClick={() => { setPosts(null); }}
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted hover:text-foreground hover:border-border-light transition-all"
              >
                Générer un autre exemple
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: "#f97316" }} />
              <p className="text-sm text-muted">L&apos;IA génère vos posts...</p>
            </div>
          ) : (
            <button
              onClick={runDemo}
              disabled={loading}
              className="w-full px-6 py-4 rounded-2xl font-bold text-base text-black shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)" }}
            >
              <Sparkles className="w-5 h-5" />
              Générer un exemple
            </button>
          )}

          {error && (
            <p className="mt-3 text-sm text-center" style={{ color: "#ef4444" }}>{error}</p>
          )}
        </div>
      </div>
    </section>
  );
}
