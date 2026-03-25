import type {
  ProblemCategory,
  ProblemImportance,
  ProblemLifecycleStatus,
  ProblemStatus,
} from "@/entities/problem/model/types";
import {
  PROBLEM_CATEGORY_LABELS,
  PROBLEM_IMPORTANCE_LABELS,
  PROBLEM_LIFECYCLE_LABELS,
  PROBLEM_STATUS_LABELS,
} from "@/entities/problem/model/types";
import { Badge } from "@/shared/ui/badge";

export function StatusBadge({ status }: { status: ProblemStatus }) {
  const classNameMap: Record<ProblemStatus, string> = {
    approved: "bg-secondary-container text-on-secondary-container",
    in_progress: "bg-tertiary text-on-tertiary",
    resolved: "bg-tertiary/10 text-tertiary",
    rejected: "bg-error-container text-on-error-container",
  };

  return <Badge className={classNameMap[status]}>{PROBLEM_STATUS_LABELS[status]}</Badge>;
}

export function ImportanceBadge({
  importance,
}: {
  importance: ProblemImportance;
}) {
  const classNameMap: Record<ProblemImportance, string> = {
    low: "bg-surface-container-highest text-primary",
    medium: "bg-secondary-container text-on-secondary-container",
    high: "bg-error-container text-on-error-container",
  };

  return (
    <Badge className={classNameMap[importance]}>
      {PROBLEM_IMPORTANCE_LABELS[importance]}
    </Badge>
  );
}

export function CategoryBadge({
  category,
}: {
  category: ProblemCategory;
}) {
  return (
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">
      {PROBLEM_CATEGORY_LABELS[category]}
    </span>
  );
}

export function LifecycleBadge({
  lifecycleStatus,
}: {
  lifecycleStatus: ProblemLifecycleStatus;
}) {
  const classNameMap: Record<ProblemLifecycleStatus, string> = {
    new: "bg-surface-container-highest text-primary",
    under_review: "bg-secondary-container text-on-secondary-container",
    accepted: "bg-tertiary text-on-tertiary",
    resolved: "bg-tertiary/10 text-tertiary",
    rejected: "bg-error-container text-on-error-container",
  };

  return (
    <Badge className={classNameMap[lifecycleStatus]}>
      {PROBLEM_LIFECYCLE_LABELS[lifecycleStatus]}
    </Badge>
  );
}
