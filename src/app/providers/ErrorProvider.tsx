"use client";

import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { toast, Toaster } from "sonner";

interface ErrorContextType {
  captureError: (error: unknown, fallbackMessage?: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useErrorHandler = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useErrorHandler debe usarse dentro de un ErrorProvider");
  }
  return context;
};

interface AppError extends Error {
  code?: string;
  status?: number;
  details?: string;
}

// Función para manejar errores
function handleError(
  error: unknown,
  fallbackMessage = "Ha ocurrido un error inesperado"
): void {
  console.error("[Error Controlado]:", error);

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

// Componente que sirve como límite de error (ErrorBoundary)
class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    handleError(error);
    console.error("[Error de componente]:", error, info);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || <></>;
    }
    return this.props.children;
  }
}

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  // Cuando se inicializa el proveedor, interceptamos errores globales
  useEffect(() => {
    // Interceptar errores no manejados de promesas
    const unhandledRejectionHandler = (event: PromiseRejectionEvent): void => {
      event.preventDefault(); // Previene que NextJS muestre el error
      handleError(event.reason, "Error de operación no controlado");
    };

    // Interceptar errores globales de JavaScript
    const errorHandler = (event: ErrorEvent): void => {
      event.preventDefault(); // Previene que NextJS muestre el error
      handleError(event.error || event.message, "Error de aplicación");
    };

    // Registrar los interceptores
    window.addEventListener("unhandledrejection", unhandledRejectionHandler);
    window.addEventListener("error", errorHandler);

    // Sobreescribir console.error para evitar mensajes de NextJS
    const originalConsoleError = console.error;
    console.error = function (...args: unknown[]): void {
      // Filtrar errores específicos de NextJS o React Development
      const errorString = args.join(" ");
      if (
        errorString.includes("Warning:") ||
        errorString.includes("React DevTools") ||
        errorString.includes("Unhandled Runtime Error") ||
        errorString.includes("Next.js")
      ) {
        // No mostrar estos errores en la consola
        return;
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      // Limpiar interceptores al desmontar
      window.removeEventListener(
        "unhandledrejection",
        unhandledRejectionHandler
      );
      window.removeEventListener("error", errorHandler);
      console.error = originalConsoleError;
    };
  }, []);

  const captureError = (error: unknown, fallbackMessage?: string): void => {
    handleError(error, fallbackMessage);
  };

  return (
    <ErrorContext.Provider value={{ captureError }}>
      <ErrorBoundary>
        <Toaster richColors position="top-right" />
        {children}
      </ErrorBoundary>
    </ErrorContext.Provider>
  );
};
