import { PASSWORD_MIN_LENGTH } from "@/config/site";
import { dataSource } from "@/lib/data-source";
import { findUserByEmail, toPublicUser } from "@/lib/referrals";
import type { PublicUser, Result } from "@/types";
import { generateSalt, hashPassword, verifyPassword } from "./password";
import { applyRegistration, validateReferralCode } from "./registration";

export { PASSWORD_MIN_LENGTH };
export { validateReferralCode } from "./registration";

export type LoginInput = { email: string; password: string };
export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  referralCode: string;
  phone?: string;
};

/**
 * Auth service contract. The mock implementation below talks to the local
 * data source; replace `authService` with an Auth.js / JWT / Supabase / Clerk
 * adapter that implements the same interface and the UI keeps working.
 */
export interface AuthService {
  login(input: LoginInput): Promise<Result<PublicUser>>;
  register(input: RegisterInput): Promise<Result<PublicUser>>;
  logout(): Promise<void>;
  getCurrentUser(): PublicUser | null;
}

const mockAuthService: AuthService = {
  async login({ email, password }) {
    const ds = dataSource();
    const user = findUserByEmail(ds.getDb().users, email);
    // Same message for unknown email / wrong password — avoids account enumeration.
    const invalid = { ok: false, error: "Invalid email or password." } as const;
    if (!user) return invalid;
    if (!(await verifyPassword(password, user.passwordSalt, user.passwordHash))) return invalid;
    if (user.status !== "active") return { ok: false, error: "This account has been suspended." };
    ds.setSessionUserId(user.id);
    return { ok: true, data: toPublicUser(user) };
  },

  async register(input) {
    const ds = dataSource();
    const salt = generateSalt();
    const passwordHash = await hashPassword(input.password, salt);
    const result = applyRegistration(ds.getDb(), {
      name: input.name,
      email: input.email,
      phone: input.phone,
      referralCode: input.referralCode,
      passwordHash,
      passwordSalt: salt,
    });
    if (!result.ok) return result;
    ds.setDb(result.data.db);
    ds.setSessionUserId(result.data.user.id);
    return { ok: true, data: toPublicUser(result.data.user) };
  },

  async logout() {
    dataSource().setSessionUserId(null);
  },

  getCurrentUser() {
    const ds = dataSource();
    const id = ds.getSessionUserId();
    const user = id ? ds.getDb().users.find((u) => u.id === id) : undefined;
    return user ? toPublicUser(user) : null;
  },
};

export let authService: AuthService = mockAuthService;

/** Swap the auth backend (e.g. in tests or when real auth lands). */
export function setAuthService(service: AuthService): void {
  authService = service;
}

export const login = (input: LoginInput) => authService.login(input);
export const register = (input: RegisterInput) => authService.register(input);
export const logout = () => authService.logout();
export const getCurrentUser = () => authService.getCurrentUser();

/** Convenience for forms: checks a code without creating anything. */
export function checkReferralCode(code: string): Result<{ sponsorName: string }> {
  const result = validateReferralCode(dataSource().getDb(), code);
  return result.ok ? { ok: true, data: { sponsorName: result.data.name } } : result;
}
