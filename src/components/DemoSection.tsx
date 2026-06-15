"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

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
    <section className="py-16 px-4 border-t border-border/50 bg-surface/20">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Essayez sans inscription</h2>
        <p className="text-muted mb-8">
          Découvrez la puissance de ContentFlow AI en un clic, sans créer de compte.
        </p>

        <div className="bg-card border border-border rounded-2xl p-6 text-left">
          {posts ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-surface/50 border border-border/30">
                <div className="text-xs font-semibold text-[#0A66C2] mb-2">LinkedIn</div>
                <p className="text-sm text-muted whitespace-pre-wrap">{posts.linkedin}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface/50 border border-border/30">
                <div className="text-xs font-semibold text-sky-400 mb-2">Twitter / X</div>
                <p className="text-sm text-muted whitespace-pre-wrap">{posts.twitter}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface/50 border border-border/30">
                <div className="text-xs font-semibold text-pink-500 mb-2">Instagram</div>
                <p className="text-sm text-muted whitespace-pre-wrap">{posts.instagram}</p>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted">L&apos;IA génère vos posts...</p>
            </div>
          ) : (
            <button
              onClick={runDemo}
              disabled={loading}
              className="w-full px-6 py-4 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-all shadow-md shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Générer un exemple
            </button>
          )}

          {error && (
            <p className="mt-3 text-sm text-error text-center">{error}</p>
          )}
        </div>
      </div>
    </section>
  );
}
