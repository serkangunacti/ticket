"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedStatValueProps = {
  value: number;
  className?: string;
  duration?: number;
  suffix?: string;
  prefix?: string;
  padStart?: number;
};

export function AnimatedStatValue({
  value,
  className,
  duration = 1400,
  suffix = "",
  prefix = "",
  padStart,
}: AnimatedStatValueProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frameRef.current = window.requestAnimationFrame(() => {
        setDisplayValue(value);
      });
      return;
    }

    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [duration, value]);

  const renderedValue = padStart
    ? displayValue.toString().padStart(padStart, "0")
    : displayValue.toString();

  return <span className={className}>{`${prefix}${renderedValue}${suffix}`}</span>;
}