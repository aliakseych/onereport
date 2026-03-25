import { createBrowserRouter } from "react-router-dom";

import { env } from "@/shared/config/env";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { AuthPage } from "@/pages/auth-page";
import { CreatePage } from "@/pages/create-page";
import { FeedPage } from "@/pages/feed-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { ProblemPage } from "@/pages/problem-page";
import { ProfilePage } from "@/pages/profile-page";

export const router = createBrowserRouter(
  [
    {
      path: "/auth",
      element: <AuthPage />,
    },
    {
      path: "/",
      element: <AppShell />,
      children: [
        {
          index: true,
          element: <FeedPage />,
        },
        {
          path: "feed",
          element: <FeedPage />,
        },
        {
          path: "problem/:id",
          element: <ProblemPage />,
        },
        {
          path: "create",
          element: <CreatePage />,
        },
        {
          path: "profile/:username",
          element: <ProfilePage />,
        },
        {
          path: "*",
          element: <NotFoundPage />,
        },
      ],
    },
  ],
  {
    basename: env.routerBasename || undefined,
  },
);
