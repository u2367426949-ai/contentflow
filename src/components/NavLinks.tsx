"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const ALL_LINKS = [
  { href: "/", label: "Accueil", requireGuest: true },
  { href: "/dashboard", label: "Dashboard", requireAuth: true },
  { href: "/dashboard/brand-voices", label: "Style", requireAuth: true },
  { href: "/dashboard/schedule", label: "Planning", requireAuth: true },
  { href: "/dashboard/analytics", label: "Performance", requireAuth: true },
];

export function NavLinks() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  const links = ALL_LINKS.filter((link) => {
    if (link.requireGuest && isSignedIn) return false;
    if (link.requireAuth && !isSignedIn) return false;
    return true;
  });

  if (links.length === 0) return null;

  return (
    <div className="hidden sm:flex items-center gap-0.5">
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
            }`}
          >
            {link.label}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, #f97316, #fbbf24)" }} />
            )}
          </Link>
        );
      })}
    </div>
  );
}
