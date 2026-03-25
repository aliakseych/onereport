import { readSessionStorage, writeSessionStorage } from "@/shared/lib/storage";

const VIEWED_PROBLEMS_KEY = "solveit:viewed-problems:v1";

export function hasProblemBeenViewed(problemId: string) {
  const viewedIds = readSessionStorage<string[]>(VIEWED_PROBLEMS_KEY, []);
  return viewedIds.includes(problemId);
}

export function markProblemAsViewed(problemId: string) {
  const viewedIds = readSessionStorage<string[]>(VIEWED_PROBLEMS_KEY, []);

  if (viewedIds.includes(problemId)) {
    return;
  }

  writeSessionStorage(VIEWED_PROBLEMS_KEY, [...viewedIds, problemId]);
}
