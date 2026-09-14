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
  if (!rawRole) return 'DEVELOPER';
  const str = String(rawRole).toUpperCase();
  if (str.includes('ADMIN')) return 'ADMIN';
  if (str.includes('MANAG') || str.includes('LÍDER') || str.includes('LIDER') || str.includes('PLANIF')) return 'MANAGER';
  if (str.includes('DEV') || str.includes('DESARROLLADOR')) return 'DEVELOPER';
  return 'DEVELOPER';
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
  approvedUsers: ['salamancamai12@gmail.com'],
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
    return saved ? JSON.parse(saved) : ['salamancamai12@gmail.com'];
  });

  useEffect(() => {
    checkAuthSession();

    const handleDeactivated = () => {
      setUser(prev => prev ? ({
        ...prev,
        activo: false,
        status: 'PENDING',
        rol: 'PENDING'
      }) : null);
    };
    window.addEventListener('mchav-account-deactivated', handleDeactivated);
    return () => window.removeEventListener('mchav-account-deactivated', handleDeactivated);
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
        if (existingToken || tokenParam) {
          userData = await authService.getCurrentUser();
        } else if (USE_MOCK_DATA && storedSession) {
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
      
      const userEmail = (userData.email || '').toLowerCase().trim();
      const isTestEnv = import.meta.env.MODE === 'test';
      const isMasterAdmin = userEmail === 'salamancamai12@gmail.com';
      
      let isApproved = false;
      if (isMasterAdmin || isTestEnv) {
        isApproved = true;
      } else if (USE_MOCK_DATA) {
        isApproved = currentApproved.includes(userData.email);
      } else {
        isApproved = Boolean(
          userData.activo === true && 
          userData.id_rol && 
          userData.rol && 
          userData.rol !== 'Sin Rol' &&
          userData.rol !== 'PENDING'
        );
      }

      const rawNorm = normalizeRole(userData.rol);
      let assignedRole: 'ADMIN' | 'MANAGER' | 'DEVELOPER' = 'DEVELOPER';
      if (isTestEnv) {
        assignedRole = rawNorm;
      } else if (isMasterAdmin) {
        assignedRole = 'ADMIN';
      } else if (USE_MOCK_DATA) {
        const mockNorm = normalizeRole(rolesMap[userData.email] || userData.rol);
        assignedRole = mockNorm;
      } else {
        assignedRole = rawNorm;
      }

      if (userData?.token || userData?.access_token) {
        localStorage.setItem('mchav_jwt_token', userData.token || userData.access_token);
      }

      setUser({
        ...userData,
        email: userEmail || userData.email,
        rol: isApproved ? assignedRole : 'PENDING',
        original_rol: userData.rol,
        activo: isApproved,
        status: isApproved ? 'ACTIVE' : 'PENDING'
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
        const normalized = normalizeRole(newRole);
        setUser(prev => prev ? ({
          ...prev,
          rol: normalized,
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
      const userEmail = (loggedUser.email || '').toLowerCase().trim();
      const isTestEnv = import.meta.env.MODE === 'test';
      const isMasterAdmin = userEmail === 'salamancamai12@gmail.com';
      const currentApproved: string[] = JSON.parse(localStorage.getItem('mock_approved_users') || '["vhoyos@mchav.com"]');
      const rolesMap: Record<string, string> = JSON.parse(localStorage.getItem('mock_user_roles_map') || '{}');
      
      const isApproved = isMasterAdmin || isTestEnv || (
        USE_MOCK_DATA 
          ? currentApproved.includes(loggedUser.email) 
          : Boolean(loggedUser.activo === true && loggedUser.id_rol && loggedUser.rol && loggedUser.rol !== 'Sin Rol' && loggedUser.rol !== 'PENDING')
      );
      const candidateRole = normalizeRole(rolesMap[loggedUser.email] || loggedUser.rol);
      const assignedRole = candidateRole;

      const userWithStatus: AuthUser = {
        ...loggedUser,
        email: userEmail || loggedUser.email,
        rol: isApproved ? assignedRole : 'PENDING',
        original_rol: loggedUser.rol,
        activo: isApproved,
        status: isApproved ? 'ACTIVE' : 'PENDING'
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
      localStorage.removeItem('mchav_active_tab');    // Prevenir que la pestaña se arrastre a otro usuario
      localStorage.removeItem('mchav_jwt_token');
      localStorage.removeItem('mock_user_session');   // Eliminar datos de la sesión activa
      setUser(null);                                  // Limpiar estado de usuario en React
    }
  };

  // Función para reiniciar el estado de la demo manualmente
  const resetDemoState = () => {
    localStorage.removeItem('mock_approved_users');
    localStorage.removeItem('mock_user_roles_map');
    setApprovedUsers(['salamancamai12@gmail.com']);
  };

  const isRealAdmin = (user?.email || '').toLowerCase().trim() === 'salamancamai12@gmail.com';

  const switchViewRole = (newRole: 'ADMIN' | 'MANAGER' | 'DEVELOPER') => {
    try {
      localStorage.setItem('mchav_active_role', newRole);
    } catch (e) {}
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
