import { Link } from "react-router-dom";
import { useState } from "react";

import type {
  ProblemCategory,
  ProblemPost,
} from "@/entities/problem/model/types";
import { PROBLEM_CATEGORY_LABELS } from "@/entities/problem/model/types";
import { ProblemCard } from "@/entities/problem/ui/problem-card";
import type { User } from "@/entities/user/model/types";
import { EmptyState } from "@/components/empty-state";
import {
  getDashboardMetrics,
  getFeedSections,
} from "@/features/feed/lib/selectors";
import { cx } from "@/shared/lib/cx";
import { Button } from "@/shared/ui/button";
import { MaterialIcon } from "@/shared/ui/material-icon";

interface ProblemFeedProps {
  problems: ProblemPost[];
  authorsById: Record<string, User>;
  currentUserProblems: ProblemPost[];
  currentUser?: User | null;
}

type ProblemFilter = "all" | ProblemCategory;

const filterOptions: ProblemFilter[] = [
  "all",
  "infrastructure",
  "safety",
  "ecology",
  "transport",
  "community",
];

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold tracking-[0.08em] text-on-surface-variant">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-black tracking-editorial text-primary">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
        {description}
      </p>
    </div>
  );
}

function getDeltaLabel(delta: number) {
  if (delta > 0) {
    return {
      icon: "north_east",
      text: `+${delta}`,
    };
  }

  if (delta < 0) {
    return {
      icon: "south_east",
      text: `${delta}`,
    };
  }

  return {
    icon: "trending_flat",
    text: "0",
  };
}

export function ProblemFeed({
  problems,
  authorsById,
  currentUserProblems,
  currentUser,
}: ProblemFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ProblemFilter>("all");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProblems = problems.filter((problem) => {
    const matchesFilter =
      activeFilter === "all" || problem.category === activeFilter;
    const matchesSearch =
      normalizedQuery.length === 0 ||
      `${problem.title} ${problem.description} ${problem.location || ""}`
        .toLowerCase()
        .includes(normalizedQuery);

    return matchesFilter && matchesSearch;
  });
  const sections = getFeedSections(filteredProblems, authorsById);
  const dashboardMetrics = getDashboardMetrics(currentUserProblems);
  const createTo = currentUser ? "/create" : "/auth?next=/create";

  return (
    <div className="mx-auto max-w-6xl px-6 pb-28 pt-28 sm:px-8 lg:px-12">
      <section className="mb-12 rounded-2xl bg-surface-container-low p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-[2.35rem] font-black leading-none tracking-editorial text-primary sm:text-[3rem]">
              Мои сигналы
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
              Личный обзор ваших городских обращений
            </p>
            {currentUser ? (
              <p className="mt-3 text-sm text-on-surface-variant">
                Обновления для @{currentUser.username}
              </p>
            ) : (
              <p className="mt-3 text-sm text-on-surface-variant">
                Войдите, чтобы видеть свои обращения, фотографии и историю публикаций.
              </p>
            )}
          </div>

          <Link className="self-start" to={createTo}>
            <Button className="min-w-[220px]" variant="secondary">
              Добавить проблему
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {dashboardMetrics.map((metric) => {
            const trend = getDeltaLabel(metric.delta);

            return (
              <div
                className="rounded-2xl bg-surface-container-lowest p-5 ring-1 ring-outline-variant/15"
                key={metric.label}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-on-surface-variant">
                    {metric.label}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant">
                    <MaterialIcon className="text-sm" name={trend.icon} />
                    {trend.text}
                  </span>
                </div>
                <p className="mt-5 text-3xl font-black tracking-editorial text-primary">
                  {metric.value}
                </p>
                <p className="mt-2 text-xs text-on-surface-variant">
                  {metric.supportingLabel}
                </p>
              </div>
            );
          })}
        </div>

        {currentUser && currentUserProblems.length === 0 ? (
          <p className="mt-5 text-sm leading-relaxed text-on-surface-variant">
            Пока у вас нет обращений. Первый сигнал сразу появится в этом обзоре.
          </p>
        ) : null}
      </section>

      <section className="mb-14 rounded-2xl bg-surface-container-low p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.08em] text-on-surface-variant">
              Поиск и темы
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-editorial text-primary">
              Найдите нужные обращения по теме или месту
            </h2>
          </div>

          <label className="flex min-h-12 w-full items-center gap-3 rounded-full border border-outline-variant/15 bg-surface-container-lowest px-4 md:max-w-sm">
            <MaterialIcon className="text-on-surface-variant" name="search" />
            <input
              className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-outline"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Поиск по обращениям"
              type="search"
              value={searchQuery}
            />
          </label>
        </div>

        <div className="mt-6 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {filterOptions.map((filter) => {
            const isActive = filter === activeFilter;
            const label =
              filter === "all" ? "Все" : PROBLEM_CATEGORY_LABELS[filter];

            return (
              <button
                className={cx(
                  "whitespace-nowrap rounded-full px-6 py-2 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-highest text-primary hover:bg-surface-container-high",
                )}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {filteredProblems.length > 0 ? (
        <div className="space-y-16">
          {sections.importantNow.length > 0 ? (
            <section>
              <SectionHeader
                description="Обращения, которые сейчас сильнее всего выделяются по срочности и вниманию пользователей."
                eyebrow="В фокусе"
                title="Важное прямо сейчас"
              />
              <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                {sections.importantNow.map(({ problem, author }) => (
                  <ProblemCard
                    activityLabel="В фокусе"
                    author={author}
                    key={problem.id}
                    problem={problem}
                    variant="featured"
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <SectionHeader
              description="Последние обращения в выбранном срезе."
              eyebrow="Новые проблемы"
              title="Свежие обращения"
            />
            <div className="flex flex-col gap-6">
              {sections.newProblems.map(({ problem, author }) => (
                <ProblemCard
                  author={author}
                  key={problem.id}
                  problem={problem}
                />
              ))}
            </div>
          </section>
        </div>
      ) : (
        <EmptyState
          actionLabel="Добавить проблему"
          actionTo={createTo}
          description="Измените запрос или выберите другую категорию."
          title="Подходящих обращений пока нет"
        />
      )}
    </div>
  );
}
