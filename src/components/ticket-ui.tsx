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
    new: "bg-[#dff4fb] text-[#0f5a73]",
    open: "bg-[#e6eef9] text-[#274a75]",
    waiting_customer: "bg-[#ece8fb] text-[#55449c]",
    resolved: "bg-[#e5f4ea] text-[#2b6c45]",
    closed: "bg-[#eceff3] text-[#526070]",
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
    low: "bg-[#eceff3] text-[#526070]",
    normal: "bg-[#dff4fb] text-[#0f5a73]",
    high: "bg-[#e8edf7] text-[#3f5680]",
    critical: "bg-[#fae7ea] text-[#9c3d4c]",
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
    <div className="rounded-[24px] border border-[rgba(15,23,42,0.08)] bg-[#f7fafc] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#64748b]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#18212c]">
        {value}
      </p>
      {hint ? <p className="mt-2 text-sm text-[#64748b]">{hint}</p> : null}
    </div>
  );
}
