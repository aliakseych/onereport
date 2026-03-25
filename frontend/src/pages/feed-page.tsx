import { useEffect, useState } from "react";

import type { ProblemPost } from "@/entities/problem/model/types";
import type { User } from "@/entities/user/model/types";
import { useAppOutletContext } from "@/app/router-context";
import { ProblemFeed } from "@/features/feed/problem-feed";
import { api } from "@/shared/api";
import { loadUserMapByIds } from "@/shared/api/load-user-map";
import { EmptyState } from "@/components/empty-state";

export function FeedPage() {
  const { currentUser } = useAppOutletContext();
  const [problems, setProblems] = useState<ProblemPost[]>([]);
  const [currentUserProblems, setCurrentUserProblems] = useState<ProblemPost[]>(
    [],
  );
  const [authorsById, setAuthorsById] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFeed() {
      setIsLoading(true);
      setError(null);

      try {
        const [response, profileResponse] = await Promise.all([
          api.getProblems(),
          currentUser
            ? api.getUserProfile(currentUser.username)
            : Promise.resolve(null),
        ]);
        const authoredProblems = profileResponse?.problems || [];
        const authorMap = await loadUserMapByIds(
          [...response, ...authoredProblems].map((problem) => problem.authorId),
        );

        if (isMounted) {
          setProblems(response);
          setCurrentUserProblems(authoredProblems);
          setAuthorsById(authorMap);
        }
      } catch (loadError) {
        if (isMounted) {
          setCurrentUserProblems([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Не удалось загрузить ленту.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFeed();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.username]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 pb-28 pt-28 sm:px-8 lg:px-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-40 rounded-full bg-surface-container-highest" />
          <div className="h-24 w-full rounded-2xl bg-surface-container-highest" />
          <div className="h-48 w-full rounded-2xl bg-surface-container-highest" />
          <div className="h-48 w-full rounded-2xl bg-surface-container-highest" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-6 pb-28 pt-28 sm:px-8 lg:px-12">
        <EmptyState
          actionLabel="Перейти к форме"
          actionTo="/create"
          description={error}
          title="Лента сейчас недоступна"
        />
      </div>
    );
  }

  return (
    <ProblemFeed
      authorsById={authorsById}
      currentUser={currentUser}
      currentUserProblems={currentUserProblems}
      problems={problems}
    />
  );
}
