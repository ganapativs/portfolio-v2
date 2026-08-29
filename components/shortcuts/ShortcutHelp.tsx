"use client";
import dynamic from "next/dynamic";
import { useShortcutRegistry } from "./ShortcutProvider";

/**
 * The gate in front of the `?` help sheet.
 *
 * The sheet itself is `@base-ui/react/dialog` — 62 modules and 25 kB gzipped
 * for the dialog, floating-ui, and the focus and dismiss machinery. That was
 * 14% of every page's JavaScript, on every route, for a panel most readers
 * never open. This component is the whole cost until somebody presses `?`.
 *
 * `ssr: false` because there is nothing to render on the server: the sheet
 * only exists while `helpOpen` is true, which is a client interaction by
 * definition, and the shortcut registry it reads is built during hydration.
 */
const Sheet = dynamic(() => import("./ShortcutHelpSheet"), { ssr: false });

export function ShortcutHelp() {
  const { helpOpen } = useShortcutRegistry();
  if (!helpOpen) return null;
  return <Sheet />;
}
