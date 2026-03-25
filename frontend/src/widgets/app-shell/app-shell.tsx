import { useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  matchPath,
  useLocation,
  useNavigate,
} from "react-router-dom";

import type { User } from "@/entities/user/model/types";
import { api } from "@/shared/api";
import { cx } from "@/shared/lib/cx";
import { MaterialIcon } from "@/shared/ui/material-icon";
import { Button } from "@/shared/ui/button";

const navigation = [{ to: "/feed", label: "Лента", icon: "reorder" }];

function getNavLinkClass(isActive: boolean) {
  return cx(
    "rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200",
    isActive
      ? "bg-surface-container-highest text-black"
      : "text-zinc-500 hover:bg-surface-container-low hover:text-black",
  );
}

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    api.getCurrentUser().then((user) => {
      if (isMounted) {
        setCurrentUser(user);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  const profileMatch = matchPath("/profile/:username", location.pathname);
  const isOwnProfileRoute = Boolean(
    currentUser &&
      profileMatch?.params.username &&
      profileMatch.params.username === currentUser.username,
  );
  const profileTo = currentUser ? `/profile/${currentUser.username}` : "/auth";
  const createTo = currentUser ? "/create" : "/auth?next=/create";

  async function handleLogout() {
    await api.logout();
    setCurrentUser(null);
    navigate("/feed", { replace: true });
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="fixed top-0 z-50 w-full border-b border-outline-variant/10 bg-[#fcf9f8]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4 tracking-tight sm:px-8">
          <div className="flex items-center gap-6">
            <NavLink className="text-xl font-black tracking-editorial text-black" to="/feed">
              SolveIt
            </NavLink>

            <nav className="hidden items-center gap-3 md:flex">
              {navigation.map((item) => (
                <NavLink
                  className={({ isActive }) => getNavLinkClass(isActive)}
                  key={item.to}
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
              {currentUser ? (
                <NavLink
                  className={() => getNavLinkClass(isOwnProfileRoute)}
                  to={profileTo}
                >
                  Профиль
                </NavLink>
              ) : (
                <NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/auth">
                  Войти
                </NavLink>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <NavLink
                className="hidden rounded-full bg-surface-container-highest px-4 py-2 text-sm font-bold text-primary transition hover:bg-surface-container-high lg:inline-flex"
                to={profileTo}
              >
                @{currentUser.username}
              </NavLink>
            ) : null}
            {!currentUser ? (
              <NavLink className="hidden sm:inline-flex" to="/auth">
                <Button variant="ghost">Войти</Button>
              </NavLink>
            ) : (
              <Button
                className="hidden px-4 py-2.5 sm:inline-flex"
                onClick={handleLogout}
                variant="ghost"
              >
                Выйти
              </Button>
            )}
            <NavLink to={createTo}>
              <Button className="gap-2 px-4 py-2.5 sm:px-5">
                <MaterialIcon className="text-lg" fill name="add_circle" />
                <span className="hidden sm:inline">Добавить проблему</span>
                <span className="sm:hidden">Добавить</span>
              </Button>
            </NavLink>
          </div>
        </div>
      </header>

      <main>
        <Outlet context={{ currentUser }} />
      </main>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-outline-variant/10 bg-[#fcf9f8]/95 px-6 py-3 backdrop-blur md:hidden">
        {navigation.map((item) => (
          <NavLink
            className={({ isActive }) =>
              cx(
                "flex min-w-[72px] flex-col items-center gap-1 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em]",
                isActive
                  ? "bg-surface-container-highest text-black"
                  : "text-zinc-600",
              )
            }
            key={item.to}
            to={item.to}
          >
            {({ isActive }) => (
              <>
                <MaterialIcon fill={isActive} name={item.icon} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <NavLink
          className={({ isActive }) =>
            cx(
              "flex min-w-[72px] flex-col items-center gap-1 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em]",
              currentUser
                ? isOwnProfileRoute
                  ? "bg-surface-container-highest text-black"
                  : "text-zinc-600"
                : isActive
                ? "bg-surface-container-highest text-black"
                : "text-zinc-600",
            )
          }
          to={profileTo}
        >
          {({ isActive }) => (
            <>
              <MaterialIcon
                fill={currentUser ? isOwnProfileRoute : isActive}
                name="account_circle"
              />
              <span>{currentUser ? "Профиль" : "Войти"}</span>
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}
