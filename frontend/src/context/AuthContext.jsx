import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // ✅ CRITICAL FIX: Start user as NULL always.
  // Previously it read from localStorage immediately, so isLoggedIn=true
  // before initializing finished — causing instant redirect away from landing page.
  // Now user stays null until the token is verified by the server.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // On mount — verify token is still valid
  useEffect(() => {
    const token = localStorage.getItem('videstore_token');
    if (!token) {
      // No token — definitely not logged in
      setInitializing(false);
      return;
    }
    // Token exists — verify with server
    authAPI.getMe()
      .then(res => {
        setUser(res.user);
        localStorage.setItem('videstore_user', JSON.stringify(res.user));
      })
      .catch(() => {
        // Token expired or invalid — clear everything
        localStorage.removeItem('videstore_token');
        localStorage.removeItem('videstore_user');
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem('videstore_token', res.token);
      localStorage.setItem('videstore_user', JSON.stringify(res.user));
      setUser(res.user);
      toast.success(`Welcome back, ${res.user.name?.split(' ')[0]}!`);
      return { success: true, user: res.user };
    } catch (err) {
      const msg = err.message || 'Login failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.register(data);
      localStorage.setItem('videstore_token', res.token);
      localStorage.setItem('videstore_user', JSON.stringify(res.user));
      setUser(res.user);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (err) {
      const msg = err.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('videstore_token');
    localStorage.removeItem('videstore_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('videstore_user', JSON.stringify(updatedUser));
  };

  // ✅ loginWithToken — used after Google OAuth redirect
  const loginWithToken = async (token) => {
    try {
      localStorage.setItem('videstore_token', token);
      const res = await authAPI.getMe();
      localStorage.setItem('videstore_user', JSON.stringify(res.user));
      setUser(res.user);
      toast.success(`Welcome, ${res.user.name?.split(' ')[0]}! 🎉`);
      return { success: true, user: res.user };
    } catch (err) {
      localStorage.removeItem('videstore_token');
      localStorage.removeItem('videstore_user');
      setUser(null);
      toast.error('Google login failed. Please try again.');
      return { success: false };
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      initializing,
      login,
      register,
      logout,
      updateUser,
      isAdmin,
      isSeller: user?.role === 'seller' || user?.role === 'seller_owner' || user?.role === 'seller_staff',
      isLoggedIn: !!user,
      loginWithToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};