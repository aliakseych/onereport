import { Link } from "react-router-dom";

import { Button } from "@/shared/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-8 text-center">
      <h3 className="text-2xl font-black tracking-editorial text-primary">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-on-surface-variant">
        {description}
      </p>
      {actionLabel && actionTo ? (
        <Link className="mt-6 inline-flex" to={actionTo}>
          <Button>{actionLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}
