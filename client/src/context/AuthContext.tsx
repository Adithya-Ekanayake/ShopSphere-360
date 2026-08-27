import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import authService from "../services/authService";
import type { User, LoginInput, Role } from "../types/auth";

/* ── Context shape ──────────────────────────────────────────── */
interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
  canWrite: () => boolean; // Admin or Manager
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ── Provider ───────────────────────────────────────────────── */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(authService.getStoredUser());
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [isLoading, setIsLoading] = useState(false);

  // Verify the stored session on mount
  useEffect(() => {
    const storedToken = authService.getToken();
    if (!storedToken) return;

    setIsLoading(true);
    authService
      .getMe()
      .then((profile) => {
        setUser(profile);
        setToken(storedToken);
      })
      .catch(() => {
        // Token invalid or expired — clear everything
        authService.clearSession();
        setUser(null);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (credentials: LoginInput) => {
    setIsLoading(true);
    try {
      const { token: t, user: u } = await authService.login(credentials);
      setToken(t);
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const hasRole = useCallback(
    (...roles: Role[]) => !!user && roles.includes(user.Role),
    [user]
  );

  const canWrite = useCallback(
    () => hasRole("Admin", "Manager"),
    [hasRole]
  );

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, hasRole, canWrite }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ── Hook ───────────────────────────────────────────────────── */
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};

export default AuthContext;
