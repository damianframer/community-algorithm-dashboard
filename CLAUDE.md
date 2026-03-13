# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (localhost:3000)
- **Build:** `npm run build`
- **Lint:** `npm run lint` (ESLint 9 flat config with Next.js core-web-vitals + TypeScript)
- **No test framework is configured.**

## Architecture

Next.js 15 App Router + React 19 + TypeScript (strict mode). All UI is client-side rendered (`"use client"`).

**Path alias:** `@/*` maps to `./src/*`

### Feature-based module structure

Each marketplace category (plugins, components, vectors, templates, tutorials) lives in `src/features/<name>/` with a consistent pattern:

- `*-workspace.tsx` — top-level stateful component managing ranking + settings
- `components/` — UI (sidebar config panel, content/list display)
- `lib/sidebar-settings.ts` — setting definitions (sections, controls, defaults)
- `lib/*-ranking.ts` — scoring algorithm + seed data

Pages in `src/app/` are thin shells that render the corresponding workspace.

### Ranking algorithm system

Each feature has a ranking algorithm that scores and sorts marketplace items using configurable weights. Key concepts:

- **Weight metrics:** opens, users, engagement, recency, momentum — each with configurable multipliers
- **Lookback windows:** 7d, 14d, 30d, 60d, 90d for metrics; 3d, 7d, 14d, 30d for momentum
- **Special controls:** admin overrides, rotation cooldowns, diversity caps, exploration/discovery percentage
- Shared ranking helpers in `src/features/marketplace/lib/ranking-helpers.ts`

### Settings system

`src/features/settings/lib/persisted-sidebar-settings.ts` provides a React Context + localStorage persistence layer. Settings are defined declaratively with support for stepper (numeric with min/max/step/formatting) and dropdown controls, organized into collapsible sections.

### Dynamic routes

`src/app/[templateSlug]/page.tsx` handles individual template detail pages using `TemplatesProvider` context from `src/features/templates/`.
