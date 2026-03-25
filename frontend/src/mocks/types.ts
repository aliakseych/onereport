import type { ProblemPost } from "@/entities/problem/model/types";
import type { User } from "@/entities/user/model/types";

export interface MockAuthRecord {
  userId: string;
  password: string;
}

export interface MockDatabase {
  currentUserId: string | null;
  users: User[];
  problems: ProblemPost[];
  authRecords: MockAuthRecord[];
}
