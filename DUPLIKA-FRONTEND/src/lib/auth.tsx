import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  type AccountUser,
  type Credentials,
  type RegisterPayload,
} from "./api";

/**
 * Session client. L'autorité reste le backend (Sanctum) :
 * ce contexte ne fait que refléter la réponse de GET /me.
 */

interface AuthContextValue {
  user: AccountUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<AccountUser>;
  register: (payload: RegisterPayload) => Promise<AccountUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    staleTime: 60_000,
    retry: false,
  });

  const login = useCallback(
    async (credentials: Credentials) => {
      const user = await apiLogin(credentials);
      queryClient.setQueryData(["me"], user);
      return user;
    },
    [queryClient],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const user = await apiRegister(payload);
      queryClient.setQueryData(["me"], user);
      return user;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await apiLogout();
    queryClient.setQueryData(["me"], null);
    await queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    await queryClient.invalidateQueries({ queryKey: ["addresses"] });
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: data ?? null,
      isLoading,
      isAuthenticated: Boolean(data),
      login,
      register,
      logout,
    }),
    [data, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}
