"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
  name?: string;
  value?: string;
};

export function SubmitButton({
  children,
  pendingText,
  className,
  name,
  value,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      aria-busy={pending}
      className={cn(
        "transition disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
    >
      {pending ? pendingText : children}
    </button>
  );
}
