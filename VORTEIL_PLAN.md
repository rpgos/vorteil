# Vorteil

This is the high level plan for the app Vorteil - a website for competetive amateur leagues of tennis (for now just tennis). The inspiration is https://www.hobbyliga.de.
Users will be matched up with other users, play league matches, upload the scores of their matches and will be able to see their stats and head-to-head with other players/users.
Another goal for this project is SEO and performance. It should use server components as much as possible, with appropriate metadata, JSON LD and OpenGraph objects/data where applicable.
Use server actions over API routes, unless specifically instructed. In general the project won't have public api endpoints, as we won't, for now, share any data with external apis.

## How this file works

- We will be definining features and tasks we're gonna build. This file is the source of truth in that regard.
- New features/tasks will be added as time goes by, so it's important to not repeat the ones that are done already. **Important** after a feature or task is done, ask me for confirmation and mark it with `[DONE]` so on future sessions or future agents don't try to implement them again.
- Always follow the guidelines on `AGENTS.md` when implementing anything

## Agent guide

This section is the operating manual for any agent (or human) contributing to Vorteil. Read it before starting any task. The numbered feature sections below are the _what_; this section is the _how_.

### Tech stack

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS with HeroUI components (HeroUI is the default; do not pull in another component library)
- **Internationalization**: next-intl with locale-based routing (EN default; EN, PT, DE)
- **Authentication**: Supabase Auth — magic link + Google/Apple OAuth. _Not wired up yet; stub server actions until the Supabase integration step._
- **Database**: Supabase (Postgres) — _not wired up yet; replace stubs later. Treat every DB call today as a stub that logs and returns fixture data._
- **Testing**: Vitest (unit), Playwright (e2e)
- **CI**: GitHub Actions; deployment on Vercel later

### Folder structure

- `src/app/[locale]/` — all routes
- `src/app/[locale]/(public)/` — routes that do not require auth (landing, login, register, privacy)
- `src/app/[locale]/(app)/` — routes that require auth; the layout for this group calls `requireSession()`
- `src/components/` — reusable presentational components
- `src/components/forms/` — form components, paired with their server actions
- `src/server/actions/` — server actions grouped by domain (`auth.ts`, `users.ts`, `leagues.ts`, `matches.ts`)
- `src/server/db/` — DB stubs the server actions call; swap with Supabase later
- `src/server/auth/` — session and role helpers (`session.ts`, `guards.ts`)
- `src/server/notifications/` — email helpers and templates
- `src/lib/` — pure utilities (validation schemas, formatters, ranking math)
- `src/lib/seo/` — metadata helpers, JSON-LD builders
- `src/lib/security/` — rate-limit helpers, CSP utilities
- `src/types/` — shared TypeScript types
- `messages/{locale}/` — translation files grouped by namespace (`home.json`, `auth.json`, `leagues.json`, etc.)

### Server actions and data layer

- Prefer server actions over API routes. No public REST endpoints for now.
- Every server action that mutates data must:
  1. Validate input with a Zod schema (defined in `src/lib/validation/<domain>.ts`).
  2. Call a function in `src/server/db/<domain>.ts` (the stub).
  3. Return a typed `ActionResult<T>` discriminated union so the client can branch on `{ ok: true, data }` vs `{ ok: false, error }`.
- DB stubs:
  - Log `[DB STUB] <operation> <payload>` for any would-be write.
  - For reads, return realistic shaped fixture data so the UI can be developed end-to-end.
  - Return shapes must match what Supabase queries will eventually return so the swap-in is a one-file change per domain.

### Auth and authorization helpers

- `requireSession()` — server-only; calls `redirect('/login')` if no session.
- `requireRole(role)` — server-only; calls `notFound()` if the user lacks the role (404 not 403 to avoid leaking admin routes).
- `getOptionalSession()` — for pages that render differently for logged-in users (e.g., header, landing).
- All authenticated pages live under `(app)` so the layout calls `requireSession()` once for the whole tree.

### SEO conventions

