"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Users, MessageSquare, History } from "lucide-react";
import { authService, User as UserType } from "../services/authService";

interface NavigationProps {
  currentUser: UserType | null;
}

const Navigation: React.FC<NavigationProps> = ({ currentUser }) => {
  const pathname = usePathname();

  // Evaluar isAdmin solo en el cliente después de renderizar
  let isAdmin = false;
  if (typeof window !== "undefined" && currentUser) {
    isAdmin = authService.isAdmin(currentUser);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-lg mx-auto flex justify-around">
        {isAdmin && (
          <>
            <Link
              href="/dashboard/users"
              className={`flex flex-col items-center p-2 ${
                pathname === "/dashboard/users"
                  ? "text-[#2B577A] font-semibold"
                  : "text-gray-600 hover:text-[#2B577A]"
              }`}
            >
              <Users size={24} />
              <span className="text-xs mt-1">Usuarios</span>
            </Link>
            <Link
              href="/dashboard/chat-history"
              className={`flex flex-col items-center p-2 ${
                pathname === "/dashboard/chat-history"
                  ? "text-[#2B577A] font-semibold"
                  : "text-gray-600 hover:text-[#2B577A]"
              }`}
            >
              <History size={24} />
              <span className="text-xs mt-1">Historial</span>
            </Link>
          </>
        )}
        <Link
          href="/dashboard/chat"
          className={`flex flex-col items-center p-2 ${
            pathname === "/dashboard/chat"
              ? "text-[#2B577A] font-semibold"
              : "text-gray-600 hover:text-[#2B577A]"
          }`}
        >
          <MessageSquare size={24} />
          <span className="text-xs mt-1">Chat</span>
        </Link>
        <Link
          href="/dashboard/profile"
          className={`flex flex-col items-center p-2 ${
            pathname === "/dashboard/profile"
              ? "text-[#2B577A] font-semibold"
              : "text-gray-600 hover:text-[#2B577A]"
          }`}
        >
          <User size={24} />
          <span className="text-xs mt-1">Perfil</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
