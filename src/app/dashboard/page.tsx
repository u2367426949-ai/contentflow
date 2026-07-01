"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import {
  Loader2,
  ExternalLink,
  FileText,
  Sparkles,
  ArrowRight,
  Zap,
  PlaySquare,
  Rss,
  Link2,
  Type,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { getPlan } from "@/lib/plans";

type SourceType = "url" | "youtube" | "rss" | "text";

const SOURCE_TABS: { id: SourceType; label: string; icon: React.ReactNode }[] = [
  { id: "url", label: "URL", icon: <Link2 className="w-4 h-4" /> },
  { id: "youtube", label: "YouTube", icon: <PlaySquare className="w-4 h-4" /> },
  { id: "rss", label: "RSS", icon: <Rss className="w-4 h-4" /> },
  { id: "text", label: "Texte", icon: <Type className="w-4 h-4" /> },
];

interface RssItem {
  title: string;
  link: string;
  snippet: string;
  pubDate: string | null;
}

const linkedinIcon = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const xIcon = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const instagramIcon = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const platformIcons: Record<string, React.ReactNode> = {
  linkedin: linkedinIcon,
  twitter: xIcon,
  instagram: instagramIcon,
};

interface Project {
  id: string;
  title: string;
  originalUrl: string | null;
  createdAt: string;
  generations: { platform: string; status: string }[];
}

