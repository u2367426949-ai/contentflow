import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { DemoSection } from "@/components/DemoSection";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SeoLandingPageProps {
  kicker: string;
  title: React.ReactNode;
  subtitle: string;
  bullets: string[];
  faq: FaqItem[];
  ctaLabel?: string;
  /** Optional extra section rendered between the live demo and the FAQ (e.g. a comparison table). */
  children?: React.ReactNode;
}

/**
 * Shared shell for programmatic SEO pages (/outils/*, /alternatives/*).
 * Reuses the same live demo as the homepage and emits FAQPage JSON-LD so
 * these pages are eligible for rich results, not just organic clicks.
 */
export function SeoLandingPage({
  kicker,
  title,
  subtitle,
  bullets,
  faq,
  ctaLabel = "Essayer gratuitement",
  children,
}: SeoLandingPageProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="flex flex-col flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── Hero ─── */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#f97316]/8 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#f97316]/30 bg-[#f97316]/8 text-[#fb923c] text-sm mb-8">
            <Zap className="w-3.5 h-3.5" />
            <span>{kicker}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6 leading-[1.05]">
            {title}
          </h1>

          <p className="text-lg text-muted leading-relaxed max-w-xl mx-auto mb-10">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base text-black overflow-hidden shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#f97316]/20"
              style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)" }}
            >
              <Zap className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{ctaLabel}</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {bullets.map((b) => (
              <li key={b} className="inline-flex items-center gap-1.5 text-sm text-muted">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Demo ─── */}
      <DemoSection />

      {children}

      {/* ─── FAQ ─── */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-accent mb-3 text-center">
            Questions fréquentes
          </p>
          <div className="space-y-4 mt-8">
            {faq.map((item) => (
              <div key={item.question} className="p-5 rounded-2xl bg-card border border-border">
                <h3 className="text-foreground font-semibold mb-2">{item.question}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="relative p-10 rounded-3xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(251,191,36,0.05))" }}
          >
            <div className="absolute inset-0 border border-[#f97316]/20 rounded-3xl pointer-events-none" />
            <h2 className="text-2xl md:text-3xl font-black text-foreground mb-4">
              Prêt à essayer ?
            </h2>
            <p className="text-muted mb-8 max-w-sm mx-auto text-sm">
              5 générations gratuites par mois, sans carte bancaire.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-black shadow-xl hover:opacity-90 hover:-translate-y-0.5 transition-all"
              style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)" }}
            >
              <Zap className="w-4 h-4" />
              Commencer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
