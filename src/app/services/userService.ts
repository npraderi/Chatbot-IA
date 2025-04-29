import { User, UserRole } from "./authService";

// Función para generar un ID único
const generateId = () => Math.random().toString(36).substr(2, 9);

// Función para generar una contraseña aleatoria
const generatePassword = () => {
  const length = 8;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Servicio de gestión de usuarios
export const userService = {
  // Obtener usuarios
  getUsers: (): User[] => {
    const usersJson = localStorage.getItem("users");
    if (!usersJson) {
      // Si no hay usuarios en localStorage, inicializamos con datos de ejemplo
      const initialUsers: User[] = [
        {
          id: "1",
          name: "Admin Usuario",
          email: "admin@example.com",
          role: "Superadministrador",
        },
        {
          id: "3",
          name: "Usuario Estándar",
          email: "user@example.com",
          role: "Usuario",
        },
      ];
      localStorage.setItem("users", JSON.stringify(initialUsers));
      return initialUsers;
    }

    return JSON.parse(usersJson);
  },

  // Crear usuario
  createUser: (userData: Omit<User, "id">): User => {
    const users = userService.getUsers();

    // Verificar si el email ya existe y no está vacío
    if (userData.email) {
      const existingUser = users.find((user) => user.email === userData.email);
      if (existingUser) {
        throw new Error("El email ya está registrado");
      }
    }

    const newUser: User = {
      ...userData,
      id: generateId(),
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    return newUser;
  },

  // Actualizar usuario
  updateUser: (id: string, userData: Partial<Omit<User, "id">>): User => {
    const users = userService.getUsers();

    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new Error("Usuario no encontrado");
    }

    // Si se intenta actualizar el email, verificar que no exista ya
    if (userData.email) {
      const emailExists = users.some(
        (user) => user.id !== id && user.email === userData.email
      );

      if (emailExists) {
        throw new Error("El email ya está registrado");
      }
    }

    // Actualizar usuario
    const updatedUser: User = {
      ...users[userIndex],
      ...userData,
    };

    users[userIndex] = updatedUser;
    localStorage.setItem("users", JSON.stringify(users));

    return updatedUser;
  },

  // Eliminar usuario
  deleteUser: (id: string): void => {
    const users = userService.getUsers();

    const filteredUsers = users.filter((user) => user.id !== id);
    if (filteredUsers.length === users.length) {
      throw new Error("Usuario no encontrado");
    }

    localStorage.setItem("users", JSON.stringify(filteredUsers));
  },

  // Obtener un usuario por id
  getUserById: (id: string): User | null => {
    const users = userService.getUsers();
    return users.find((user) => user.id === id) || null;
  },
};
