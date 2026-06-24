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
      <div
        className="relative w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden"
        style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)" }}
      >
        <Sparkles className="w-4 h-4 text-black relative z-10" />
      </div>
      <span className="font-black text-base text-foreground tracking-tight">
        Content<span style={{ color: "#f97316" }}>Flow</span>
      </span>
    </Link>
  );
}
