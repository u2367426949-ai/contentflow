import Link from "next/link";
import { DemoSection } from "@/components/DemoSection";
import { PLANS, type Plan } from "@/lib/plans";
import {
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
  Globe,
  Shield,
  Layers,
  TrendingUp,
  CheckCircle2,
  Star,
} from "lucide-react";

const PLATFORMS = [
  {
    name: "LinkedIn",
    color: "text-[#0A66C2]",
    bg: "bg-[#0A66C2]/10",
    border: "border-[#0A66C2]/20",
  },
  {
    name: "Twitter / X",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
  },
  {
    name: "Instagram",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
];

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Génération instantanée",
    desc: "Collez une URL, obtenez 3 posts optimisés en moins de 10 secondes. Fini la page blanche.",
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: "Contenu multi-plateforme",
    desc: "LinkedIn, Twitter, Instagram : chaque post est adapté au ton et au format de la plateforme.",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "N'importe quelle source",
    desc: "Articles de blog, pages web, newsletters : l'IA extrait et analyse tout type de contenu.",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Optimisé pour l'engagement",
    desc: "Tons professionnels, hashtags pertinents, questions d'accroche : conçu pour performer.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Vos données protégées",
    desc: "Authentification sécurisée, aucun stockage inutile. Vos articles restent confidentiels.",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Gagnez 2h par jour",
    desc: "Automatisez votre présence sociale et concentrez-vous sur ce qui compte vraiment.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Collez une URL",
    desc: "L'URL de l'article que vous voulez transformer en posts sociaux.",
  },
  {
    step: "2",
    title: "L'IA analyse",
    desc: "Notre IA extrait les points clés et comprend le contexte de votre contenu.",
  },
  {
    step: "3",
    title: "Publiez partout",
    desc: "Copiez-collez vos posts LinkedIn, Twitter et Instagram. C'est prêt.",
  },
];

const PRICING_ORDER: Plan[] = ["free", "creator", "pro", "agency"];

const PRICING_DETAILS: Record<Plan, { cta: string; href: string; featured?: boolean; features: string[] }> = {
  free: {
    cta: "Commencer",
    href: "/dashboard",
    features: [
      "5 générations par mois",
      "LinkedIn, Twitter, Instagram",
      "Extraction d'articles, YouTube, RSS",
    ],
  },
  creator: {
    cta: "Essayer Creator",
    href: "/upgrade",
    features: [
      "Générations illimitées",
      "1 voix de marque clonée",
      "Auto-publication LinkedIn",
      "Programmation de posts",
    ],
  },
  pro: {
    cta: "Essayer Pro",
    href: "/upgrade",
    featured: true,
    features: [
      "Tout Creator, plus :",
      "Multi-plateforme + Analytics",
      "3 voix de marque",
    ],
  },
  agency: {
    cta: "Essayer Agency",
    href: "/upgrade",
    features: [
      "Tout Pro, plus :",
      "10 voix de marque",
      "Multi-clients & white label",
    ],
  },
};

