// Auth store using nanostores for Astro
// This allows auth state to be shared between React islands
import { atom, computed } from "nanostores";
import { authApi, API_BASE_URL } from "../lib/api";

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: "admin" | "vendedor" | "cliente";
  cliente_id?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Validate if a string is a valid JWT format (3 parts separated by dots)
 */
function isValidJwtFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3;
}

// Initialize auth from localStorage if available
function getInitialAuth(): { user: User | null; token: string | null } {
  if (typeof window === "undefined") {
    return { user: null, token: null };
  }
  try {
    const storedUser = localStorage.getItem("muebleria-user");
    const storedToken = localStorage.getItem("muebleria-token");
    
    // Validate JWT format - clean up old fake tokens
    if (storedToken && !isValidJwtFormat(storedToken)) {
      console.warn("Invalid JWT format detected, cleaning auth data");
      localStorage.removeItem("muebleria-user");
      localStorage.removeItem("muebleria-token");
      return { user: null, token: null };
    }
    
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      token: storedToken || null,
    };
  } catch {
    return { user: null, token: null };
  }
}

// Auth atoms
export const $user = atom<User | null>(null);
export const $token = atom<string | null>(null);
export const $isLoading = atom(false);

// Initialize on client
if (typeof window !== "undefined") {
  const initial = getInitialAuth();
  $user.set(initial.user);
  $token.set(initial.token);

  // Persist to localStorage on changes
  $user.subscribe((user) => {
    if (user) {
      localStorage.setItem("muebleria-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("muebleria-user");
    }
  });

  $token.subscribe((token) => {
    if (token) {
      localStorage.setItem("muebleria-token", token);
    } else {
      localStorage.removeItem("muebleria-token");
    }
  });
  
  // Verify token on page load (if token exists and has valid format)
  if (initial.token && isValidJwtFormat(initial.token)) {
    verifyToken().catch(() => {
      // Token invalid or expired, clear auth
      logout();
    });
  }
}

// Computed values
export const $isAuthenticated = computed(
  [$user, $token],
  (user, token) => user !== null && token !== null
);

export const $isAdmin = computed(
  $user,
  (user) => user?.rol === "admin"
);

export const $isVendedor = computed(
  $user,
  (user) => user?.rol === "vendedor" || user?.rol === "admin"
);

// Auth actions using centralized API client
export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  $isLoading.set(true);
  
  try {
    const data = await authApi.login({ email, password });

    // Set user and token (API returns 'user' with cliente_id)
    $user.set({
      id: data.user.id,
      email: data.user.email,
      nombre: data.user.nombre,
      apellido: data.user.apellido,
      rol: data.user.rol as "admin" | "vendedor" | "cliente",
      cliente_id: data.user.cliente_id,
    });
    $token.set(data.token);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return { success: false, error: message };
  } finally {
    $isLoading.set(false);
  }
}

export async function register(userData: {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
}): Promise<{ success: boolean; error?: string }> {
  $isLoading.set(true);

  try {
    const data = await authApi.register(userData);

    // Auto login after registration
    $user.set({
      id: data.user.id,
      email: data.user.email,
      nombre: data.user.nombre,
      apellido: data.user.apellido,
      rol: data.user.rol as "admin" | "vendedor" | "cliente",
      cliente_id: data.user.cliente_id,
    });
    $token.set(data.token);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return { success: false, error: message };
  } finally {
    $isLoading.set(false);
  }
}

export function logout() {
  $user.set(null);
  $token.set(null);
  
  // Redirect to home
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

/**
 * Verify current token with backend /auth/me endpoint
 * Updates user data if valid, logs out if invalid
 */
export async function verifyToken(): Promise<boolean> {
  const token = $token.get();
  if (!token) return false;
  
  try {
    const userData = await authApi.me();
    
    // Update user data with fresh data from server
    $user.set({
      id: userData.id,
      email: userData.email,
      nombre: userData.nombre,
      apellido: userData.apellido,
      rol: userData.rol as "admin" | "vendedor" | "cliente",
      cliente_id: userData.cliente_id ?? undefined,
    });
    
    return true;
  } catch (error) {
    // Token invalid or expired
    console.error("Token verification failed:", error);
    return false;
  }
}

// Get auth header for API requests
export function getAuthHeader(): { Authorization: string } | {} {
  const token = $token.get();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Check if token is expired (basic check)
export function checkAuth(): boolean {
  const token = $token.get();
  if (!token) return false;

  try {
    // Decode JWT payload (without verifying signature)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    
    if (Date.now() >= exp) {
      // Token expired, logout
      logout();
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}
