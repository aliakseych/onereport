import type {
  ProblemCategory,
  ProblemImportance,
  ProblemLifecycleStatus,
  ProblemPost,
  ProblemStatus,
} from "@/entities/problem/model/types";
import type { AIAnalysisPayload, AIAnalysisResult } from "@/shared/api/contracts";

interface SimilarityResult {
  problem: ProblemPost;
  score: number;
}

const stopWords = new Set([
  "и",
  "в",
  "во",
  "на",
  "по",
  "для",
  "из",
  "к",
  "ко",
  "с",
  "со",
  "а",
  "но",
  "или",
  "что",
  "это",
  "как",
  "уже",
  "были",
  "нужно",
  "требуется",
  "необходимы",
  "очень",
  "просто",
  "there",
  "with",
  "that",
  "this",
  "from",
  "into",
  "have",
  "more",
]);

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

export function extractKeywords(value: string) {
  const words = normalizeText(value)
    .split(/[^a-zа-я0-9]+/i)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  return [...new Set(words)];
}

export function inferCategory(text: string): ProblemCategory {
  if (
    /(ливн|drain|road|sidewalk|ramp|пандус|яма|infrastructure|тротуар|парков|ремонт|дорог|парк)/i.test(
      text,
    )
  ) {
    return "infrastructure";
  }

  if (
    /(light|school|crosswalk|безопас|опасн|свет|crime|traffic|школ|переход|освещ)/i.test(
      text,
    )
  ) {
    return "safety";
  }

  if (
    /(trash|waste|garbage|tree|park|eco|эколог|мусор|свалк|канал|река|озеро|recycl|контейнер|берег)/i.test(
      text,
    )
  ) {
    return "ecology";
  }

  if (
    /(bus|transport|route|stop|traffic|parking|вело|автобус|остановк|маршрут|дорога|транспорт)/i.test(
      text,
    )
  ) {
    return "transport";
  }

  return "community";
}

export function inferImportance(text: string): ProblemImportance {
  if (
    /(danger|urgent|flood|school|children|опасн|срочн|авар|подтоп|дет|пешеход|безопас)/i.test(
      text,
    )
  ) {
    return "high";
  }

  if (text.length > 180) {
    return "medium";
  }

  return "low";
}

export function inferStatus(payload: AIAnalysisPayload): ProblemStatus {
  const description = payload.description.trim();
  const title = payload.title.trim();

  if (
    description.length < 90 ||
    title.length < 12 ||
    /(test|spam|asdf|qwerty|тест)/i.test(`${title} ${description}`)
  ) {
    return "rejected";
  }

  return "approved";
}

export function deriveLifecycleStatus({
  status,
  importance,
  similarReportsCount,
}: {
  status: ProblemStatus;
  importance: ProblemImportance;
  similarReportsCount: number;
}): ProblemLifecycleStatus {
  if (status === "rejected") {
    return "rejected";
  }

  if (status === "resolved") {
    return "resolved";
  }

  if (status === "in_progress") {
    return "under_review";
  }

  if (similarReportsCount >= 2 || importance === "high") {
    return "under_review";
  }

  return "new";
}

export function statusFromLifecycle(
  lifecycleStatus: ProblemLifecycleStatus,
): ProblemStatus {
  const mapping: Record<ProblemLifecycleStatus, ProblemStatus> = {
    new: "approved",
    under_review: "in_progress",
    accepted: "approved",
    resolved: "resolved",
    rejected: "rejected",
  };

  return mapping[lifecycleStatus];
}

function getPrimaryKeyword(payload: AIAnalysisPayload) {
  const keywords = extractKeywords(
    `${payload.location || ""} ${payload.title} ${payload.description}`,
  );

  return keywords[0] || "signal";
}

export function buildClusterKey(
  payload: AIAnalysisPayload,
  category?: ProblemCategory,
) {
  const nextCategory =
    category || inferCategory(normalizeText(`${payload.title} ${payload.description}`));
  const locationPart = payload.location ? slugify(payload.location) : "";
  const keywordPart = slugify(getPrimaryKeyword(payload));

  return `${nextCategory}:${locationPart || keywordPart || "signal"}`;
}

