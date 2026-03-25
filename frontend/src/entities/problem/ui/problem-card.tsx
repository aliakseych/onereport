import { Link } from "react-router-dom";

import { getProblemTopicChips } from "@/entities/problem/model/intelligence";
import type { ProblemPost } from "@/entities/problem/model/types";
import { PROBLEM_CATEGORY_LABELS } from "@/entities/problem/model/types";
import {
  ImportanceBadge,
  StatusBadge,
} from "@/entities/problem/ui/problem-badges";
import type { User } from "@/entities/user/model/types";
import { UserAvatar } from "@/entities/user/ui/user-avatar";
import { cx } from "@/shared/lib/cx";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { MaterialIcon } from "@/shared/ui/material-icon";

interface ProblemCardProps {
  problem: ProblemPost;
  author?: User | null;
  variant?: "default" | "compact" | "featured";
  activityLabel?: string;
  showAiPreview?: boolean;
}

export function ProblemCard({
  problem,
  author = null,
  variant = "default",
  activityLabel,
  showAiPreview = true,
}: ProblemCardProps) {
  const isCompact = variant === "compact";
  const isFeatured = variant === "featured";
  const relativeTime = formatRelativeTime(problem.updatedAt);
  const topicChips = getProblemTopicChips(problem);
  const primaryTopic = topicChips[0];
  const remainingTopicsCount = Math.max(topicChips.length - 1, 0);

  const footerMetrics = [
    {
      icon: "visibility",
      label: `${problem.viewsCount} просмотров`,
    },
    {
      icon: "hub",
      label: `${problem.similarReportsCount} похожих`,
    },
  ];

  if (problem.supportersCount) {
    footerMetrics.push({
      icon: "thumb_up",
      label: `${problem.supportersCount} поддержали`,
    });
  }

  return (
    <article>
      <Link
        className={cx(
          "block rounded-2xl ring-1 ring-outline-variant/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-ambient",
          isCompact ? "p-5" : "p-6 sm:p-7",
          isFeatured
            ? "bg-gradient-to-br from-surface-container-lowest via-surface-container-lowest to-surface-container-low"
            : "bg-surface-container-lowest",
        )}
        to={`/problem/${problem.id}`}
      >
        {activityLabel ? (
          <span className="inline-flex rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-semibold text-on-surface-variant">
            {activityLabel}
          </span>
        ) : null}

        <div className={cx("flex flex-wrap items-start justify-between gap-3", activityLabel ? "mt-4" : "")}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-tertiary">
              {PROBLEM_CATEGORY_LABELS[problem.category]}
            </span>
            {primaryTopic ? (
              <span className="rounded-full bg-surface-container-low px-2.5 py-1 text-[11px] font-medium text-on-surface-variant">
                {primaryTopic}
              </span>
            ) : null}
            {remainingTopicsCount > 0 ? (
              <span className="rounded-full bg-surface-container-low px-2.5 py-1 text-[11px] font-medium text-on-surface-variant">
                +{remainingTopicsCount}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status={problem.status} />
            <ImportanceBadge importance={problem.importance} />
          </div>
        </div>

        <h3
          className={cx(
            "mt-4 font-black tracking-editorial text-primary",
            isCompact ? "text-lg leading-snug" : "text-2xl leading-tight",
            isFeatured ? "sm:text-[1.9rem]" : "",
          )}
        >
          {problem.title}
        </h3>

        <p
          className={cx(
            "mt-3 text-sm leading-relaxed text-on-surface-variant",
            isCompact ? "line-clamp-2" : "line-clamp-3",
          )}
        >
          {problem.description}
        </p>

        {showAiPreview && problem.aiSummary ? (
          <div className="mt-5 rounded-xl bg-surface-container-low p-4">
            <p className="text-[11px] font-semibold text-on-surface-variant">
              AI-сводка
            </p>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
              {problem.aiSummary}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-outline-variant/10 pt-5">
          <div className="flex items-center gap-3">
            {author ? <UserAvatar size="sm" user={author} /> : null}
            <div>
              <p className="text-sm font-bold text-primary">
                {author?.displayName || author?.username || "Автор обращения"}
              </p>
              <p className="text-xs text-on-surface-variant">{relativeTime}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-on-surface-variant">
            {footerMetrics.map((metric) => (
              <span className="inline-flex items-center gap-1.5" key={metric.label}>
                <MaterialIcon className="text-base" fill name={metric.icon} />
                {metric.label}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}