function QuotaBar({ plan, generationCount }: { plan: string; generationCount: number }) {
  const config = getPlan(plan);
  if (config.genQuota === null) return null;

  const used = Math.min(generationCount, config.genQuota);
  const pct = Math.round((used / config.genQuota) * 100);
  const nearLimit = used >= config.genQuota - 1;

  return (
    <div className="mb-8 p-4 bg-card border border-border/50 rounded-xl">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-sm text-muted">
          {used}/{config.genQuota} générations utilisées ce mois-ci
        </span>
        {nearLimit && (
          <Link
            href="/upgrade"
            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors whitespace-nowrap"
          >
            Passer à Creator →
          </Link>
        )}
      </div>
      <div className="h-1.5 rounded-full bg-surface overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${nearLimit ? "bg-error" : "bg-accent"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [url, setUrl] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("url");
  const [docTitle, setDocTitle] = useState("");
  const [docText, setDocText] = useState("");
  const [rssItems, setRssItems] = useState<RssItem[]>([]);
  const [rssLoading, setRssLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [quota, setQuota] = useState<{ plan: string; generationCount: number } | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchProjects();
      fetchQuota();
    }
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn]);

  async function fetchProjects() {
    try {
      const token = await getToken();
      const res = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchQuota() {
    try {
      const token = await getToken();
      const res = await fetch("/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setQuota(await res.json());
    } catch { /* silent */ }
  }

  async function createProject(payload: Record<string, unknown>) {
    setCreating(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur lors de la création");
      }

      const project = await res.json();
      setUrl("");
      setDocText("");
      setDocTitle("");
      setRssItems([]);
      await fetchProjects();
      router.push(`/dashboard/${project.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
    } finally {
      setCreating(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (sourceType === "url") {
      if (!url.trim()) return;
      await createProject({ originalUrl: url.trim(), sourceType: "url" });
    } else if (sourceType === "youtube") {
      if (!url.trim()) return;
      await createProject({ originalUrl: url.trim(), sourceType: "youtube" });
    } else if (sourceType === "text") {
      if (!docText.trim()) return;
      await createProject({
        sourceText: docText.trim(),
        title: docTitle.trim() || undefined,
        sourceType: "text",
      });
    }
  }

  async function loadRss(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setRssLoading(true);
    setError("");
    setRssItems([]);
    try {
      const token = await getToken();
      const res = await fetch(`/api/sources/rss?url=${encodeURIComponent(url.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors du chargement du flux");
      setRssItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setRssLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setDocText(text);
    if (!docTitle) setDocTitle(file.name.replace(/\.[^.]+$/, ""));
  }

  function switchSource(type: SourceType) {
    setSourceType(type);
    setError("");
    setRssItems([]);
  }

  function getPlatformStatusColor(status: string) {
    switch (status) {
      case "completed":
        return "text-success";
      case "failed":
        return "text-error";
      default:
        return "text-warning";
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted">
            URL, vidéo YouTube, flux RSS ou texte — transformez n&apos;importe
            quelle source en posts.
          </p>
        </div>

        {quota && <QuotaBar plan={quota.plan} generationCount={quota.generationCount} />}

        {/* Multi-source input */}
        <div className="mb-12">
          {/* Source tabs */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {SOURCE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchSource(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                  sourceType === tab.id
                    ? "bg-accent text-white shadow-sm"
                    : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-hover border border-border/50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* URL / YouTube single input */}
          {(sourceType === "url" || sourceType === "youtube") && (
            <form onSubmit={handleSubmit}>
              <div className="p-1 bg-card border border-border rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3 p-3">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      {sourceType === "youtube" ? (
                        <PlaySquare className="w-4 h-4 text-muted" />
                      ) : (
                        <ExternalLink className="w-4 h-4 text-muted" />
                      )}
                    </div>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder={
                        sourceType === "youtube"
                          ? "https://youtube.com/watch?v=..."
                          : "https://exemple.com/article"
                      }
                      className="w-full pl-11 pr-4 py-3 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
                      disabled={creating}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creating || !url.trim()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm shadow-accent/20"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyse...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Générer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* RSS feed: load then pick an article */}
          {sourceType === "rss" && (
            <div>
              <form onSubmit={loadRss}>
                <div className="p-1 bg-card border border-border rounded-2xl shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-3 p-3">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Rss className="w-4 h-4 text-muted" />
                      </div>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://exemple.com/feed.xml"
                        className="w-full pl-11 pr-4 py-3 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
                        disabled={rssLoading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={rssLoading || !url.trim()}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm shadow-accent/20"
                    >
                      {rssLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Chargement...
                        </>
                      ) : (
                        <>
                          <Rss className="w-4 h-4" />
                          Charger
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {rssItems.length > 0 && (
                <div className="mt-3 space-y-1.5 max-h-96 overflow-y-auto">
                  {rssItems.map((item) => (
                    <button
                      key={item.link}
                      onClick={() =>
                        createProject({ originalUrl: item.link, sourceType: "url" })
                      }
                      disabled={creating}
                      className="w-full text-left p-4 bg-card border border-border/50 rounded-xl hover:border-accent/30 hover:bg-card-hover transition-all disabled:opacity-50 group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.title}
                          </p>
                          {item.snippet && (
                            <p className="text-xs text-muted truncate mt-1">
                              {item.snippet}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Text / document */}
          {sourceType === "text" && (
            <form onSubmit={handleSubmit} className="p-4 bg-card border border-border rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-3">
                <input
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Titre (optionnel)"
                  className="flex-1 px-4 py-2.5 bg-surface border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground outline-none text-sm focus:border-accent/40"
                  disabled={creating}
                />
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface border border-border/50 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-all whitespace-nowrap">
                  <Upload className="w-4 h-4" />
                  Fichier
                  <input
                    type="file"
                    accept=".txt,.md,.markdown,text/plain"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                rows={8}
                placeholder="Collez votre texte, vos notes, la transcription d'un appel... ou importez un fichier .txt / .md"
                className="w-full px-4 py-3 bg-surface border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground outline-none text-sm leading-relaxed focus:border-accent/40 resize-y"
                disabled={creating}
              />
              <button
                type="submit"
                disabled={creating || !docText.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-accent/20"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Générer
                  </>
                )}
              </button>
            </form>
          )}

          {error && <p className="mt-3 text-sm text-error">{error}</p>}
        </div>

        {/* Quick stats */}
        {projects.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <div className="text-2xl font-bold text-foreground">{projects.length}</div>
              <div className="text-xs text-muted mt-1">Projets</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <div className="text-2xl font-bold text-success">
                {projects.filter((p) =>
                  p.generations.some((g) => g.status === "completed")
                ).length}
              </div>
              <div className="text-xs text-muted mt-1">Générés</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <div className="text-2xl font-bold text-accent">
                {projects.reduce(
                  (acc, p) => acc + p.generations.filter((g) => g.status === "completed").length,
                  0
                )}
              </div>
              <div className="text-xs text-muted mt-1">Posts créés</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <div className="text-2xl font-bold text-foreground">
                {quota && getPlan(quota.plan).genQuota !== null
                  ? `${Math.max(0, getPlan(quota.plan).genQuota! - quota.generationCount)}`
                  : "∞"}
              </div>
              <div className="text-xs text-muted mt-1">
                {quota && getPlan(quota.plan).genQuota !== null ? "Restantes" : "Générations"}
              </div>
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Projets récents
          </h2>

          {projects.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                <Zap className="w-7 h-7 text-accent" />
              </div>
              <p className="text-foreground font-medium mb-2">
                Prêt à créer votre premier projet ?
              </p>
              <p className="text-sm text-muted max-w-sm mx-auto">
                Collez l&apos;URL d&apos;un article ci-dessus et laissez l&apos;IA faire la magie.
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/${project.id}`}
                className="block p-5 bg-card border border-border/50 rounded-xl hover:border-accent/20 hover:bg-card-hover transition-all group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground font-medium truncate text-sm">
                      {project.title}
                    </h3>
                    {project.originalUrl && (
                      <p className="text-xs text-muted truncate mt-1">
                        {project.originalUrl}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2.5">
                      {project.generations.map((gen) => (
                        <span
                          key={gen.platform}
                          className={`inline-flex items-center gap-1 text-[11px] font-medium ${getPlatformStatusColor(
                            gen.status
                          )}`}
                        >
                          {platformIcons[gen.platform]}
                          <span className="capitalize hidden sm:inline">{gen.platform}</span>
                        </span>
                      ))}
                      <span className="text-[11px] text-muted-foreground ml-auto">
                        {new Date(project.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
