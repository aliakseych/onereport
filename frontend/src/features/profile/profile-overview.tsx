import { Link } from "react-router-dom";

import type { ProblemPost, ProblemStatus } from "@/entities/problem/model/types";
import { PROBLEM_STATUS_LABELS } from "@/entities/problem/model/types";
import { StatusBadge } from "@/entities/problem/ui/problem-badges";
import type { User } from "@/entities/user/model/types";
import { UserAvatar } from "@/entities/user/ui/user-avatar";
import { EmptyState } from "@/components/empty-state";
import { formatDisplayDate } from "@/shared/lib/format-date";
import { MaterialIcon } from "@/shared/ui/material-icon";

interface ProfileOverviewProps {
  user: User;
  problems: ProblemPost[];
}

function getStatusCount(problems: ProblemPost[], status: ProblemStatus) {
  return problems.filter((problem) => problem.status === status).length;
}

export function ProfileOverview({ user, problems }: ProfileOverviewProps) {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-28 pt-28 sm:px-8 lg:px-12">
      <section className="mb-16 grid grid-cols-1 items-end gap-8 md:grid-cols-12">
        <div className="md:col-span-8">
          <span className="mb-4 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
            Гражданский профиль
          </span>
          <h1 className="text-[2.75rem] font-black leading-none tracking-editorial text-primary sm:text-[3.5rem]">
            {user.displayName || user.username}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-on-surface-variant">
            {user.bio || "Пользователь SolveIt."}
          </p>
          <p className="mt-3 text-sm uppercase tracking-[0.16em] text-on-surface-variant">
            @{user.username}
          </p>
        </div>

        <div className="md:col-span-4 md:flex md:justify-end">
          <UserAvatar className="shadow-ambient" size="lg" user={user} />
        </div>
      </section>

      <section className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex min-h-[200px] flex-col justify-between rounded-xl bg-surface-container-low p-8">
          <MaterialIcon className="mb-4 text-primary" name="campaign" />
          <div>
            <div className="text-4xl font-black text-primary">{problems.length}</div>
            <div className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">
              Авторские обращения
            </div>
          </div>
        </div>
        <div className="flex min-h-[200px] flex-col justify-between rounded-xl bg-surface-container-low p-8">
          <MaterialIcon className="mb-4 text-primary" name="group" />
          <div>
            <div className="text-4xl font-black text-primary">
              {user.followersCount}
            </div>
            <div className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">
              Подписчики
            </div>
          </div>
        </div>
        <div className="flex min-h-[200px] flex-col justify-between rounded-xl bg-tertiary p-8 text-on-tertiary">
          <MaterialIcon className="mb-4" fill name="sync_alt" />
          <div>
            <div className="text-4xl font-black">{user.followingCount}</div>
            <div className="mt-1 text-sm font-bold uppercase tracking-[0.14em] opacity-80">
              Подписок
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <section className="lg:col-span-8">
          <h2 className="mb-8 text-2xl font-black tracking-editorial text-primary">
            Последние публикации
          </h2>
          {problems.length > 0 ? (
            <div className="space-y-6">
              {problems.map((problem) => (
                <Link
                  className="block rounded-xl bg-surface-container-highest p-6 transition-colors hover:bg-surface-container-high"
                  key={problem.id}
                  to={`/problem/${problem.id}`}
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <StatusBadge status={problem.status} />
                    <span className="text-xs font-medium text-on-surface-variant">
                      {formatDisplayDate(problem.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold leading-snug text-primary">
                    {problem.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-on-surface-variant">
                    {problem.description}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                    <span className="inline-flex items-center gap-1">
                      <MaterialIcon className="text-sm" name="visibility" />
                      {problem.viewsCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MaterialIcon className="text-sm" name="auto_awesome" />
                      {PROBLEM_STATUS_LABELS[problem.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              actionLabel="Создать первую проблему"
              actionTo="/create"
              description="После первой публикации проблемы появятся здесь вместе со статусами AI-обработки."
              title="У пользователя пока нет публикаций"
            />
          )}
        </section>

        <aside className="border-outline-variant/20 lg:col-span-4 lg:border-l lg:pl-8">
          <h2 className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
            Статусы публикаций
          </h2>
          <div className="space-y-6">
            {([
              "approved",
              "in_progress",
              "resolved",
              "rejected",
            ] as ProblemStatus[]).map((status) => (
              <div
                className="flex items-center justify-between rounded-xl bg-surface-container-low p-4"
                key={status}
              >
                <StatusBadge status={status} />
                <span className="text-lg font-black text-primary">
                  {getStatusCount(problems, status)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-surface-container-low p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
              Важно
            </p>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
              Отклоненные обращения остаются в профиле автора и не попадают в
              общую ленту, пока их не дополнят и не отправят повторно.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
