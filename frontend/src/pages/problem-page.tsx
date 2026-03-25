import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { useAppOutletContext } from "@/app/router-context";
import { findSimilarProblems } from "@/entities/problem/model/intelligence";
import type { ProblemPost } from "@/entities/problem/model/types";
import type { User } from "@/entities/user/model/types";
import { ProblemDetailsView } from "@/features/problem-details/problem-details-view";
import { api } from "@/shared/api";
import { loadUserMapByIds } from "@/shared/api/load-user-map";
import { EmptyState } from "@/components/empty-state";
import {
  hasProblemBeenViewed,
  markProblemAsViewed,
} from "@/shared/lib/view-tracking";
import { getSupportedProblemIds } from "@/shared/lib/support-tracking";

export function ProblemPage() {
  const { currentUser } = useAppOutletContext();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [problem, setProblem] = useState<ProblemPost | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [relatedProblems, setRelatedProblems] = useState<ProblemPost[]>([]);
  const [moreFromAuthor, setMoreFromAuthor] = useState<ProblemPost[]>([]);
  const [usersById, setUsersById] = useState<Record<string, User>>({});
  const [supportedProblemIds, setSupportedProblemIds] = useState<string[]>([]);
  const [isSupporting, setIsSupporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupportedProblemIds(getSupportedProblemIds(currentUser?.id));
  }, [currentUser?.id]);

  useEffect(() => {
    if (!id) {
      setError("Проблема не найдена.");
      setIsLoading(false);
      return;
    }

    const problemId = id;
    let isMounted = true;

    async function loadProblem() {
      try {
        const initialProblem = await api.getProblemById(problemId);

        if (!initialProblem) {
          if (isMounted) {
            setProblem(null);
          }
          return;
        }

        let currentProblem = initialProblem;

        if (!hasProblemBeenViewed(problemId)) {
          const viewedProblem = await api.incrementProblemView(problemId);

          if (viewedProblem) {
            currentProblem = viewedProblem;
          }

          markProblemAsViewed(problemId);
        }

        const [profile, visibleProblems] = await Promise.all([
          api.getUserProfile(currentProblem.authorId),
          api.getProblems(),
        ]);
        const nextRelatedProblems = findSimilarProblems(
          {
            title: currentProblem.title,
            description: currentProblem.description,
            location: currentProblem.location,
          },
          visibleProblems.filter((candidate) => candidate.id !== currentProblem.id),
          3,
        ).map((item) => item.problem);
        const nextMoreFromAuthor = (profile?.problems || [])
          .filter((candidate) => candidate.id !== currentProblem.id)
          .slice(0, 3);
        const relatedUsers = await loadUserMapByIds(
          nextRelatedProblems.map((candidate) => candidate.authorId),
        );

        if (isMounted) {
          setProblem(currentProblem);
          setAuthor(profile?.user ?? null);
          setRelatedProblems(nextRelatedProblems);
          setMoreFromAuthor(nextMoreFromAuthor);
          setUsersById(relatedUsers);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Не удалось загрузить проблему.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProblem();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 pb-28 pt-28 sm:px-8 lg:px-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-36 rounded-full bg-surface-container-highest" />
          <div className="h-20 rounded-2xl bg-surface-container-highest" />
          <div className="h-96 rounded-2xl bg-surface-container-highest" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-6 pb-28 pt-28 sm:px-8 lg:px-12">
        <EmptyState
          actionLabel="Вернуться в ленту"
          actionTo="/feed"
          description={error}
          title="Проблема недоступна"
        />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="mx-auto max-w-5xl px-6 pb-28 pt-28 sm:px-8 lg:px-12">
        <EmptyState
          actionLabel="Вернуться в ленту"
          actionTo="/feed"
          description="Похоже, эта запись была удалена или еще не существует."
          title="Проблема не найдена"
        />
      </div>
    );
  }

  const showCreatedBanner = searchParams.get("created") === "1";
  const isSupported = supportedProblemIds.includes(problem.id);
  const canSupport =
    problem.status !== "rejected" &&
    (!currentUser || problem.authorId !== currentUser.id);

  async function handleSupportProblem() {
    if (!problem || isSupported) {
      return;
    }

    setIsSupporting(true);

    try {
      const updatedProblem = await api.supportProblem(problem.id);

      if (updatedProblem) {
        setProblem(updatedProblem);
      }

      setSupportedProblemIds(getSupportedProblemIds(currentUser?.id));
    } finally {
      setIsSupporting(false);
    }
  }

  return (
    <>
      {showCreatedBanner ? (
        <div className="mx-auto max-w-6xl px-6 pt-28 sm:px-8 lg:px-12">
          <div className="rounded-2xl bg-tertiary p-4 text-sm text-on-tertiary">
            Обращение сохранено. Если его приняли, оно уже появилось в ленте.
          </div>
        </div>
      ) : null}
      <ProblemDetailsView
        author={author}
        canSupport={canSupport}
        isSupported={isSupported}
        isSupporting={isSupporting}
        moreFromAuthor={moreFromAuthor}
        onSupportProblem={handleSupportProblem}
        problem={problem}
        relatedProblems={relatedProblems}
        usersById={usersById}
      />
    </>
  );
}
