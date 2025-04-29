// services/authService.ts
"use client";

export type UserRole = "Superadministrador" | "Usuario";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  fullName?: string;
}

// Usuarios de prueba
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Admin Usuario",
    email: "admin@example.com",
    role: "Superadministrador",
    password: "admin123",
  },
  {
    id: "3",
    name: "Usuario Estándar",
    email: "user@example.com",
    role: "Usuario",
    password: "user123",
  },
];

export const authService = {
  login: async (email: string, password: string): Promise<User | null> => {
    if (typeof window === "undefined") return null;
    // simulamos retardo
    await new Promise((r) => setTimeout(r, 500));

    const user = MOCK_USERS.find((u) => u.email === email);
    // comprobamos existencia y que la contraseña case
    if (!user || user.password !== password) {
      return null;
    }

    // guardamos en localStorage
    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  },

  logout: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("currentUser");
  },

  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const userJson = localStorage.getItem("currentUser");
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch {
      console.error("Error parsing user data");
      return null;
    }
  },

  isAdmin: (user: User | null): boolean => {
    return user?.role === "Superadministrador";
  },

  // Alias para mantener compatibilidad con importaciones previas
  isSuperAdmin: (user: User | null): boolean => {
    return user?.role === "Superadministrador";
  },
};
