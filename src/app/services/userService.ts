import { User, UserRole } from "./authService";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

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
      const auth = getAuth();

      // 1. Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // 2. Actualizar el perfil del usuario con el nombre
      await updateProfile(userCredential.user, {
        displayName: userData.name,
      });

      // 3. Crear documento en Firestore
      const userRef = doc(db, "users", userCredential.user.uid);
      const newUser: User = {
        id: userCredential.user.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };

      await setDoc(userRef, newUser);

      return newUser;
    } catch (error) {
      console.error("Error al crear usuario:", error);
      const firebaseError = error as { code?: string };

      if (firebaseError.code === "auth/email-already-in-use") {
        throw new UserServiceError("El email ya está en uso");
      }
      if (firebaseError.code === "auth/invalid-email") {
        throw new UserServiceError("El email no es válido");
      }
      if (firebaseError.code === "auth/weak-password") {
        throw new UserServiceError("La contraseña es demasiado débil");
      }
      throw new UserServiceError("Error al crear el usuario");
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

  // Eliminar usuario
  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new UserServiceError("Usuario no encontrado");
      }

      await deleteDoc(userRef);
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      throw new UserServiceError("Error al eliminar el usuario");
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
