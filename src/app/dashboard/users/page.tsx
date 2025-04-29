// app/dashboard/users/page.tsx  (o donde tengas tu ruta /dashboard/chat)
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { authService, User, UserRole } from "@/services/authService";

import { User as UserIcon, Edit, Trash, Plus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const generateRandomPassword = () => {
  const length = 8;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const Users: React.FC = () => {
  const router = useRouter();

  const [currentLoggedUser, setCurrentLoggedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "Usuario" as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);

  // 1. Comprobamos sesión al montar
  useEffect(() => {
    const u = authService.getCurrentUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setCurrentLoggedUser(u);
    loadUsers();
  }, []);

  // 2. Determinamos si es superadmin
  const isSuperAdmin = authService.isSuperAdmin(currentLoggedUser);

  const loadUsers = () => {
    try {
      const loadedUsers = userService.getUsers();
      setUsers(loadedUsers);
    } catch {
      toast.error("Error al cargar los usuarios");
    }
  };

  const handleOpenModal = (user: User | null = null) => {
    if (user) {
      setFormData({
        username: user.name,
        password: user.password || "",
        name: user.fullName || "",
        email: user.email,
        role: user.role,
      });
      setCurrentUser(user);
    } else {
      setFormData({
        username: "",
        password: "",
        name: "",
        email: "",
        role: "Usuario",
      });
      setCurrentUser(null);
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
    setShowPassword(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setFormData({ ...formData, password: newPassword });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.username) {
        toast.error("El nombre de usuario es obligatorio");
        return;
      }
      if (!formData.password && !currentUser) {
        toast.error("La contraseña es obligatoria para nuevos usuarios");
        return;
      }

      const userData: Partial<User> = {
        name: formData.username,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        fullName: formData.name,
      };

      if (currentUser) {
        userService.updateUser(currentUser.id, userData);
        toast.success("Usuario actualizado correctamente");
      } else {
        userService.createUser(userData as User);
        toast.success("Usuario creado correctamente");
      }

      handleCloseModal();
      loadUsers();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al procesar el usuario"
      );
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (currentLoggedUser?.id === userId) {
      toast.error("No puedes eliminar tu propio usuario");
      return;
    }
    try {
      userService.deleteUser(userId);
      toast.success("Usuario eliminado correctamente");
      loadUsers();
    } catch {
      toast.error("Error al eliminar el usuario");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#2B577A]">
          Gestión de Usuarios
        </h1>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[#336633] hover:bg-green-700 text-white"
        >
          <Plus size={18} className="mr-1" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#BED1E0]">
              <TableRow>
                <TableHead className="text-[#2B577A]">Usuario</TableHead>
                <TableHead className="text-[#2B577A]">
                  Nombre/Institución
                </TableHead>
                <TableHead className="text-[#2B577A]">Email</TableHead>
                <TableHead className="text-[#2B577A]">Rol</TableHead>
                <TableHead className="text-[#2B577A] text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-[#BED1E0] rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-[#2B577A]" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {user.fullName || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {user.email || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "Superadministrador"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => handleOpenModal(user)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit size={18} />
                    </Button>
                    {isSuperAdmin &&
                      user.role !== "Superadministrador" &&
                      currentLoggedUser?.id !== user.id && (
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash size={18} />
                        </Button>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-[#2B577A]">
              {currentUser ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">
                  Nombre de Usuario <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="password">
                  Contraseña{" "}
                  {!currentUser && <span className="text-red-500">*</span>}
                </Label>
                <div className="flex">
                  <div className="relative flex-grow">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!currentUser}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <Button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="ml-2 bg-[#2B577A] text-white"
                  >
                    Generar
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Nombre de la persona o institución</Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="role">Rol</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#2B577A] focus:border-[#2B577A]"
                >
                  {isSuperAdmin && (
                    <option value="Superadministrador">
                      Superadministrador
                    </option>
                  )}
                  <option value="Usuario">Usuario</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#2B577A] hover:bg-blue-700"
                >
                  {currentUser ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
