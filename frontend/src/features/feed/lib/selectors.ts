import type {
  ProblemCategory,
  ProblemImportance,
  ProblemLifecycleStatus,
  ProblemPost,
  ProblemStatus,
} from "@/entities/problem/model/types";
import { formatAverageReviewTime } from "@/entities/problem/model/intelligence";
import { PROBLEM_CATEGORY_LABELS } from "@/entities/problem/model/types";
import type { User } from "@/entities/user/model/types";
import { isWithinDays } from "@/shared/lib/format-relative-time";

export interface ProblemWithAuthor {
  problem: ProblemPost;
  author: User | null;
}

export interface FeedStats {
  activeHighPriorityCount: number;
  resolvedThisWeekCount: number;
  topCategoryLabel: string;
  averageReviewTimeLabel: string;
}

export interface DashboardMetric {
  label: string;
  value: number;
  delta: number;
  supportingLabel: string;
}

export interface FeedSections {
  importantNow: ProblemWithAuthor[];
  newProblems: ProblemWithAuthor[];
}

function sortByNewest(left: ProblemPost, right: ProblemPost) {
  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
}

function isActiveLifecycle(status: ProblemLifecycleStatus) {
  return status !== "resolved" && status !== "rejected";
}

function isOverdue(problem: ProblemPost) {
  if (!isActiveLifecycle(problem.lifecycleStatus)) {
    return false;
  }

  const hoursOpen =
    (Date.now() - new Date(problem.createdAt).getTime()) / (1000 * 60 * 60);

  if (problem.importance === "high") {
    return hoursOpen > 72;
  }

  return hoursOpen > 24 * 7;
}

function getCurrentAndPrevious<T>(
  problems: ProblemPost[],
  selector: (problem: ProblemPost) => number,
) {
  const now = Date.now();
  const currentPeriodStart = now - 7 * 24 * 60 * 60 * 1000;
  const previousPeriodStart = now - 14 * 24 * 60 * 60 * 1000;

  const current = problems
    .filter((problem) => new Date(problem.updatedAt).getTime() >= currentPeriodStart)
    .reduce((sum, problem) => sum + selector(problem), 0);

  const previous = problems
    .filter((problem) => {
      const updatedAt = new Date(problem.updatedAt).getTime();
      return updatedAt >= previousPeriodStart && updatedAt < currentPeriodStart;
    })
    .reduce((sum, problem) => sum + selector(problem), 0);

  return { current, previous };
}

function getImportanceScore(importance: ProblemImportance) {
  const scores: Record<ProblemImportance, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return scores[importance];
}

function getStatusScore(status: ProblemStatus) {
  const scores: Record<ProblemStatus, number> = {
    in_progress: 4,
    approved: 3,
    resolved: 2,
    rejected: 1,
  };

  return scores[status];
}

function getProblemScore(problem: ProblemPost) {
  return (
    getImportanceScore(problem.importance) * 50 +
    getStatusScore(problem.status) * 20 +
    (problem.supportersCount || 0) +
    problem.viewsCount
  );
}

function toProblemWithAuthor(
  problems: ProblemPost[],
  authorsById: Record<string, User>,
) {
  return problems.map((problem) => ({
    problem,
    author: authorsById[problem.authorId] || null,
  }));
}

export function getFeedStats(problems: ProblemPost[]): FeedStats {
  const categories = problems.reduce<Record<ProblemCategory, number>>(
    (accumulator, problem) => {
      accumulator[problem.category] += 1;
      return accumulator;
    },
    {
      infrastructure: 0,
      safety: 0,
      ecology: 0,
      transport: 0,
      community: 0,
    },
  );

  const topCategory =
    Object.entries(categories).sort((left, right) => right[1] - left[1])[0]?.[0] ||
    "community";

  return {
    activeHighPriorityCount: problems.filter(
      (problem) =>
        problem.importance === "high" &&
        problem.lifecycleStatus !== "resolved" &&
        problem.lifecycleStatus !== "rejected",
    ).length,
    resolvedThisWeekCount: problems.filter(
      (problem) =>
        problem.lifecycleStatus === "resolved" &&
        isWithinDays(problem.updatedAt, 7),
    ).length,
    topCategoryLabel:
      PROBLEM_CATEGORY_LABELS[topCategory as ProblemCategory] || "Сообщество",
    averageReviewTimeLabel: formatAverageReviewTime(problems),
  };
}

export function getFeedSections(
  problems: ProblemPost[],
  authorsById: Record<string, User>,
): FeedSections {
  const importantNow = toProblemWithAuthor(
    [...problems]
      .sort((left, right) => getProblemScore(right) - getProblemScore(left))
      .slice(0, 2),
    authorsById,
  );

  const newProblems = toProblemWithAuthor(
    [...problems].sort(sortByNewest),
    authorsById,
  );

  return {
    importantNow,
    newProblems,
  };
}

export function getDashboardMetrics(authoredProblems: ProblemPost[]) {
  const similarComparison = getCurrentAndPrevious(
    authoredProblems,
    (problem) => problem.similarReportsCount,
  );
  const resolvedComparison = getCurrentAndPrevious(
    authoredProblems,
    (problem) => (problem.lifecycleStatus === "resolved" ? 1 : 0),
  );
  const activeComparison = getCurrentAndPrevious(
    authoredProblems,
    (problem) => (isActiveLifecycle(problem.lifecycleStatus) ? 1 : 0),
  );
  const overdueComparison = getCurrentAndPrevious(
    authoredProblems,
    (problem) => (isOverdue(problem) ? 1 : 0),
  );

  const metrics: DashboardMetric[] = [
    {
      label: "Похожие на мои",
      value: authoredProblems.reduce(
        (sum, problem) => sum + problem.similarReportsCount,
        0,
      ),
      delta: similarComparison.current - similarComparison.previous,
      supportingLabel: "к прошлой неделе",
    },
    {
      label: "Решено",
      value: authoredProblems.filter((problem) => problem.lifecycleStatus === "resolved")
        .length,
      delta: resolvedComparison.current - resolvedComparison.previous,
      supportingLabel: "за 7 дней",
    },
    {
      label: "В работе",
      value: authoredProblems.filter((problem) =>
        isActiveLifecycle(problem.lifecycleStatus),
      ).length,
      delta: activeComparison.current - activeComparison.previous,
      supportingLabel: "к прошлой неделе",
    },
    {
      label: "Просрочено",
      value: authoredProblems.filter((problem) => isOverdue(problem)).length,
      delta: overdueComparison.current - overdueComparison.previous,
      supportingLabel: "к прошлой неделе",
    },
  ];

  return metrics;
}
