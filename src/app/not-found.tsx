import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-7xl font-bold text-accent mb-4">404</div>
        <h1 className="text-xl font-bold text-foreground mb-2">Page introuvable</h1>
        <p className="text-muted mb-8">Cette page n&apos;existe pas ou a été déplacée.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-all"
        >
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
