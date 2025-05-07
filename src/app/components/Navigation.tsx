// components/Navigation.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Users, MessageSquare, History } from "lucide-react";
import { authService } from "../services/authService";
import type { User as UserType } from "../services/authService";

const Navigation: React.FC = () => {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  if (!currentUser) {
    return null;
  }

  const isAdmin = currentUser.role === "Admin";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow z-50 py-2">
      <div className="max-w-lg mx-auto flex justify-around">
        {isAdmin && (
          <>
            <Link
              href="/dashboard/users"
              className={`flex flex-col items-center gap-1 ${
                pathname === "/dashboard/profile"
                  ? "text-[#2B577A] font-semibold"
                  : "text-gray-600 hover:text-[#2B577A]"
              }`}
            >
              <Users size={24} />
              <span className="text-xs">Usuarios</span>
            </Link>
            <Link
              href="/dashboard/chat-history"
              className={`flex flex-col items-center gap-1 ${
                pathname === "/dashboard/profile"
                  ? "text-[#2B577A] font-semibold"
                  : "text-gray-600 hover:text-[#2B577A]"
              }`}
            >
              <History size={24} />
              <span className="text-xs">Historial</span>
            </Link>
          </>
        )}
        <Link
          href="/dashboard/chat"
          className={`flex flex-col items-center gap-1 ${
            pathname === "/dashboard/profile"
              ? "text-[#2B577A] font-semibold"
              : "text-gray-600 hover:text-[#2B577A]"
          }`}
        >
          <MessageSquare size={24} />
          <span className="text-xs">Chat</span>
        </Link>
        <Link
          href="/dashboard/profile"
          className={`flex flex-col items-center gap-1 ${
            pathname === "/dashboard/profile"
              ? "text-[#2B577A] font-semibold"
              : "text-gray-600 hover:text-[#2B577A]"
          }`}
        >
          <User size={24} />
          <span className="text-xs">Perfil</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
