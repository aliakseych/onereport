import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import type { User } from "@/entities/user/model/types";
import { UserAvatar } from "@/entities/user/ui/user-avatar";
import { api } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { TextField } from "@/shared/ui/field";

type AuthMode = "login" | "register";

function getSafeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/feed";
  }

  return nextPath;
}

export function AuthForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = useMemo(
    () => getSafeNextPath(searchParams.get("next")),
    [searchParams],
  );

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({
    identifier: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    let isMounted = true;

    api
      .getCurrentUser()
      .then((user) => {
        if (isMounted) {
          setCurrentUser(user);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingUser(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.login(loginForm);
      navigate(nextPath, { replace: true });
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Не удалось войти в аккаунт.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !registerForm.displayName.trim() ||
      !registerForm.username.trim() ||
      !registerForm.email.trim() ||
      !registerForm.password.trim()
    ) {
      setError("Заполните все поля, чтобы создать аккаунт.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.register(registerForm);
      navigate(nextPath, { replace: true });
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Не удалось создать аккаунт.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setIsSubmitting(true);
    await api.logout();
    setCurrentUser(null);
    setIsSubmitting(false);
  }

  if (isLoadingUser) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-5 w-24 rounded-full bg-surface-container-highest" />
        <div className="h-12 rounded-2xl bg-surface-container-highest" />
        <div className="h-12 rounded-2xl bg-surface-container-highest" />
        <div className="h-11 w-44 rounded-xl bg-surface-container-highest" />
      </div>
    );
  }

  if (currentUser) {
    return (
      <div className="rounded-[1.75rem] bg-surface-container-lowest p-6 shadow-ambient ring-1 ring-outline-variant/15 sm:p-7">
        <p className="text-sm font-semibold text-on-surface-variant">
          Вы уже вошли
        </p>
        <div className="mt-5 flex items-center gap-4">
          <UserAvatar size="md" user={currentUser} />
          <div>
            <p className="text-xl font-black tracking-editorial text-primary">
              {currentUser.displayName || currentUser.username}
            </p>
            <p className="text-sm text-on-surface-variant">
              @{currentUser.username}
            </p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-on-surface-variant">
          Можно сразу продолжить к публикации обращения или выйти и сменить аккаунт.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => navigate(nextPath, { replace: true })}>
            Продолжить
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleLogout}
            variant="secondary"
          >
            Выйти и сменить аккаунт
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] bg-surface-container-lowest p-6 shadow-ambient ring-1 ring-outline-variant/15 sm:p-7">
      <h1 className="text-[2rem] font-black leading-none tracking-editorial text-primary sm:text-[2.35rem]">
        Войти или создать аккаунт
      </h1>

      <div className="mt-6 inline-flex rounded-full bg-surface-container-low p-1">
        {([
          { id: "login", label: "Вход" },
          { id: "register", label: "Регистрация" },
        ] as const).map((item) => (
          <button
            className={
              item.id === mode
                ? "rounded-full bg-primary px-5 py-2 text-sm font-bold text-on-primary"
                : "rounded-full px-5 py-2 text-sm font-bold text-on-surface-variant"
            }
            key={item.id}
            onClick={() => {
              setMode(item.id);
              setError(null);
            }}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === "login" ? (
        <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit}>
          <TextField
            className="min-h-11 rounded-xl px-3.5 py-2.5 text-sm"
            label="Username или email"
            onChange={(event) =>
              setLoginForm((current) => ({
                ...current,
                identifier: event.target.value,
              }))
            }
            placeholder="alex.konstantinov"
            value={loginForm.identifier}
          />
          <TextField
            className="min-h-11 rounded-xl px-3.5 py-2.5 text-sm"
            label="Пароль"
            onChange={(event) =>
              setLoginForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder="Введите пароль"
            type="password"
            value={loginForm.password}
          />
          {error ? (
            <div className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
              {error}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3 pt-1">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Входим..." : "Войти"}
            </Button>
            <Button
              onClick={() => navigate("/feed", { replace: true })}
              type="button"
              variant="ghost"
            >
              Продолжить без входа
            </Button>
          </div>
          <p className="text-sm text-on-surface-variant">
            Для теста можно войти как `alex.konstantinov` с паролем `solveit2026`.
          </p>
        </form>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleRegisterSubmit}>
          <TextField
            className="min-h-11 rounded-xl px-3.5 py-2.5 text-sm"
            label="Имя"
            onChange={(event) =>
              setRegisterForm((current) => ({
                ...current,
                displayName: event.target.value,
              }))
            }
            placeholder="Как вас зовут"
            value={registerForm.displayName}
          />
          <TextField
            className="min-h-11 rounded-xl px-3.5 py-2.5 text-sm"
            label="Username"
            onChange={(event) =>
              setRegisterForm((current) => ({
                ...current,
                username: event.target.value,
              }))
            }
            placeholder="Например: dilshod.rahimov"
            value={registerForm.username}
          />
          <TextField
            className="min-h-11 rounded-xl px-3.5 py-2.5 text-sm"
            label="Email"
            onChange={(event) =>
              setRegisterForm((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            placeholder="you@example.com"
            type="email"
            value={registerForm.email}
          />
          <TextField
            className="min-h-11 rounded-xl px-3.5 py-2.5 text-sm"
            label="Пароль"
            onChange={(event) =>
              setRegisterForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder="Придумайте пароль"
            type="password"
            value={registerForm.password}
          />
          {error ? (
            <div className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
              {error}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3 pt-1">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Создаем аккаунт..." : "Создать аккаунт"}
            </Button>
            <Button
              onClick={() => navigate("/feed", { replace: true })}
              type="button"
              variant="ghost"
            >
              Продолжить без входа
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
