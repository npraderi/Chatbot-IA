import * as admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

// Función para inicializar Firebase Admin
export async function initAdmin() {
  const apps = getApps();

  if (apps.length === 0) {
    // Si no hay aplicaciones inicializadas, inicializar Admin SDK
    try {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

      if (!serviceAccountKey) {
        throw new Error(
          "FIREBASE_SERVICE_ACCOUNT_KEY no está configurado en las variables de entorno"
        );
      }

      const serviceAccount = JSON.parse(serviceAccountKey);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });

      console.log("Firebase Admin SDK inicializado correctamente");
    } catch (error) {
      console.error("Error al inicializar Firebase Admin SDK:", error);
      throw new Error(
        error instanceof Error
          ? `Error al inicializar Firebase Admin SDK: ${error.message}`
          : "Error al inicializar Firebase Admin SDK"
      );
    }
  }

  return admin;
}

// Verifica un token de sesión de cookie
export async function verifySessionCookie(sessionCookie: string) {
  try {
    const apps = getApps();
    if (apps.length === 0) {
      await initAdmin();
    }

    // Verificar la cookie de sesión con checkRevoked a true
    const decodedClaims = await admin.auth().verifySessionCookie(
      sessionCookie,
      true // checkRevoked
    );

    return decodedClaims;
  } catch (error) {
    console.error("Error al verificar cookie de sesión:", error);
    return null;
  }
}

// Genera una cookie de sesión a partir de un ID token
export async function createSessionCookie(idToken: string, expiresIn: number) {
  try {
    const apps = getApps();
    if (apps.length === 0) {
      await initAdmin();
    }

    const sessionCookie = await admin.auth().createSessionCookie(idToken, {
      expiresIn,
    });

    return sessionCookie;
  } catch (error) {
    console.error("Error al crear cookie de sesión:", error);
    throw new Error(
      error instanceof Error
        ? `Error al crear cookie de sesión: ${error.message}`
        : "Error al crear cookie de sesión"
    );
  }
}
