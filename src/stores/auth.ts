// Auth store using nanostores for Astro
// This allows auth state to be shared between React islands
import { atom, computed } from "nanostores";

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: "admin" | "vendedor" | "cliente";
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Initialize auth from localStorage if available
function getInitialAuth(): { user: User | null; token: string | null } {
  if (typeof window === "undefined") {
    return { user: null, token: null };
  }
  try {
    const storedUser = localStorage.getItem("muebleria-user");
    const storedToken = localStorage.getItem("muebleria-token");
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

// API base URL
const API_URL = "http://localhost:5000/api";

// Auth actions
export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  $isLoading.set(true);
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al iniciar sesion");
    }

    // Set user and token
    $user.set(data.user);
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
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al registrar usuario");
    }

    // Auto login after registration
    $user.set(data.user);
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
