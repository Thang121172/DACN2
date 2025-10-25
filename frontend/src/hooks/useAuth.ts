import { useState, useEffect, useCallback } from "react";
import api from "../services/http";

export type User = {
  id?: number | string;
  username: string;
  name?: string;
  role?: string;
};

function readUserCache(): User | null {
  try {
    const raw = localStorage.getItem("me");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(readUserCache());
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMe = useCallback(async () => {
    try {
      const r = await api.get("/accounts/me/");
      setUser(r.data);
      localStorage.setItem("me", JSON.stringify(r.data));
    } catch {
      setUser(null);
      localStorage.removeItem("me");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (payload: any) => {
    const res = await api.post("/accounts/login/", payload);
    const data = res.data || {};
    const token = data.access || data.token || data.jwt || null;
    if (token) localStorage.setItem("token", token);
    await fetchMe();
    return data;
  };

  const setToken = async (token: string) => {
    localStorage.setItem("token", token);
    await fetchMe();
  };

  const logout = async () => {
    try { await api.post("/accounts/logout/"); } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("me");
    setUser(null);
  };

  return {
    user,
    loading,
    fetchMe,
    login,
    logout,
    setToken,
    isAuthenticated: !!user,
  };
}
