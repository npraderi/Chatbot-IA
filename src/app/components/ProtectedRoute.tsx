"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, User } from "@/services/authService";
import { Spinner } from "@/components/ui/Spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "Admin" | "SuperAdmin" | "User";
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();

        if (!currentUser) {
          router.replace("/dashboard/login");
          return;
        }

        // Verificar si el usuario tiene el rol requerido
        if (requiredRole) {
          const hasRequiredRole =
            requiredRole === "SuperAdmin"
              ? authService.isSuperAdmin(currentUser)
              : requiredRole === "Admin"
              ? authService.isAdmin(currentUser)
              : true; // Si es "User", todos los usuarios pueden acceder

          if (!hasRequiredRole) {
            console.error("Usuario no tiene permisos suficientes");
            router.replace("/dashboard/chat");
            return;
          }
        }

        setUser(currentUser);
      } catch (error) {
        console.error("Error de autenticación:", error);
        router.replace("/dashboard/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return user ? <>{children}</> : null;
}