export function getSimilarityScore(
  source: AIAnalysisPayload,
  target: ProblemPost,
  sourceCategory?: ProblemCategory,
  sourceClusterKey?: string,
) {
  const category = sourceCategory || inferCategory(normalizeText(`${source.title} ${source.description}`));
  const clusterKey = sourceClusterKey || buildClusterKey(source, category);
  const sourceKeywords = extractKeywords(
    `${source.title} ${source.description} ${source.location || ""}`,
  );
  const targetKeywords = extractKeywords(
    `${target.title} ${target.description} ${target.location || ""}`,
  );
  const sharedKeywords = sourceKeywords.filter((keyword) =>
    targetKeywords.includes(keyword),
  );

  let score = 0;

  if (target.clusterKey === clusterKey) {
    score += 60;
  }

  if (target.category === category) {
    score += 20;
  }

  score += sharedKeywords.length * 12;

  return score;
}

export function findSimilarProblems(
  draft: AIAnalysisPayload,
  problems: ProblemPost[],
  limit = 3,
) {
  const category = inferCategory(
    normalizeText(`${draft.title} ${draft.description} ${draft.location || ""}`),
  );
  const clusterKey = buildClusterKey(draft, category);

  const matches = problems
    .map<SimilarityResult>((problem) => ({
      problem,
      score: getSimilarityScore(draft, problem, category, clusterKey),
    }))
    .filter((item) => item.score >= 26)
    .sort((left, right) => right.score - left.score);

  return matches.slice(0, limit);
}

export function buildSummary(
  payload: AIAnalysisPayload,
  category: ProblemCategory,
  importance: ProblemImportance,
  status: ProblemStatus,
  similarReportsCount: number,
) {
  const categoryLabelMap: Record<ProblemCategory, string> = {
    infrastructure: "инфраструктурную",
    safety: "по безопасности",
    ecology: "экологическую",
    transport: "транспортную",
    community: "общественную",
  };

  const importanceLabelMap: Record<ProblemImportance, string> = {
    low: "низким",
    medium: "средним",
    high: "высоким",
  };

  if (status === "rejected") {
    return "AI считает сигнал слишком общим: стоит уточнить место, влияние на жителей и повторяемость проблемы.";
  }

  const duplicateHint =
    similarReportsCount > 0
      ? ` Уже найдено похожих сигналов: ${similarReportsCount}.`
      : "";

  return `AI определил ${categoryLabelMap[category]} проблему с ${importanceLabelMap[importance]} приоритетом.${duplicateHint}`;
}

export function buildAiAnalysis(
  payload: AIAnalysisPayload,
  existingProblems: ProblemPost[] = [],
): AIAnalysisResult {
  const normalizedText = normalizeText(
    `${payload.title} ${payload.description} ${payload.location || ""}`,
  );
  const category = inferCategory(normalizedText);
  const importance = inferImportance(normalizedText);
  const draftStatus = inferStatus(payload);
  const clusterKey = buildClusterKey(payload, category);
  const similarReportsCount = findSimilarProblems(payload, existingProblems, 20).length;
  let lifecycleStatus = deriveLifecycleStatus({
    status: draftStatus,
    importance,
    similarReportsCount,
  });

  if (lifecycleStatus === "new" && similarReportsCount === 0 && importance !== "high") {
    lifecycleStatus = "accepted";
  }

  return {
    category,
    importance,
    status: statusFromLifecycle(lifecycleStatus === "accepted" ? "accepted" : lifecycleStatus),
    lifecycleStatus,
    aiSummary: buildSummary(
      payload,
      category,
      importance,
      draftStatus,
      similarReportsCount,
    ),
    clusterKey,
    similarReportsCount,
  };
}

