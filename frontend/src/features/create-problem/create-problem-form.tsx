import { Link } from "react-router-dom";
import { useState } from "react";

import {
  buildAiAnalysis,
  findSimilarProblems,
  getDraftGuidance,
} from "@/entities/problem/model/intelligence";
import type {
  ProblemAttachment,
  ProblemPost,
} from "@/entities/problem/model/types";
import {
  CategoryBadge,
  ImportanceBadge,
  StatusBadge,
} from "@/entities/problem/ui/problem-badges";
import type { User } from "@/entities/user/model/types";
import { UserAvatar } from "@/entities/user/ui/user-avatar";
import { api } from "@/shared/api";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { Button } from "@/shared/ui/button";
import { TextAreaField, TextField } from "@/shared/ui/field";
import { MaterialIcon } from "@/shared/ui/material-icon";

interface CreateProblemFormProps {
  currentUser: User;
  existingProblems: ProblemPost[];
  authorsById: Record<string, User>;
  onProblemCreated(problem: ProblemPost): void;
}

interface FormState {
  title: string;
  location: string;
  description: string;
  attachments: ProblemAttachment[];
}

const initialFormState: FormState = {
  title: "",
  location: "",
  description: "",
  attachments: [],
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Не удалось прочитать файл."));
    };

    reader.onerror = () => reject(new Error("Не удалось прочитать файл."));
    reader.readAsDataURL(file);
  });
}

