// services/authService.ts
"use client";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
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
      await signOut(auth);
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
