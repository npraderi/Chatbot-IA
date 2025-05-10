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
  FirestoreError,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { handleError, AppError } from "@/lib/error-handler";

export class UserServiceError extends Error implements AppError {
  code?: string;
  status?: number;
  details?: string;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = "UserServiceError";
    this.code = code;
    this.status = status;
  }
}

// Interfaz para la creación de usuarios
export interface CreateUserData {
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
      const firestoreError = error as FirestoreError;
      const serviceError = new UserServiceError(
        "Error al obtener usuarios",
        firestoreError.code,
        500
      );
      handleError(serviceError);
      throw serviceError;
    }
  },

  // Crear usuario
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Utilizar el endpoint de la API para crear usuarios desde el servidor
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
      if (error instanceof UserServiceError) {
        handleError(error);
        throw error;
      }

      // Si es un error que no viene de nuestra API
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error desconocido al crear usuario";
      const code = (error as { code?: string }).code;

      const serviceError = new UserServiceError(errorMessage, code, 500);
      handleError(serviceError);
      throw serviceError;
    }
  },

  // Actualizar usuario
  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new UserServiceError("Usuario no encontrado", "not_found", 404);
      }

      await updateDoc(userRef, userData);
    } catch (error) {
      const firestoreError = error as FirestoreError;
      const serviceError = new UserServiceError(
        "Error al actualizar el usuario",
        firestoreError.code,
        500
      );
      handleError(serviceError);
      throw serviceError;
    }
  },

  // Eliminar usuario y sus datos asociados
  async deleteUser(userId: string): Promise<void> {
    try {
      // 1. Verificar que el usuario existe
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new UserServiceError("Usuario no encontrado", "not_found", 404);
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
    } catch (error) {
      const firestoreError = error as FirestoreError;
      const serviceError = new UserServiceError(
        "Error al eliminar el usuario",
        firestoreError.code,
        500
      );
      handleError(serviceError);
      throw serviceError;
    }
  },

  // Eliminar completamente un usuario (usando la API)
  async deleteUserCompletely(userId: string): Promise<void> {
    try {
      // 1. Obtener el usuario que vamos a eliminar
      const user = await this.getUserById(userId);
      if (!user) {
        throw new UserServiceError("Usuario no encontrado", "not_found", 404);
      }

      // 2. Llamar a la API para eliminar el usuario de Firebase Auth
      try {
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
          throw new UserServiceError(
            errorData.error ||
              `Error al eliminar usuario de Auth: ${response.statusText}`,
            errorData.code,
            response.status
          );
        }
      } catch (authError) {
        if (authError instanceof UserServiceError) {
          handleError(authError);
          throw authError;
        }

        const errorMessage =
          authError instanceof Error ? authError.message : "Error desconocido";
        const serviceError = new UserServiceError(
          errorMessage,
          "auth_delete_error",
          500
        );
        handleError(serviceError);
        throw serviceError;
      }

      // 3. Si la eliminación de Auth fue exitosa, eliminar los datos del usuario en Firestore
      await this.deleteUser(userId);
    } catch (error) {
      if (error instanceof UserServiceError) {
        handleError(error);
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      const serviceError = new UserServiceError(
        errorMessage,
        "delete_user_error",
        500
      );
      handleError(serviceError);
      throw serviceError;
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
      const firestoreError = error as FirestoreError;
      const serviceError = new UserServiceError(
        "Error al obtener el usuario",
        firestoreError.code,
        500
      );
      handleError(serviceError);
      throw serviceError;
    }
  },
};
