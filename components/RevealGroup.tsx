"use client";

import { useRef, useEffect } from "react";
import { useReveal } from "./RevealController";

export function RevealGroup({
  children,
  stagger = 80,
  className,
}: {
  children: React.ReactNode;
  stagger?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const api = useReveal();

  useEffect(() => {
    const el = ref.current;
    if (!el || !api) return;

    const kids = el.children;
    for (let i = 0; i < kids.length; i++) {
      (kids[i] as HTMLElement).style.setProperty("--reveal-delay", `${i * stagger}ms`);
    }

    api.register(el);
    return () => {
      api.unregister(el);
    };
  }, [api, stagger]);

  return (
    <div ref={ref} className={`reveal-group${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
