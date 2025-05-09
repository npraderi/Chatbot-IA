import { User, UserRole } from "./authService";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

class UserServiceError extends Error implements ApiError {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = "UserServiceError";
    this.code = code;
    this.status = status;
  }
}

// Interfaz para la creación de usuarios
interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Servicio de gestión de usuarios
export const userService = {
  // Obtener usuarios
  async getUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw new UserServiceError("Error al obtener usuarios");
    }
  },

  // Crear usuario
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Utilizar el endpoint de la API para crear usuarios desde el servidor
      // esto evita problemas de sesión automática en el navegador
      const response = await fetch("/api/admin/createUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new UserServiceError(
          errorData.error || "Error al crear el usuario",
          errorData.code,
          response.status
        );
      }

      const result = await response.json();
      return result.user;
    } catch (error) {
      console.error("Error al crear usuario:", error);

      if (error instanceof UserServiceError) {
        throw error;
      }

      const firebaseError = error as { code?: string; message?: string };

      if (firebaseError.code === "auth/email-already-in-use") {
        throw new UserServiceError("El email ya está en uso");
      }
      if (firebaseError.code === "auth/invalid-email") {
        throw new UserServiceError("El email no es válido");
      }
      if (firebaseError.code === "auth/weak-password") {
        throw new UserServiceError("La contraseña es demasiado débil");
      }

      throw new UserServiceError(
        firebaseError.message || "Error al crear el usuario"
      );
    }
  },

  // Actualizar usuario
  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new UserServiceError("Usuario no encontrado");
      }

      await updateDoc(userRef, userData);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      throw new UserServiceError("Error al actualizar el usuario");
    }
  },

  // Eliminar usuario y sus datos asociados
  async deleteUser(userId: string): Promise<void> {
    try {
      // 1. Verificar que el usuario existe
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new UserServiceError("Usuario no encontrado");
      }

      // 2. Eliminar las conversaciones asociadas al usuario
      const conversationsRef = collection(db, "conversations");
      const q = query(conversationsRef, where("userId", "==", userId));
      const conversationsSnapshot = await getDocs(q);

      // Eliminar cada conversación encontrada
      const deleteConversationsPromises = conversationsSnapshot.docs.map(
        (doc) => deleteDoc(doc.ref)
      );
      await Promise.all(deleteConversationsPromises);

      // 3. Eliminar el documento de usuario en Firestore
      await deleteDoc(userRef);

      // 4. No podemos eliminar directamente el usuario de Auth desde el cliente
      // Esta operación debe ser manejada con cuidado, generalmente a través de
      // las Firebase Admin SDK o en el cliente después de autenticar al usuario
      console.log(
        "Usuario eliminado de Firestore. La eliminación de Auth debe ser manejada por el cliente."
      );
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      throw new UserServiceError("Error al eliminar el usuario");
    }
  },

  // Eliminar completamente un usuario (usando Cloud Functions)
  // Esta función requiere una función de Cloud Functions que elimine el usuario de Firebase Auth
  async deleteUserCompletely(userId: string): Promise<void> {
    try {
      // 1. Obtener el usuario que vamos a eliminar
      const user = await this.getUserById(userId);
      if (!user) {
        throw new UserServiceError("Usuario no encontrado");
      }

      // 2. Llamar a la función de Cloud Functions para eliminar el usuario de Firebase Auth
      // Aquí se debería implementar una llamada a una función de Cloud Functions
      // que elimine el usuario de Firebase Auth usando la Admin SDK
      try {
        // Como alternativa a Cloud Functions, se podría implementar un endpoint en
        // un servidor propio que utilice la Admin SDK para eliminar el usuario
        const apiUrl = `/api/admin/deleteUser?uid=${userId}`;
        const response = await fetch(apiUrl, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Importante: incluir cookies de sesión
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Error al eliminar usuario de Auth: ${response.statusText}`
          );
        }
      } catch (authError) {
        console.error("Error al eliminar usuario de Auth:", authError);
        throw authError; // Re-lanzar el error para detener el proceso
      }

      // 3. Si la eliminación de Auth fue exitosa, eliminar los datos del usuario en Firestore
      await this.deleteUser(userId);
    } catch (error) {
      console.error("Error al eliminar usuario completamente:", error);
      throw new UserServiceError(
        error instanceof Error
          ? error.message
          : "Error al eliminar el usuario completamente"
      );
    }
  },

  // Obtener un usuario por id
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      return {
        id: userDoc.id,
        ...userDoc.data(),
      } as User;
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      throw new UserServiceError("Error al obtener el usuario");
    }
  },
};
