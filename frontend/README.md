# SolveIt Frontend MVP

SolveIt is a hackathon-ready frontend MVP for publishing, reviewing, and browsing civic problems. This repository now runs as a responsive React app with a thin API layer that defaults to mocks today and can be pointed at FastAPI later with minimal rewrites.

The original `stitch/` directory is preserved as the exported design reference. The runnable app lives in `src/`.

## Initial Audit

### What the repository contained
- Exported static design HTML in `stitch/ru_4/code.html` and `stitch/ru_updated_nav/code.html`
- Design screenshots in `stitch/*/screen.png`
- Design system notes in `stitch/civic_mono/DESIGN.md`

### What was missing
- No framework scaffold
- No build tool config
- No package manager setup
- No `src/` app code
- No router
- No environment config
- No mock or real API layer

### Initial blockers to running locally
- No `package.json`
- No dev/build scripts
- No entrypoint or bundler
- Exported HTML depended on Tailwind CDN and static markup only
- No data persistence or typed domain models

## Current Stack

- Framework: React 18 + TypeScript
- Build tool: Vite 5
- Package manager: npm
- Routing: `react-router-dom` with Browser Router
- Styling: Tailwind CSS + small shared UI primitives + preserved design tokens from the export
- Mock persistence: `localStorage` and `sessionStorage`

## Install

```bash
npm install
cp .env.example .env
```

## Run

```bash
npm run dev
```

App will be available at `http://localhost:5173` by default.

## Build

```bash
npm run build
npm run preview
```

## Environment Variables

Create `.env` from `.env.example`.

```env
VITE_API_MODE=mock
VITE_API_BASE_URL=http://localhost:8000
VITE_PUBLIC_BASE_PATH=/
VITE_ROUTER_BASENAME=
```

### Meaning
- `VITE_API_MODE`: `mock` or `real`
- `VITE_API_BASE_URL`: FastAPI base URL used when `VITE_API_MODE=real`
- `VITE_PUBLIC_BASE_PATH`: Vite asset base path for deployments under a subpath
- `VITE_ROUTER_BASENAME`: React Router basename if the app is mounted below `/`

## Working Routes

- `/`
- `/feed`
- `/auth`
- `/problem/:id`
- `/create`
- `/profile/:username`

In local dev, direct refresh works for those routes. For production deployment, configure SPA fallback rewrites to `index.html`.

## Project Structure

```text
src/
  app/
  pages/
  widgets/
  components/
  features/
    feed/
    problem-details/
    create-problem/
    profile/
  entities/
    problem/
    user/
  shared/
    api/
    lib/
    config/
    ui/
  mocks/
```

### Important files
- `src/shared/api/contracts.ts`: typed request/response contracts
- `src/shared/api/mock-api.ts`: mock implementation
- `src/shared/api/http-api.ts`: FastAPI-ready HTTP implementation
- `src/shared/api/index.ts`: central API selection
- `src/mocks/seed.ts`: realistic seeded users/problems
- `src/mocks/db.ts`: localStorage-backed mock database

## Mock Mode

Mock mode is the default.

### Behavior
- Feed shows approved/public mock problems
- Opening a problem increments views once per browser session
- Guests can browse feed, problems, and profiles without signing in
- Creating a new problem redirects guests to `/auth`
- Creating a problem runs `runAIAnalysis()` locally
- AI mock returns `category`, `importance`, `status`, and `aiSummary`
- Approved problems appear in the feed immediately
- Rejected problems remain visible in the author profile
- Supporting a problem is available on the expanded problem page for non-authored issues
- Manual additions persist in `localStorage`

### Storage keys
- `solveit:mock-db:v1`: users + problems
- `solveit:viewed-problems:v1`: per-session viewed problem ids

## FastAPI Handoff

The frontend already separates mock and real implementations behind one interface.

### Current API methods
- `getCurrentUser()`
- `getProblems()`
- `getProblemById(id)`
- `createProblem(payload)`
- `getUserProfile(idOrUsername)`
- `incrementProblemView(id)`
- `supportProblem(id)`
- `runAIAnalysis(payload)`
- `login(payload)`
- `register(payload)`
- `logout()`

### Switch to FastAPI
1. Set `VITE_API_MODE=real`
2. Set `VITE_API_BASE_URL` to your FastAPI origin
3. Update the endpoint paths in `src/shared/api/http-api.ts` if your backend paths differ
4. Keep the response shapes aligned with `src/shared/api/contracts.ts`

### Suggested FastAPI mapping
- `GET /api/users/me`
- `GET /api/problems`
- `GET /api/problems/{id}`
- `POST /api/problems`
- `POST /api/problems/{id}/views`
- `POST /api/problems/{id}/support`
- `POST /api/analysis/problem`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/users/{id_or_username}`

## Deployment Notes

- Assets are bundled through Vite, so there are no hardcoded localhost asset paths
- If deployed under a subdomain root, leave `VITE_PUBLIC_BASE_PATH=/` and `VITE_ROUTER_BASENAME=` blank
- If deployed under a subpath like `/solveit/`, set both variables accordingly
- Production hosting must rewrite unknown routes to `index.html` for Browser Router refresh support

## Known Limitations

- Authentication is mock-backed and not connected to a real identity provider yet
- Mock AI analysis is deterministic keyword logic, not a real model call
- No edit/delete flow for authored problems
- No pagination or backend caching yet
- `stitch/` remains as reference exports and is not part of the runtime app

## Commands Summary

```bash
npm install
cp .env.example .env
npm run dev
npm run build
```
