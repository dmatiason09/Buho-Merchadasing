"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Phase = "idle" | "covering" | "revealing";

interface TransitionContextValue {
  phase: Phase;
  color: string;
  start: (color: string) => void;
  setPhase: (phase: Phase) => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [color, setColor] = useState("#ffffff");

  const start = (newColor: string) => {
    setColor(newColor);
    setPhase("covering");
  };

  return (
    <TransitionContext.Provider value={{ phase, color, start, setPhase }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx)
    throw new Error("useTransition must be used inside TransitionProvider");
  return ctx;
}
