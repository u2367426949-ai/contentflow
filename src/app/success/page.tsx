"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SuccessContent from "./SuccessContent";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
