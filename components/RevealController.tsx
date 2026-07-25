"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

type RevealAPI = {
  register: (el: HTMLElement) => void;
  unregister: (el: HTMLElement) => void;
};

const RevealContext = createContext<RevealAPI | null>(null);

export function useReveal() {
  return useContext(RevealContext);
}

const REVEAL_MARGIN = 60;

function isInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh - REVEAL_MARGIN && rect.bottom > 0;
}

export function RevealController({ children }: { children: React.ReactNode }) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const trackedRef = useRef<Set<HTMLElement>>(new Set());
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
            trackedRef.current.delete(entry.target as HTMLElement);
          }
        }
      },
      { threshold: 0.15, rootMargin: `0px 0px -${REVEAL_MARGIN}px 0px` },
    );
    observerRef.current = observer;

    // Manual sweep covers cases where IO's initial callback is delayed: hidden tab, bfcache restore, dev HMR.
    const sweep = () => {
      for (const el of Array.from(trackedRef.current)) {
        if (isInViewport(el)) {
          el.classList.add("in-view");
          observer.unobserve(el);
          trackedRef.current.delete(el);
        }
      }
    };

    // Pick up anything that registered before this effect ran.
    for (const el of trackedRef.current) {
      if (reducedMotion.current) {
        el.classList.add("in-view");
      } else {
        observer.observe(el);
      }
    }
    if (reducedMotion.current) {
      trackedRef.current.clear();
    } else {
      // Defer two frames: first paint may not have laid out yet, so getBoundingClientRect would be wrong.
      requestAnimationFrame(() => requestAnimationFrame(sweep));
    }

    const onVisibility = () => {
      if (!document.hidden) sweep();
    };
    const onPageShow = () => sweep();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      observer.disconnect();
      observerRef.current = null;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  const register = useCallback((el: HTMLElement) => {
    if (reducedMotion.current) {
      el.classList.add("in-view");
      return;
    }
    trackedRef.current.add(el);
    if (observerRef.current) observerRef.current.observe(el);
  }, []);

  const unregister = useCallback((el: HTMLElement) => {
    trackedRef.current.delete(el);
    observerRef.current?.unobserve(el);
  }, []);

  const value = useMemo(() => ({ register, unregister }), [register, unregister]);

  return <RevealContext.Provider value={value}>{children}</RevealContext.Provider>;
}
