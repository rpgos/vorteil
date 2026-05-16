/**
 * Discriminated union returned by every server action that mutates data.
 *
 * Error codes:
 *   VALIDATION      — input failed Zod schema validation; fieldErrors will be populated
 *   UNAUTHENTICATED — no session present
 *   FORBIDDEN       — session exists but lacks required role/ownership
 *   NOT_FOUND       — referenced entity does not exist
 *   CONFLICT        — action violates a business rule (e.g. already a member)
 *   RATE_LIMITED    — too many requests from this identifier
 *   INTERNAL        — unexpected server error
 */
export type ErrorCode =
  | 'VALIDATION'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL';

export type ActionError = {
  code: ErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
};

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: ActionError };
