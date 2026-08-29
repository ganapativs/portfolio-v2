"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFX } from "@/components/providers/FXProvider";
import { track } from "@/lib/analytics";

export type ShortcutScope = "global" | "modal" | "page";

export type Shortcut = {
  id: string;
  keys: string[];
  label: string;
  group: string;
  scope?: ShortcutScope;
  hint?: string;
  elementRef?: React.RefObject<HTMLElement | null>;
  /** Skip the registry's generic tick and let the shortcut sound itself. The
   *  ink tray uses it: each of the six inks has its own pitch, and the generic
   *  tick would land on top of the note. */
  silent?: boolean;
  run: () => void;
};

type RegistryAPI = {
  register: (s: Shortcut) => void;
  unregister: (id: string) => void;
  list: () => Shortcut[];
  pushScope: (s: ShortcutScope) => void;
  popScope: (s: ShortcutScope) => void;
  activeScope: ShortcutScope;
  helpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
  /** monotonic version that bumps on register/unregister so subscribers can re-read */
  version: number;
};

const RegistryContext = createContext<RegistryAPI | null>(null);

function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (t.isContentEditable) return true;
  if (t.getAttribute("role") === "textbox") return true;
  if (t.closest("[data-no-shortcuts]")) return true;
  return false;
}

function normaliseKey(e: KeyboardEvent): string {
  // `?` is Shift+/ on US keyboards. Match by e.key directly so we get "?" regardless of layout.
  if (e.key === "?") return "?";
  if (e.key === "Escape") return "escape";
  return e.key.toLowerCase();
}

export function ShortcutProvider({ children }: { children: React.ReactNode }) {
  const fx = useFX();
  // Map in a ref + version counter: keydown listener reads fresh data; subscribers re-render off `version`.
  const mapRef = useRef<Map<string, Shortcut>>(new Map());
  const [version, setVersion] = useState(0);
  const [scopeStack, setScopeStack] = useState<ShortcutScope[]>(["global"]);
  const [helpOpen, setHelpOpen] = useState(false);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const register = useCallback(
    (s: Shortcut) => {
      const m = mapRef.current;
      if (process.env.NODE_ENV !== "production") {
        const scope = s.scope ?? "global";
        for (const existing of m.values()) {
          if (existing.id === s.id) continue;
          if ((existing.scope ?? "global") !== scope) continue;
          for (const k of s.keys) {
            if (existing.keys.includes(k)) {
              // eslint-disable-next-line no-console
              console.warn(
                `[shortcuts] duplicate key "${k}" in scope "${scope}": "${existing.id}" vs "${s.id}"`,
              );
            }
          }
        }
      }
      m.set(s.id, s);
      bump();
    },
    [bump],
  );

  const unregister = useCallback(
    (id: string) => {
      const m = mapRef.current;
      if (m.delete(id)) bump();
    },
    [bump],
  );

  const list = useCallback(() => Array.from(mapRef.current.values()), []);

  const pushScope = useCallback((s: ShortcutScope) => {
    setScopeStack((prev) => [...prev, s]);
  }, []);
  const popScope = useCallback((s: ShortcutScope) => {
    setScopeStack((prev) => {
      const i = prev.lastIndexOf(s);
      if (i === -1) return prev;
      return [...prev.slice(0, i), ...prev.slice(i + 1)];
    });
  }, []);

  const openHelp = useCallback(() => setHelpOpen(true), []);
  const closeHelp = useCallback(() => setHelpOpen(false), []);

  const activeScope = scopeStack[scopeStack.length - 1] ?? "global";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditableTarget(e.target)) return;

      const k = normaliseKey(e);

      if (k === "?") {
        e.preventDefault();
        if (!helpOpen) {
          fx?.tick();
          fx?.haptic(6);
          setHelpOpen(true);
          track({ name: "help" });
        }
        return;
      }
      if (k === "escape") {
        // Route Escape through the registry for the ACTIVE scope first — a
        // pushed scope (modal/page) may register its own Escape handler.
        // Only if nothing claims it does Escape fall through to closing help.
        for (const s of mapRef.current.values()) {
          if ((s.scope ?? "global") !== activeScope) continue;
          if (!s.keys.includes("escape")) continue;
          if (!s.silent) {
            fx?.tick();
            fx?.haptic(6);
          }
          s.run();
          return;
        }
        if (helpOpen) setHelpOpen(false);
        // No preventDefault: other handlers (e.g. dialog dismissal) still need this Escape.
        return;
      }

      if (activeScope !== "global") return;

      for (const s of mapRef.current.values()) {
        if ((s.scope ?? "global") !== "global") continue;
        if (!s.keys.includes(k)) continue;
        e.preventDefault();
        if (!s.silent) {
          fx?.tick();
          fx?.haptic(6);
        }
        // Reported here rather than at each registration site: this is the one
        // place that knows a shortcut fired *from the keyboard* rather than
        // from the control it shares a handler with.
        track({ name: "shortcut", id: s.id });
        s.run();
        return;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeScope, helpOpen, fx]);

  const api = useMemo<RegistryAPI>(
    () => ({
      register,
      unregister,
      list,
      pushScope,
      popScope,
      activeScope,
      helpOpen,
      openHelp,
      closeHelp,
      version,
    }),
    [
      register,
      unregister,
      list,
      pushScope,
      popScope,
      activeScope,
      helpOpen,
      openHelp,
      closeHelp,
      version,
    ],
  );

  return <RegistryContext.Provider value={api}>{children}</RegistryContext.Provider>;
}

export function useShortcutRegistry() {
  const ctx = useContext(RegistryContext);
  if (!ctx) throw new Error("useShortcutRegistry must be used inside <ShortcutProvider>");
  return ctx;
}

/** Read-only registry hook that returns a stable list snapshot, updating when shortcuts register/unregister. */
export function useShortcutList(): Shortcut[] {
  const ctx = useContext(RegistryContext);
  const version = ctx?.version ?? 0;
  // `version` bumps on register/unregister; the dep forces a fresh list() snapshot.
  return useMemo(() => {
    void version;
    return ctx ? ctx.list() : [];
  }, [ctx, version]);
}
