import { toast } from "sonner";

interface ErrorOptions {
  showToast?: boolean;
  logToConsole?: boolean;
}

// Función para capturar errores en servicios
export function catchServiceError<T>(
  promise: Promise<T>,
  customMessage?: string,
  options: ErrorOptions = { showToast: true, logToConsole: true }
): Promise<T | null> {
  return promise.catch((error) => {
    // Registrar el error en la consola si se especifica
    if (options.logToConsole) {
      console.error("[Service Error]:", error);
    }

    // Mostrar notificación toast si se especifica
    if (options.showToast) {
      const message =
        customMessage ||
        (error instanceof Error
          ? error.message
          : "Ha ocurrido un error en la operación");
      toast.error(message);
    }

    // Retornar null para indicar que la operación falló
    return null;
  });
}

// Función para desactivar los errores de desarrollo de React
export function disableReactDevErrors(): void {
  if (typeof window !== "undefined") {
    // Sobrescribir console.error para filtrar mensajes de desarrollo
    const originalError = console.error;
    console.error = function (...args) {
      if (
        // Filtrar errores de React/Next que son solo informativos
        typeof args[0] === "string" &&
        (args[0].includes("Warning:") ||
          args[0].includes("React DevTools") ||
          args[0].includes("React does not recognize") ||
          args[0].includes("Invalid prop") ||
          args[0].includes("Each child in a list") ||
          args[0].includes("Unhandled Runtime Error") ||
          args[0].includes("useLayoutEffect does nothing on the server"))
      ) {
        return;
      }
      originalError.apply(console, args);
    };
  }
}

// Silenciar errores en la fase de hidratación de React
export function suppressHydrationWarnings(): void {
  if (typeof window !== "undefined") {
    const originalConsoleError = console.error;
    console.error = function (...args) {
      if (
        args.length > 0 &&
        typeof args[0] === "string" &&
        (args[0].includes("Warning: Text content did not match") ||
          args[0].includes("Warning: Expected server HTML to contain") ||
          args[0].includes("Hydration failed"))
      ) {
        // Ignorar errores de hidratación
        return;
      }
      originalConsoleError.apply(console, args);
    };
  }
}
