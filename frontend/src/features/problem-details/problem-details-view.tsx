import { Link } from "react-router-dom";

import { getProblemTopicChips } from "@/entities/problem/model/intelligence";
import type { ProblemPost } from "@/entities/problem/model/types";
import { PROBLEM_CATEGORY_LABELS } from "@/entities/problem/model/types";
import { ProblemCard } from "@/entities/problem/ui/problem-card";
import {
  ImportanceBadge,
  LifecycleBadge,
  StatusBadge,
} from "@/entities/problem/ui/problem-badges";
import type { User } from "@/entities/user/model/types";
import { UserAvatar } from "@/entities/user/ui/user-avatar";
import { formatDisplayDate } from "@/shared/lib/format-date";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { Button } from "@/shared/ui/button";
import { MaterialIcon } from "@/shared/ui/material-icon";

interface ProblemDetailsViewProps {
  problem: ProblemPost;
  author: User | null;
  relatedProblems: ProblemPost[];
  moreFromAuthor: ProblemPost[];
  usersById: Record<string, User>;
  canSupport: boolean;
  isSupported: boolean;
  isSupporting: boolean;
  onSupportProblem(): void;
}

export function ProblemDetailsView({
  problem,
  author,
  relatedProblems,
  moreFromAuthor,
  usersById,
  canSupport,
  isSupported,
  isSupporting,
  onSupportProblem,
}: ProblemDetailsViewProps) {
  const topicChips = getProblemTopicChips(problem);
  const primaryAttachment = problem.attachments?.[0];
  const analyzedAt = new Date(
    new Date(problem.createdAt).getTime() + 10 * 60 * 1000,
  ).toISOString();
  const stageLabelMap = {
    new: "Ожидает первичную проверку",
    under_review: "Передано на дополнительную проверку",
    accepted: "Принято как отдельное обращение",
    resolved: "Закрыто после подтверждения",
    rejected: "Отклонено как слишком слабое или дублирующее",
  } as const;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-28 pt-28 sm:px-8 lg:px-12">
      <Link
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant transition hover:text-primary"
        to="/feed"
      >
        <MaterialIcon className="text-base" name="arrow_back" />
        Назад к ленте
      </Link>

      <section className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-tertiary">
              {PROBLEM_CATEGORY_LABELS[problem.category]}
            </span>
            <span className="inline-flex items-center rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-semibold text-on-surface-variant">
              Обновлено {formatRelativeTime(problem.updatedAt)}
            </span>
          </div>
          <h1 className="text-[2.75rem] font-black leading-none tracking-editorial text-primary sm:text-[3.5rem]">
            {problem.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
            {problem.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LifecycleBadge lifecycleStatus={problem.lifecycleStatus} />
            <StatusBadge status={problem.status} />
            <ImportanceBadge importance={problem.importance} />
          </div>
          {topicChips.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {topicChips.map((chip) => (
                <span
                  className="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-semibold text-on-surface-variant"
                  key={chip}
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-4 lg:pt-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-surface-container-low p-5">
              <p className="text-[11px] font-semibold text-on-surface-variant">
                Просмотры
              </p>
              <p className="mt-3 text-2xl font-black tracking-editorial text-primary">
                {problem.viewsCount}
              </p>
            </div>
            <div className="rounded-2xl bg-surface-container-low p-5">
              <p className="text-[11px] font-semibold text-on-surface-variant">
                Поддержка
              </p>
              <p className="mt-3 text-2xl font-black tracking-editorial text-primary">
                {problem.supportersCount || 0}
              </p>
            </div>
            <div className="rounded-2xl bg-surface-container-low p-5">
              <p className="text-[11px] font-semibold text-on-surface-variant">
                Похожие обращения
              </p>
              <p className="mt-3 text-2xl font-black tracking-editorial text-primary">
                {problem.similarReportsCount}
              </p>
            </div>
            <div className="rounded-2xl bg-surface-container-low p-5">
              <p className="text-[11px] font-semibold text-on-surface-variant">
                Последнее обновление
              </p>
              <p className="mt-3 text-lg font-black tracking-editorial text-primary">
                {formatRelativeTime(problem.updatedAt)}
              </p>
            </div>
            <div className="col-span-2 rounded-2xl bg-surface-container-low p-5">
              <div className="space-y-4 text-sm text-on-surface-variant">
                <div className="flex items-center gap-3">
                  <MaterialIcon className="text-base" name="event" />
                  <span>{formatDisplayDate(problem.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MaterialIcon className="text-base" name="location_on" />
                  <span>{problem.location || "Городская локация"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MaterialIcon className="text-base" name="update" />
                  <span>Обновлено {formatDisplayDate(problem.updatedAt)}</span>
                </div>
              </div>
            </div>
            {canSupport ? (
              <div className="col-span-2">
                <Button
                  className="w-full justify-center"
                  disabled={isSupported || isSupporting}
                  onClick={onSupportProblem}
                  variant={isSupported ? "secondary" : "primary"}
                >
                  {isSupported ? "Поддержка учтена" : "Поддержать проблему"}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          {primaryAttachment ? (
            <article className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-ambient ring-1 ring-outline-variant/15">
              <img
                alt={primaryAttachment.name}
                className="h-[360px] w-full object-cover sm:h-[440px]"
                loading="lazy"
                src={primaryAttachment.url}
              />
              <div className="p-5">
                <p className="text-sm font-semibold text-on-surface-variant">
                  Прикрепленное изображение
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {primaryAttachment.name}
                </p>
              </div>
            </article>
          ) : null}

          <article className="rounded-2xl bg-surface-container-lowest p-8 shadow-ambient ring-1 ring-outline-variant/15">
            <p className="text-xs font-semibold text-on-surface-variant">
              Описание
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-editorial text-primary">
              Контекст обращения
            </h2>
            <p className="mt-4 leading-relaxed text-on-surface-variant">
              {problem.description}
            </p>
          </article>

          <article className="rounded-2xl bg-surface-container-lowest p-8 shadow-ambient ring-1 ring-outline-variant/15">
            <p className="text-xs font-semibold text-on-surface-variant">
              Разбор
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-editorial text-primary">
              Что показал разбор
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-surface-container-low p-4">
                <p className="text-[11px] font-semibold text-on-surface-variant">
                  Категория
                </p>
                <p className="mt-2 text-lg font-black text-primary">
                  {PROBLEM_CATEGORY_LABELS[problem.category]}
                </p>
              </div>
              <div className="rounded-xl bg-surface-container-low p-4">
                <p className="text-[11px] font-semibold text-on-surface-variant">
                  Статус
                </p>
                <div className="mt-3">
                  <StatusBadge status={problem.status} />
                </div>
              </div>
              <div className="rounded-xl bg-surface-container-low p-4">
                <p className="text-[11px] font-semibold text-on-surface-variant">
                  Приоритет
                </p>
                <div className="mt-3">
                  <ImportanceBadge importance={problem.importance} />
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-surface-container-low p-5">
              <p className="text-[11px] font-semibold text-on-surface-variant">
                AI-сводка
              </p>
              <p className="mt-2 leading-relaxed text-on-surface-variant">
                {problem.aiSummary}
              </p>
            </div>
            <div className="mt-4 rounded-2xl bg-surface-container-low p-5">
              <p className="text-[11px] font-semibold text-on-surface-variant">
                Текущий этап
              </p>
              <p className="mt-2 text-lg font-black text-primary">
                {stageLabelMap[problem.lifecycleStatus]}
              </p>
              {problem.resolutionNote ? (
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                  {problem.resolutionNote}
                </p>
              ) : null}
            </div>
            {problem.status === "rejected" ? (
              <div className="mt-8 rounded-2xl bg-error-container p-5 text-on-error-container">
                <p className="text-sm font-bold">Не попало в общую ленту</p>
                <p className="mt-2 text-sm leading-relaxed">
                  Обращение сохранено в профиле автора и может быть дополнено
                  перед повторной отправкой.
                </p>
              </div>
            ) : null}
          </article>

          <article className="rounded-2xl bg-surface-container-lowest p-8 shadow-ambient ring-1 ring-outline-variant/15">
            <p className="text-xs font-semibold text-on-surface-variant">
              Ход обращения
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-editorial text-primary">
              Короткая история
            </h2>
            <div className="mt-6 space-y-5">
              {[
                {
                  title: "Обращение зарегистрировано",
                  time: problem.createdAt,
                  description:
                    "Пользователь добавил проблему и описал её в системе.",
                },
                {
                  title: "Разбор завершён",
                  time: analyzedAt,
                  description:
                    "Система определила тему, срочность и нашла похожие обращения.",
                },
                {
                  title: "Текущий этап",
                  time: problem.updatedAt,
                  description: stageLabelMap[problem.lifecycleStatus],
                },
              ].map((item, index) => (
                <div className="relative pl-8" key={item.title}>
                  {index < 2 ? (
                    <div className="absolute left-[7px] top-7 h-full w-px bg-outline-variant/40" />
                  ) : null}
                  <div className="absolute left-0 top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary" />
                  <p className="text-sm font-black text-primary">{item.title}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {formatDisplayDate(item.time)} · {formatRelativeTime(item.time)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </article>

          {relatedProblems.length > 0 ? (
            <section>
              <p className="text-xs font-semibold text-on-surface-variant">
                Похожие обращения
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-editorial text-primary">
                Что ещё происходит по теме
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
                {relatedProblems.map((relatedProblem) => (
                  <ProblemCard
                    author={usersById[relatedProblem.authorId] || null}
                    key={relatedProblem.id}
                    problem={relatedProblem}
                    variant="compact"
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6 lg:col-span-4">
          {author ? (
            <div className="rounded-2xl bg-surface-container-low p-6">
              <p className="text-sm font-semibold text-on-surface-variant">
                Автор обращения
              </p>
              <div className="mt-5 flex items-center gap-4">
                <UserAvatar size="md" user={author} />
                <div>
                  <p className="text-lg font-black tracking-editorial text-primary">
                    {author.displayName || author.username}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    @{author.username}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-on-surface-variant">
                {author.bio}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-surface-container-lowest p-4">
                <div>
                  <p className="text-[11px] font-semibold text-on-surface-variant">
                    Подписчики
                  </p>
                  <p className="mt-2 text-xl font-black text-primary">
                    {author.followersCount}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-on-surface-variant">
                    Подписок
                  </p>
                  <p className="mt-2 text-xl font-black text-primary">
                    {author.followingCount}
                  </p>
                </div>
              </div>
              <Link
                className="mt-6 inline-flex items-center gap-2 border-b-2 border-primary pb-1 text-sm font-black text-primary"
                to={`/profile/${author.username}`}
              >
                Открыть профиль
                <MaterialIcon className="text-base" name="north_east" />
              </Link>
            </div>
          ) : null}

          {author && moreFromAuthor.length > 0 ? (
            <div className="rounded-2xl bg-surface-container-low p-6">
              <p className="text-sm font-semibold text-on-surface-variant">
                Ещё от автора
              </p>
              <div className="mt-5 space-y-4">
                {moreFromAuthor.map((post) => (
                  <Link
                    className="block rounded-xl bg-surface-container-lowest p-4 transition hover:bg-surface-container-highest"
                    key={post.id}
                    to={`/problem/${post.id}`}
                  >
                    <p className="text-sm font-black leading-snug text-primary">
                      {post.title}
                    </p>
                    <p className="mt-2 text-xs text-on-surface-variant">
                      {formatRelativeTime(post.createdAt)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
