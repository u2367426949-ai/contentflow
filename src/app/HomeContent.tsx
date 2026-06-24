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
  Flame,
  Star,
} from "lucide-react";

const PLATFORMS = [
  { name: "LinkedIn", color: "#0A66C2" },
  { name: "Twitter / X", color: "#1d9bf0" },
  { name: "Instagram", color: "#e1306c" },
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
    desc: "Articles, pages web, newsletters, YouTube, RSS : l'IA extrait et analyse tout type de contenu.",
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
    title: "Gagnez 2h par semaine",
    desc: "Automatisez votre présence sociale et concentrez-vous sur ce qui compte vraiment.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Collez une URL",
    desc: "Article, YouTube, newsletter ou texte brut — ContentFlow accepte tout.",
  },
  {
    n: "02",
    title: "L'IA analyse",
    desc: "Notre IA extrait les points clés, comprend le contexte et adapte le ton.",
  },
  {
    n: "03",
    title: "Publiez partout",
    desc: "Posts LinkedIn, Twitter et Instagram prêts à copier-coller ou auto-publier.",
  },
];

const PRICING_ORDER: Plan[] = ["free", "creator", "pro", "agency"];

const PRICING_DETAILS: Record<Plan, { cta: string; href: string; featured?: boolean; features: string[] }> = {
  free: {
    cta: "Commencer",
    href: "/dashboard",
    features: [
      "5 générations / mois",
      "LinkedIn · Twitter · Instagram",
      "Articles, YouTube, RSS",
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
      "Analytics multi-plateforme",
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
      <section className="relative flex flex-col items-center justify-center px-4 pt-28 pb-24 md:pt-40 md:pb-36 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#f97316]/8 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-[#fbbf24]/6 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#f97316]/5 rounded-full blur-[80px]" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(#fafafa 1px, transparent 1px), linear-gradient(90deg, #fafafa 1px, transparent 1px)`,
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#f97316]/30 bg-[#f97316]/8 text-[#fb923c] text-sm mb-10 animate-fade-in-up">
            <Flame className="w-3.5 h-3.5" />
            <span>Propulsé par l&apos;IA — sans carte bancaire</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-[90px] font-black tracking-tight text-foreground mb-6 leading-[1.0] animate-fade-in-up animate-fade-in-up-delay-1">
            Un article.
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #f97316 100%)" }}
            >
              3 posts. 10 sec.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-in-up animate-fade-in-up-delay-2">
            ContentFlow AI transforme n&apos;importe quel article en posts percutants
            pour LinkedIn, Twitter et Instagram. Automatiquement.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up animate-fade-in-up-delay-3">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base text-black overflow-hidden shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#f97316]/20"
              style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)" }}
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Zap className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Essayer gratuitement</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-border bg-surface/50 text-foreground font-medium text-base hover:bg-surface-hover transition-all"
            >
              Créer un compte
            </Link>
          </div>

          {/* Platform badges */}
          <div className="flex items-center justify-center gap-2 animate-fade-in-up animate-fade-in-up-delay-4">
            <span className="text-xs text-muted-foreground mr-1">Optimisé pour</span>
            {PLATFORMS.map((p) => (
              <span
                key={p.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-semibold"
                style={{ color: p.color }}
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Demo ─── */}
      <DemoSection />

      {/* ─── How It Works ─── */}
      <section className="py-24 md:py-32 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-3">Comment ça marche</p>
              <h2 className="text-3xl md:text-5xl font-black text-foreground leading-tight">
                Simple comme
                <br />
                bonjour.
              </h2>
            </div>
            <p className="text-muted max-w-xs md:text-right text-sm leading-relaxed">
              Trois étapes. Trente secondes chrono.<br />Votre contenu social est prêt.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="relative p-8 rounded-3xl border border-border bg-card hover:border-border-light transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <span
                    className="text-5xl font-black leading-none"
                    style={{ color: i === 0 ? "#f97316" : i === 1 ? "#fbbf24" : "#3f3f46" }}
                  >
                    {s.n}
                  </span>
                  <div className="w-8 h-px bg-border mt-3 group-hover:bg-[#f97316]/30 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Bento Grid ─── */}
      <section className="py-24 md:py-32 px-4 border-t border-border bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-3">Fonctionnalités</p>
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">
              Tout ce dont vous avez besoin,
              <br />
              <span className="text-muted-foreground">rien de superflu.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Row 1: narrow + wide */}
            <div className="md:col-span-2 p-7 rounded-3xl border border-border bg-card hover:border-border-light hover:bg-card-hover transition-all">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-black"
                style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)" }}
              >
                {FEATURES[0].icon}
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{FEATURES[0].title}</h3>
              <p className="text-sm text-muted leading-relaxed">{FEATURES[0].desc}</p>
            </div>

            <div className="md:col-span-4 p-7 rounded-3xl border border-border bg-card hover:border-border-light hover:bg-card-hover transition-all relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.08), transparent 70%)" }} />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-black"
                style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)" }}
              >
                {FEATURES[1].icon}
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{FEATURES[1].title}</h3>
              <p className="text-sm text-muted leading-relaxed">{FEATURES[1].desc}</p>
              <div className="flex gap-2 mt-5">
                {PLATFORMS.map((p) => (
                  <span key={p.name} className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-background border border-border" style={{ color: p.color }}>
                    {p.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Row 2: wide + narrow */}
            <div className="md:col-span-4 p-7 rounded-3xl border border-border bg-card hover:border-border-light hover:bg-card-hover transition-all">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-black"
                style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)" }}
              >
                {FEATURES[2].icon}
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{FEATURES[2].title}</h3>
              <p className="text-sm text-muted leading-relaxed">{FEATURES[2].desc}</p>
            </div>

            <div className="md:col-span-2 p-7 rounded-3xl border border-border bg-card hover:border-border-light hover:bg-card-hover transition-all">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-black"
                style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)" }}
              >
                {FEATURES[3].icon}
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{FEATURES[3].title}</h3>
              <p className="text-sm text-muted leading-relaxed">{FEATURES[3].desc}</p>
            </div>

            {/* Row 3: equal halves */}
            {FEATURES.slice(4).map((f) => (
              <div key={f.title} className="md:col-span-3 p-7 rounded-3xl border border-border bg-card hover:border-border-light hover:bg-card-hover transition-all">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-black"
                  style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)" }}
                >
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="py-24 md:py-32 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-3">Tarifs</p>
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">
              Commencez gratuitement.
              <br />
              <span className="text-muted-foreground">Scalez quand vous êtes prêt.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {PRICING_ORDER.map((id) => {
              const plan = PLANS[id];
              const details = PRICING_DETAILS[id];
              return (
                <div
                  key={id}
                  className={`relative flex flex-col p-7 rounded-3xl border transition-all ${
                    details.featured
                      ? "border-[#f97316]/40 bg-[#f97316]/5 shadow-2xl shadow-[#f97316]/10"
                      : "border-border bg-card hover:border-border-light"
                  }`}
                >
                  {details.featured && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 text-black shadow-lg whitespace-nowrap"
                      style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)" }}
                    >
                      <Star className="w-3 h-3" /> Recommandé
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted mb-2">{plan.name}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-foreground">{plan.price}€</span>
                      {plan.price > 0 && (
                        <span className="text-sm text-muted">/mois</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {details.features.map((f) => (
                      <li
                        key={f}
                        className={`flex items-start gap-2.5 text-sm ${
                          f.endsWith(":") ? "text-foreground font-semibold" : "text-muted"
                        }`}
                      >
                        {!f.endsWith(":") && (
                          <CheckCircle2
                            className="w-4 h-4 shrink-0 mt-0.5"
                            style={{ color: details.featured ? "#f97316" : "#22c55e" }}
                          />
                        )}
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={details.href}
                    className={`block w-full text-center py-3 rounded-2xl font-bold text-sm transition-all ${
                      details.featured
                        ? "text-black hover:opacity-90 hover:-translate-y-0.5 shadow-md"
                        : "bg-surface border border-border text-foreground hover:bg-surface-hover"
                    }`}
                    style={details.featured ? { background: "linear-gradient(135deg, #f97316, #fbbf24)" } : {}}
                  >
                    {details.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="relative p-12 rounded-3xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(251,191,36,0.05))" }}
          >
            <div className="absolute inset-0 border border-[#f97316]/20 rounded-3xl pointer-events-none" />
            <Flame className="w-10 h-10 mx-auto mb-6" style={{ color: "#f97316" }} />
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Prêt à publier plus vite ?
            </h2>
            <p className="text-muted mb-8 max-w-md mx-auto">
              Rejoignez les créateurs qui gagnent des heures chaque semaine avec ContentFlow AI.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base text-black shadow-xl hover:opacity-90 hover:-translate-y-0.5 transition-all"
              style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)" }}
            >
              <Zap className="w-4 h-4" />
              Commencer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)" }}
                >
                  <Sparkles className="w-4 h-4 text-black" />
                </div>
                <span className="text-sm font-black text-foreground">
                  Content<span style={{ color: "#f97316" }}>Flow</span>
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Transformez vos articles en posts sociaux en 30 secondes.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Produit</h4>
              <div className="space-y-2">
                <Link href="/dashboard" className="block text-xs text-muted hover:text-foreground transition-colors">Dashboard</Link>
                <Link href="/sign-up" className="block text-xs text-muted hover:text-foreground transition-colors">S&apos;inscrire</Link>
                <Link href="/upgrade" className="block text-xs text-muted hover:text-foreground transition-colors">Tarifs</Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Légal</h4>
              <div className="space-y-2">
                <Link href="/mentions-legales" className="block text-xs text-muted hover:text-foreground transition-colors">Mentions légales</Link>
                <Link href="/politique-de-confidentialite" className="block text-xs text-muted hover:text-foreground transition-colors">Confidentialité</Link>
                <Link href="/cgv" className="block text-xs text-muted hover:text-foreground transition-colors">CGV</Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Node IA</h4>
              <div className="space-y-2">
                <a href="https://node-ia.com" target="_blank" rel="noopener" className="block text-xs text-muted hover:text-foreground transition-colors">node-ia.com</a>
                <a href="mailto:contact@node-ia.com" className="block text-xs text-muted hover:text-foreground transition-colors">Contact</a>
                <p className="text-xs text-muted">Rouen, France</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
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
