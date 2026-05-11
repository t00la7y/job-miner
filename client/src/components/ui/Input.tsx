import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-3 py-2 border border-[var(--color-border-secondary)] rounded-md text-sm text-[var(--color-text-primary)] bg-[var(--color-background-primary)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-border-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-border-primary)]",
          className,
        )}
        {...props}
      />
    </div>
  );
};
