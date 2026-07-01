"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Loader2,
  Lock,
  Crown,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  Check,
  Save,
} from "lucide-react";

interface PerformanceProfile {
  summary?: string;
  hooks?: string;
  topics?: string;
  structure?: string;
  avoid?: string;
  recommendations?: string[];
}

interface Insight {
  id: string;
  platform: string;
  insight: string;
  postCount: number;
  updatedAt: string;
}

interface Post {
  id: string;
  platform: string;
  content: string;
  publishedAt: string | null;
  externalId: string | null;
  impressions: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  metricsAt: string | null;
}

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  twitter: "Twitter / X",
  instagram: "Instagram",
};
const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "text-[#0A66C2] bg-[#0A66C2]/10",
  twitter: "text-sky-400 bg-sky-400/10",
  instagram: "text-pink-500 bg-pink-500/10",
};

const MIN_MEASURED_POSTS = 3;

export default function AnalyticsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshWarning, setRefreshWarning] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch("/api/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 402) {
        setLocked(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        setInsights(data.insights || []);
        setTwitterConnected(Boolean(data.twitterConnected));
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (isLoaded && isSignedIn) {
      load();
    }
  }, [isLoaded, isSignedIn, load, router]);

  async function handleRefresh() {
    setRefreshing(true);
    setRefreshWarning(null);
    try {
      const token = await getToken();
      const res = await fetch("/api/analytics/refresh", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.twitterError) {
        setRefreshWarning("Stats X indisponibles pour le moment — saisis-les manuellement ci-dessous.");
      }
      await load();
    } catch {
      /* silent */
    } finally {
      setRefreshing(false);
    }
  }

  function parseInsight(json: string): PerformanceProfile {
    try {
      return JSON.parse(json) as PerformanceProfile;
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

  if (locked) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold text-foreground">Performance</h1>
          </div>
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-accent" />
            </div>
            <p className="text-foreground font-medium mb-2">
              La boucle de performance est réservée au plan Pro
            </p>
            <p className="text-sm text-muted max-w-sm mx-auto mb-6">
              Passez à Pro (79€/mois) pour que l&apos;IA apprenne de tes stats
              réelles et optimise tes prochains posts en conséquence.
            </p>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-all"
            >
              <Crown className="w-4 h-4" />
              Débloquer
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const measuredCount = posts.filter((p) => p.metricsAt).length;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight flex items-center gap-2.5">
              <BarChart3 className="w-7 h-7 text-accent" />
              Performance
            </h1>
            <p className="text-muted max-w-xl">
              Renseigne les stats de tes posts publiés. L&apos;IA apprend ce qui
              marche pour toi et l&apos;applique à tes prochains posts.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-all whitespace-nowrap shadow-sm shadow-accent/20 disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Actualiser
          </button>
        </div>

        {refreshWarning && (
          <div className="mb-6 p-4 rounded-xl bg-accent/5 border border-accent/20 text-sm text-muted flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent shrink-0" />
            {refreshWarning}
          </div>
        )}

        {!twitterConnected && posts.some((p) => p.platform === "twitter") && (
          <div className="mb-6 p-4 rounded-xl bg-accent/5 border border-accent/20 text-sm text-muted flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent shrink-0" />
            Connecte ton compte X pour récupérer tes stats automatiquement.{" "}
            <Link href="/dashboard/settings" className="text-accent hover:text-accent-hover font-medium">
              Connecter X
            </Link>
          </div>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <div className="space-y-4 mb-10">
            {insights.map((insight) => {
              const p = parseInsight(insight.insight);
              return (
                <div
                  key={insight.id}
                  className="p-6 bg-card border border-border/50 rounded-2xl"
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Lightbulb className="w-4.5 h-4.5 text-accent" />
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${PLATFORM_COLORS[insight.platform] || "text-muted bg-surface"}`}
                      >
                        {PLATFORM_LABELS[insight.platform] || insight.platform}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Calculé sur {insight.postCount} post{insight.postCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {p.summary && (
                    <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                      {p.summary}
                    </p>
                  )}

                  <div className="grid sm:grid-cols-2 gap-3 text-xs mb-4">
                    {p.hooks && <ProfileFacet label="Accroches" value={p.hooks} />}
                    {p.topics && <ProfileFacet label="Sujets" value={p.topics} />}
                    {p.structure && <ProfileFacet label="Structure" value={p.structure} />}
                    {p.avoid && <ProfileFacet label="À éviter" value={p.avoid} />}
                  </div>

                  {p.recommendations && p.recommendations.length > 0 && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                        Recommandations
                      </div>
                      <ul className="space-y-1.5">
                        {p.recommendations.map((r, i) => (
                          <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-5" />
            <p className="text-foreground font-semibold mb-2">Aucun post publié pour l&apos;instant</p>
            <p className="text-sm text-muted max-w-sm mx-auto">
              Publie tes premiers posts planifiés, leurs stats apparaîtront ici.
              Il faut au moins {MIN_MEASURED_POSTS} posts mesurés par plateforme
              pour générer tes insights.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Posts publiés
              {measuredCount < MIN_MEASURED_POSTS && (
                <span className="normal-case font-normal text-muted-foreground/70">
                  · {measuredCount}/{MIN_MEASURED_POSTS} mesurés avant le premier insight
                </span>
              )}
            </h2>
            <div className="space-y-3">
              {posts.map((post) => (
                <PostRow key={post.id} post={post} getToken={getToken} onSaved={load} />
              ))}
            </div>
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

function PostRow({
  post,
  getToken,
  onSaved,
}: {
  post: Post;
  getToken: () => Promise<string | null>;
  onSaved: () => void;
}) {
  const [impressions, setImpressions] = useState(post.impressions?.toString() ?? "");
  const [likes, setLikes] = useState(post.likes?.toString() ?? "");
  const [comments, setComments] = useState(post.comments?.toString() ?? "");
  const [shares, setShares] = useState(post.shares?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const token = await getToken();
      const res = await fetch("/api/analytics/metrics", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: post.id,
          impressions,
          likes,
          comments,
          shares,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onSaved();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 bg-card border border-border/50 rounded-xl">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${PLATFORM_COLORS[post.platform] || "text-muted bg-surface"}`}
        >
          {PLATFORM_LABELS[post.platform] || post.platform}
        </span>
        {post.publishedAt && (
          <span className="text-[11px] text-muted-foreground">
            {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}
      </div>
      <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-3">{post.content}</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
        <MetricInput label="Impressions" value={impressions} onChange={setImpressions} />
        <MetricInput label="J'aime" value={likes} onChange={setLikes} />
        <MetricInput label="Commentaires" value={comments} onChange={setComments} />
        <MetricInput label="Partages" value={shares} onChange={setShares} />
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-xs font-medium hover:bg-surface-hover transition-all disabled:opacity-50 h-[38px]"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saved ? (
            <Check className="w-3.5 h-3.5 text-success" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Enregistrer
        </button>
      </div>
    </div>
  );
}

function MetricInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">
        {label}
      </label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full px-2.5 py-2 bg-surface border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground outline-none text-sm focus:border-accent/40"
      />
    </div>
  );
}
