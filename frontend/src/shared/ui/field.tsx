import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cx } from "@/shared/lib/cx";

interface BaseFieldProps {
  label: string;
  hint?: string;
  error?: string | null;
  wrapperClassName?: string;
}

interface TextFieldProps
  extends BaseFieldProps,
    InputHTMLAttributes<HTMLInputElement> {}

interface TextAreaFieldProps
  extends BaseFieldProps,
    TextareaHTMLAttributes<HTMLTextAreaElement> {}

function FieldMessage({
  hint,
  error,
}: {
  hint?: string;
  error?: string | null;
}) {
  if (error) {
    return <p className="text-sm text-error">{error}</p>;
  }

  if (hint) {
    return <p className="text-sm text-on-surface-variant">{hint}</p>;
  }

  return null;
}

export function TextField({
  label,
  hint,
  error,
  wrapperClassName,
  className,
  ...props
}: TextFieldProps) {
  return (
    <label className={cx("flex flex-col gap-3", wrapperClassName)}>
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
        {label}
      </span>
      <input
        className={cx(
          "min-h-12 rounded-xl bg-surface-container-low px-4 py-3 text-base text-on-surface outline-none ring-1 ring-transparent transition focus:ring-primary/20",
          className,
        )}
        {...props}
      />
      <FieldMessage error={error} hint={hint} />
    </label>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  wrapperClassName,
  className,
  ...props
}: TextAreaFieldProps) {
  return (
    <label className={cx("flex flex-col gap-3", wrapperClassName)}>
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
        {label}
      </span>
      <textarea
        className={cx(
          "min-h-40 rounded-xl bg-surface-container-low px-4 py-3 text-base text-on-surface outline-none ring-1 ring-transparent transition focus:ring-primary/20",
          className,
        )}
        {...props}
      />
      <FieldMessage error={error} hint={hint} />
    </label>
  );
}
