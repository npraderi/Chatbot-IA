"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { authService, User as UserType } from "@/services/authService";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Usar un estado para almacenar el usuario actual
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // Usar useEffect para obtener el usuario en el cliente
  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, []);

  return (
    <div>
      {children}
      <Navigation currentUser={currentUser} />
    </div>
  );
}
