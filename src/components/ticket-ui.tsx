import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#8fe9ff]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Surface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-[color:var(--line)] bg-[color:var(--panel)] p-6 shadow-[0_24px_80px_rgba(8,25,47,0.08)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const colorMap: Record<string, string> = {
    new: "bg-cyan-100 text-cyan-800",
    open: "bg-blue-100 text-blue-800",
    waiting_customer: "bg-indigo-100 text-indigo-800",
    resolved: "bg-emerald-100 text-emerald-800",
    closed: "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        colorMap[value] ?? "bg-zinc-100 text-zinc-700",
      )}
    >
      {value.replace("_", " ")}
    </span>
  );
}

export function PriorityBadge({ value }: { value: string }) {
  const colorMap: Record<string, string> = {
    low: "bg-slate-100 text-slate-700",
    normal: "bg-cyan-100 text-cyan-800",
    high: "bg-sky-100 text-sky-800",
    critical: "bg-rose-100 text-rose-800",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        colorMap[value] ?? "bg-zinc-100 text-zinc-700",
      )}
    >
      {value}
    </span>
  );
}

export function MetricTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4e6a88]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#08192f]">
        {value}
      </p>
      {hint ? <p className="mt-2 text-sm text-[#5a6d85]">{hint}</p> : null}
    </div>
  );
}
