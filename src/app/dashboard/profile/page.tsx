"use client";
import React from "react";
import { authService, User } from "@/services/authService";
import { LogOut, User as UserIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import router from "next/router";

const Profile: React.FC = () => {
  const currentUser = authService.getCurrentUser() as User;

  const handleLogout = () => {
    authService.logout();
    toast.success("Sesión cerrada correctamente");
    router.push("/login");
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card className="overflow-hidden">
        {/* Header section */}
        <div className="bg-[#2B577A] p-4 sm:p-6 flex flex-col items-center">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white flex items-center justify-center mb-3 sm:mb-4">
            <UserIcon size={40} className="text-[#2B577A]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {currentUser.name}
          </h1>
          <p className="text-sm sm:text-base text-[#BED1E0]">
            {currentUser.email}
          </p>
        </div>

        {/* Content section */}
        <div className="p-4 sm:p-6">
          {/* User Information */}
          <div className="mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-[#2B577A] mb-3">
              Información de usuario
            </h2>

            <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Nombre</p>
                  <p className="text-sm sm:text-base font-medium">
                    {currentUser.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Email</p>
                  <p className="text-sm sm:text-base font-medium">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-500">Rol</p>
                <p className="mt-1">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      currentUser.role === "Superadministrador"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Permissions section - Only shown for non-regular users */}
          {currentUser.role !== "Usuario" && (
            <div className="mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-[#2B577A] mb-3">
                Permisos
              </h2>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
                <ul className="space-y-2.5">
                  <li className="flex items-center">
                    <span
                      className={`w-3 h-3 sm:w-4 sm:h-4 mr-2 rounded-full ${
                        authService.isAdmin(currentUser)
                          ? "bg-[#336633]"
                          : "bg-gray-300"
                      }`}
                    ></span>
                    <span className="text-sm sm:text-base">
                      Administración de usuarios
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 sm:w-4 sm:h-4 mr-2 rounded-full bg-[#336633]"></span>
                    <span className="text-sm sm:text-base">Acceso al chat</span>
                  </li>
                  <li className="flex items-center">
                    <span
                      className={`w-3 h-3 sm:w-4 sm:h-4 mr-2 rounded-full ${
                        currentUser.role === "Superadministrador"
                          ? "bg-[#336633]"
                          : "bg-gray-300"
                      }`}
                    ></span>
                    <span className="text-sm sm:text-base">
                      Administración completa
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full mt-4 bg-[#336633] hover:bg-[#336633]/90 text-white py-2.5 sm:py-3 px-4 rounded-md flex items-center justify-center transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            <span className="text-sm sm:text-base cursor-pointer">
              Cerrar sesión
            </span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
