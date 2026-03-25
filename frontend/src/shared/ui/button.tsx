import type { ButtonHTMLAttributes } from "react";

import { cx } from "@/shared/lib/cx";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:opacity-90 focus-visible:outline-primary",
  secondary:
    "bg-surface-container-highest text-primary hover:bg-surface-container-high focus-visible:outline-outline",
  tertiary:
    "bg-tertiary text-on-tertiary hover:brightness-110 focus-visible:outline-tertiary",
  ghost:
    "bg-transparent text-primary hover:bg-surface-container focus-visible:outline-outline",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variantClasses[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
