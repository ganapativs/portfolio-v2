"use client";
import { useEffect, useMemo } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { useShortcutList, useShortcutRegistry } from "./ShortcutProvider";
import { KeyGlyph } from "./KeyGlyph";

const GROUP_ORDER = ["Navigate", "Theme", "Sound", "Accent", "Page", "Help"];

export function ShortcutHelp() {
  const reg = useShortcutRegistry();
  const list = useShortcutList();

  // Push/pop modal scope so global shortcuts don't fire while help is open.
  // Depend on the stable pieces, not `reg` — its identity changes on every
  // shortcut register/unregister, which would churn the scope stack while
  // the dialog is open.
  const { helpOpen, pushScope, popScope } = reg;
  useEffect(() => {
    if (helpOpen) {
      pushScope("modal");
      return () => popScope("modal");
    }
  }, [helpOpen, pushScope, popScope]);

  const groups = useMemo(() => {
    const byGroup = new Map<string, typeof list>();
    for (const s of list) {
      if ((s.scope ?? "global") !== "global") continue;
      const g = s.group || "Other";
      const arr = byGroup.get(g) ?? [];
      arr.push(s);
      byGroup.set(g, arr);
    }
    const builtinHelp = [
      { id: "_help", keys: ["?"], label: "Open this help", group: "Help" },
      { id: "_close", keys: ["escape"], label: "Close help", group: "Help" },
      { id: "_hint", keys: ["shift"], label: "Hold to reveal keys", group: "Help" },
    ];
    const helpArr = (byGroup.get("Help") ?? []).slice();
    for (const b of builtinHelp) {
      if (!helpArr.some((s) => s.id === b.id)) {
        helpArr.push({
          ...b,
          run: () => {},
          elementRef: undefined,
        } as (typeof list)[number]);
      }
    }
    byGroup.set("Help", helpArr);

    const orderedKeys = [
      ...GROUP_ORDER.filter((g) => byGroup.has(g)),
      ...Array.from(byGroup.keys()).filter((g) => !GROUP_ORDER.includes(g)),
    ];
    return orderedKeys.map((g) => {
      const items = byGroup.get(g) ?? [];
      items.sort((a, b) => {
        const ak = a.keys[0] ?? "";
        const bk = b.keys[0] ?? "";
        return ak.localeCompare(bk, undefined, { numeric: true });
      });
      return { group: g, items };
    });
  }, [list]);

  return (
    <Dialog.Root open={reg.helpOpen} onOpenChange={(o) => (o ? reg.openHelp() : reg.closeHelp())}>
      <Dialog.Portal>
        <Dialog.Backdrop className="khelp-backdrop" />
        <Dialog.Popup className="khelp-popup">
          <header className="khelp-header">
            <Dialog.Title className="khelp-title">Keyboard</Dialog.Title>
            <Dialog.Description className="khelp-sub">
              Direct keys for every move. No leader, no chord, just press.
            </Dialog.Description>
          </header>

          <div className="khelp-body">
            {groups.map(({ group, items }) => (
              <section key={group} className="khelp-section">
                <h3 className="khelp-section-title">{group}</h3>
                <ul className="khelp-list">
                  {items.map((s) => (
                    <li key={s.id} className="khelp-row">
                      <span className="khelp-keys">
                        {s.keys.map((k) => (
                          <KeyGlyph key={`${s.id}-${k}`} k={k} size="md" spoken />
                        ))}
                      </span>
                      <span className="khelp-label">{s.label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <footer className="khelp-footer">
            <span>
              Hold <KeyGlyph k="shift" size="sm" spoken /> to see keys on the page.
            </span>
            <Dialog.Close className="khelp-close" aria-label="Close">
              <KeyGlyph k="escape" size="sm" />
            </Dialog.Close>
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
