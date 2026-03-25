import { EmptyState } from "@/components/empty-state";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-28 pt-28 sm:px-8 lg:px-12">
      <EmptyState
        actionLabel="Вернуться в ленту"
        actionTo="/feed"
        description="Страница не найдена, но основные MVP-маршруты SolveIt уже готовы."
        title="404"
      />
    </div>
  );
}