- Every page exports `generateMetadata` returning `Metadata`. Title and description come from i18n keys.
- Set OpenGraph and Twitter card defaults plus `metadataBase` in `src/app/layout.tsx`; override per page where useful.
- Pages with structured content (public leagues/matches, when those exist) add JSON-LD via `src/lib/seo/jsonld.ts` (`SportsEvent`, `Organization`, `BreadcrumbList`).
- Render data server-side as much as possible. Avoid `'use client'` unless a component needs state, events, or browser APIs.
- Static-ish pages (landing, about, 404, privacy) can be statically rendered. Dynamic pages (leagues, profiles) should be SSR with appropriate cache hints.
- `robots.txt` and dynamic `sitemap.xml` live in `src/app/`.

### Security conventions

- Strict CSP and security headers configured in `next.config`. No inline scripts unless required and nonced.
- All server actions validate input with Zod; never trust client input.
- Rate-limit auth endpoints (magic-link request) — placeholder helper now, real implementation when DB is wired.
- Email addresses are stored normalized (lowercased, trimmed).
- Do not log sensitive data (emails, full names) in production logs. DB-stub logging is dev-only.
- GDPR: include a privacy policy page (`/privacy`) and a data-deletion request flow (placeholder for now).

### Internationalization

- All user-facing strings come from `messages/{locale}/`. No hard-coded English in components.
- Each page loads only the namespaces it needs (per existing convention).
- Translations exist in EN, PT, and DE for every key. If a translation is unknown, mirror the EN value and add a `TODO_TRANSLATE` comment beside it.

### Forms and validation

- Use HeroUI form components.
- Pair every form with a Zod schema. The same schema is used client-side (for instant validation) and server-side (in the action). Use `useActionState` from react for form submission.
- On submit, call the server action directly (no `fetch`).
- Display field-level errors returned by the action; display a top-level toast for unexpected failures.

### Testing expectations per feature

- **Unit tests** (Vitest) for: Zod schemas (valid + invalid cases), server-action happy paths (with DB stub), utility functions, role helpers, ranking math.
- **e2e tests** (Playwright) for the critical journey: register → login → join a league → submit a match score. Add tests incrementally as flows are built.
- New tests should pass before a section is marked `[DONE]`.

### Definition of done (per task)

A task is `[DONE]` when:

1. The implementation matches the spec in this file.
2. Types pass (`tsc --noEmit`) and lints are clean.
3. i18n keys exist for EN, PT, DE.
4. The page has appropriate metadata (and JSON-LD where applicable).
5. Server actions are guarded by `requireSession`/`requireRole` where relevant.
6. Unit (and e2e if applicable) tests are added and passing.
7. The user reviews the result and confirms, then the agent marks the task `[DONE]` in this file.

### Working pattern when adding a new feature

1. Re-read the relevant section in this file.
2. If anything is ambiguous, ask the user before coding.
3. Define types and Zod schemas first.
4. Build the server actions against DB stubs.
5. Build the page (server component) + form/component (client where needed).
6. Add metadata + JSON-LD where applicable.
7. Add i18n keys for EN, PT, DE.
8. Add tests.
9. Verify locally (`npm run build`, `npm run test`, Playwright if relevant).
10. Ask the user to confirm, then mark `[DONE]`.

# 1. Basic project structure, style and coding guidelines

Let's take care of the boilerplate code and rules for coding style, app style (tailwind themes) and basic repo rules

1. [DONE] Build the tailwind dark and light themes.

