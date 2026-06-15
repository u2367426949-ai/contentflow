"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import {
  Loader2,
  Plus,
  ExternalLink,
  FileText,
  Sparkles,
  ArrowRight,
  Zap,
  Clock,
} from "lucide-react";
import Link from "next/link";

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

export default function DashboardPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [url, setUrl] = useState("");
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

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
        body: JSON.stringify({ originalUrl: url.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur lors de la création");
      }

      const project = await res.json();
      setUrl("");
      await fetchProjects();
      router.push(`/dashboard/${project.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
    } finally {
      setCreating(false);
    }
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
            Collez une URL d&apos;article pour générer vos posts en un clic.
          </p>
        </div>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="p-1 bg-card border border-border rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 p-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <ExternalLink className="w-4 h-4 text-muted" />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://exemple.com/article"
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
          {error && (
            <p className="mt-3 text-sm text-error">{error}</p>
          )}
        </form>

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
                {quota && quota.plan === "free"
                  ? `${3 - quota.generationCount}`
                  : "∞"}
              </div>
              <div className="text-xs text-muted mt-1">
                {quota && quota.plan === "free" ? "Restantes" : "Générations"}
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
