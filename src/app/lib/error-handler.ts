import { toast } from "sonner";

// Tipos de errores comunes
export interface AppError extends Error {
  code?: string;
  status?: number;
  details?: string;
}

// Función para manejar errores genéricos
export function handleError(
  error: unknown,
  fallbackMessage = "Ha ocurrido un error inesperado"
): void {
  console.error(error);

  if (error instanceof Error) {
    const appError = error as AppError;
    const message = appError.message || fallbackMessage;

    // Mostrar errores específicos para diferentes casos
    if (appError.code?.includes("auth/")) {
      handleAuthError(appError);
    } else if (appError.status === 403) {
      toast.error(`Acceso denegado: ${message}`);
    } else if (appError.status === 404) {
      toast.error(`No encontrado: ${message}`);
    } else if (appError.status && appError.status >= 500) {
      toast.error(`Error del servidor: ${message}`);
    } else {
      toast.error(message);
    }
  } else if (typeof error === "string") {
    toast.error(error);
  } else {
    toast.error(fallbackMessage);
  }
}

// Manejar errores específicos de autenticación
function handleAuthError(error: AppError): void {
  const code = error.code || "";

  if (
    code.includes("auth/wrong-password") ||
    code.includes("auth/user-not-found")
  ) {
    toast.error("Credenciales incorrectas");
  } else if (code.includes("auth/email-already-in-use")) {
    toast.error("El email ya está registrado");
  } else if (code.includes("auth/weak-password")) {
    toast.error("La contraseña es demasiado débil");
  } else if (code.includes("auth/invalid-email")) {
    toast.error("El formato del email no es válido");
  } else if (code.includes("auth/network-request-failed")) {
    toast.error("Error de conexión. Verifica tu internet");
  } else if (code.includes("auth/too-many-requests")) {
    toast.error("Demasiados intentos. Inténtalo más tarde");
  } else {
    toast.error(`Error de autenticación: ${error.message}`);
  }
}

// Función para manejar errores en bloques try/catch
export function tryCatch<T>(
  promise: Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  return promise
    .then((data) => data)
    .catch((error) => {
      handleError(error, errorMessage);
      return null;
    });
}
