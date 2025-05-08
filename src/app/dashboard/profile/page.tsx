"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, User } from "@/services/authService";
import { LogOut, User as UserIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const Profile: React.FC = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.replace("/dashboard/login");
      } else {
        setCurrentUser(user);
      }
      setLoading(false);
    };
    loadUser();
  }, [router]);

  if (loading) return null;
  if (!currentUser) return null;

  const handleLogout = () => {
    authService.logout();
    toast.success("Sesión cerrada correctamente");
    router.push("/dashboard/login");
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card className="overflow-hidden">
        {/* Header */}
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

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Info básica */}
          <div className="mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-[#2B577A] mb-3">
              Información de usuario
            </h2>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-md border">
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
                <span
                  className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    currentUser.role === "Admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>

          {/* Permisos (solo si no es "User") */}
          {currentUser.role !== "User" && (
            <div className="mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-[#2B577A] mb-3">
                Permisos
              </h2>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-md border">
                <ul className="space-y-2.5">
                  <li className="flex items-center">
                    <span
                      className={`w-3 h-3 sm:w-4 sm:h-4 mr-2 rounded-full ${
                        authService.isAdmin(currentUser)
                          ? "bg-[#336633]"
                          : "bg-gray-300"
                      }`}
                    />
                    <span className="text-sm sm:text-base">
                      Administración de usuarios
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 sm:w-4 sm:h-4 mr-2 rounded-full bg-[#336633]" />
                    <span className="text-sm sm:text-base">Acceso al chat</span>
                  </li>
                  <li className="flex items-center">
                    <span
                      className={`w-3 h-3 sm:w-4 sm:h-4 mr-2 rounded-full ${
                        currentUser.role === "Admin"
                          ? "bg-[#336633]"
                          : "bg-gray-300"
                      }`}
                    />
                    <span className="text-sm sm:text-base">
                      Administración completa
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Botón de logout */}
          <button
            onClick={handleLogout}
            className="cursor-pointer w-full mt-4 bg-[#336633] hover:bg-[#336633]/90 text-white py-2.5 sm:py-3 px-4 rounded-md flex items-center justify-center transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            <span className="text-sm sm:text-base">Cerrar sesión</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
