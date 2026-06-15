"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Trash2,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  tone: string;
  scheduledAt: string;
  status: string;
  projectId?: string | null;
}

const PLATFORM_LABELS: Record<string, string> = { linkedin: "LinkedIn", twitter: "Twitter / X", instagram: "Instagram" };
const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "text-[#0A66C2] bg-[#0A66C2]/10",
  twitter: "text-sky-400 bg-sky-400/10",
  instagram: "text-pink-500 bg-pink-500/10",
};

function groupByDate(posts: ScheduledPost[]) {
  const groups: Record<string, ScheduledPost[]> = {};
  for (const post of posts) {
    const key = new Date(post.scheduledAt).toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(post);
  }
  return groups;
}

export default function SchedulePage() {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in");
    if (isLoaded && isSignedIn) {
      fetchPlan();
    }
  }, [isLoaded, isSignedIn]);

  async function fetchPlan() {
    try {
      const res = await fetch("/api/user/me");
      const data = await res.json();
      setPlan(data.plan);
      if (data.plan !== "pro") {
        router.replace("/upgrade?reason=schedule");
        return;
      }
      fetchPosts();
    } catch {
      router.replace("/dashboard");
    }
  }

  async function fetchPosts() {
    try {
      const token = await getToken();
      const res = await fetch("/api/schedule", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setPosts(await res.json());
    } catch {}
    setLoading(false);
  }

  async function deletePost(id: string) {
    if (!confirm("Supprimer cette programmation ?")) return;
    const token = await getToken();
    await fetch("/api/schedule", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (!isLoaded || loading || plan === null) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const grouped = groupByDate(posts);
  const totalPosts = posts.length;
  const thisWeek = posts.filter((p) => {
    const d = new Date(p.scheduledAt);
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    return d <= weekEnd;
  }).length;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au dashboard
        </Link>

        {/* Header + Stats */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-accent" />
              <h1 className="text-2xl font-bold text-foreground">Posts programmés</h1>
            </div>
            <p className="text-sm text-muted">
              {totalPosts} post{totalPosts !== 1 ? "s" : ""} programmé{totalPosts !== 1 ? "s" : ""}
              {thisWeek > 0 && ` · ${thisWeek} cette semaine`}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-all shadow-sm shadow-accent/20"
          >
            <Sparkles className="w-4 h-4" />
            Nouveau projet
          </Link>
        </div>

        {/* Empty state */}
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-5" />
            <p className="text-foreground font-semibold mb-2">Aucun post programmé</p>
            <p className="text-sm text-muted max-w-sm mx-auto mb-6">
              Depuis un projet, cliquez sur &quot;Programmer&quot; et choisissez une date.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-border text-foreground text-sm font-medium hover:bg-surface-hover transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Créer un projet
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([date, datePosts]) => (
              <div key={date}>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {date}
                </h2>
                <div className="space-y-2">
                  {datePosts.map((post) => (
                    <div
                      key={post.id}
                      className="group p-4 bg-card border border-border/50 rounded-xl hover:border-border transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${PLATFORM_COLORS[post.platform] || "text-muted bg-surface"}`}>
                              {PLATFORM_LABELS[post.platform] || post.platform}
                            </span>
                            <span className="text-[11px] text-muted-foreground capitalize">{post.tone}</span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(post.scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-sm text-muted leading-relaxed line-clamp-3">{post.content}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopy(post.content, post.id)}
                            className="p-1.5 rounded-lg hover:bg-surface transition-colors"
                            title="Copier"
                          >
                            {copiedId === post.id ? (
                              <Check className="w-3.5 h-3.5 text-success" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="p-1.5 rounded-lg hover:bg-error/5 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-error" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
