"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "everglade" | "orange" | "gray-black" | "mist";

const GRADIENT: Record<Variant, string> = {
  everglade:
    "radial-gradient(at 78% 18%, #3f6b5e 0%, transparent 45%), radial-gradient(at 28% 85%, #9ebaae 0%, transparent 55%), radial-gradient(at 60% 60%, #cadbd4 0%, transparent 45%), linear-gradient(135deg, #dadfe0 0%, #58897a 100%)",
  orange:
    "radial-gradient(at 80% 15%, #ec4819 0%, transparent 40%), radial-gradient(at 20% 85%, #fed8cb 0%, transparent 50%), linear-gradient(135deg, #fed8cb 0%, #ec4819 100%)",
  "gray-black":
    "radial-gradient(at 72% 22%, #3a4545 0%, transparent 45%), radial-gradient(at 25% 80%, #58897a 0%, transparent 55%), linear-gradient(135deg, #1a2424 0%, #2b3837 100%)",
  mist: "radial-gradient(at 80% 20%, #9ebaae 0%, transparent 50%), radial-gradient(at 25% 75%, #dadfe0 0%, transparent 55%), linear-gradient(135deg, #eaeeec 0%, #c4cccb 100%)",
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
