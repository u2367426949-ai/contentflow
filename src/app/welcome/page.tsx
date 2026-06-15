"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/dashboard"), 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🎉</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Bienvenue sur ContentFlow AI !</h1>
        <p className="text-muted mb-8">
          Transformez n&apos;importe quel article en posts LinkedIn, Twitter et Instagram en 30 secondes.
        </p>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-card border border-border/50 text-left">
            <span className="text-lg mr-2">1️⃣</span>
            <span className="text-sm text-foreground font-medium">Collez une URL d&apos;article</span>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/50 text-left">
            <span className="text-lg mr-2">2️⃣</span>
            <span className="text-sm text-foreground font-medium">L&apos;IA génère 3 posts</span>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/50 text-left">
            <span className="text-lg mr-2">3️⃣</span>
            <span className="text-sm text-foreground font-medium">Copiez, planifiez, publiez</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-6">Redirection vers le dashboard...</p>
      </div>
    </div>
  );
}
