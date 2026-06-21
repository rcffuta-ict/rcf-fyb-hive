# AI Coding Agent Instructions


# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.


## Project Context

- **Framework:** Next.js 16.x (App Router, React 19+ architecture). Default bundler is Turbopack.
- **State Management:** Zustand (lightweight, client-side slices). Absolutely no MobX.
- **UI & Styling:** Shadcn/ui (Radix Primitives + Tailwind CSS v3). Complete deprecation of Ant Design.
- **Forms & Validation:** React Hook Form + Zod + @hookform/resolvers.

## Architectural Directives & Next 16 Breaking Changes

1. **Asynchronous Request APIs:** APIs like `params`, `searchParams`, `cookies()`, and `headers()` are strictly async. Always `await` them in pages, layouts, and route handlers.
2. **Local Docs First:** Check `node_modules/next/dist/docs/` before implementing complex server structures or caching logic.
3. **Caching Architecture:** Implement explicit component-level caching using the stable `use cache` directive rather than implicit fetch-level caching.
4. **Network Boundary:** Keep in mind that edge middleware configuration uses the `proxy.ts` convention in this version.
5. **Zustand Isolation:** Wrap your interactive state listeners tightly in `'use client'` boundaries and use strict selectors to limit component re-renders.
