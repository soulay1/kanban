import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  username: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
  updateUser: (token: string, username: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null, username: null,
  login: () => {}, logout: () => {}, updateUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'));

  const login = (t: string, u: string) => {
    localStorage.setItem('token', t);
    localStorage.setItem('username', u);
    setToken(t);
    setUsername(u);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
  };

  const updateUser = (t: string, u: string) => {
    localStorage.setItem('token', t);
    localStorage.setItem('username', u);
    setToken(t);
    setUsername(u);
  };

  return (
    <AuthContext.Provider value={{ token, username, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
