import * as admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

// Función para inicializar Firebase Admin
export async function initAdmin() {
  const apps = getApps();

  if (apps.length === 0) {
    // Si no hay aplicaciones inicializadas, inicializar Admin SDK
    try {
      let serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

      if (!serviceAccountKey) {
        throw new Error(
          "FIREBASE_SERVICE_ACCOUNT_KEY no está configurado en las variables de entorno"
        );
      }

      // Limpiar el valor de comillas envolventes extras si existen
      // Esto soluciona el problema cuando la variable viene como '{"type": ...}' o "{"type": ...}"
      serviceAccountKey = serviceAccountKey.trim();
      if (
        (serviceAccountKey.startsWith("'") &&
          serviceAccountKey.endsWith("'")) ||
        (serviceAccountKey.startsWith('"') && serviceAccountKey.endsWith('"'))
      ) {
        serviceAccountKey = serviceAccountKey.substring(
          1,
          serviceAccountKey.length - 1
        );
      }

      // Intentar parsear directamente, si falla, intentar decodificar base64
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(serviceAccountKey);

        // Corregir el formato de la clave privada si es necesario
        if (
          serviceAccount.private_key &&
          typeof serviceAccount.private_key === "string"
        ) {
          // Reemplazar los saltos de línea escapados por saltos de línea reales
          serviceAccount.private_key = serviceAccount.private_key
            .replace(/\\n/g, "\n")
            .replace(/\\\\/g, "\\");
        }
      } catch (parseError: unknown) {
        try {
          // Intentar decodificar desde base64 en caso de error
          const decodedKey = Buffer.from(
            serviceAccountKey,
            "base64"
          ).toString();

          // La cadena decodificada también podría tener comillas extras
          let cleanedDecodedKey = decodedKey.trim();
          if (
            (cleanedDecodedKey.startsWith("'") &&
              cleanedDecodedKey.endsWith("'")) ||
            (cleanedDecodedKey.startsWith('"') &&
              cleanedDecodedKey.endsWith('"'))
          ) {
            cleanedDecodedKey = cleanedDecodedKey.substring(
              1,
              cleanedDecodedKey.length - 1
            );
          }

          serviceAccount = JSON.parse(cleanedDecodedKey);

          // Corregir el formato de la clave privada si es necesario
          if (
            serviceAccount.private_key &&
            typeof serviceAccount.private_key === "string"
          ) {
            serviceAccount.private_key = serviceAccount.private_key
              .replace(/\\n/g, "\n")
              .replace(/\\\\/g, "\\");
          }
        } catch (decodeError) {
          console.error("Error al parsear JSON:", parseError);
          console.error("Error al decodificar base64:", decodeError);
          console.error(
            "Valor de serviceAccountKey (recortado):",
            serviceAccountKey.length > 20
              ? `${serviceAccountKey.substring(0, 20)}...`
              : serviceAccountKey
          );
          const errorMessage =
            parseError instanceof Error
              ? parseError.message
              : "Error desconocido";
          throw new Error(
            `Error al parsear FIREBASE_SERVICE_ACCOUNT_KEY: ${errorMessage}`
          );
        }
      }

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
