"use client";

import { useEffect } from "react";
import { toast } from "sonner";

// Este componente se renderiza cuando ocurre un error en una ruta
export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registrar el error y mostrar una notificación toast
    console.error("[Interceptado por error.tsx]:", error);

    // Mostrar toast al usuario, sin exponer detalles técnicos
    toast.error("Ha ocurrido un error. Por favor, intenta de nuevo más tarde.");

    // Prevenir que NextJS muestre el error
    const root = document.getElementById("__next") || document.documentElement;
    const errorElements = root.querySelectorAll("[data-nextjs-error]");
    errorElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.display = "none";
      }
    });
  }, [error]);

  return (
    <div className="hidden">
      {/* Componente oculto que solo sirve para capturar errores */}
    </div>
  );
}