export function getDraftGuidance(payload: AIAnalysisPayload) {
  const guidance: string[] = [];
  const warnings: string[] = [];
  const description = payload.description.trim();

  if (!payload.location?.trim()) {
    guidance.push("Уточните локацию, чтобы кейс было легче проверить и объединить с похожими сигналами.");
  }

  if (!/(ежеднев|кажд|регуляр|постоян|часто|несколько|каждую)/i.test(description)) {
    guidance.push("Добавьте частоту: происходит ли это ежедневно, после дождя, вечером или в часы пик.");
  }

  if (!/(опас|мешает|затруд|риск|невозмож|вынужд|страда)/i.test(description)) {
    guidance.push("Опишите влияние: кому мешает проблема и какой риск или неудобство она создает.");
  }

  if (description.length < 110) {
    warnings.push("Сигнал пока выглядит слишком коротким. Лучше добавить место, последствия и повторяемость.");
  }

  if (!payload.location?.trim() && description.length < 160) {
    warnings.push("Без локации и подробностей обращение может быть распознано как слишком общее.");
  }

  return { guidance, warnings };
}

export function normalizeProblem(problem: ProblemPost, problems: ProblemPost[]) {
  const draft: AIAnalysisPayload = {
    title: problem.title,
    description: problem.description,
    location: problem.location,
  };
  const analysis = buildAiAnalysis(draft, problems.filter((item) => item.id !== problem.id));
  const lifecycleStatus =
    problem.lifecycleStatus ||
    (problem.status === "approved" && problem.id !== "problem-bus-stop"
      ? "accepted"
      : analysis.lifecycleStatus);
  const normalizedStatus =
    problem.status || statusFromLifecycle(lifecycleStatus);

  return {
    ...problem,
    status: normalizedStatus,
    lifecycleStatus,
    updatedAt: problem.updatedAt || problem.createdAt,
    similarReportsCount:
      typeof problem.similarReportsCount === "number"
        ? problem.similarReportsCount
        : analysis.similarReportsCount,
    clusterKey: problem.clusterKey || analysis.clusterKey,
    resolutionNote:
      problem.resolutionNote ||
      (lifecycleStatus === "resolved"
        ? "Исполнитель подтвердил устранение проблемы и закрыл кейс."
        : undefined),
  };
}

export function normalizeProblemCollection(problems: ProblemPost[]) {
  const normalized = problems.map((problem) =>
    normalizeProblem(problem, problems),
  );

  return normalized.map((problem) => {
    const similarReportsCount = normalized.filter((candidate) => {
      if (candidate.id === problem.id) {
        return false;
      }

      const sameCluster = candidate.clusterKey === problem.clusterKey;
      const draft: AIAnalysisPayload = {
        title: problem.title,
        description: problem.description,
        location: problem.location,
      };

      return sameCluster || getSimilarityScore(draft, candidate) >= 26;
    }).length;

    return {
      ...problem,
      similarReportsCount,
      status: statusFromLifecycle(problem.lifecycleStatus),
    };
  });
}

export function formatAverageReviewTime(problems: ProblemPost[]) {
  const reviewedProblems = problems.filter(
    (problem) => problem.lifecycleStatus !== "new",
  );

  if (reviewedProblems.length === 0) {
    return "Нет данных";
  }

  const averageMs =
    reviewedProblems.reduce((sum, problem) => {
      return sum + (new Date(problem.updatedAt).getTime() - new Date(problem.createdAt).getTime());
    }, 0) / reviewedProblems.length;

  const hours = averageMs / (1000 * 60 * 60);

  if (hours < 24) {
    return `${Math.max(1, Math.round(hours))} ч`;
  }

  return `${(hours / 24).toFixed(1)} дн`;
}

export function getProblemTopicChips(problem: ProblemPost) {
  const chips = [
    problem.location,
    problem.clusterKey.split(":")[1]?.replace(/-/g, " "),
    ...extractKeywords(problem.title).slice(0, 2),
  ].filter(Boolean) as string[];

  return [...new Set(chips)].slice(0, 3);
}