export default function HomeContent() {
  return (
    <div className="flex flex-col flex-1">
      {/* ─── Hero ─── */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-24 pb-20 md:pt-36 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/8 via-background to-background pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm mb-8 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Propulsé par l&apos;intelligence artificielle</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
            Un article,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-indigo-400 to-purple-400">
              3 posts sociaux
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted leading-relaxed max-w-2xl mx-auto mb-10">
            ContentFlow AI transforme automatiquement n&apos;importe quel article en
            posts optimisés pour LinkedIn, Twitter et Instagram. Gagnez des heures
            chaque semaine.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent text-white font-semibold text-base hover:bg-accent-hover transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5"
            >
              Essayer gratuitement
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-surface border border-border text-foreground font-medium text-base hover:bg-surface-hover transition-all"
            >
              Créer un compte
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted">Aucune carte bancaire requise</p>

          <div className="flex items-center justify-center gap-3 mt-12">
            {PLATFORMS.map((p) => (
              <span
                key={p.name}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${p.bg} ${p.border} border ${p.color} text-xs font-medium`}
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>

<DemoSection />

      {/* ─── How It Works ─── */}
      <section className="py-20 md:py-28 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comment ça marche
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Trois étapes, trente secondes. Aussi simple que ça.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div
                key={s.step}
                className="relative p-8 rounded-2xl bg-card border border-border hover:border-accent/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-5 text-accent font-bold text-sm group-hover:bg-accent/20 transition-colors">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-border/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="py-20 md:py-28 px-4 bg-surface/30 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Des fonctionnalités pensées pour les créateurs de contenu exigeants.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-border hover:bg-card-hover transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 text-accent group-hover:bg-accent/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="py-20 md:py-28 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Des tarifs simples
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Commencez gratuitement, évoluez vers Creator, Pro ou Agency selon
              votre rythme de publication.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {PRICING_ORDER.map((id) => {
              const plan = PLANS[id];
              const details = PRICING_DETAILS[id];
              return (
                <div
                  key={id}
                  className={`relative p-8 rounded-2xl border transition-all ${
                    details.featured
                      ? "bg-card border-accent/30 shadow-lg shadow-accent/5"
                      : "bg-card border-border hover:border-border-light"
                  }`}
                >
                  {details.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-white text-xs font-medium flex items-center gap-1">
                      <Star className="w-3 h-3" /> Recommandé
                    </div>
                  )}
                  <div className="text-sm font-medium text-muted mb-1">{plan.name}</div>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold text-foreground">{plan.price} €</span>
                    {plan.price > 0 && (
                      <span className="text-sm text-muted">/mois</span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {details.features.map((f) => (
                      <li
                        key={f}
                        className={`flex items-start gap-2.5 text-sm ${
                          f.endsWith(":") ? "text-foreground font-medium" : "text-muted"
                        }`}
                      >
                        {!f.endsWith(":") && (
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        )}
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={details.href}
                    className={`block w-full text-center py-3 rounded-xl font-medium text-sm transition-all ${
                      details.featured
                        ? "bg-accent text-white hover:bg-accent-hover shadow-md shadow-accent/20"
                        : "bg-surface border border-border text-foreground hover:bg-surface-hover"
                    }`}
                  >
                    {details.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-12 px-4 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-foreground">ContentFlow<span className="text-accent">AI</span></span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Transformez vos articles en posts sociaux en 30 secondes.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Produit</h4>
              <div className="space-y-2">
                <Link href="/dashboard" className="block text-xs text-muted hover:text-foreground transition-colors">Dashboard</Link>
                <Link href="/sign-up" className="block text-xs text-muted hover:text-foreground transition-colors">S&apos;inscrire</Link>
                <Link href="/upgrade" className="block text-xs text-muted hover:text-foreground transition-colors">Tarifs</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Légal</h4>
              <div className="space-y-2">
                <Link href="/mentions-legales" className="block text-xs text-muted hover:text-foreground transition-colors">Mentions légales</Link>
                <Link href="/politique-de-confidentialite" className="block text-xs text-muted hover:text-foreground transition-colors">Confidentialité</Link>
                <Link href="/cgv" className="block text-xs text-muted hover:text-foreground transition-colors">CGV</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Node IA</h4>
              <div className="space-y-2">
                <a href="https://node-ia.com" target="_blank" rel="noopener" className="block text-xs text-muted hover:text-foreground transition-colors">node-ia.com</a>
                <a href="mailto:contact@node-ia.com" className="block text-xs text-muted hover:text-foreground transition-colors">Contact</a>
                <p className="text-xs text-muted">Rouen, France</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted">
              &copy; {new Date().getFullYear()} ContentFlow AI — Propulsé par Node IA Studio, Rouen
            </p>
            <div className="flex items-center gap-4">
              <Link href="/mentions-legales" className="text-xs text-muted hover:text-foreground transition-colors">Mentions légales</Link>
              <Link href="/politique-de-confidentialite" className="text-xs text-muted hover:text-foreground transition-colors">Confidentialité</Link>
              <Link href="/cgv" className="text-xs text-muted hover:text-foreground transition-colors">CGV</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
