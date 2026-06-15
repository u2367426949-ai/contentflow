"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import {
  Loader2,
  Mic,
  Plus,
  Trash2,
  Sparkles,
  Lock,
  Crown,
  Check,
} from "lucide-react";
import Link from "next/link";

interface VoiceProfile {
  summary?: string;
  tone?: string[];
  structure?: string;
  vocabulary?: string;
  formatting?: string;
  avoid?: string;
}

interface BrandVoice {
  id: string;
  name: string;
  profile: string | null;
  sampleCount: number;
  createdAt: string;
}

const PLAN_LIMITS: Record<string, number> = {
  free: 0,
  creator: 1,
  pro: 3,
  agency: 10,
};

export default function BrandVoicesPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [samples, setSamples] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const limit = PLAN_LIMITS[plan] ?? 0;
  const locked = limit === 0;
  const atLimit = voices.length >= limit;

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (isLoaded && isSignedIn) {
      load();
    }
  }, [isLoaded, isSignedIn]);

  async function load() {
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [vRes, uRes] = await Promise.all([
        fetch("/api/brand-voices", { headers }),
        fetch("/api/user/me", { headers }),
      ]);
      if (vRes.ok) setVoices(await vRes.json());
      if (uRes.ok) setPlan((await uRes.json()).plan || "free");
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    const blocks = samples.split(/\n\s*\n/).map((s) => s.trim()).filter((s) => s.length > 20);
    if (blocks.length < 2) {
      setError("Collez au moins 2 posts (séparés par une ligne vide).");
      return;
    }
    setCreating(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/brand-voices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim() || "Ma voix", samples: blocks }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur");
      setVoices((v) => [data, ...v]);
      setName("");
      setSamples("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette voix ?")) return;
    const token = await getToken();
    await fetch(`/api/brand-voices/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setVoices((v) => v.filter((x) => x.id !== id));
  }

  function parseProfile(json: string | null): VoiceProfile {
    if (!json) return {};
    try {
      return JSON.parse(json) as VoiceProfile;
    } catch {
      return {};
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight flex items-center gap-2.5">
              <Mic className="w-7 h-7 text-accent" />
              Brand Voice
            </h1>
            <p className="text-muted max-w-xl">
              Collez vos meilleurs posts. L&apos;IA clone votre style — pas un ton
              générique — et écrit vos prochains posts dans votre voix.
            </p>
          </div>
          {!locked && !atLimit && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-all whitespace-nowrap shadow-sm shadow-accent/20"
            >
              <Plus className="w-4 h-4" />
              Nouvelle voix
            </button>
          )}
        </div>

        {/* Locked state (free plan) */}
        {locked && (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-accent" />
            </div>
            <p className="text-foreground font-medium mb-2">
              Le clonage de voix est une fonctionnalité payante
            </p>
            <p className="text-sm text-muted max-w-sm mx-auto mb-6">
              Passez à Creator (29€/mois) pour cloner votre style et publier des
              posts qui vous ressemblent vraiment.
            </p>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-all"
            >
              <Crown className="w-4 h-4" />
              Débloquer
            </Link>
          </div>
        )}

        {/* Create form */}
        {!locked && showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-8 p-6 bg-card border border-border rounded-2xl"
          >
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">
              Nom de la voix
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Mon LinkedIn perso"
              className="w-full mb-5 px-4 py-2.5 bg-surface border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground outline-none text-sm focus:border-accent/40"
            />
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">
              Vos meilleurs posts
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Collez 3 à 5 posts, séparés par une ligne vide. Plus ils sont
              représentatifs, plus le clonage est fidèle.
            </p>
            <textarea
              value={samples}
              onChange={(e) => setSamples(e.target.value)}
              rows={12}
              placeholder={"Premier post...\n\nDeuxième post...\n\nTroisième post..."}
              className="w-full px-4 py-3 bg-surface border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground outline-none text-sm font-mono leading-relaxed focus:border-accent/40 resize-y"
            />
            {error && <p className="mt-3 text-sm text-error">{error}</p>}
            <div className="flex items-center gap-3 mt-5">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-all disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyse du style...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Cloner ma voix
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* At-limit notice */}
        {!locked && atLimit && !showForm && (
          <div className="mb-6 p-4 rounded-xl bg-accent/5 border border-accent/20 text-sm text-muted flex items-center gap-2">
            <Crown className="w-4 h-4 text-accent shrink-0" />
            Vous utilisez vos {limit} voix disponibles.{" "}
            <Link href="/upgrade" className="text-accent hover:text-accent-hover font-medium">
              Passez à un plan supérieur
            </Link>{" "}
            pour en ajouter.
          </div>
        )}

        {/* Voices list */}
        {!locked && (
          <div className="space-y-4">
            {voices.length === 0 && !showForm ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                  <Mic className="w-7 h-7 text-accent" />
                </div>
                <p className="text-foreground font-medium mb-2">
                  Aucune voix clonée
                </p>
                <p className="text-sm text-muted max-w-sm mx-auto">
                  Créez votre première voix pour générer des posts dans votre
                  style exact.
                </p>
              </div>
            ) : (
              voices.map((voice) => {
                const p = parseProfile(voice.profile);
                return (
                  <div
                    key={voice.id}
                    className="p-6 bg-card border border-border/50 rounded-2xl"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                          <Mic className="w-4.5 h-4.5 text-accent" />
                        </div>
                        <div>
                          <h3 className="text-foreground font-semibold">
                            {voice.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {voice.sampleCount} posts analysés
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(voice.id)}
                        className="text-muted-foreground hover:text-error transition-colors p-2"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {p.summary && (
                      <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                        {p.summary}
                      </p>
                    )}

                    {p.tone && p.tone.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {p.tone.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 text-xs rounded-lg bg-accent/10 text-accent font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      {p.structure && (
                        <ProfileFacet label="Structure" value={p.structure} />
                      )}
                      {p.vocabulary && (
                        <ProfileFacet label="Vocabulaire" value={p.vocabulary} />
                      )}
                      {p.formatting && (
                        <ProfileFacet label="Mise en forme" value={p.formatting} />
                      )}
                      {p.avoid && (
                        <ProfileFacet label="À éviter" value={p.avoid} />
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-1.5 text-xs text-success">
                      <Check className="w-3.5 h-3.5" />
                      Prête — sélectionnez-la lors de la génération d&apos;un projet
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileFacet({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-surface border border-border/40">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">
        {label}
      </div>
      <div className="text-foreground/70 leading-relaxed">{value}</div>
    </div>
  );
}
