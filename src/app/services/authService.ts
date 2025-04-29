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
    const user = MOCK_USERS.find((u) => u.email === email);
    await new Promise((r) => setTimeout(r, 500));
    if (!user || password.length < 4) return null;

    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  },

  logout: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("currentUser");
  },

  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null;

    let userJson = localStorage.getItem("currentUser");

    // Si no hay nada, semilla el usuario por defecto
    if (!userJson) {
      const defaultUser = MOCK_USERS[0];
      localStorage.setItem("currentUser", JSON.stringify(defaultUser));
      userJson = JSON.stringify(defaultUser);
    }

    try {
      return JSON.parse(userJson) as User;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  },

  isAdmin: (user: User | null): boolean => {
    return user?.role === "Superadministrador";
  },

  isSuperAdmin: (user: User | null): boolean => {
    return user?.role === "Superadministrador";
  },
};
