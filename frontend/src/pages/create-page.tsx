import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAppOutletContext } from "@/app/router-context";
import type { ProblemPost } from "@/entities/problem/model/types";
import type { User } from "@/entities/user/model/types";
import { CreateProblemForm } from "@/features/create-problem/create-problem-form";
import { api } from "@/shared/api";
import { loadUserMapByIds } from "@/shared/api/load-user-map";

export function CreatePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAppOutletContext();
  const [existingProblems, setExistingProblems] = useState<ProblemPost[]>([]);
  const [authorsById, setAuthorsById] = useState<Record<string, User>>({});

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    let isMounted = true;

    async function loadContext() {
      const problems = await api.getProblems();
      const authors = await loadUserMapByIds(
        problems.map((problem) => problem.authorId),
      );

      if (isMounted) {
        setExistingProblems(problems);
        setAuthorsById(authors);
      }
    }

    loadContext().catch(() => {
      if (isMounted) {
        setExistingProblems([]);
        setAuthorsById({});
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  function handleProblemCreated(problem: ProblemPost) {
    if (!currentUser) {
      return;
    }

    if (problem.status === "rejected") {
      navigate(`/profile/${currentUser.username}?created=${problem.id}`);
      return;
    }

    navigate(`/problem/${problem.id}?created=1`);
  }

  if (!currentUser) {
    return (
      <Navigate
        replace
        to={`/auth?next=${encodeURIComponent(location.pathname || "/create")}`}
      />
    );
  }

  return (
    <CreateProblemForm
      authorsById={authorsById}
      currentUser={currentUser}
      existingProblems={existingProblems}
      onProblemCreated={handleProblemCreated}
    />
  );
}
