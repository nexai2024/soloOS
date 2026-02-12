"use client";

import { useState, useEffect } from "react";

const ONBOARDING_KEY = "soloos_onboarding_completed";

export function useOnboarding() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setShowWelcome(true);
    }
    setIsLoading(false);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowWelcome(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowWelcome(true);
  };

  return {
    showWelcome,
    isLoading,
    completeOnboarding,
    resetOnboarding
  };
}
