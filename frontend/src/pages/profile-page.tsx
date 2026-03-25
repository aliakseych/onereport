import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import type { ProblemPost } from "@/entities/problem/model/types";
import type { User } from "@/entities/user/model/types";
import { ProfileOverview } from "@/features/profile/profile-overview";
import { api } from "@/shared/api";
import { EmptyState } from "@/components/empty-state";

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [problems, setProblems] = useState<ProblemPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setError("Профиль не найден.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    api
      .getUserProfile(username)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        if (!response) {
          setUser(null);
          setProblems([]);
          return;
        }

        setUser(response.user);
        setProblems(response.problems);
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Не удалось загрузить профиль.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [username]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 pb-28 pt-28 sm:px-8 lg:px-12">
        <div className="animate-pulse space-y-6">
          <div className="h-16 rounded-2xl bg-surface-container-highest" />
          <div className="h-48 rounded-2xl bg-surface-container-highest" />
          <div className="h-80 rounded-2xl bg-surface-container-highest" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-6 pb-28 pt-28 sm:px-8 lg:px-12">
        <EmptyState
          actionLabel="Открыть ленту"
          actionTo="/feed"
          description={error}
          title="Профиль недоступен"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-6 pb-28 pt-28 sm:px-8 lg:px-12">
        <EmptyState
          actionLabel="Открыть ленту"
          actionTo="/feed"
          description="По этому идентификатору профиль пока не найден."
          title="Профиль не найден"
        />
      </div>
    );
  }

  const createdProblemId = searchParams.get("created");

  return (
    <>
      {createdProblemId ? (
        <div className="mx-auto max-w-6xl px-6 pt-28 sm:px-8 lg:px-12">
          <div className="rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
            Новое обращение сохранено в профиле. Если его отклонили, оно
            останется только здесь до уточнения или повторной отправки.
          </div>
        </div>
      ) : null}
      <ProfileOverview problems={problems} user={user} />
    </>
  );
}
