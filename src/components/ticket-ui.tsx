import type { CSSProperties, ReactNode } from "react";

import { getPriorityLabel, getStatusLabel } from "@/lib/labels";
import type { TicketPriority, TicketStatus } from "@/lib/types";
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
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "rounded-[26px] border border-[color:var(--line)] bg-[color:var(--panel)] p-5 shadow-[0_18px_48px_rgba(8,25,47,0.08)] backdrop-blur-xl",
        className,
      )}
      style={style}
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
      {getStatusLabel(value as TicketStatus) ?? value.replace("_", " ")}
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
      {getPriorityLabel(value as TicketPriority) ?? value}
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
    <div className="rounded-[24px] border border-[rgba(17,35,60,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(243,248,252,0.96)_100%)] p-4 shadow-[0_12px_30px_rgba(8,25,47,0.05)]">
      <div className="mb-3 h-1.5 w-14 rounded-full bg-[linear-gradient(90deg,#37c2e8,#143b67)]" />
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#607287]">
        {label}
      </p>
      <p className="mt-2 text-[2rem] font-semibold tracking-tight text-[#102038]">
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-xs leading-6 text-[#64748b]">{hint}</p> : null}
    </div>
  );
}
