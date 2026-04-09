import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  getMe,
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  refreshSession,
} from '../services/authApi';
import { setUnauthorizedHandler } from '../services/apiClient';
import { clearAccessToken, getAccessToken, setAccessToken } from '../services/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // noop
    }
    clearAccessToken();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAccessToken();
      setUser(null);
    });
  }, []);

  const bootstrap = useCallback(async () => {
    const token = getAccessToken();
    try {
      if (!token) {
        const refreshed = await refreshSession();
        if (refreshed?.accessToken) {
          setAccessToken(refreshed.accessToken);
        }
      }

      const profile = await getMe();
      setUser(profile);
    } catch {
      clearAccessToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (payload) => {
    const data = await loginApi(payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await registerApi(payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      register,
      refreshProfile: async () => {
        const profile = await getMe();
        setUser(profile);
        return profile;
      },
    }),
    [user, isLoading, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
