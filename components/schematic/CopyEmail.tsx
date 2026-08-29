"use client";
import { useEffect, useRef, useState } from "react";
import { useFX } from "@/components/providers/FXProvider";
import { useShortcut } from "@/components/shortcuts/useShortcut";
import { useCoarsePointer } from "./useCoarsePointer";
import { track } from "@/lib/analytics";
import { identity } from "@/lib/resume";

/**
 * The address, without making anyone open a mail client to find out what it is.
 *
 * The chip teaches its own shortcut by being labelled with it, and confirms in
 * place: the label becomes the address that was just copied for a second and a
 * half, so the reader can see what landed on their clipboard. No toast, no
 * corner of the screen, nothing that outlives the gesture.
 */
export function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const coarse = useCoarsePointer();
  const fx = useFX();
  const tid = useRef(0);

  const copy = () => {
    const done = () => {
      fx?.blip();
      track({ name: "copy", kind: "email" });
      setCopied(true);
      window.clearTimeout(tid.current);
      tid.current = window.setTimeout(() => setCopied(false), 1500);
    };
    // The async clipboard API is refused outside a secure context and in a few
    // embedded webviews; the textarea route still works there.
    const fallback = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = identity.email;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
      } catch {}
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(identity.email).then(done, fallback);
    } else fallback();
  };

  const ref = useShortcut<HTMLButtonElement>({
    id: "copy.email",
    keys: ["e"],
    label: "Copy my email",
    group: "Page",
    run: copy,
  });

  useEffect(() => () => window.clearTimeout(tid.current), []);

  return (
    <button type="button" className="chip" ref={ref} data-copied={copied} onClick={copy}>
      {copied ? (
        <span>copied · {identity.email}</span>
      ) : coarse ? (
        // No keyboard on the other side of the glass, and on a phone this is
        // the only contact affordance above the footer.
        <span>tap to copy my email</span>
      ) : (
        <span>
          press <kbd>E</kbd> to copy my email
        </span>
      )}
    </button>
  );
}
