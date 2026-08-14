// ============================================================================
// FEATURE AUTH — CONTEXTO DE AUTENTICACIÓN (REINICIO DE FLUJO AL CERRAR SESIÓN DEV)
// ============================================================================
// Mantiene todo lo construido intacto. Cuando el Desarrollador presiona "Cerrar Sesión",
// se reinician los permisos para que en el siguiente ingreso vuelva a enviar la notificación de acceso al Admin.

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, USE_MOCK_DATA } from '../../../services/api';

export interface AuthUser {
  id?: string;
  name?: string;
  email: string;
  rol: 'ADMIN' | 'MANAGER' | 'DEVELOPER' | string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | string;
  [key: string]: any;
}

export function normalizeRole(rawRole?: string): 'ADMIN' | 'MANAGER' | 'DEVELOPER' {
  if (!rawRole) return 'ADMIN';
  const str = String(rawRole).toUpperCase();
  if (str.includes('DEV') || str.includes('DESARROLLADOR')) return 'DEVELOPER';
  if (str.includes('MANAG') || str.includes('LÍDER') || str.includes('LIDER')) return 'MANAGER';
  return 'ADMIN';
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: { email: string; password?: string }) => Promise<AuthUser>;
  loginWithJira: () => Promise<AuthUser | void>;
  logout: () => Promise<void>;
  checkAuthSession: () => Promise<void>;
  approvedUsers: string[];
  approveUserPermission: (email: string, newRole?: string) => void;
  switchViewRole: (newRole: 'ADMIN' | 'MANAGER' | 'DEVELOPER') => void;
  isRealAdmin: boolean;
  resetDemoState: () => void;
}

