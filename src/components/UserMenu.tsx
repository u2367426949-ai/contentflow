"use client";

import { useState, useEffect, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Crown,
  LogOut,
  ChevronDown,
  Sparkles,
  User,
  ArrowUpRight,
  RefreshCw,
  XCircle,
  Settings,
} from "lucide-react";

export function UserMenu() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [quota, setQuota] = useState<{ plan: string; generationCount: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch quota on mount and on dropdown open
  const fetchQuota = () => {
    if (!isLoaded || !user) return;
    fetch("/api/user/me")
      .then((r) => r.json())
      .then(setQuota)
      .catch(() => {});
  };

  useEffect(() => {
    fetchQuota();
  }, [isLoaded, user]);

  function toggleOpen() {
    if (!open) fetchQuota(); // refresh on open
    setOpen(!open);
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  if (!isLoaded || !user) {
    return (
      <div className="w-8 h-8 rounded-full bg-surface animate-pulse" />
    );
  }

  const initials =
    user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user.firstName?.[0]?.toUpperCase() || "?";

  const isPro = quota?.plan === "pro";
  const remaining = quota ? 3 - quota.generationCount : 0;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => toggleOpen()}
        className="flex items-center gap-2.5 group"
      >
        {/* Avatar */}
        <div className="relative">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full ring-2 ring-accent/20 group-hover:ring-accent/40 transition-all"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-accent/20 ring-2 ring-accent/20 group-hover:ring-accent/40 transition-all flex items-center justify-center text-xs font-bold text-accent">
              {initials}
            </div>
          )}
          {isPro && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-accent flex items-center justify-center ring-2 ring-background">
              <Crown className="w-2 h-2 text-white" />
            </span>
          )}
        </div>

        {/* Name + plan (desktop) */}
        <div className="hidden sm:block text-left leading-tight">
          <div className="text-sm font-medium text-foreground max-w-[120px] truncate">
            {user.firstName || user.emailAddresses[0]?.emailAddress?.split("@")[0] || "Utilisateur"}
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-[11px] font-medium ${isPro ? "text-accent" : "text-muted"}`}>
              {isPro ? "Pro" : "Gratuit"}
            </span>
            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </div>
        </div>

        {/* Mobile chevron */}
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground sm:hidden transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-2xl shadow-black/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User info */}
          <div className="px-4 py-3.5 border-b border-border/50">
            <div className="flex items-center gap-3">
              {user.imageUrl ? (
                <img src={user.imageUrl} alt="" className="w-9 h-9 rounded-full" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {user.fullName || user.emailAddresses[0]?.emailAddress || "Utilisateur"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user.emailAddresses[0]?.emailAddress}
                </div>
              </div>
            </div>

            {/* Plan badge */}
            <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
              isPro ? "bg-accent/10 text-accent" : "bg-surface text-muted-foreground"
            }`}>
              {isPro ? (
                <>
                  <Crown className="w-3.5 h-3.5" />
                  Plan Pro · Générations illimitées
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {remaining > 0
                    ? `${remaining} génération${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""} ce mois-ci`
                    : "0 génération restante ce mois-ci"}
                </>
              )}
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
              Dashboard
            </Link>

            {!isPro ? (
              <>
                <Link
                  href="/upgrade"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent hover:bg-accent/5 transition-colors"
                >
                  <Crown className="w-4 h-4" />
                  Passer en Pro
                  <ArrowUpRight className="w-3 h-3 ml-auto" />
                </Link>
                <button
                  onClick={async () => {
                    setOpen(false);
                    try {
                      const res = await fetch("/api/stripe/activate", { method: "POST" });
                      const data = await res.json();
                      if (data.success) {
                        window.location.reload();
                      } else {
                        alert(data.message || "Aucun paiement trouvé.");
                      }
                    } catch {
                      alert("Erreur réseau.");
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Vérifier mon paiement
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-success">
                  <Crown className="w-4 h-4" />
                  Pro actif
                </div>
                <button
                  onClick={async () => {
                    setOpen(false);
                    try {
                      const res = await fetch("/api/stripe/cancel", { method: "POST" });
                      const data = await res.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        alert(data.error || "Erreur.");
                      }
                    } catch {
                      alert("Erreur réseau.");
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Gérer l'abonnement
                </button>
              </>
            )}

            <button
              onClick={() => {
                setOpen(false);
                signOut(() => router.push("/"));
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
