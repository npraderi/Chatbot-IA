// services/authService.ts
"use client";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type UserRole = "Admin" | "User";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  fullName?: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      // 1. Autenticarse en Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2. Obtener el token ID del usuario autenticado
      const idToken = await getIdToken(userCredential.user);

      // 3. Crear una cookie de sesión a través de nuestra API
      const sessionResponse = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!sessionResponse.ok) {
        console.error(
          "Error al crear la sesión:",
          await sessionResponse.json()
        );
        // Continuar a pesar del error para al menos permitir la funcionalidad local
      }

      // 4. Obtener el documento del usuario de Firestore
      const userRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Si el usuario no existe en Firestore, lo creamos
        const newUser: Omit<User, "id"> = {
          name: "Admin Usuario",
          email: email,
          role: "Admin",
        };
        await setDoc(userRef, newUser);
        return {
          id: userCredential.user.uid,
          ...newUser,
        };
      }

      const userData = userDoc.data() as Omit<User, "id">;
      return {
        id: userCredential.user.uid,
        ...userData,
      };
    } catch (error) {
      console.error("Error en login:", error);
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      // 1. Cerrar sesión en Firebase Auth
      await signOut(auth);

      // 2. Eliminar la cookie de sesión
      await fetch("/api/auth/session", {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error en logout:", error);
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();

        if (!firebaseUser) {
          resolve(null);
          return;
        }

        try {
          // Renovar la cookie de sesión si el usuario está autenticado
          const idToken = await getIdToken(firebaseUser, true);

          // Actualizar la cookie de sesión
          const sessionResponse = await fetch("/api/auth/session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ idToken }),
          });

          if (!sessionResponse.ok) {
            console.warn(
              "Error al renovar la sesión:",
              await sessionResponse.json()
            );
            // Continuar a pesar del error
          }

          // Obtener datos del usuario de Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (!userDoc.exists()) {
            resolve(null);
            return;
          }

          const userData = userDoc.data() as Omit<User, "id">;
          resolve({
            id: firebaseUser.uid,
            ...userData,
          });
        } catch (error) {
          console.error("Error al obtener usuario actual:", error);
          resolve(null);
        }
      });
    });
  },

  isAdmin: (user: User | null): boolean => {
    return user?.role === "Admin";
  },

  isSuperAdmin: (user: User | null): boolean => {
    return user?.role === "Admin";
  },
};
