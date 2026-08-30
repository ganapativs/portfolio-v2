"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Exploded } from "@/components/schematic/Exploded";
import { Portrait } from "@/components/schematic/Portrait";

const Loupe = dynamic(() => import("@/components/schematic/Loupe").then((m) => m.Loupe));

/**
 * The figure under test, wired the way it would ship.
 *
 * Also says out loud whether this browser is on the GPU path, because the whole
 * point of the page is to judge the GPU version and half of these experiments
 * are invisible if the adapter never turned up.
 */
export function LabStage({ slug }: { slug: string }) {
  const [gpu, setGpu] = useState<string>("checking");

  useEffect(() => {
    let dead = false;
    void (async () => {
      if (!("gpu" in navigator) || !navigator.gpu) {
        if (!dead) setGpu("no WebGPU in this browser");
        return;
      }
      try {
        const a = await navigator.gpu.requestAdapter();
        if (dead) return;
        setGpu(a ? "WebGPU adapter present" : "WebGPU present, no adapter");
      } catch {
        if (!dead) setGpu("WebGPU request failed");
      }
    })();
    return () => {
      dead = true;
    };
  }, []);

  return (
    <>
      <p className="lab-status mono">{gpu}</p>
      <div className="lab-figure" data-slug={slug}>
        {slug === "flow" && <Exploded fig="fig. 1 · exploded view" />}
        {slug === "lens" && <Loupe />}
        {slug === "portrait" && <Portrait />}
      </div>
    </>
  );
}
