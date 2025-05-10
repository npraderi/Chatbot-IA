// app/dashboard/users/page.tsx  (o donde tengas tu ruta /dashboard/chat)
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { authService, User, UserRole } from "@/services/authService";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

import {
  User as UserIcon,
  Edit,
  Trash,
  Plus,
  Eye,
  EyeOff,
  Key,
  Check,
} from "lucide-react";
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
import { Spinner } from "@/components/ui/Spinner";

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
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "User" as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState<{
    [key: string]: boolean;
  }>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialFormData, setInitialFormData] = useState({
    username: "",
    role: "User" as UserRole,
  });

  const loadUsers = async () => {
    try {
      const loadedUsers = await userService.getUsers();
      setUsers(loadedUsers);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      toast.error(
        err instanceof Error ? err.message : "Error al cargar los usuarios"
      );
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user) {
          router.replace("/dashboard/login");
          return;
        }
        setCurrentLoggedUser(user);
        await loadUsers();
      } catch (err) {
        console.error("Error al cargar datos:", err);
        toast.error(
          err instanceof Error ? err.message : "Error al cargar los datos"
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!currentLoggedUser) return null;

  // Verificar si el usuario actual es Admin o SuperAdmin
  const isAdmin =
    currentLoggedUser.role === "Admin" ||
    currentLoggedUser.role === "SuperAdmin";
  const isSuperAdmin = currentLoggedUser.role === "SuperAdmin";

  const handleOpenModal = (user: User | null = null) => {
    // Si el usuario actual es admin (pero no superadmin) y está intentando editar otro admin
    if (
      isAdmin &&
      !isSuperAdmin &&
      user?.role === "Admin" &&
      user.id !== currentLoggedUser.id
    ) {
      toast.error("No puedes editar otros administradores");
      return;
    }

    // Si no es admin, solo puede editar su propio perfil
    if (!isAdmin && user && user.id !== currentLoggedUser.id) {
      toast.error("Solo puedes editar tu propio perfil");
      return;
    }

    if (user) {
      const newFormData = {
        username: user.name,
        password: "", // No mostramos la contraseña actual
        name: user.fullName || "",
        email: user.email,
        role: user.role as UserRole,
      };
      setFormData(newFormData);
      setInitialFormData({
        username: user.name,
        role: user.role as UserRole,
      });
      setCurrentUser(user);
    } else {
      const newFormData = {
        username: "",
        password: "",
        name: "",
        email: "",
        role: "User" as UserRole,
      };
      setFormData(newFormData);
      setInitialFormData({
        username: "",
        role: "User" as UserRole,
      });
      setCurrentUser(null);
    }
    setShowPassword(false);
    setIsModalOpen(true);
    setHasChanges(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
    setShowPassword(false);
    setHasChanges(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Verificar cambios solo en campos permitidos
    if (currentUser) {
      if (name === "username" || name === "role") {
        const hasChanged =
          (name === "username" && value !== initialFormData.username) ||
          (name === "role" && value !== initialFormData.role);
        setHasChanges(hasChanged);
      }
    } else {
      // Para nuevos usuarios, siempre habilitar el botón
      setHasChanges(true);
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setFormData({ ...formData, password: newPassword });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast.error("El nombre de usuario es obligatorio");
      return false;
    }
    if (!formData.password && !currentUser) {
      toast.error("La contraseña es obligatoria para nuevos usuarios");
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("El formato del email no es válido");
      return false;
    }
    return true;
  };

  const handleResetPassword = async (email: string) => {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent((prev) => ({ ...prev, [email]: true }));
      toast.success("Se ha enviado un correo para restablecer la contraseña");
    } catch (error) {
      console.error("Error al enviar correo de restablecimiento:", error);
      toast.error("Error al enviar el correo de restablecimiento");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (currentUser) {
        const userData: Partial<User> = {
          name: formData.username.trim(),
          email: formData.email.trim(),
          role: formData.role,
        };

        // No permitir cambiar el rol si no es Admin
        if (!isAdmin && userData.role !== currentUser.role) {
          toast.error("No tienes permiso para cambiar el rol de usuario");
          return;
        }

        // Si es admin (pero no superadmin), solo puede editar su propio perfil
        if (
          isAdmin &&
          !isSuperAdmin &&
          currentUser.role === "Admin" &&
          currentUser.id !== currentLoggedUser.id
        ) {
          toast.error("No puedes editar otros administradores");
          return;
        }

        await userService.updateUser(currentUser.id, userData);
        toast.success("Usuario actualizado correctamente");
      } else {
        const newUserData = {
          name: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
        };
        await userService.createUser(newUserData);
        toast.success("Usuario creado correctamente");
      }

      handleCloseModal();
      await loadUsers();
    } catch (err) {
      console.error("Error al procesar usuario:", err);
      toast.error(
        err instanceof Error ? err.message : "Error al procesar el usuario"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (currentLoggedUser?.id === userId) {
      toast.error("No puedes eliminar tu propio usuario");
      return;
    }

    const userToDelete = users.find((u) => u.id === userId);

    // Solo SuperAdmin puede eliminar usuarios Admin
    if (userToDelete?.role === "Admin" && !isSuperAdmin) {
      toast.error("Solo SuperAdmin puede eliminar administradores");
      return;
    }

    // Nadie puede eliminar a un SuperAdmin
    if (userToDelete?.role === "SuperAdmin") {
      toast.error("No se puede eliminar un SuperAdmin");
      return;
    }

    // Mostrar confirmación antes de eliminar
    if (
      !confirm(
        `¿Estás seguro de eliminar al usuario ${userToDelete?.name}? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      // Usamos el método de eliminación completa que intentará eliminar
      // tanto el usuario de Firestore como el de Firebase Auth
      await userService.deleteUserCompletely(userId);

      toast.success("Usuario eliminado correctamente");
      await loadUsers();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      toast.error(
        err instanceof Error ? err.message : "Error al eliminar el usuario"
      );
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl bg-gray-50 ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#2B577A]">
          Gestión de Usuarios
        </h1>
        {isAdmin && (
          <Button
            onClick={() => handleOpenModal()}
            className="bg-[#336633] hover:bg-green-700 text-white cursor-pointer"
          >
            <Plus size={18} className="mr-1" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      <div className="bg-gray-50  shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#BED1E0]">
              <TableRow>
                <TableHead className="text-[#2B577A]">Usuario</TableHead>
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
                      {user.email || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "SuperAdmin"
                          ? "bg-red-100 text-red-800"
                          : user.role === "Admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      {(user.id === currentLoggedUser.id ||
                        (isAdmin && user.role !== "Admin") ||
                        (isSuperAdmin && user.role === "Admin") ||
                        (isSuperAdmin &&
                          user.role === "SuperAdmin" &&
                          user.id === currentLoggedUser.id)) && (
                        <Button
                          onClick={() => handleOpenModal(user)}
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer text-blue-600 hover:text-blue-900"
                          title="Editar usuario"
                        >
                          <Edit size={18} />
                        </Button>
                      )}
                      {((isAdmin &&
                        user.role !== "Admin" &&
                        user.role !== "SuperAdmin") ||
                        (isSuperAdmin && user.role === "Admin")) &&
                        user.id !== currentLoggedUser.id && (
                          <Button
                            onClick={() => handleDeleteUser(user.id)}
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer text-red-600 hover:text-red-900"
                            title="Eliminar usuario"
                          >
                            <Trash size={18} />
                          </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed bg-[#2B577A]/90 inset-0 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-gray-50  rounded-lg p-6 w-full max-w-md border">
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
                  placeholder="Ingrese el nombre de usuario"
                />
              </div>

              {currentUser ? (
                <div>
                  <Label>Contraseña</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      onClick={() => handleResetPassword(currentUser.email)}
                      disabled={resetEmailSent[currentUser.email]}
                      className={`w-full cursor-pointer ${
                        resetEmailSent[currentUser.email]
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-[#2B577A] hover:bg-[#2B577A]/90"
                      } text-white`}
                    >
                      {resetEmailSent[currentUser.email] ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Correo enviado
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4 mr-2" />
                          Enviar correo para cambiar contraseña
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {resetEmailSent[currentUser.email]
                      ? "El correo de restablecimiento ya fue enviado"
                      : "Se enviará un correo al usuario para que pueda cambiar su contraseña"}
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="password">
                    Contraseña <span className="text-red-500">*</span>
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
                        placeholder="Ingrese la contraseña"
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
                      className="ml-2 bg-[#2B577A] text-white cursor-pointer"
                    >
                      Generar
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="ejemplo@correo.com"
                  readOnly={!!currentUser}
                  disabled={!!currentUser}
                  title={currentUser ? "El email no puede ser modificado" : ""}
                />
                {currentUser && (
                  <p className="text-sm text-gray-500 mt-1">
                    El email no puede ser modificado
                  </p>
                )}
              </div>

              {isAdmin && (
                <div className="cursor-pointer">
                  <Label htmlFor="role">Rol</Label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="cursor-pointer w-full px-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                  >
                    {isSuperAdmin && (
                      <option value="SuperAdmin">SuperAdmin</option>
                    )}
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  variant="outline"
                  disabled={isSubmitting}
                  className="bg-gray-50 border-[#BED1E0] text-[#2B577A] hover:bg-[#BED1E0] hover:text-[#2B577A] cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={(!!currentUser && !hasChanges) || isSubmitting}
                  className={`${
                    (!!currentUser && !hasChanges) || isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#2B577A] hover:bg-[#2B577A]/90 cursor-pointer"
                  } text-white`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <Spinner size="sm" className="mr-2" />
                      {currentUser ? "Actualizando..." : "Creando..."}
                    </div>
                  ) : currentUser ? (
                    "Actualizar"
                  ) : (
                    "Crear"
                  )}
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
