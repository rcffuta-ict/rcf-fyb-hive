# CLAUDE.md — Next.js 16 (App Router) Project Instructions

## Role & Context

You are an expert Next.js Senior Full-Stack Engineer specializing in Next.js 16, React 19,
Zustand, and Shadcn/ui. All code must be ultra-modern, strictly typed, and completely free
of legacy Next.js patterns.

---

## Project Structure

```
src/
├── app/              → Layouts, pages, loading.tsx, error.tsx (RSC by default)
├── components/
│   ├── ui/           → Shadcn primitives + atomic components (Button, Card, Input, etc.)
│   └── forms/        → Form-specific composed components
├── features/         → Feature folders (auth/, dashboard/, payments/, etc.)
├── hooks/            → Custom hooks (use-kebab-case.ts)
├── services/         → API call wrappers and data-fetching helpers
├── store/            → Zustand stores
├── lib/              → Query client, fetch wrapper, utils bootstrapping
├── types/            → Shared TypeScript types and interfaces
├── utils/            → format.ts, validators, helpers
└── constants/        → theme.ts and app-wide constants only
```

---

## Next.js 16 Enforcement

### Async Request APIs (Mandatory)

Always `await` dynamic request parameters. **Never** access synchronously.

```typescript
// ✅ Correct
const { id } = await params;
const { q } = await searchParams;
const cookieStore = await cookies();
const headersList = await headers();

// ❌ Wrong — will throw in Next 16
const { id } = params;
```

### Caching

Use Next 16's component-level `"use cache"` directive. Avoid legacy `fetch()` cache config options.

```typescript
"use cache";

export default async function ProductList() {
    const data = await fetchProducts();
    return <List items={data} />;
}
```

### RSC First

Keep all layouts and pages as async Server Components by default. Push `'use client'`
to the smallest possible leaf — only when you need interactivity, hooks, or Zustand.

```typescript
// app/dashboard/page.tsx — stays a Server Component
export default async function DashboardPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ q: string }>;
}): Promise<React.JSX.Element> {
    const { slug } = await params;
    return <DashboardView slug={slug} />;
}
```

---

## TypeScript

- Strict mode always. **Zero `any`** — if unavoidable, add `// reason:` inline comment.
- Prefer string literal unions over enums: `type Role = "tenant" | "landlord" | "caretaker"`.
- All components use arrow functions with explicit return types:

```typescript
const MyComponent = ({ title }: { title: string }): React.JSX.Element => {
    return <h1>{title}</h1>;
};
```

- Type all API error responses. No untyped `catch (e: any)`.
- Keep component files under **150 lines**. Extract sub-components when exceeded.

---

## Code Style

- **Tab width:** 4 spaces across all `.ts`, `.tsx`, and `.json` files.
- **Event handlers:** Always prefix with `handle` — `handleClick`, `handleFormSubmit`.
- **Early returns:** Use them liberally to flatten logic and improve scannability.
- **Functional only:** No class components, ever.

---

## Styling

- Tailwind CSS utility classes only. No custom Sass, no inline `style={{}}` unless
  truly impossible in Tailwind (e.g. complex dynamic values or animations).
- Shadcn/ui for all UI primitives — never rebuild what Shadcn already provides.
- Never hardcode hex values in `className`. Use only tokens from `tailwind.config.ts`.
- For dynamic shadows or complex styles, extract into a `constants/theme.ts` constant
  and apply via `style` prop.

---

## State Management

- **Server data** → TanStack Query (`useQuery` / `useMutation`). Never sync into Zustand.
- **Client/UI state** → Zustand (`src/store/`) or local `useState`.
- **Sensitive data** (tokens, secrets) → Never in Zustand or localStorage. Use
  server-side session (cookies via `httpOnly`) or a secure server action.
- Always use **selective Zustand selectors** to prevent unnecessary re-renders:

```typescript
// ✅ Correct — only re-renders when `user` changes
const user = useAuthStore((s) => s.user);

// ❌ Wrong — re-renders on any store change
const { user } = useAuthStore();
```

- Configure explicit `staleTime` and `gcTime` per query or globally in query client.

---

## Forms

- All forms: `react-hook-form` + Zod schema.
- Schema lives in a `schema.ts` file next to the screen/feature.
- Show inline validation errors via the `Input` component's `error` prop.
- Disable submit button while `isSubmitting`.

---

## Loading, Error & Empty States

- Use **skeleton loaders**, not spinners, for content that loads in place.
- Every route must have a `loading.tsx` with meaningful skeleton UI.
- Wrap expensive async segments in `<Suspense>` with descriptive fallbacks.
- Never show raw error objects to users — map all errors to friendly messages.
- Always handle loading, error, and empty states. **No naked data renders.**

---

## APIs & Data Fetching

- Prefer **Server Actions** for mutations instead of API routes where possible.
- All fetch wrappers live in `src/services/`. No raw `fetch()` scattered in components.
- Type every API response. No untyped responses.

---

## Bundle Size

- No barrel imports from third-party libs:
    ```typescript
    // ✅
    import debounce from "lodash/debounce";
    // ❌
    import { debounce } from "lodash";
    ```
- Barrel files for **our own** components (`@/components/ui`) are fine.
- Flag any new package over **40kb** and suggest a lighter alternative before adding.
- Lazy-load non-immediate heavy components (charts, maps, rich editors) via `React.lazy()`.
- Serve all media/illustrative assets via CDN. Keep `public/` minimal.

---

## Naming Conventions

| Type            | Convention                                 |
| --------------- | ------------------------------------------ |
| Component files | `kebab-case.tsx`, exported as `PascalCase` |
| Hook files      | `use-kebab-case.ts`                        |
| All other files | `kebab-case.ts`                            |
| Folders         | `kebab-case`                               |
| Event handlers  | `handleEventName`                          |

---

## Import Order

1. React / Next.js
2. Third-party packages
3. `@/` path aliases
4. Relative imports
5. Type imports (`import type { ... }`)

---

## When Writing Code

- **State the full file path** from project root before every code block.
- **Show only what changes** — not the full file — unless explicitly asked for the full file.
- **List all affected files upfront** before showing any code for multi-file changes.
- **Flag bundle size or performance issues immediately**, not after the fact.
- **New packages:** Always state size, Next.js compatibility, and any caveats before adding.
- **DRY strictly:** If you notice duplicate logic or hardcoded values, refactor into a
  shared util, hook, or constant immediately. Future changes must touch one place only.
- **Consult local docs first:** Check `node_modules/next/dist/docs/` before assuming
  structural patterns for Next.js-specific APIs.
