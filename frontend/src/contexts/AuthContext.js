import { createContext, useContext, useState, useEffect } from 'react';
import * as storage from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.initStorage();
    const session = storage.getSession();
    if (session) {
      const users = storage.getUsers();
      const currentUser = users.find(u => u.id === session.id);
      if (currentUser) {
        const { password, ...safe } = currentUser;
        setUser(safe);
      } else {
        setUser(session);
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const found = storage.authenticate(username, password);
    if (found) {
      const { password: pw, ...safe } = found;
      storage.setSession(safe);
      setUser(safe);
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    storage.clearSession();
    setUser(null);
  };

  const refreshUser = () => {
    const session = storage.getSession();
    if (session) {
      const users = storage.getUsers();
      const currentUser = users.find(u => u.id === session.id);
      if (currentUser) {
        const { password, ...safe } = currentUser;
        storage.setSession(safe);
        setUser(safe);
      }
    }
  };

  const isAdmin = user?.role === 'Admin' || user?.isAdminAccess === true;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
