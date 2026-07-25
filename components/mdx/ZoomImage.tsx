"use client";
import { useEffect, useRef } from "react";
import type { Zoom } from "medium-zoom";

export function ZoomImage({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  // Pass intrinsic pixel dimensions so the browser reserves space (aspect-ratio
  // from width/height + height:auto) and the image doesn't shift layout as it
  // loads (CLS). medium-zoom needs a raw <img>, so we can't use next/image here.
  width?: number;
  height?: number;
}) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    let zoom: Zoom | undefined;
    let cancelled = false;

    const attach = async () => {
      const { default: mediumZoom } = await import("medium-zoom");
      if (cancelled || !ref.current) return;
      zoom = mediumZoom(ref.current, {
        background: "color-mix(in oklab, var(--moonless) 85%, transparent)",
        margin: 24,
      });
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            attach();
          }
        },
        { rootMargin: "200px" },
      );
      io.observe(img);
      return () => {
        cancelled = true;
        io.disconnect();
        zoom?.detach();
      };
    }

    attach();
    return () => {
      cancelled = true;
      zoom?.detach();
    };
  }, []);
  return (
    // medium-zoom needs a raw <img> element to attach to.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      style={{
        maxWidth: "100%",
        height: "auto",
        borderRadius: "var(--r-md)",
        margin: "var(--s-5) 0",
      }}
    />
  );
}
