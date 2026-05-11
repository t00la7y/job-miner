import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) => {
  const baseClasses =
    "font-medium cursor-pointer border-none rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-[var(--color-text-primary)] text-[var(--color-background-primary)] hover:bg-opacity-90 focus:ring-[var(--color-text-primary)]",
    ghost:
      "bg-transparent border border-[var(--color-border-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)] focus:ring-[var(--color-border-secondary)]",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
