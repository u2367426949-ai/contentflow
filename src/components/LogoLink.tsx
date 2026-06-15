"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

export function LogoLink() {
  const { isSignedIn } = useUser();

  return (
    <Link
      href={isSignedIn ? "/dashboard" : "/"}
      className="flex items-center gap-2.5 group shrink-0"
    >
      <div className="relative w-8 h-8 rounded-lg bg-accent flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        <Sparkles className="w-4 h-4 text-white relative z-10" />
      </div>
      <span className="font-bold text-base text-foreground tracking-tight">
        ContentFlow<span className="text-accent">AI</span>
      </span>
    </Link>
  );
}
