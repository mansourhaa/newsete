'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';


const AuthContext = createContext();

// Keys for localStorage
const TOKEN_KEY = 'newsapp_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser]   = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
      const decoded = jwtDecode(stored);
      setUser({ id: decoded.id });
    }
  }, []);

  // Save token + user
  const login = (jwt) => {
    localStorage.setItem(TOKEN_KEY, jwt);
    setToken(jwt);
    const decoded = jwtDecode(jwt);
    setUser({ id: decoded.id });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  return useContext(AuthContext);
}
