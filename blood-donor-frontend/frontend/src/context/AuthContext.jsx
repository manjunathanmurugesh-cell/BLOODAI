import { createContext, useCallback, useContext, useMemo, useState } from "react";

// Same localStorage keys the original pages used ("token" + "currentUser"),
// so anyone already logged in stays logged in.
const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser"));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, isLoggedIn: Boolean(user && token), login, logout }),
    [user, token, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
