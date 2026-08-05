import { createContext, useContext, useState } from "react";
import { login as loginApi } from "../api/auth";
import { clearToken, getToken, setToken } from "../api/client";

const USERNAME_KEY = "zpadel_admin_username";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_KEY));
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getToken()));

  async function login(user, password) {
    const result = await loginApi(user, password);
    setToken(result.token);
    localStorage.setItem(USERNAME_KEY, result.username);
    setUsername(result.username);
    setIsAuthenticated(true);
  }

  function logout() {
    clearToken();
    localStorage.removeItem(USERNAME_KEY);
    setUsername(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ username, isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
