import type {
  ProblemPost,
} from "@/entities/problem/model/types";
import type { User } from "@/entities/user/model/types";
import type {
  AIAnalysisPayload,
  AIAnalysisResult,
  CreateProblemPayload,
  LoginPayload,
  RegisterPayload,
  SolveItApi,
  UserProfileResponse,
} from "@/shared/api/contracts";
import { ApiClient } from "@/shared/api/api-client";

export function createHttpApi(client: ApiClient): SolveItApi {
  return {
    getCurrentUser() {
      return client.get<User | null>("/api/users/me");
    },

    getProblems() {
      return client.get<ProblemPost[]>("/api/problems");
    },

    getProblemById(id) {
      return client.get<ProblemPost | null>(`/api/problems/${id}`);
    },

    createProblem(payload) {
      return client.post<ProblemPost, CreateProblemPayload>("/api/problems", payload);
    },

    getUserProfile(idOrUsername) {
      return client.get<UserProfileResponse | null>(`/api/users/${idOrUsername}`);
    },

    incrementProblemView(id) {
      return client.post<ProblemPost | null, Record<string, never>>(
        `/api/problems/${id}/views`,
        {},
      );
    },

    supportProblem(id) {
      return client.post<ProblemPost | null, Record<string, never>>(
        `/api/problems/${id}/support`,
        {},
      );
    },

    runAIAnalysis(payload) {
      return client.post<AIAnalysisResult, AIAnalysisPayload>(
        "/api/analysis/problem",
        payload,
      );
    },

    login(payload) {
      return client.post<User, LoginPayload>("/api/auth/login", payload);
    },

    register(payload) {
      return client.post<User, RegisterPayload>("/api/auth/register", payload);
    },

    logout() {
      return client.post<void, Record<string, never>>("/api/auth/logout", {});
    },
  };
}
