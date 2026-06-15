"use client";

import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("contentflow-cookie-consent");
    if (!stored) {
      setTimeout(() => setShow(true), 500);
    }
  }, []);

  function accept() {
    localStorage.setItem("contentflow-cookie-consent", "accepted");
    setShow(false);
  }

  function reject() {
    localStorage.setItem("contentflow-cookie-consent", "rejected");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4">
      <div className="max-w-xl mx-auto bg-card border border-border rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Cookie className="w-4 h-4 text-accent shrink-0" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            Nous utilisons des cookies pour améliorer votre expérience.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={reject}
            className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:bg-surface transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="px-3 py-1.5 text-xs rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
