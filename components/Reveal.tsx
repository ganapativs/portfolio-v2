"use client";

import { useRef, useEffect } from "react";
import { useReveal } from "./RevealController";

export function Reveal({
  children,
  delay,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const api = useReveal();

  useEffect(() => {
    const el = ref.current;
    if (!el || !api) return;
    api.register(el);
    return () => api.unregister(el);
  }, [api]);

  return (
    <div
      ref={ref}
      className={`reveal${className ? ` ${className}` : ""}`}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
