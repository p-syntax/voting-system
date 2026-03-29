/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function safeDecode(token) {
  try {
    if (!token) return null;
    const raw = token.startsWith("Bearer ") ? token.slice(7) : token;
    const parts = raw.split(".");
    if (parts.length < 2) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      if (typeof window === "undefined") return null;
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("voterToken");
      return safeDecode(token);
    } catch {
      return null;
    }
  });

  const loading = false; // keep simple for now

  const login = (key, token) => {
    try {
      if (!key || !token) return null;
      localStorage.setItem(key, token);
      const p = safeDecode(token);
      setUser(p);
      return p;
    } catch {
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("voterToken");
    setUser(null); 
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);