// app/dashboard/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; // <-- import
import Navigation from "@/components/Navigation";
import { authService, User as UserType } from "@/services/authService";
import {
  disableReactDevErrors,
  suppressHydrationWarnings,
} from "@/lib/error-utils";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const pathname = usePathname(); // <-- ruta actual

  // Desactivar errores de desarrollo y supresión de hidratación
  useEffect(() => {
    disableReactDevErrors();
    suppressHydrationWarnings();
  }, []);

  // Cada vez que cambie la ruta, releemos el user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("[Error controlado]:", error);
        toast.error("Error al cargar información del usuario");
        setCurrentUser(null);
      }
    };

    loadUser();
  }, [pathname]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 ">
      <main className="flex-1 overflow-auto">{children}</main>
      {currentUser && <Navigation />}
    </div>
  );
}
