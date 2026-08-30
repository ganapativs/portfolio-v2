"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { DitherField } from "./DitherField";

/**
 * The light under the hand, in whichever form this browser can draw it.
 *
 * `GpuLamp` is a separate chunk and is only ever requested where
 * `navigator.gpu` exists, which keeps 44 kB of WebGPU runtime out of every
 * first load. It is also only requested after mount, so it never competes with
 * the page's own scripts.
 *
 * `navigator.gpu` is a promise of a request rather than of a device, so the
 * lamp can still fail after all that: no adapter, a blocked context, a driver
 * the browser will not use. `onFail` is how it hands back, and the 2D field
 * takes over with nothing lost. That field is not a stub — it is the same
 * light, drawn with what a main thread can afford.
 */
const GpuLamp = dynamic(() => import("./GpuLamp").then((m) => m.GpuLamp), { ssr: false });

type Mode = "unknown" | "gpu" | "cpu";

export function Lamp() {
  const [mode, setMode] = useState<Mode>("unknown");
  const fallBack = useCallback(() => setMode("cpu"), []);

  useEffect(() => {
    // Coarse pointers have no cursor to light anything, and both fields cost a
    // full-viewport backing store whether or not a frame is ever drawn.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setMode("gpu" in navigator && navigator.gpu ? "gpu" : "cpu");
  }, []);

  if (mode === "unknown") return null;
  if (mode === "cpu") return <DitherField />;
  return <GpuLamp onFail={fallBack} />;
}
