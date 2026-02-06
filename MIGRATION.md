# Astro to Next.js Migration Guide

## Migration Progress

This document tracks the migration from Astro to Next.js App Router.

### ✅ Completed

- [x] Next.js configuration (next.config.js, tsconfig.json)
- [x] Environment variables setup
- [x] Authentication middleware (@navikt/oasis)
- [x] Root layout with NAV Design System
- [x] API proxy route (/api/proxy/[...path])
- [x] Health check routes (/api/internal/isAlive, /api/internal/isReady)
- [x] Server utility functions (environment, urls, getOboToken, getAuthToken)
- [x] Home page (/)
- [x] Updated package.json with Next.js dependencies

### 🔄 In Progress / Remaining

- [ ] Teams pages (/teams, /teams/[teamId])
- [ ] Reports pages (/reports/[id], /reports/aggregated/[id])
- [ ] Admin pages (/admin, /admin/create-report/[id])
- [ ] Update React components (remove `client:only` directives, add `'use client'` where needed)
- [ ] Test and validate the build

## Key Migration Decisions

### 1. **Next.js App Router** (Chosen over Pages Router)

- Uses Server Components by default (better performance)
- Aligned with Astro's SSR model
- Modern Next.js approach

### 2. **Authentication Flow**

- Middleware validates tokens and passes them via headers (`x-auth-token`)
- Server Components access token via `getAuthToken()` helper
- API routes receive token from headers

### 3. **File Structure**

```
app/
├── layout.tsx                 # Root layout (replaces Layout.astro)
├── page.tsx                   # Home page (replaces index.astro)
├── api/
│   ├── proxy/[...path]/route.ts
│   └── internal/
│       ├── isAlive/route.ts
│       └── isReady/route.ts
└── [future pages will go here]

src/
├── components/                # Existing React components
│   ├── navbar/
│   │   ├── Navbar.tsx        # Converted to Server Component
│   │   └── MobileNavbar.tsx  # Client Component ('use client')
│   └── ...
└── utils/
    └── server/
        ├── getAuthToken.ts    # NEW: Helper to get token from headers
        └── ...

middleware.ts                  # NEW: Root middleware (replaces src/middleware/index.ts)
next.config.js                 # NEW: Next.js configuration
```

## Component Migration Pattern

### Astro Components → React Server Components

```astro
// src/layouts/Layout.astro
---
import Navbar from '../components/navbar/Navbar.astro';
---
<html>
  <body>
    <Navbar />
    <slot />
  </body>
</html>
```

Becomes:

```tsx
// app/layout.tsx
import Navbar from "@/components/navbar/Navbar";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
```

### Astro Pages → Next.js Server Components

```astro
// src/pages/index.astro
---
const oboToken = await getOboToken(Astro.locals.token);
const user = await fetch(...);
---
<Layout>
  <MyTeam client:only user={user} />
</Layout>
```

Becomes:

```tsx
// app/page.tsx
async function getUser() {
  const token = await getAuthToken();
  const oboToken = await getOboToken(token);
  return fetch(...);
}

export default async function Home() {
  const user = await getUser();
  return <MyTeam user={user} />;
}
```

### Client Directives → 'use client'

```tsx
// Before (Astro)
<MyComponent client:only />
<Interactive client:only="react" />
```

```tsx
// After (Next.js)
// At the top of interactive component files:
'use client';

export default function MyComponent() { ... }
```

## Next Steps to Complete Migration

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Convert Remaining Pages

For each `.astro` page file in `src/pages/`:

1. Create corresponding file in `app/` directory
2. Extract data fetching from frontmatter to async function
3. Use `getAuthToken()` instead of `Astro.locals.token`
4. Convert JSX-like syntax to proper React/JSX
5. Remove `<Layout>` wrapper (handled by root layout)
6. Add `'use client'` to components that need interactivity

### 3. Update React Components

- Add `'use client'` to any component using:
  - React hooks (useState, useEffect, etc.)
  - Browser APIs (window, document)
  - Event handlers (onClick, onChange)
  - Third-party libraries that require client-side

### 4. Test the Application

```bash
# Development
pnpm dev

# Build
pnpm build

# Start production
pnpm start
```

## Important Notes

### CSS Changes

- Astro CSS variables: `var(--ax-*)` → Next.js/DS: `var(--a-*)`
- NAV Design System CSS is imported via `import '@navikt/ds-css'` in root layout

### Data Fetching Differences

| Astro                | Next.js App Router           |
| -------------------- | ---------------------------- |
| Frontmatter `---`    | Async Server Component       |
| `Astro.locals.token` | `await getAuthToken()`       |
| `<slot />`           | `{children}`                 |
| `client:only`        | `'use client'` directive     |
| ViewTransitions      | Built-in with Link component |

### API Routes

- Next.js uses `route.ts` files instead of Astro's API endpoints
- HTTP methods are named exports: `GET`, `POST`, `PUT`, DELETE`, `PATCH`
- Dynamic routes use folder structure: `[...path]/route.ts`

## Environment Variables

Make sure to copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in your environment-specific values.

## Deployment

The app is configured with `output: 'standalone'` for Node.js deployment, similar to Astro's standalone adapter.

## Troubleshooting

### "Cannot find module 'next'" errors

Run `pnpm install` to install Next.js and related dependencies.

### TypeScript errors about imports

The tsconfig has been updated for Next.js. You may need to restart your TypeScript server.

### CSS not loading

Make sure `@navikt/ds-css` is imported in `app/layout.tsx`.

### Authentication not working

Verify that:

1. Middleware is running (check `middleware.ts`)
2. `x-auth-token` header is being set
3. `getAuthToken()` is being called in Server Components
