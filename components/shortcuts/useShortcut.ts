"use client";
import { useEffect, useRef } from "react";
import { useShortcutRegistry, type Shortcut } from "./ShortcutProvider";

type Options = Omit<Shortcut, "elementRef">;

/**
 * Register a keyboard shortcut and get back a ref to attach to the element
 * that the Shift-hold hint should float over.
 */
export function useShortcut<T extends HTMLElement = HTMLElement>(opts: Options) {
  const ref = useRef<T | null>(null);
  const reg = useShortcutRegistry();
  // Keep latest opts in a ref so we don't have to re-register on every render
  // (avoids effect-loop pitfalls when callers pass inline closures).
  const latest = useRef(opts);
  latest.current = opts;

  useEffect(() => {
    reg.register({
      id: opts.id,
      keys: opts.keys,
      label: opts.label,
      group: opts.group,
      scope: opts.scope,
      hint: opts.hint,
      silent: opts.silent,
      run: () => latest.current.run(),
      elementRef: ref as React.RefObject<HTMLElement | null>,
    });
    return () => reg.unregister(opts.id);
    // Re-register only when identity-defining props change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.id, opts.keys.join("|"), opts.scope, opts.label, opts.group, opts.hint, opts.silent]);

  return ref;
}
