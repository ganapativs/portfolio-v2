"use client";
import { useRef, useState, type ComponentProps } from "react";
import { track } from "@/lib/analytics";

type Status = "idle" | "copied" | "failed";

type CodeBlockProps = ComponentProps<"pre"> & { "data-title"?: string };

export function CodeBlock(props: CodeBlockProps) {
  const ref = useRef<HTMLPreElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const title = props["data-title"];

  const onCopy = async () => {
    const text = ref.current?.innerText ?? "";
    const flash = (s: Status) => {
      setStatus(s);
      setTimeout(() => setStatus("idle"), 1400);
    };
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      flash("failed");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      flash("copied");
      track({ name: "copy", kind: "code" });
    } catch {
      flash("failed");
    }
  };

  const label = status === "copied" ? "copied" : status === "failed" ? "press ⌘C" : "copy";
  const ariaLabel =
    status === "copied"
      ? "Code copied to clipboard"
      : status === "failed"
        ? "Copy failed — press ⌘C to copy manually"
        : "Copy code to clipboard";

  return (
    <div className="codeblock">
      {title && <div className="codeblock-title">{title}</div>}
      <pre ref={ref} {...props} />
      <button
        className="codeblock-copy"
        onClick={onCopy}
        aria-label={ariaLabel}
        aria-live="polite"
        data-status={status}
      >
        {label}
      </button>
    </div>
  );
}
