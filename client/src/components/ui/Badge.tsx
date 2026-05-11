import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gray" | "teal" | "amber";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "gray",
  className,
}) => {
  const variantClasses = {
    gray: "bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border-tertiary)]",
    teal: "bg-[#E1F5EE] text-[#0F6E56]",
    amber: "bg-[#FAEEDA] text-[#633806]",
  };

  return (
    <span
      className={cn(
        "inline-block text-xs px-3 py-1 rounded-full font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};
