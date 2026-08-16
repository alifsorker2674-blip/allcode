"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch } from "./api";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  walletBalance: number;
}

interface AuthContextValue {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string; phone?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "royal-clans-admin-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
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

  async function login(email: string, password: string) {
    const res = await apiFetch<{ data: { user: AdminUser; accessToken: string } }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    if (res.data.user.role !== "admin") {
      throw new Error("This account does not have admin access.");
    }

    setUser(res.data.user);
    setToken(res.data.accessToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: res.data.user, token: res.data.accessToken }));
  }

  async function logout() {
    try {
      await apiFetch("/auth/logout", { method: "POST", token });
    } catch {
      // best-effort
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  async function updateProfile(updates: { name?: string; phone?: string }) {
    const res = await apiFetch<{ data: { user: AdminUser } }>("/auth/me", {
      method: "PATCH",
      token,
      body: updates,
    });
    setUser(res.data.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: res.data.user, token }));
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
