"use client";

import { useState, useEffect, useCallback } from "react";

export type ConsentChoice = "pending" | "accepted" | "rejected" | "custom";

export interface ConsentCategories {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = "contentflow-cookie-consent";

function getStoredConsent(): { choice: ConsentChoice; categories: ConsentCategories } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function storeConsent(choice: ConsentChoice, categories: ConsentCategories) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, categories }));
  } catch {
    // localStorage might be full or disabled
  }
}

export function useCookieConsent() {
  const [choice, setChoice] = useState<ConsentChoice>("pending");
  const [categories, setCategories] = useState<ConsentCategories>({
    essential: true,
    analytics: false,
    marketing: false,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      setChoice(stored.choice);
      setCategories(stored.categories);
    }
    setLoaded(true);
  }, []);

  const acceptAll = useCallback(() => {
    const cats: ConsentCategories = { essential: true, analytics: true, marketing: true };
    setChoice("accepted");
    setCategories(cats);
    storeConsent("accepted", cats);
  }, []);

  const rejectAll = useCallback(() => {
    const cats: ConsentCategories = { essential: true, analytics: false, marketing: false };
    setChoice("rejected");
    setCategories(cats);
    storeConsent("rejected", cats);
  }, []);

  const saveCustom = useCallback((cats: ConsentCategories) => {
    setChoice("custom");
    setCategories(cats);
    storeConsent("custom", cats);
  }, []);

  const toggleCategory = useCallback((cat: keyof ConsentCategories) => {
    if (cat === "essential") return; // Essential cannot be toggled
    setCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  }, []);

  return {
    choice,
    categories,
    loaded,
    acceptAll,
    rejectAll,
    saveCustom,
    toggleCategory,
  };
}
