import type {
  ProblemCategory,
  ProblemAttachment,
  ProblemImportance,
  ProblemLifecycleStatus,
  ProblemPost,
  ProblemStatus,
} from "@/entities/problem/model/types";
import type { User } from "@/entities/user/model/types";

export interface AIAnalysisPayload {
  title: string;
  description: string;
  location?: string;
}

export interface AIAnalysisResult {
  category: ProblemCategory;
  importance: ProblemImportance;
  status: ProblemStatus;
  lifecycleStatus: ProblemLifecycleStatus;
  aiSummary: string;
  clusterKey: string;
  similarReportsCount: number;
}

export interface CreateProblemPayload extends AIAnalysisPayload {
  authorId: string;
  analysis?: AIAnalysisResult;
  attachments?: ProblemAttachment[];
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  displayName: string;
  username: string;
  email: string;
  password: string;
}

export interface UserProfileResponse {
  user: User;
  problems: ProblemPost[];
}

export interface SolveItApi {
  getCurrentUser(): Promise<User | null>;
  getProblems(): Promise<ProblemPost[]>;
  getProblemById(id: string): Promise<ProblemPost | null>;
  createProblem(payload: CreateProblemPayload): Promise<ProblemPost>;
  getUserProfile(idOrUsername: string): Promise<UserProfileResponse | null>;
  incrementProblemView(id: string): Promise<ProblemPost | null>;
  supportProblem(id: string): Promise<ProblemPost | null>;
  runAIAnalysis(payload: AIAnalysisPayload): Promise<AIAnalysisResult>;
  login(payload: LoginPayload): Promise<User>;
  register(payload: RegisterPayload): Promise<User>;
  logout(): Promise<void>;
}
