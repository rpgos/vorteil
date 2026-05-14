<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Behavioral guidelines for all agents.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

# Coding Conventions

- Prefer TypeScript (`.tsx`/`.ts`) for new components and utilities.
- Co-locate component-specific styles in the same folder as the component when practical.
- Use single quotes
- Use semicolons.
- Use functional patterns where possible.
- Use HeroUI components.
- Use kebab-case for .tsx files and camelCase for .ts files.

---

# Testing strategy

- Any time you add a new component, server action, function, service, etc (anything), write unit tests for it. The goal is to have as high coverage as possible.
- Go for strong behavioral tests.

# Testing Strategy

## Core Principles

- Every new component, hook, utility, server action, route handler, or service must include tests.
- Tests must prioritize behavioral correctness over implementation details.
- Prefer fewer high-signal tests over many shallow tests.
- Tests should increase confidence to refactor safely.
- Tests must be deterministic and isolated.
- Co-locate tests next to the code they validate.
- Test observable behavior only.
- Avoid implementation-detail assertions.
- Keep tests minimal and focused.
- Prefer one behavior per test.
- Cover happy paths and realistic failure cases.
- Do not generate redundant tests.
- Do not generate snapshot tests unless explicitly justified.
- Use accessible queries.
- Co-locate tests with implementation.
- Reuse shared setup utilities when appropriate.
- If code is difficult to test, improve the code structure instead of writing brittle tests.

## Reliability

- run in isolation
- avoid shared state
- avoid ordering dependencies
- avoid arbitrary timeouts
- avoid sleeping/waiting unnecessarily

## React Testing Library Rules

Prefer queries in this order:

1. getByRole
2. getByLabelText
3. getByText
4. getByTestId (last resort)

## Mocking strategy

- Common framework-level mocks should live in the Vitest setup file.
- Mock only what the test requires.
- Avoid excessive mocking.
- Prefer testing real behavior whenever possible.
- Avoid mocking:
  - simple utility functions
  - React state
  - internal implementation details
- Mock boundaries instead:
  - network requests
  - Supabase
  - external APIs
  - auth providers
  - timers when necessary

---

# Test Stack

- Unit/integration: Vitest + React Testing Library
- End-to-end: Playwright

---

# File Organization

Co-locate tests with implementation files.

Examples:

```txt
/components/Button.tsx
/components/Button.test.tsx

/lib/date.ts
/lib/date.test.ts

/app/actions/create-user.ts
/app/actions/create-user.test.ts
```

# Useful Commands Recap

| Command                  | Purpose                                |
| ------------------------ | -------------------------------------- |
| `npm run dev`            | Start the Next.js dev server with HMR. |
| `npm run lint`           | Run ESLint checks.                     |
| `npm run test`           | Execute the test suite (if present).   |
| `npm run build`          | Production build                       |
| `npx vitest <file_path>` | Run specific test file                 |

# Icons

Always use Lucide icons. Don't use emojis where an icon should be.

```
import { Camera } from 'lucide-react';
// Usage
const App = () => {
  return <Camera />;
};
export default App;
```

# Internationalization

Always use the informal version of any language on the messages.
For portuguese, **alawys use european portuguese**.
