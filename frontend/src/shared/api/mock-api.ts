import {
  buildAiAnalysis,
  normalizeText,
} from "@/entities/problem/model/intelligence";
import { FEED_VISIBLE_STATUSES } from "@/entities/problem/model/types";
import type {
  ProblemPost,
} from "@/entities/problem/model/types";
import type { User } from "@/entities/user/model/types";
import { getMockDatabase, saveMockDatabase } from "@/mocks/db";
import type {
  AIAnalysisPayload,
  AIAnalysisResult,
  CreateProblemPayload,
  LoginPayload,
  RegisterPayload,
  SolveItApi,
  UserProfileResponse,
} from "@/shared/api/contracts";
import {
  hasSupportedProblem,
  markProblemSupported,
} from "@/shared/lib/support-tracking";

const analysisDelayMs = 650;

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function sortByNewest(problems: ProblemPost[]) {
  return [...problems].sort((left, right) => {
    return (
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  });
}

function buildProblemId() {
  return `problem-${Date.now()}`;
}

function buildUserId() {
  return `user-${Date.now()}`;
}

function buildAvatarLabel(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getUserByIdOrUsername(idOrUsername: string): User | null {
  const database = getMockDatabase();

  return (
    database.users.find(
      (user) => user.id === idOrUsername || user.username === idOrUsername,
    ) || null
  );
}

export function createMockApi(): SolveItApi {
  return {
    async getCurrentUser() {
      const database = getMockDatabase();

      if (!database.currentUserId) {
        return null;
      }

      const currentUser = database.users.find(
        (user) => user.id === database.currentUserId,
      );

      if (!currentUser) {
        database.currentUserId = null;
        saveMockDatabase(database);
        return null;
      }

      return currentUser;
    },

    async getProblems() {
      const database = getMockDatabase();
      const visibleProblems = database.problems.filter((problem) =>
        FEED_VISIBLE_STATUSES.includes(problem.status),
      );

      return sortByNewest(visibleProblems);
    },

    async getProblemById(id) {
      const database = getMockDatabase();
      return database.problems.find((problem) => problem.id === id) || null;
    },

    async createProblem(payload) {
      const database = getMockDatabase();
      const analysis =
        payload.analysis ||
        (await this.runAIAnalysis(payload as AIAnalysisPayload));
      const now = new Date().toISOString();
      const createdProblem: ProblemPost = {
        id: buildProblemId(),
        title: payload.title.trim(),
        description: payload.description.trim(),
        location: payload.location?.trim() || "Не указано",
        authorId: payload.authorId,
        createdAt: now,
        updatedAt: now,
        viewsCount: 0,
        supportersCount: 0,
        category: analysis.category,
        status: analysis.status,
        importance: analysis.importance,
        aiSummary: analysis.aiSummary,
        lifecycleStatus: analysis.lifecycleStatus,
        similarReportsCount: analysis.similarReportsCount,
        clusterKey: analysis.clusterKey,
        resolutionNote:
          analysis.lifecycleStatus === "resolved"
            ? "Проблема была закрыта сразу после верификации."
            : undefined,
        attachments: payload.attachments || [],
      };

      database.problems = [createdProblem, ...database.problems];
      saveMockDatabase(database);

      return createdProblem;
    },

    async getUserProfile(idOrUsername) {
      const user = getUserByIdOrUsername(idOrUsername);

      if (!user) {
        return null;
      }

      const database = getMockDatabase();
      const authoredProblems = sortByNewest(
        database.problems.filter((problem) => problem.authorId === user.id),
      );

      const response: UserProfileResponse = {
        user,
        problems: authoredProblems,
      };

      return response;
    },

    async incrementProblemView(id) {
      const database = getMockDatabase();
      const problemIndex = database.problems.findIndex((problem) => problem.id === id);

      if (problemIndex < 0) {
        return null;
      }

      const currentProblem = database.problems[problemIndex];
      const updatedProblem: ProblemPost = {
        ...currentProblem,
        viewsCount: currentProblem.viewsCount + 1,
      };

      database.problems[problemIndex] = updatedProblem;
      saveMockDatabase(database);

      return updatedProblem;
    },

    async supportProblem(id) {
      const database = getMockDatabase();
      const problemIndex = database.problems.findIndex((problem) => problem.id === id);

      if (problemIndex < 0) {
        return null;
      }

      const actorUserId = database.currentUserId;

      if (hasSupportedProblem(id, actorUserId)) {
        return database.problems[problemIndex];
      }

      const currentProblem = database.problems[problemIndex];
      const updatedProblem: ProblemPost = {
        ...currentProblem,
        supportersCount: (currentProblem.supportersCount || 0) + 1,
      };

      database.problems[problemIndex] = updatedProblem;
      saveMockDatabase(database);
      markProblemSupported(id, actorUserId);

      return updatedProblem;
    },

    async runAIAnalysis(payload) {
      await wait(analysisDelayMs);
      const database = getMockDatabase();
      const analysis: AIAnalysisResult = buildAiAnalysis(payload, database.problems);

      if (
        analysis.lifecycleStatus === "accepted" &&
        /(resolved|устранено|решено)/i.test(
          normalizeText(`${payload.title} ${payload.description}`),
        )
      ) {
        return {
          ...analysis,
          status: "resolved",
          lifecycleStatus: "resolved",
        };
      }

      return analysis;
    },

    async login(payload) {
      const database = getMockDatabase();
      const identifier = payload.identifier.trim().toLowerCase();
      const user = database.users.find(
        (candidate) =>
          candidate.username.toLowerCase() === identifier ||
          candidate.email?.toLowerCase() === identifier,
      );

      if (!user) {
        throw new Error("Пользователь с такими данными не найден.");
      }

      const authRecord = database.authRecords.find(
        (record) => record.userId === user.id,
      );

      if (!authRecord || authRecord.password !== payload.password) {
        throw new Error("Неверный логин или пароль.");
      }

      database.currentUserId = user.id;
      saveMockDatabase(database);

      return user;
    },

    async register(payload) {
      const database = getMockDatabase();
      const username = payload.username.trim().toLowerCase();
      const email = payload.email.trim().toLowerCase();

      if (database.users.some((user) => user.username.toLowerCase() === username)) {
        throw new Error("Такой username уже занят.");
      }

      if (database.users.some((user) => user.email?.toLowerCase() === email)) {
        throw new Error("Пользователь с таким email уже существует.");
      }

      const nextUser: User = {
        id: buildUserId(),
        username,
        email,
        displayName: payload.displayName.trim(),
        followersCount: 0,
        followingCount: 0,
        memberSince: new Date().toISOString(),
        bio: "Новый участник платформы SolveIt.",
        avatarLabel: buildAvatarLabel(payload.displayName.trim() || username),
      };

      database.users = [nextUser, ...database.users];
      database.authRecords = [
        ...database.authRecords,
        {
          userId: nextUser.id,
          password: payload.password,
        },
      ];
      database.currentUserId = nextUser.id;
      saveMockDatabase(database);

      return nextUser;
    },

    async logout() {
      const database = getMockDatabase();
      database.currentUserId = null;
      saveMockDatabase(database);
    },
  };
}
