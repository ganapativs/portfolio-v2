"use client";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useFX } from "@/components/providers/FXProvider";
import { Icon } from "./Icon";

type BaseProps = {
  variant?: "primary" | "secondary" | "ghost";
  withArrow?: boolean;
  children: ReactNode;
  className?: string;
};

type ButtonProps = BaseProps & {
  href?: undefined;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};
type LinkProps = BaseProps & { href: string; onClick?: (e: MouseEvent<HTMLAnchorElement>) => void };

export function Btn(props: ButtonProps | LinkProps) {
  const { variant = "secondary", withArrow, children, className = "", ...rest } = props;
  const fx = useFX();
  const ref = useRef<HTMLElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const frameRef = useRef(0);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const flush = () => {
    frameRef.current = 0;
    const p = pendingRef.current;
    if (!p || !ref.current) return;
    ref.current.style.transform = `translate(${p.x}px, ${p.y}px)`;
  };
  const onEnter = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (ref.current) rectRef.current = ref.current.getBoundingClientRect();
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = rectRef.current;
    if (!r) return;
    pendingRef.current = {
      x: ((e.clientX - r.left) / r.width - 0.5) * 8,
      y: ((e.clientY - r.top) / r.height - 0.5) * 8,
    };
    if (!frameRef.current) frameRef.current = requestAnimationFrame(flush);
  };
  const onLeave = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    pendingRef.current = null;
    if (ref.current) ref.current.style.transform = "";
    rectRef.current = null;
  };
  const interact = () => {
    // Audio is not motion — FXProvider applies its own sound gating. Only the
    // haptic (a motion channel) is dropped under reduced motion, and the
    // magnetic transform is already gated separately via motionHandlers.
    if (variant === "primary") fx?.primary();
    else if (variant === "ghost") fx?.back();
    else fx?.nav();
    if (!reduceMotion) fx?.haptic(8);
  };

  const inner = (
    <>
      {children}
      {withArrow && <Icon name="arrow" size="sm" className="arrow" />}
    </>
  );

  const cls = `btn ${variant} ${className}`;
  const motionHandlers = reduceMotion
    ? {}
    : {
        onPointerEnter: onEnter,
        onPointerMove: onMove,
        onPointerLeave: onLeave,
        onPointerCancel: onLeave,
      };

  if ("href" in rest && rest.href) {
    return (
      <Link
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={rest.href}
        className={cls}
        {...motionHandlers}
        onClick={(e) => {
          interact();
          rest.onClick?.(e);
        }}
      >
        {inner}
      </Link>
    );
  }
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      className={cls}
      {...motionHandlers}
      onClick={(e) => {
        interact();
        (rest as ButtonProps).onClick?.(e);
      }}
    >
      {inner}
    </button>
  );
}
