/**
 * Auth helpers: resolve human subject from Supabase JWT / user payload.
 */

import {
  humanSubjectFromClaims,
  type HumanSubject,
  type Subject,
} from "./permission-manager";
import { isHumanRole, type HumanRole } from "./roles";

export type AuthUser = {
  id: string;
  email?: string;
  role: HumanRole | null;
  appMetadata?: Record<string, unknown>;
};

export function roleFromUser(user: {
  id?: string;
  email?: string | null;
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
}): HumanRole | null {
  const fromApp = user.app_metadata?.role;
  if (isHumanRole(fromApp)) return fromApp;
  // Do not trust user_metadata for authorization
  return null;
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

export type { Subject, HumanSubject };
