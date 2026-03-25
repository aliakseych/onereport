export type ProblemCategory =
  | "infrastructure"
  | "safety"
  | "ecology"
  | "transport"
  | "community";

export type ProblemStatus =
  | "approved"
  | "in_progress"
  | "resolved"
  | "rejected";

export type ProblemImportance = "low" | "medium" | "high";
export type ProblemLifecycleStatus =
  | "new"
  | "under_review"
  | "accepted"
  | "resolved"
  | "rejected";

export interface ProblemAttachment {
  id: string;
  type: "image";
  name: string;
  url: string;
}

export interface ProblemPost {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  status: ProblemStatus;
  viewsCount: number;
  authorId: string;
  createdAt: string;
  aiSummary: string;
  importance: ProblemImportance;
  location?: string;
  supportersCount?: number;
  lifecycleStatus: ProblemLifecycleStatus;
  updatedAt: string;
  similarReportsCount: number;
  clusterKey: string;
  resolutionNote?: string;
  attachments?: ProblemAttachment[];
}

export const FEED_VISIBLE_STATUSES: ProblemStatus[] = [
  "approved",
  "in_progress",
  "resolved",
];

export const PROBLEM_CATEGORY_LABELS: Record<ProblemCategory, string> = {
  infrastructure: "Инфраструктура",
  safety: "Безопасность",
  ecology: "Экология",
  transport: "Транспорт",
  community: "Сообщество",
};

export const PROBLEM_STATUS_LABELS: Record<ProblemStatus, string> = {
  approved: "Одобрено",
  in_progress: "В работе",
  resolved: "Решено",
  rejected: "Отклонено",
};

export const PROBLEM_IMPORTANCE_LABELS: Record<ProblemImportance, string> = {
  low: "Низкий приоритет",
  medium: "Средний приоритет",
  high: "Высокий приоритет",
};

export const PROBLEM_LIFECYCLE_LABELS: Record<ProblemLifecycleStatus, string> = {
  new: "Новый кейс",
  under_review: "На проверке",
  accepted: "Принят",
  resolved: "Решен",
  rejected: "Отклонен",
};
