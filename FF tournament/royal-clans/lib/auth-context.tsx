"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch } from "./api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  walletBalance: number;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: { name?: string; phone?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "royal-clans-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        // ignore corrupt storage
      }
    }
    setLoading(false);
  }, []);

  function persist(nextUser: AuthUser, nextToken: string) {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }));
  }

  function clear() {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  async function login(email: string, password: string) {
    const res = await apiFetch<{ data: { user: AuthUser; accessToken: string } }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    persist(res.data.user, res.data.accessToken);
  }

  async function register(name: string, email: string, password: string, phone?: string) {
    const res = await apiFetch<{ data: { user: AuthUser; accessToken: string } }>("/auth/register", {
      method: "POST",
      body: { name, email, password, phone: phone || undefined },
    });
    persist(res.data.user, res.data.accessToken);
  }

  async function logout() {
    try {
      await apiFetch("/auth/logout", { method: "POST", token });
    } catch {
      // best-effort — clear local state regardless
    }
    clear();
  }

  async function refreshUser() {
    if (!token) return;
    try {
      const res = await apiFetch<{ data: { user: AuthUser } }>("/auth/me", { token });
      setUser(res.data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: res.data.user, token }));
    } catch {
      clear();
    }
  }

  async function updateProfile(updates: { name?: string; phone?: string }) {
    const res = await apiFetch<{ data: { user: AuthUser } }>("/auth/me", {
      method: "PATCH",
      token,
      body: updates,
    });
    setUser(res.data.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: res.data.user, token }));
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, refreshUser, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
