/**
 * Auth helpers: resolve human subject from Supabase user payload.
 * Only app_metadata.role is trusted (never user_metadata).
 */

import {
  humanSubjectFromClaims,
  type HumanSubject,
} from "./permission-manager";
import { isHumanRole, type HumanRole } from "./roles";

export function roleFromUser(user: {
  app_metadata?: Record<string, unknown> | null;
}): HumanRole | null {
  const fromApp = user.app_metadata?.role;
  return isHumanRole(fromApp) ? fromApp : null;
}

export function subjectFromUser(user: {
  id: string;
  email?: string | null;
  app_metadata?: Record<string, unknown> | null;
}): HumanSubject | null {
  return humanSubjectFromClaims({
    id: user.id,
    email: user.email || undefined,
    role: roleFromUser(user),
  });
}
