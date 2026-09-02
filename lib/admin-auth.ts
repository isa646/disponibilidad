import { isAdministradorEmail } from "./administradores";

export const ADMIN_COOKIE = "admin_session";

export function isAdminAuthenticated(cookieValue: string | undefined): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !cookieValue) return false;
  return cookieValue === password;
}

export function canAccessAdmin(
  cookieValue: string | undefined,
  email: string | undefined
): boolean {
  return isAdminAuthenticated(cookieValue) || isAdministradorEmail(email);
}
