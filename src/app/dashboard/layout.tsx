// app/dashboard/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; // <-- import
import Navigation from "@/components/Navigation";
import { authService, User as UserType } from "@/services/authService";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const pathname = usePathname(); // <-- ruta actual

  // Cada vez que cambie la ruta, releemos el user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        setCurrentUser(null);
      }
    };

    loadUser();
  }, [pathname]);

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-auto">{children}</main>
      {currentUser && <Navigation />}
    </div>
  );
}
