import { normalizeProblemCollection } from "@/entities/problem/model/intelligence";
import { seededDatabase } from "@/mocks/seed";
import type { MockDatabase } from "@/mocks/types";
import { readStorage, writeStorage } from "@/shared/lib/storage";

const MOCK_DB_KEY = "solveit:mock-db:v1";

function cloneDatabase(data: MockDatabase): MockDatabase {
  return JSON.parse(JSON.stringify(data)) as MockDatabase;
}

function normalizeDatabase(database: MockDatabase): MockDatabase {
  const seededUsersById = Object.fromEntries(
    seededDatabase.users.map((user) => [user.id, user]),
  );
  const nextUsers = database.users.map((user) => ({
    ...seededUsersById[user.id],
    ...user,
  }));
  const nextAuthRecords =
    database.authRecords && database.authRecords.length > 0
      ? database.authRecords
      : seededDatabase.authRecords.filter((record) =>
          nextUsers.some((user) => user.id === record.userId),
        );

  return {
    ...database,
    currentUserId: database.currentUserId ?? null,
    users: nextUsers,
    authRecords: nextAuthRecords,
    problems: normalizeProblemCollection(database.problems),
  };
}

export function getMockDatabase() {
  const storedDatabase = readStorage<MockDatabase | null>(MOCK_DB_KEY, null);

  if (storedDatabase) {
    const normalizedDatabase = normalizeDatabase(storedDatabase);
    writeStorage(MOCK_DB_KEY, normalizedDatabase);
    return normalizedDatabase;
  }

  const initialDatabase = normalizeDatabase(cloneDatabase(seededDatabase));
  writeStorage(MOCK_DB_KEY, initialDatabase);
  return initialDatabase;
}

export function saveMockDatabase(database: MockDatabase) {
  writeStorage(MOCK_DB_KEY, database);
}
