"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import {
  Loader2,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  AlertCircle,
  FileText,
  Calendar,
  Lock,
  Crown,
  Fingerprint,
} from "lucide-react";
import Link from "next/link";
import { ScheduleModal } from "@/components/ScheduleModal";
import { QuotaPaywallModal } from "@/components/QuotaPaywallModal";

const linkedinIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const xIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const instagramIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const platformConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  linkedin: {
    label: "LinkedIn",
    icon: linkedinIcon,
    color: "text-[#0A66C2]",
  },
  twitter: {
    label: "Twitter / X",
    icon: xIcon,
    color: "text-sky-400",
  },
  instagram: {
    label: "Instagram",
    icon: instagramIcon,
    color: "text-pink-500",
  },
};

interface Generation {
  id: string;
  platform: string;
  content: string | null;
  status: string;
  tone: string;
}

interface Project {
  id: string;
  title: string;
  originalUrl: string | null;
  sourceText: string | null;
  createdAt: string;
  generations: Generation[];
}

interface BrandVoice {
  id: string;
  name: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("linkedin");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [tone, setTone] = useState("professionnel");
  const [isPro, setIsPro] = useState(false);
  const [plan, setPlan] = useState<string>("free");
  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [brandVoiceId, setBrandVoiceId] = useState<string>("");
  const [scheduleModal, setScheduleModal] = useState<{ open: boolean; platform: string; content: string }>({ open: false, platform: "", content: "" });
  const [quotaModal, setQuotaModal] = useState<{ open: boolean; used: number; limit: number }>({ open: false, used: 0, limit: 0 });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (isLoaded && isSignedIn) {
      fetchProject();
      fetchPlan();
      fetchVoices();
    }
  }, [isLoaded, isSignedIn]);

  async function fetchPlan() {
    try {
      const res = await fetch("/api/user/me");
      const data = await res.json();
      setIsPro(data.plan && data.plan !== "free");
      setPlan(data.plan || "free");
    } catch { /* ignore */ }
  }

  async function fetchVoices() {
    try {
      const token = await getToken();
      const res = await fetch("/api/brand-voices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setVoices(await res.json());
    } catch { /* ignore */ }
  }

  async function fetchProject() {
    try {
      const token = await getToken();
      const res = await fetch(`/api/projects/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Projet introuvable");
      const data = await res.json();
      setProject(data);
      // Set active tab to first generation with content
      const completedGen = data.generations.find(
        (g: Generation) => g.status === "completed" && g.content
      );
      if (completedGen) {
        setActiveTab(completedGen.platform);
      } else if (data.generations.length > 0) {
        setActiveTab(data.generations[0].platform);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError("");

    try {
      const token = await getToken();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId: params.id, tone, brandVoiceId: brandVoiceId || undefined }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 402 && errData.quota) {
          setQuotaModal({ open: true, used: errData.quota.used, limit: errData.quota.limit });
          return;
        }
        throw new Error(errData.error || "Erreur lors de la génération");
      }

      await fetchProject();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSchedule(date: Date) {
    const token = await getToken();
    const projectId = params.id as string;
    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + (token || "") },
      body: JSON.stringify({ projectId, platform: scheduleModal.platform, content: scheduleModal.content, tone: tone, scheduledAt: date.toISOString() }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error || "Erreur lors de la programmation.");
      return;
    }
    setScheduleModal({ open: false, platform: "", content: "" });
  }

  async function handleDelete() {
    if (!confirm("Supprimer ce projet ?")) return;
    try {
      const token = await getToken();
      await fetch(`/api/projects/${params.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("Delete failed", err);
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">{error}</p>
          <Link
            href="/dashboard"
            className="text-accent hover:text-accent-hover text-sm"
          >
            Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const hasGeneration = project.generations.length > 0;
  const activeGeneration = project.generations.find(
    (g) => g.platform === activeTab
  );
  const hasAnyCompleted = project.generations.some(
    (g) => g.status === "completed"
  );

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back + actions */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour</span>
          </Link>
          <button
            onClick={handleDelete}
            className="text-muted-foreground hover:text-error transition-colors p-2"
            title="Supprimer le projet"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Project Info */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {project.title}
          </h1>
          {project.originalUrl && (
            <a
              href={project.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {project.originalUrl}
            </a>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Créé le{" "}
            {new Date(project.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Generate Button */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-muted font-medium">Ton :</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: "professionnel", label: "Pro" },
                { value: "decontracte", label: "Décontracté" },
                { value: "humoristique", label: "Humoristique" },
                { value: "inspirant", label: "Inspirant" },
                { value: "viral", label: "Viral" },
              ].map((t) => (
                <button key={t.value} onClick={() => setTone(t.value)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${tone === t.value ? "bg-accent text-white shadow-sm" : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-hover border border-border/50"}`}
                >{t.label}</button>
              ))}
            </div>
          </div>

          {/* Brand voice selector */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-muted font-medium inline-flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5" />
              Style :
            </span>
            {voices.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setBrandVoiceId("")}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${brandVoiceId === "" ? "bg-accent text-white shadow-sm" : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-hover border border-border/50"}`}
                >
                  Aucune
                </button>
                {voices.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setBrandVoiceId(v.id)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${brandVoiceId === v.id ? "bg-accent text-white shadow-sm" : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-hover border border-border/50"}`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            ) : (
              <Link
                href="/dashboard/brand-voices"
                className="text-xs text-accent hover:text-accent-hover transition-colors inline-flex items-center gap-1"
              >
                <Fingerprint className="w-3 h-3" />
                Clonez votre style
              </Link>
            )}
          </div>

          {brandVoiceId && (
            <p className="text-xs text-muted-foreground mb-4 -mt-1">
              Les posts seront écrits dans votre style cloné (le ton ci-dessus est ignoré).
            </p>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-medium hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {hasAnyCompleted
                  ? "Régénérer les posts"
                  : "Générer les posts"}
              </>
            )}
          </button>
          {error && (
            <p className="mt-3 text-sm text-error">{error}</p>
          )}
        </div>

        {/* No generation state */}
        {!hasGeneration && !generating && (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <FileText className="w-8 h-8 text-accent" />
            </div>
            <p className="text-foreground font-medium mb-2">
              Aucun post généré
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Cliquez sur &quot;Générer les posts&quot; pour que l&apos;IA
              analyse le contenu et crée vos posts LinkedIn, Twitter et
              Instagram.
            </p>
          </div>
        )}

        {/* Platform Tabs */}
        {hasGeneration && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-border">
              {["linkedin", "twitter", "instagram"].map((platform) => {
                const gen = project.generations.find(
                  (g) => g.platform === platform
                );
                const config = platformConfig[platform];
                const isActive = activeTab === platform;
                return (
                  <button
                    key={platform}
                    onClick={() => setActiveTab(platform)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all ${
                      isActive
                        ? "text-accent border-b-2 border-accent bg-accent/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                    }`}
                  >
                    <span className={config.color}>{config.icon}</span>
                    <span>{config.label}</span>
                    {gen && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          gen.status === "completed"
                            ? "bg-success"
                            : gen.status === "failed"
                              ? "bg-error"
                              : "bg-warning animate-pulse"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="p-6">
              {activeGeneration ? (
                <>
                  {activeGeneration.status === "pending" && (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          Génération en cours...
                        </p>
                      </div>
                    </div>
                  )}

                  {activeGeneration.status === "failed" && (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <AlertCircle className="w-8 h-8 text-error mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          La génération a échoué
                        </p>
                        <button
                          onClick={handleGenerate}
                          className="mt-4 text-sm text-accent hover:text-accent-hover"
                        >
                          Réessayer
                        </button>
                      </div>
                    </div>
                  )}

                  {activeGeneration.status === "completed" &&
                    activeGeneration.content && (
                      <>
                        <div className="relative group">
                          <div className="prose prose-invert max-w-none whitespace-pre-wrap text-foreground leading-relaxed">
                            {activeGeneration.content}
                          </div>
                          <button
                            onClick={() => handleCopy(activeGeneration.content!, activeGeneration.id)}
                            className="absolute top-0 right-0 p-2 rounded-lg bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all opacity-0 group-hover:opacity-100"
                            title="Copier"
                          >
                            {copiedId === activeGeneration.id ? (
                              <Check className="w-4 h-4 text-success" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <button
                            onClick={() => handleGenerate()}
                            disabled={generating}
                            className="text-xs text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Régénérer
                          </button>
                          {isPro ? (
                            <button
                              onClick={() => setScheduleModal({ open: true, platform: activeGeneration.platform, content: activeGeneration.content! })}
                              disabled={generating}
                              className="text-xs text-accent hover:text-accent-hover transition-colors inline-flex items-center gap-1 font-medium"
                            >
                              <Calendar className="w-3 h-3" />
                              Programmer
                            </button>
                          ) : (
                            <span
                              className="text-xs text-muted-foreground/40 inline-flex items-center gap-1 cursor-not-allowed select-none"
                              title="Réservé au plan Pro"
                            >
                              <Lock className="w-3 h-3" />
                              Programmer
                              <Link href="/upgrade" className="ml-1 text-[10px] text-accent/60 hover:text-accent transition-colors cursor-pointer">
                                <Crown className="w-3 h-3 inline" />
                              </Link>
                            </span>
                          )}
                        </div>
                      </>
                    )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Aucune génération pour cette plateforme
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upsell: performance loop (Creator → Pro) */}
        {plan === "creator" && hasAnyCompleted && (
          <Link
            href="/dashboard/analytics"
            className="mt-6 flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-xl hover:bg-accent/10 transition-colors group"
          >
            <span className="text-lg shrink-0">💡</span>
            <p className="text-sm text-muted flex-1">
              Avec <span className="text-foreground font-medium">Pro</span>, ce
              post serait optimisé par tes stats réelles — l&apos;IA apprend ce
              qui marche pour toi.
            </p>
            <span className="text-xs font-medium text-accent group-hover:text-accent-hover transition-colors whitespace-nowrap">
              Découvrir →
            </span>
          </Link>
        )}
      </div>
      <ScheduleModal isOpen={scheduleModal.open} onClose={() => setScheduleModal({ open: false, platform: "", content: "" })} onSchedule={handleSchedule} platform={scheduleModal.platform} contentPreview={scheduleModal.content} />
      <QuotaPaywallModal
        isOpen={quotaModal.open}
        onClose={() => setQuotaModal({ open: false, used: 0, limit: 0 })}
        used={quotaModal.used}
        limit={quotaModal.limit}
      />
    </div>
  );
}