const defaultContextValue: AuthContextType = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: async () => ({ email: '', rol: '' }),
  loginWithJira: async () => {},
  logout: async () => {},
  checkAuthSession: async () => {},
  approvedUsers: ['vhoyos@mchav.com'],
  approveUserPermission: () => {},
  switchViewRole: () => {},
  isRealAdmin: true,
  resetDemoState: () => {}
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);          // Estado con la información del usuario conectado
  const [loading, setLoading] = useState<boolean>(true);     // Indicador de verificación inicial de sesión
  const [error, setError] = useState<string | null>(null);         // Almacena errores de autenticación

  // Lista global de usuarios aprobados por el Administrador (persistencia en localStorage)
  const [approvedUsers, setApprovedUsers] = useState<string[]>(() => {
    const saved = localStorage.getItem('mock_approved_users');
    return saved ? JSON.parse(saved) : ['vhoyos@mchav.com'];
  });

  useEffect(() => {
    checkAuthSession();
  }, []);

  const checkAuthSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isLoginSuccess = urlParams.get('login') === 'success';
      const tokenParam = urlParams.get('token');

      if (tokenParam) {
        localStorage.setItem('mchav_jwt_token', tokenParam);
      }

      if (isLoginSuccess) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const existingToken = localStorage.getItem('mchav_jwt_token') || sessionStorage.getItem('mchav_app_session');
      const storedSession = localStorage.getItem('mock_user_session');

      if (!existingToken && !storedSession && !tokenParam) {
        setUser(null);
        setLoading(false);
        return;
      }

      let userData;
      try {
        if (storedSession) {
          userData = JSON.parse(storedSession);
        } else {
          userData = await authService.getCurrentUser();
        }
      } catch (firstErr) {
        localStorage.removeItem('mchav_jwt_token');
        localStorage.removeItem('mock_user_session');
        setUser(null);
        setLoading(false);
        return;
      }
      
      const currentApproved: string[] = JSON.parse(localStorage.getItem('mock_approved_users') || '["vhoyos@mchav.com"]');
      const rolesMap: Record<string, string> = JSON.parse(localStorage.getItem('mock_user_roles_map') || '{}');
      
      const normRole = normalizeRole(userData.rol);
      const isApproved = USE_MOCK_DATA 
        ? currentApproved.includes(userData.email) 
        : (userData.activo !== false);

      const assignedRole = USE_MOCK_DATA ? (rolesMap[userData.email] || normRole) : normRole;

      if (userData?.token || userData?.access_token) {
        localStorage.setItem('mchav_jwt_token', userData.token || userData.access_token);
      }

      setUser({
        ...userData,
        rol: assignedRole,
        original_rol: userData.rol,
        status: isApproved ? 'ACTIVE' : (assignedRole === 'ADMIN' ? 'ACTIVE' : 'PENDING')
      });
    } catch (err) {
      console.log("Sin sesión activa actualmente:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Función para que el Administrador apruebe o modifique permisos de un Desarrollador en tiempo real
  const approveUserPermission = (email: string, newRole: string = 'DEVELOPER') => {
    const currentApproved: string[] = JSON.parse(localStorage.getItem('mock_approved_users') || '["vhoyos@mchav.com"]');
    const updatedApproved = Array.from(new Set([...currentApproved, email]));
    setApprovedUsers(updatedApproved);
    localStorage.setItem('mock_approved_users', JSON.stringify(updatedApproved));

    // Mapear y guardar el rol específico asignado (DEVELOPER o MANAGER)
    const rolesMap: Record<string, string> = JSON.parse(localStorage.getItem('mock_user_roles_map') || '{}');
    rolesMap[email] = newRole;
    localStorage.setItem('mock_user_roles_map', JSON.stringify(rolesMap));

    // Si el usuario actualmente logueado es a quien le están aprobando el permiso, actualizarlo inmediatamente
    if (user && user.email === email) {
      setUser(prev => prev ? ({
        ...prev,
        rol: newRole,
        status: 'ACTIVE'
      }) : null);
    }
  };

  const login = async (credentials: { email: string; password?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await authService.loginMock(credentials);
      if (loggedUser?.token || loggedUser?.access_token) {
        localStorage.setItem('mchav_jwt_token', loggedUser.token || loggedUser.access_token);
      }
      
      // Comprobar si el usuario logueado está en la lista de aprobados por el Admin
      const currentApproved: string[] = JSON.parse(localStorage.getItem('mock_approved_users') || '["vhoyos@mchav.com"]');
      const rolesMap: Record<string, string> = JSON.parse(localStorage.getItem('mock_user_roles_map') || '{}');
      
      const isApproved = currentApproved.includes(loggedUser.email);
      const assignedRole = rolesMap[loggedUser.email] || loggedUser.rol;

      const userWithStatus: AuthUser = {
        ...loggedUser,
        rol: assignedRole,
        status: isApproved ? 'ACTIVE' : (loggedUser.rol === 'ADMIN' ? 'ACTIVE' : 'PENDING')
      };
      
      localStorage.setItem('mock_user_session', JSON.stringify(userWithStatus));
      setUser(userWithStatus);
      return userWithStatus;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Error al iniciar sesión. Inténtalo nuevamente.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loginWithJira = async () => {
    const jiraUrl = authService.getLoginUrl();
    window.location.href = jiraUrl;
  };

  // Cierre de sesión real: Si sale el Desarrollador, reinicia aprobaciones para permitir enviar la notificación de nuevo
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    } finally {
      // Limpiar sesión mock respetando aprobaciones por defecto
      if (user?.rol === 'DEVELOPER' || user?.email === 'cgomez@mchav.com') {
        localStorage.removeItem('mock_approved_users');
        localStorage.removeItem('mock_user_roles_map');
        setApprovedUsers(['vhoyos@mchav.com', 'cgomez@mchav.com', 'dev@mchav.com']);
      }

      sessionStorage.removeItem('mchav_app_session');
      sessionStorage.removeItem('mchav_authenticated_tab');
      localStorage.removeItem('mchav_jwt_token');
      localStorage.removeItem('mock_user_session');   // Eliminar datos de la sesión activa
      setUser(null);                                  // Limpiar estado de usuario en React
    }
  };

  // Función para reiniciar el estado de la demo manualmente
  const resetDemoState = () => {
    localStorage.removeItem('mock_approved_users');
    localStorage.removeItem('mock_user_roles_map');
    setApprovedUsers(['vhoyos@mchav.com', 'cgomez@mchav.com', 'dev@mchav.com']);
  };

  const isRealAdmin = !user || normalizeRole(user.original_rol || user.rol) === 'ADMIN' || user.email === 'vhoyos@mchav.com';

  const switchViewRole = (newRole: 'ADMIN' | 'MANAGER' | 'DEVELOPER') => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        rol: newRole,
        isSimulated: newRole !== 'ADMIN'
      };
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    loginWithJira,
    logout,
    checkAuthSession,
    approvedUsers,
    approveUserPermission,
    switchViewRole,
    isRealAdmin,
    resetDemoState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context || defaultContextValue;
}

export default AuthContext;
