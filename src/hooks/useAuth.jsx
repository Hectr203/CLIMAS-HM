import { useState, useEffect, createContext, useContext } from "react";
import useTokenExpiration from "./useTokenExpiration";
import { useNavigate } from "react-router-dom";
import EnvConfig from "../utils/config";
import authService from "../services/authService";

// Contexto de autenticación
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const expiresAt = localStorage.getItem("tokenExpiresAt");
      const now = Date.now();
      // Puede venir como 'userRole', 'role' o 'rol'
      const userRole = localStorage.getItem("userRole") || localStorage.getItem("role") || localStorage.getItem("rol");
      const userEmail = localStorage.getItem("userEmail");
      if (token && (!expiresAt || now < Number(expiresAt))) {
        const userData = {
          token,
          rol: userRole,
          email: userEmail || "usuario@ejemplo.com",
        };
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Si el token no existe o expiró, limpiar localStorage
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiresAt");
        localStorage.removeItem("userRole");
        localStorage.removeItem("role");
        localStorage.removeItem("rol");
        localStorage.removeItem("userEmail");
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    loadUserFromStorage();
  }, []);

  // Integrar el hook de expiración de token
  useTokenExpiration(user?.token, (newToken) => {
    setUser((prev) => ({ ...prev, token: newToken }));
    localStorage.setItem("authToken", newToken);
    try {
      const decoded = require('jwt-decode')(newToken);
      localStorage.setItem("tokenExpiresAt", decoded.exp * 1000);
    } catch {}
  });

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result.success) {
  localStorage.setItem("authToken", result.token);
        localStorage.setItem("userRole", result.user.rol);
        localStorage.setItem("userEmail", result.user.email);
        setUser({ ...result.user, token: result.token });
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true, user: { ...result.user, token: result.token } };
      } else {
        setIsLoading(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Error al iniciar sesión" };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {}
    finally {
  localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login");
    }
  };

  const hasRole = (role) => user?.rol === role;
  const hasAnyRole = (roles) => isAuthenticated && roles.includes(user?.rol);

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(userData);
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Error al registrar usuario" };
    }
  };

  const forgotPassword = async (email) => {
    setIsLoading(true);
    try {
      const result = await authService.requestPasswordReset(email);
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Error al solicitar recuperación de contraseña" };
    }
  };

  const resetPassword = async (token, newPassword) => {
    setIsLoading(true);
    try {
      const result = await authService.resetPassword(token, newPassword);
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Error al restablecer contraseña" };
    }
  };

  const updateProfile = async (profileData) => {
    setIsLoading(true);
    try {
      const result = await authService.updateProfile(profileData);
      if (result.success) {
        setUser((prevUser) => ({ ...prevUser, ...result.user }));
      }
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Error al actualizar perfil" };
    }
  };

  const refreshToken = async () => {
    try {
      const result = await authService.refreshToken();
      if (result.success) {
  localStorage.setItem("authToken", result.token);
        setUser((prevUser) => ({ ...prevUser, token: result.token }));
        return { success: true };
      } else {
        logout();
        return { success: false };
      }
    } catch (error) {
      logout();
      return { success: false };
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    updateProfile,
    refreshToken,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const useRequireAuth = (redirectTo = "/login") => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);
  return { isAuthenticated, isLoading };
};

export const useRequireRole = (requiredRole, redirectTo = "/") => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/login");
      } else if (user?.rol !== requiredRole) {
        navigate(redirectTo);
      }
    }
  }, [user, isAuthenticated, isLoading, navigate, requiredRole, redirectTo]);
  return {
    hasAccess: isAuthenticated && user?.rol === requiredRole,
    isLoading,
  };
};

export default useAuth;
