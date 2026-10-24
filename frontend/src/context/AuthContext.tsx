"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthTokens } from "@/types";
import {
  api,
  clearTokens,
  getAccessToken,
  getStoredUser,
  parseJwt,
  setStoredUser,
  setTokens,
} from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: { username: string; email?: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = () => {
    const token = getAccessToken();
    const storedUser = getStoredUser();

    if (token) {
      const decoded = parseJwt(token);
      if (decoded && (!decoded.exp || decoded.exp * 1000 > Date.now())) {
        if (storedUser) {
          setUser(storedUser);
        } else if (decoded.user_id) {
          const userObj = {
            id: decoded.user_id,
            username: decoded.username || "User",
          };
          setUser(userObj);
          setStoredUser(userObj);
        }
      } else {
        clearTokens();
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    initAuth();

    const handleAuthChange = () => initAuth();
    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      const tokens: AuthTokens = await api.login(credentials);
      setTokens(tokens);

      const decoded = parseJwt(tokens.access);
      const userObj: User = {
        id: decoded?.user_id || 1,
        username: credentials.username,
      };

      setUser(userObj);
      setStoredUser(userObj);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { username: string; email?: string; password: string }) => {
    setIsLoading(true);
    try {
      await api.register(userData);
      // Auto login after successful registration
      await login({ username: userData.username, password: userData.password });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
