"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "cobalt" | "everglade" | "orange" | "gray-black" | "mist";

const GRADIENT: Record<Variant, string> = {
  /* Primary cobalt mesh — organic, off-axis radials over a diagonal base */
  cobalt:
    "radial-gradient(at 14% 22%, #dbe7fe 0%, transparent 46%), radial-gradient(at 86% 32%, #6b8afb 0%, transparent 54%), radial-gradient(at 42% 66%, #ffffff 0%, transparent 42%), radial-gradient(at 74% 88%, #3b2eec 0%, transparent 58%), radial-gradient(at 26% 94%, #dbe7fe 0%, transparent 44%), radial-gradient(at 95% 10%, #ffffff 0%, transparent 32%), radial-gradient(at 58% 38%, #6b8afb 0%, transparent 38%), linear-gradient(152deg, #eef3ff 0%, #6b8afb 48%, #3b2eec 100%)",
  /* Alias kept for legacy callers — re-pointed to cobalt */
  everglade:
    "radial-gradient(at 14% 22%, #dbe7fe 0%, transparent 46%), radial-gradient(at 86% 32%, #6b8afb 0%, transparent 54%), radial-gradient(at 42% 66%, #ffffff 0%, transparent 42%), radial-gradient(at 74% 88%, #3b2eec 0%, transparent 58%), radial-gradient(at 26% 94%, #dbe7fe 0%, transparent 44%), radial-gradient(at 95% 10%, #ffffff 0%, transparent 32%), radial-gradient(at 58% 38%, #6b8afb 0%, transparent 38%), linear-gradient(152deg, #eef3ff 0%, #6b8afb 48%, #3b2eec 100%)",
  orange:
    "radial-gradient(at 80% 15%, #3b2eec 0%, transparent 42%), radial-gradient(at 20% 85%, #dbe7fe 0%, transparent 55%), linear-gradient(135deg, #dbe7fe 0%, #6b8afb 100%)",
  "gray-black":
    "radial-gradient(at 72% 22%, #6b8afb 0%, transparent 48%), radial-gradient(at 25% 80%, #3b2eec 0%, transparent 55%), linear-gradient(135deg, #0a0a0b 0%, #17181d 100%)",
  mist: "radial-gradient(at 80% 20%, #6b8afb 0%, transparent 52%), radial-gradient(at 25% 75%, #dbe7fe 0%, transparent 58%), linear-gradient(135deg, #ffffff 0%, #dbe7fe 100%)",
};

type Props = {
  variant?: Variant;
  className?: string;
  children?: ReactNode;
  noiseOpacity?: number;
  baseFrequency?: number;
};

export function DitherPanel({
  variant = "everglade",
  className,
  children,
  noiseOpacity = 0.55,
  baseFrequency = 0.85,
}: Props) {
  const rawId = useId();
  const filterId = `noise-${rawId.replace(/:/g, "")}`;

  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: GRADIENT[variant] }}
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full mix-blend-overlay"
        style={{ opacity: noiseOpacity }}
      >
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFrequency}
            numOctaves={2}
            stitchTiles="stitch"
          />
          <feColorMatrix
            values="0 0 0 0 0.08  0 0 0 0 0.08  0 0 0 0 0.08  0 0 0 0.9 0"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
      {children !== undefined && (
        <div className="relative z-10 h-full">{children}</div>
      )}
    </div>
  );
}
