import api from "./api";
import type { AuthResponse, LoginInput, User } from "../types/auth";

const TOKEN_KEY = "shopsphere_token";
const USER_KEY = "shopsphere_user";

/* ── Token helpers ─────────────────────────────────────────── */
export const getToken = (): string | null =>
  sessionStorage.getItem(TOKEN_KEY);

export const getStoredUser = (): User | null => {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

const saveSession = (token: string, user: User) => {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

/* ── API calls ─────────────────────────────────────────────── */
const login = async (credentials: LoginInput): Promise<AuthResponse> => {
  const res = await api.post<{ status: string; data: AuthResponse }>(
    "/auth/login",
    credentials
  );
  const { token, user } = res.data.data;
  saveSession(token, user);
  return { token, user };
};

const getMe = async (): Promise<User> => {
  const res = await api.get<{ status: string; data: User }>("/auth/me");
  return res.data.data;
};

const logout = () => {
  clearSession();
};

const authService = { login, getMe, logout, getToken, getStoredUser, clearSession };
export default authService;