export function CreateProblemForm({
  currentUser,
  existingProblems,
  authorsById,
  onProblemCreated,
}: CreateProblemFormProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const draftPayload = {
    title: form.title,
    description: form.description,
    location: form.location,
  };
  const hasMeaningfulDraft =
    form.title.trim().length >= 6 || form.description.trim().length >= 40;
  const liveAnalysis = hasMeaningfulDraft
    ? buildAiAnalysis(draftPayload, existingProblems)
    : null;
  const draftGuidance = getDraftGuidance(draftPayload);
  const similarIssues = hasMeaningfulDraft
    ? findSimilarProblems(draftPayload, existingProblems, 3)
    : [];
  const duplicateWarning =
    similarIssues.length > 0 && similarIssues[0].score >= 60
      ? "Похоже, похожее обращение уже есть. Проверьте, не лучше ли дополнить существующий сигнал новыми деталями."
      : null;

  const hasLocation = Boolean(form.location.trim());
  const hasImpact = /(опас|мешает|затруд|риск|невозмож|вынужд|страда)/i.test(
    form.description,
  );
  const hasFrequency = /(ежеднев|кажд|регуляр|постоян|часто|несколько|после)/i.test(
    form.description,
  );

  async function handleAttachmentChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAttachmentError("Пока можно загрузить только изображение или фотографию.");
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      setAttachmentError("Файл слишком большой. Выберите изображение до 6 МБ.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setForm((current) => ({
        ...current,
        attachments: [
          {
            id: `attachment-${Date.now()}`,
            type: "image",
            name: file.name,
            url: dataUrl,
          },
        ],
      }));
      setAttachmentError(null);
      event.target.value = "";
    } catch (fileError) {
      setAttachmentError(
        fileError instanceof Error
          ? fileError.message
          : "Не удалось загрузить изображение.",
      );
    }
  }

  function handleAttachmentRemove() {
    setForm((current) => ({
      ...current,
      attachments: [],
    }));
    setAttachmentError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      setError("Заполните заголовок и описание проблемы.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const nextAnalysis = await api.runAIAnalysis({
        title: form.title,
        description: form.description,
        location: form.location,
      });

      const createdProblem = await api.createProblem({
        title: form.title,
        description: form.description,
        location: form.location,
        authorId: currentUser.id,
        analysis: nextAnalysis,
        attachments: form.attachments,
      });

      setForm(initialFormState);
      setAttachmentError(null);
      onProblemCreated(createdProblem);
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Не удалось создать проблему.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-28 pt-28 sm:px-8 lg:px-12">
      <section className="mb-10 max-w-3xl">
        <p className="text-sm text-on-surface-variant">
          От имени @{currentUser.username}
        </p>
        <h1 className="mt-3 text-[2.5rem] font-black leading-none tracking-editorial text-primary sm:text-[3rem]">
          Добавить проблему
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
          Опишите, что происходит, где это случается и как влияет на жителей.
          Предварительный разбор появится сразу по мере заполнения.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <form className="space-y-6 lg:col-span-7" onSubmit={handleSubmit}>
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-ambient ring-1 ring-outline-variant/15 sm:p-8">
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  done: hasLocation,
                  label: "Локация",
                  text: "Укажите место или ориентир",
                },
                {
                  done: hasImpact,
                  label: "Влияние",
                  text: "Объясните, кому и чем мешает",
                },
                {
                  done: hasFrequency,
                  label: "Повторяемость",
                  text: "Добавьте, как часто это происходит",
                },
              ].map((item) => (
                <div className="rounded-xl bg-surface-container-low p-4" key={item.label}>
                  <div className="flex items-center gap-2">
                    <MaterialIcon
                      className={item.done ? "text-tertiary" : "text-outline"}
                      fill={item.done}
                      name={item.done ? "check_circle" : "radio_button_unchecked"}
                    />
                    <p className="text-sm font-bold text-primary">{item.label}</p>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TextField
                label="Заголовок"
                maxLength={120}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Коротко сформулируйте проблему"
                value={form.title}
              />
              <TextField
                hint="Локация помогает точнее определить тему обращения."
                label="Локация"
                maxLength={120}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                placeholder="Например: ул. Мира, 12"
                value={form.location}
              />
              <TextAreaField
                hint="Опишите место, последствия для жителей и как часто это повторяется."
                label="Описание"
                maxLength={1200}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Подробно опишите ситуацию и желаемый результат..."
                value={form.description}
              />

              <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-primary">
                      Фото или изображение
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
                      Добавьте один снимок места, чтобы обращение было понятнее с первого взгляда.
                    </p>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-surface-container-highest px-4 py-3 text-sm font-bold text-primary transition hover:bg-surface-container-high">
                    <MaterialIcon className="text-base" name="add_photo_alternate" />
                    Выбрать файл
                    <input
                      accept="image/*"
                      className="hidden"
                      onChange={handleAttachmentChange}
                      type="file"
                    />
                  </label>
                </div>

                {attachmentError ? (
                  <p className="mt-4 text-sm text-error">{attachmentError}</p>
                ) : null}

                {form.attachments[0] ? (
                  <div className="mt-5 overflow-hidden rounded-2xl bg-surface-container-lowest ring-1 ring-outline-variant/15">
                    <img
                      alt="Предпросмотр вложения"
                      className="h-64 w-full object-cover"
                      loading="lazy"
                      src={form.attachments[0].url}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div>
                        <p className="text-sm font-bold text-primary">
                          {form.attachments[0].name}
                        </p>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          Изображение будет прикреплено к обращению.
                        </p>
                      </div>
                      <button
                        className="rounded-full bg-surface-container-high px-4 py-2 text-sm font-bold text-primary transition hover:bg-surface-container-highest"
                        onClick={handleAttachmentRemove}
                        type="button"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {draftGuidance.warnings.length > 0 || duplicateWarning ? (
              <div className="mt-6 rounded-xl bg-secondary-container px-4 py-4 text-sm text-on-secondary-container">
                <p className="font-bold">Стоит уточнить</p>
                <div className="mt-2 space-y-2">
                  {duplicateWarning ? <p>{duplicateWarning}</p> : null}
                  {draftGuidance.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="mt-6 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
                {error}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button className="min-w-[220px]" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Отправляем обращение..." : "Отправить обращение"}
              </Button>
              <p className="text-sm text-on-surface-variant">
                После отправки вы сразу увидите результат разбора.
              </p>
            </div>
          </div>
        </form>

        <aside className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-ambient ring-1 ring-outline-variant/15">
            <div className="flex items-center gap-3">
              <MaterialIcon className="text-primary" fill name="auto_awesome" />
              <p className="text-sm font-semibold text-on-surface-variant">
                Предварительный разбор
              </p>
            </div>

            {liveAnalysis ? (
              <div className="mt-5 space-y-5">
                <div className="flex flex-wrap gap-3">
                  <CategoryBadge category={liveAnalysis.category} />
                  <ImportanceBadge importance={liveAnalysis.importance} />
                  <StatusBadge status={liveAnalysis.status} />
                </div>
                <p className="leading-relaxed text-on-surface-variant">
                  {liveAnalysis.aiSummary}
                </p>
                <div className="rounded-xl bg-surface-container-low p-4">
                  <p className="text-[11px] font-semibold text-on-surface-variant">
                    Похожие обращения
                  </p>
                  <p className="mt-2 text-sm font-bold text-primary">
                    {liveAnalysis.similarReportsCount}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-relaxed text-on-surface-variant">
                Начните описывать ситуацию, и здесь появятся тема, приоритет и
                краткая сводка.
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-ambient ring-1 ring-outline-variant/15">
            <div className="flex items-center gap-3">
              <MaterialIcon className="text-primary" name="hub" />
              <p className="text-sm font-semibold text-on-surface-variant">
                Похожие обращения
              </p>
            </div>

            {similarIssues.length > 0 ? (
              <div className="mt-5 space-y-4">
                {similarIssues.map(({ problem, score }) => {
                  const author = authorsById[problem.authorId] || null;

                  return (
                    <Link
                      className="block rounded-xl bg-surface-container-low p-4 transition hover:bg-surface-container-high"
                      key={problem.id}
                      to={`/problem/${problem.id}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black leading-snug text-primary">
                            {problem.title}
                          </p>
                          <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                            {problem.aiSummary}
                          </p>
                        </div>
                        <span className="rounded-full bg-surface-container-highest px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                          {score}%
                        </span>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        {author ? <UserAvatar size="sm" user={author} /> : null}
                        <div>
                          <p className="text-sm font-bold text-primary">
                            {author?.displayName || author?.username || "Автор обращения"}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            Обновлено {formatRelativeTime(problem.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-relaxed text-on-surface-variant">
                Пока нет близких совпадений. Похоже, это новый сигнал.
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-surface-container-low p-6">
            <p className="text-sm font-semibold text-on-surface-variant">
              Что поможет быстрее разобраться
            </p>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-on-surface-variant">
              {draftGuidance.guidance.length > 0 ? (
                draftGuidance.guidance.map((tip) => <p key={tip}>{tip}</p>)
              ) : (
                <p>Описание уже выглядит достаточно конкретным и понятным.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
