import { readStorage, writeStorage } from "@/shared/lib/storage";

const SUPPORT_STORAGE_KEY = "solveit:supported-problems:v1";

type SupportedProblemsMap = Record<string, string[]>;

export function getSupportActorKey(userId?: string | null) {
  return userId || "guest-device";
}

function readSupportedProblems() {
  return readStorage<SupportedProblemsMap>(SUPPORT_STORAGE_KEY, {});
}

export function getSupportedProblemIds(userId?: string | null) {
  const supportedProblems = readSupportedProblems();
  return supportedProblems[getSupportActorKey(userId)] || [];
}

export function hasSupportedProblem(problemId: string, userId?: string | null) {
  return getSupportedProblemIds(userId).includes(problemId);
}

export function markProblemSupported(problemId: string, userId?: string | null) {
  const actorKey = getSupportActorKey(userId);
  const supportedProblems = readSupportedProblems();
  const currentIds = supportedProblems[actorKey] || [];

  if (currentIds.includes(problemId)) {
    return false;
  }

  writeStorage(SUPPORT_STORAGE_KEY, {
    ...supportedProblems,
    [actorKey]: [...currentIds, problemId],
  });

  return true;
}