2. [DONE] The base colours are already set on `src/app/globals.css` for the dark theme (let's use that as the default).

3. [DONE] At the moment, prettier and eslint are set up, so we can consider it done. We might update them in the future.

4. [DONE] Internationalization

Use next-intl for internationalization.

1. [DONE] Add the needed provider on a per-page base. Instead of loading all messages at the top, we're going to load only the necessary translations for a specific page.

2. [DONE] We'll be working on the landing page on `src/app/page.tsx`, so let's add it there. Let's also add translation files for the following locales: EN, PT, DE. Let's add just a few placeholder translations for now for each of those for the home page.

3. [DONE] The default locale is EN

4. [DONE] We'll use locale-base routing (eg, `en/about`)

5. [DONE] Use `createNextIntlPlugin` on `next.config.js

6. [DONE] If there are other configs for Nextjs that I missed, go ahead and implement them. Ask me for any clarification if needed before applying.

7. [DONE] Add github CI/CD pipeline

Set up CI/CD pipeline. This project will probably be released on Vercel, so the deployment is done through there, but for now we can create a pipeline for github actions.

1. [DONE] Install vitest, playwright and other packages those might need/help out writing tests.

2. [DONE] Create a basic github action workflow that builds the app and runs unit tests

# 4. [DONE] Header Menu

Let's add a header component with links for different pages and a button for login/logout

1. [DONE] On the left side there should be the logo (for now it's just the text "Vorteil" in the groovello font). This should be a link to `/`

2. [DONE] On the right side, from right to left, should be: Login button, About link, Dark/Light theme switcher component.

# 5. [DONE] 404 Page

Create a custom 404 page. It should have a button to go back to the site, and a background image like the hero section. It should also maintain the base layout of the app with the header and footer.

1. [DONE] Use this image: `https://images.unsplash.com/photo-1658530190197-29f63baaa460`

2. [DONE] Add a centered box with text saying "That shot was out! 0-15". The box should have some transparency so the background image is not completely hidden.

3. [DONE] Add a primary button saying "Let's move on"

# 6. [DONE] Landing page

Let's create a nice, minimal and modern landing page. We have a few images already on the `src/app/[locale]/page.tsx` file, array named `heroImagePaths` we can use to create a nice UI. Let's use external URLs for the images for now, as saving those high-quality images in our repo wouldn't be practical.

1. [DONE] Use HeroUI for components (it's already installed)

2. [DONE] Let's start by creating a hero section with a nice image and a button to go to a page (TBD). The button for now can say "Start playing"

3. [DONE] Add 3 sections after the hero. Create a reusable component that has an image on the right/left and text on the opposite side. The component should receive as a prop the side of the image and render accordingly. The component should receive an `imageUrl` prop. If the image url is not passed, the section should have centered text. It should also allow children to be passed that will be rendered under the subtitle.

# 7. [DONE] Data model and server-action scaffolding

Set up the conventions every later feature will use. Nothing here ships a user-visible page; it's the foundation for all the work that follows.

1. Create `src/types/action.ts` with `type ActionResult<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string; fieldErrors?: Record<string, string> } }`.

2. Create `src/types/db/` with TypeScript interfaces for the entities we'll need. Stub data should match these shapes exactly.
   - `User`: id, email, name, gender, lkLevel (nullable), level, city, dominantHand (nullable), homeClub (nullable), roles (array of `Role`), createdAt, updatedAt
   - `League`: id, name, city, levelRange (nullable), regularSeasonRounds, hasPlayoffs, regularSeasonEnd, playoffsEnd, maxParticipants (nullable), description (nullable), status (`draft` / `open` / `in_season` / `playoffs` / `finished`), createdBy, createdAt
   - `LeagueMembership`: id, userId, leagueId, status (`pending` / `approved` / `rejected`), requestedAt, decidedAt (nullable)
   - `Match`: id, leagueId, playerAId, playerBId, status (`scheduled` / `played` / `disputed`), submittedById (nullable), createdAt
   - `MatchScore`: id, matchId, set1A, set1B, set2A, set2B, superTiebreakA (nullable), superTiebreakB (nullable), winnerId, submittedAt, disputeWindowEndsAt, disputedAt (nullable), disputeReason (nullable)
   - `Notification`: id, userId, type, payload (JSON), sentAt (nullable), readAt (nullable)

3. Create `src/server/db/` with stub modules per entity (`users.ts`, `leagues.ts`, `memberships.ts`, `matches.ts`, `scores.ts`, `notifications.ts`). Every function logs `[DB STUB] <op>` and returns realistic fixture data. Use an in-memory `Map` keyed by id so reads after writes within a single dev session are consistent.

4. Create `src/lib/validation/` with Zod schemas for each entity's create and update operations. Each schema lives in its own file (`users.ts`, `leagues.ts`, etc.) and is the single source of truth for both client and server validation.

5. Decide on a single error-code vocabulary for `ActionResult` failures (`VALIDATION`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL`) and document it in `src/types/action.ts`. The UI maps these to localized toasts.

# 8. Authentication [DONE]

Magic link + Google/Apple OAuth. Supabase Auth will provide this later; stub the server actions now so the UI is complete.

1. Route `/login`:
   - Server component.
   - Layout: magic-link form (email field + "Send me a link" button), divider, "Continue with Google" and "Continue with Apple" buttons.
   - Metadata: title, description, `noindex` (auth pages should not be in search results).

2. Server action `requestMagicLink(email)`:
   - Validate email with Zod (normalize: trim + lowercase).
   - Wrap with `withRateLimit('magic-link', email)` (the helper is a no-op for now but the call site needs to be in place).
   - Stub: log `[DB STUB] Would send magic link to <email>`.
   - Return `{ ok: true }` so the UI can render "Check your email."

3. Server action `signInWithOAuth(provider)`:
   - Accepts `'google' | 'apple'`.
   - Stub: log and redirect to `/auth/callback?provider=<provider>` (real implementation goes via Supabase OAuth URL later).

4. Route `/auth/callback`:
   - Server component that pretends to complete sign-in: logs `[DB STUB] Would create/lookup user`, sets a stub session cookie, then redirects.
   - If this is a brand-new account (no completed profile), redirect to `/register`. Otherwise redirect to `/leagues`.

5. Server action `signOut()`:
   - Clears the stub session cookie and redirects to `/`.

6. Session helpers in `src/server/auth/session.ts`:
   - `getSession()` reads the stub cookie and returns `{ userId, email, registrationComplete } | null`.
   - For local dev, allow a `VORTEIL_DEV_SESSION` env var that injects a fake session, so we can develop authenticated UIs without going through the flow.

7. Update the header (already DONE) so the login/logout state reads from `getOptionalSession()` server-side.

8. i18n keys (EN, PT, DE) for: page title, email label and placeholder, magic-link CTA, OAuth labels, success state ("Check your email"), error states.

9. Unit tests for the email Zod schema and `requestMagicLink` happy path.

10. e2e test stub: hitting `/login` renders the form.

# 9. Registration [DONE]

Route `/register` for collecting profile info after the first sign-in.

1. Route `/register`:
   - Server component with `requireSession()`.
   - If `session.registrationComplete`, redirect to `/leagues`.
   - Metadata: `noindex`.

2. Core form fields (explicitly required by spec):
   - **email** — read-only, pre-filled from session.
   - **name** — full real name.
   - **gender** — Female / Male / Non-binary / Prefer not to say.
   - **lkLevel** — optional number (German LK ranking; range hint 1.0–25.0, one decimal).
   - **level** — Beginner / Intermediate / Advanced / Pro; only required if `lkLevel` is blank.
   - **city** — free text, German cities only for now (no validated list yet — typo tolerance is acceptable while the playerbase is small).

3. Additional fields (confirmed):
   - **dominantHand** — Right / Left. Optional.
   - **homeClub** — free text. Optional.

   _No avatar uploads at this stage — storage costs add up quickly; use initials placeholders. No DOB, displayName, preferred times, or bio for the MVP either._

4. Zod schema in `src/lib/validation/users.ts` matching the final field set. Cross-field rule: at least one of `lkLevel` or `level` must be provided.

5. Server action `completeRegistration(input)`:
   - `requireSession()`.
   - Validate with Zod.
   - Stub: log `[DB STUB] Would create user`. Mark session `registrationComplete = true`.
   - On success, redirect to `/leagues`.
   - Fire welcome email (Section 19).

6. Privacy copy below the form: explain that the profile is visible to other logged-in players only.

7. i18n keys for all labels, placeholders, helper text, validation messages.

8. Unit tests for the Zod schema covering: each invalid case (missing required, invalid email, lkLevel out of range, neither lkLevel nor level provided), and a fully valid case.

# 10. Roles and route guards [DONE]

1. Define `Role` in `src/types/auth.ts`: `type Role = 'player' | 'admin'`. Users carry a `roles: Role[]` so they can hold multiple roles in the future without migration pain.

2. Implement `src/server/auth/guards.ts`:
   - `requireSession(): Session` — redirects to `/login` if absent.
   - `requireRole(role: Role): Session` — calls `requireSession`, then `notFound()` if the user lacks the role.
   - `getOptionalSession(): Session | null` — for non-gated pages.

3. The `(app)` route group's layout calls `requireSession()` so every authenticated route inherits the check.

4. Unit tests for the guards using a mocked session.

# 11. User edit profile [DONE]

Route `/users/profile`.

1. Server component with `requireSession()` (provided automatically via `(app)` layout).

2. Factor the registration form into `src/components/forms/UserProfileForm.tsx` so it is reused here.

3. Pre-fill with the current user's data. Allow changing every field except email (email change is a separate flow — out of scope, parked in the backlog).

4. Server action `updateProfile(input)` mirrors `completeRegistration` but updates instead of creates.

5. Success state: inline toast, stay on page. No redirect.

6. Add a "Delete my account" section at the bottom (GDPR). Stub action `requestAccountDeletion()` that logs and surfaces a "We've received your request" toast.

7. Metadata: title "Edit profile · Vorteil", `noindex`.

8. i18n keys reused from registration where possible.

# 12. User public profile [DONE]

Route `/users/[userId]`. "Public" here means visible to _logged-in users only_ — guests are redirected to `/login`. No SEO indexing.

1. Server component with `requireSession()`.

2. Fetch the user via `src/server/db/users.ts:getById(userId)`. If not found, `notFound()`.

3. Layout:
   - Header card (initials placeholder where an avatar would be): name, city, LK or level badge, dominant hand, home club.
   - Stats: total matches, wins, losses, win rate, current rank in their active league.
   - Recent matches: opponent (linked), score, league, date.
   - Head-to-head: only rendered when the viewer is a different user; shows the viewer's record against the profile owner.

4. Hide email. Roles are not displayed on the public profile.

5. Metadata: title `${user.name} · Vorteil`, `noindex`.

6. No JSON-LD (page is auth-walled, no SEO benefit).

7. Tests: guest redirected to `/login`; unknown `userId` 404s; head-to-head only renders when viewing another user.

# 13. SEO scaffolding [DONE]

Reusable SEO primitives. Apply per-page in later sections.

1. Create `src/lib/seo/metadata.ts` with `buildMetadata({ title, description, locale, path, image?, noindex? })` returning a `Metadata` object including OG and Twitter card defaults.

2. Defaults: site name "Vorteil", default OG image at `/og-default.jpg` (create a simple branded image; replace later).

3. Create `src/lib/seo/jsonld.ts` with typed builders for `Organization`, `SportsEvent`, `BreadcrumbList`. Render via `<script type="application/ld+json">` inside the relevant server components.

4. Create `src/app/robots.ts` (dynamic). Allow `/`, `/about`, `/login`, `/register`, `/privacy`, and the leagues namespace (`/leagues`, `/leagues/*`). Disallow `/users` and `/auth`.

5. Create `src/app/sitemap.ts` listing the public routes per locale (landing, about, privacy, leagues index, and each non-draft league detail page).

6. Set OG defaults and `metadataBase` in `src/app/layout.tsx`. Set `<html lang>` correctly per locale (already handled by next-intl — verify).

7. Add a Lighthouse / accessibility CI step to GitHub Actions (against a built preview) so SEO and a11y regressions surface in PRs.

# 14. Security scaffolding [DONE]

1. Configure security headers in `next.config.ts`:
   - `Content-Security-Policy` — strict; nonce-based for any inline scripts.
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy` — deny by default; opt in only as features need them.

2. Create `src/lib/security/rateLimit.ts` exporting `withRateLimit(key, identifier, fn)`. Today it logs intent and calls `fn`; later it'll hit a Redis or Supabase counter.

3. Wire `withRateLimit` into the magic-link action (Section 8) and any other entry point an attacker could spam.

4. Create `/privacy` page: a plain-text placeholder privacy policy (you'll replace it with real legal copy before launch).

5. Defer cookie consent banner until a non-essential cookie is introduced. Document the trigger in this section so we don't forget.

6. Add a stub `requestAccountDeletion()` action invoked from the profile edit page (Section 11).

7. Update GitHub Actions to run `tsc --noEmit` and `pnpm audit --prod` (or equivalent) on PRs.

# 15. Leagues index [DONE]

Route `/leagues`. **Public** — indexed for SEO so city-based queries (like "tennis league Berlin") can find us.

1. Server component using `getOptionalSession()` (no auth required to view; session only informs admin-only CTAs).

2. Fetch leagues via stub `getLeagues({ city?, status?, levelMin?, levelMax? })`.

3. UI:
   - Filter bar: city dropdown (options derived from the existing leagues stub), status (`open` / `in_season` / `playoffs` / `finished`), level/LK range slider.
   - Group results by city by default (so multi-city growth feels natural even at low volume).
   - League card: name, city, level range, regular-season end date, status pill, member count, "View" button.

4. Empty state: "No leagues yet in your city." Show an admin-only CTA "Create a league" linking to `/leagues/create`.

5. Metadata: strong title (e.g., "Amateur tennis leagues · Vorteil") and description built via `buildMetadata`. **Indexable.** Render `BreadcrumbList` JSON-LD (Home → Leagues) and an `ItemList` JSON-LD containing the visible leagues so structured search results can surface them.

6. i18n keys for filters, status labels, empty state, CTA, and the page title/description.

7. _Future improvement worth noting_: switch from `/leagues?city=berlin` to a path-based `/leagues/[city]` route. Path-based URLs typically rank better for city-targeted queries. Out of scope for now; left here so we don't forget.

# 16. League creation

Route `/leagues/create`. Admin-only.

1. Server component with `requireRole('admin')`.

2. Header conditionally renders a "Create league" link when the viewer is an admin.

3. Form fields:
   - **name** (required)
   - **city** (required)
   - **levelRange** — min and max LK (optional; leave empty for untargeted leagues)
   - **regularSeasonRounds** — default 8
   - **hasPlayoffs** — boolean, default true; if true, top 8 advance
   - **regularSeasonEnd** — date
   - **playoffsEnd** — date; must be after `regularSeasonEnd` and only required when `hasPlayoffs` is true
   - **maxParticipants** — optional integer; defaults to unlimited
   - **description** — markdown textarea, optional

4. Zod schema in `src/lib/validation/leagues.ts` enforcing date ordering, positive integers, and the conditional `playoffsEnd` rule.

5. Server action `createLeague(input)`:
   - `requireRole('admin')`.
   - Validate.
   - Stub: log `[DB STUB] Would create league` and return a new league id (use a UUID generator helper).
   - Redirect to `/leagues/<newId>` with status `draft`.

6. The league starts in `draft` status. A separate admin action (`openLeague(leagueId)`) flips it to `open` so players can request to join. Once approved members exist and the admin clicks "Start season," the action runs Section 17's round-robin generation and flips status to `in_season`.

7. Metadata: `noindex`.

8. i18n keys for every field, helper text, and validation message.

9. Unit tests for the Zod schema (date ordering, conditional `playoffsEnd`, required fields).

# 17. League page

Route `/leagues/[leagueId]` with a tabbed UI. **Public** — anyone can view; the actions (join, submit score, dispute) require auth.

1. Server component using `getOptionalSession()`. Fetch the league and, if logged in, the current user's membership.

2. Page header: league name, city, status pill, and a context-sensitive CTA based on the viewer:
   - Guest → "Sign in to join" (links to `/login?next=/leagues/[leagueId]`).
   - Logged-in non-member → "Request to join".
   - Pending member → "Request pending" (disabled).
   - Approved member → "You're in the league" (subtle, non-CTA pill).
   - Admin → also surface "Manage league".
     Honor the rule that a player can be in at most one active league at a time (server-side check on join).

3. Tabs — use HeroUI tabs, but persist the active tab in the URL (`?tab=…`) so deep links work and SSR stays clean:
   - **Leaderboard** — rank, player (linked), matches played, wins, losses, sets won–lost, games won–lost, total points (per the ranking rules in Section 18). Highlight the current user's row.
   - **Matches** — played matches, most recent first. Score, link to both players, date played. Filterable by player.
   - **Schedule** — two countdown cards: "Regular season ends in N days" and "Playoffs end in N days" (the latter only renders when `hasPlayoffs`). Below: the current user's upcoming (unplayed) matches with "Submit score" buttons.
   - **Players** — roster with avatars, links to profiles, and a "Propose match" button (placeholder action that simply records intent for now; real scheduling is in the backlog).
   - **Info** — rules, format (best of 3 sets with super tiebreak in lieu of a third set), key dates, the admin who created the league.

4. Server action `requestJoinLeague(leagueId)`:
   - `requireSession`.
   - Reject if the user has an active membership in another league.
   - Create a `LeagueMembership` with status `pending`.

5. Server action `decideMembership(membershipId, decision)`:
   - `requireRole('admin')`.
   - Updates status to `approved` or `rejected` and sets `decidedAt`.
   - Triggers a notification (Section 19) to the player.

6. Server action `startSeason(leagueId)`:
   - `requireRole('admin')`.
   - Verifies status is `open` and there are at least 2 approved members.
   - Calls `generateRoundRobin(leagueId)` to create `Match` rows for every unordered pair of approved members (idempotent — running it twice doesn't duplicate matches).
   - Sets league status to `in_season`.

7. Metadata: title `${league.name} · Vorteil`, description summarizing city, level range, status, and the key dates. **Indexable.** Render `SportsEvent` JSON-LD with `name`, `location` (city), `startDate` (best available — `createdAt` or season start), `endDate` (`playoffsEnd` ?? `regularSeasonEnd`), and approved members as `competitor` entries. Also render `BreadcrumbList` (Home → Leagues → This league).

8. i18n keys for every tab label, status pill, CTA, table header.

9. Tests: tab routing preserves state on reload, join request validation (single-league rule), idempotent round-robin generation, countdown math, guest CTA behavior.

# 18. Match lifecycle and ranking

Covers score submission, the dispute window, and points computation.

1. Server action `submitMatchScore(matchId, score)`:
   - `requireSession`.
   - Server-side check: the submitter must be `playerAId` or `playerBId`.
   - Validate score with Zod:
     - Best of 3 sets.
     - Set 1 and Set 2 are standard tennis sets (winner reaches 6 with a margin of 2, tiebreak to 7 at 6–6).
     - Set 3 is replaced by a super tiebreak to 10 (win by 2). It only exists when each player has won one set.
   - Compute the winner.
   - Mark the match `played`, set `submittedAt`, `disputeWindowEndsAt = submittedAt + 48h`.
   - Log `[DB STUB] Would store score`.
   - Trigger "score submitted" notification to the opponent (Section 19).

2. Server action `disputeMatch(matchId, reason)`:
   - `requireSession`.
   - Only callable by the non-submitting player while `now < disputeWindowEndsAt`.
   - Marks match `disputed`, stores `disputeReason`, sets `disputedAt`.
   - Triggers "dispute filed" notification to the league admin.

3. After 48h with no dispute, the match is effectively confirmed. No explicit confirmation action is required.

4. Ranking points (applied for `played` matches that are not currently `disputed`):
   - 3 points: 2–0 win
   - 2 points: 2–1 win (won via super tiebreak)
   - 1 point: 1–2 loss (lost the match but won a set)
   - 0 points: 0–2 loss

   _Open question — your original spec said "3 points for a win, 2 points for a 2-1 win, 1 point if player won a set but lost." I've interpreted that as the four-case table above (since a 2-1 result is a win). Confirm before this section is implemented._

5. Leaderboard tiebreaks, in order: total sets won, total games won, head-to-head record. Compute live from match rows for now; revisit caching strategy after Supabase.

6. UI:
   - "Submit score" modal accessible from each scheduled match in the league page (Schedule tab) and from the opponent's profile.
   - Score input: two number inputs per set, plus a super-tiebreak section that appears only when the first two sets are split. Client-side validation mirrors the Zod schema.
   - Opponent's "Dispute" button only renders while the 48h window is open.

7. Tests: Zod schema covering valid scores (2–0, 2–1 with super tiebreak) and invalid scores (impossible games, missing super tiebreak when split, super tiebreak with insufficient margin); points computation per case; dispute window logic with a mocked clock.

# 19. Notifications (email)

Email-only for the MVP. In-app notifications stay in the backlog.

1. Create `src/server/notifications/email.ts` exporting `sendEmail({ to, subject, body, locale })`. The stub logs and resolves; the real implementation (Supabase/Resend/etc.) plugs in later.

2. Templates (subject + plain-text body for now; HTML can wait) in `src/server/notifications/templates/`:
   - `magicLink` — sign-in link
   - `welcome` — sent after `completeRegistration`
   - `membershipDecision` — request approved or rejected
   - `scoreSubmitted` — to the opponent, with a deep link to dispute
   - `disputeFiled` — to the league admin
   - `seasonEndingSoon` — to all approved members N days before `regularSeasonEnd` (depends on a future cron; scaffold the template now)

3. Each template lives in its own file and exports `{ subject, body }` resolved from i18n keys for the recipient's locale.

4. Server actions invoke these helpers. Notification failures log but never break the surrounding action.

5. Tests: each template renders without error for EN, PT, DE and includes the required interpolation tokens.

# 20. Future / backlog

Captured to avoid reinventing them later. Not in scope for the MVP — leaving them here so we don't architect ourselves out of them.

- Direct messages between players
- Friend / favorites system
- Match scheduling assistant (suggest times based on overlapping `preferredTimes`)
- Tournaments (one-off events alongside leagues)
- Achievements and badges
- Calendar export (ICS) for upcoming matches
- Court / club directory and integrations
- PWA / mobile install
- Push notifications
- Multi-sport (padel, squash, table tennis)
- Public, indexable league pages with rich JSON-LD for SEO
- Match photo uploads
- Admin dashboard (membership approvals queue, dispute resolution UI, league lifecycle controls)
- Email change flow
- Real rate-limiting backend
- Audit log
- League-scoped roles (captain / organizer)
- Multi-league participation
- Custom league formats (Swiss, ladder, challenge)

# Decisions log

Notes on key choices baked into this plan, so future agents (and future you) don't relitigate them every session.

- **No avatar uploads at MVP**: storage costs add up fast. Profile pages use initials placeholders. Revisit when there's revenue or a hosting partner.
- **Trimmed profile fields**: only `email`, `name`, `gender`, `lkLevel`, `level`, `city`, `dominantHand`, `homeClub`. No DOB, displayName, preferred times, or bio.
- **Auth providers**: magic link + Google + Apple. No passwords (reduces breach risk and support burden), no Microsoft (not needed for the target audience).
- **Email-only notifications**: in-app and push live in the backlog.
- **One league per player at a time**: enforced server-side in `requestJoinLeague`. Multi-league participation parked in the backlog.
- **Leagues are public; player profiles are auth-gated**: leagues benefit from SEO (and there's no PII on the league page itself beyond names); player profile pages stay behind auth.
- **Round-robin generated up front**: players self-schedule. No weekly forced pairings — multiple matches per week are allowed.
- **48-hour dispute window with implicit confirmation**: simpler than two-sided confirmation, still gives a recourse path.
- **Ranking points**: 3 / 2 / 1 / 0 for 2–0 / 2–1 / 1–2 / 0–2 results. Tiebreaks: sets won → games won → head-to-head.
- **Germany-only POC**: i18n setup is forward-looking; the data model carries `city` only for now.
- **Landing hero CTA**: single "Start playing" CTA for now, linking to `/register` (logged out) or `/leagues` (logged in). Secondary CTAs deferred.
