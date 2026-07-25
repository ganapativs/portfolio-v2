"use client";
import { memo, useEffect, useRef, useState } from "react";

function CanIUseImpl({ feature }: { feature: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [iframeFailed, setIframeFailed] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const onMessage = (e: MessageEvent) => {
      if (typeof e.data === "string" && e.data.startsWith(`ciu_embed:${feature}`)) {
        const parts = e.data.split(":");
        const h = parseInt(parts[2], 10);
        if (!Number.isNaN(h)) setHeight(h);
      }
    };
    window.addEventListener("message", onMessage);
    const t = setTimeout(() => {
      if (height === null) setIframeFailed(true);
    }, 4000);
    return () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(t);
    };
  }, [feature, height]);

  if (iframeFailed) {
    return (
      <picture>
        <source type="image/webp" srcSet={`https://caniuse.bitsofco.de/image/${feature}.webp`} />
        <img
          src={`https://caniuse.bitsofco.de/image/${feature}.png`}
          alt={`Can I Use: ${feature}`}
          style={{ width: "100%" }}
        />
      </picture>
    );
  }

  return (
    <div ref={ref} style={{ margin: "var(--s-5) 0" }}>
      <iframe
        src={`https://caniuse.bitsofco.de/embed/index.html?feat=${encodeURIComponent(feature)}&periods=future_1,current,past_1,past_2&accessible-colours=false`}
        title={`Can I Use: ${feature}`}
        loading="lazy"
        sandbox="allow-scripts"
        style={{ width: "100%", height: height ?? 420, border: 0 }}
      />
    </div>
  );
}

export const CanIUse = memo(CanIUseImpl, (a, b) => a.feature === b.feature);
