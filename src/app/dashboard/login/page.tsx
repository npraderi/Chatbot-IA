"use client";
import React, { useState } from "react";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Login: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "El email es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "El email no es válido";

    if (!password) newErrors.password = "La contraseña es obligatoria";
    else if (password.length < 4)
      newErrors.password = "La contraseña debe tener al menos 4 caracteres";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const user = await authService.login(email, password);
    setLoading(false);

    if (user) {
      toast.success(`Bienvenido, ${user.name}`);
      router.push("/dashboard/chat");
    } else {
      setErrors({ password: "Credenciales inválidas" });
      toast.error("Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#BED1E0] to-white p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-[#2B577A] text-center">
          ChatBot Ladamerica
        </h1>
        <p className="text-center text-sm text-gray-600">
          Inicia sesión en tu cuenta
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                focus:outline-none focus:ring-[#2B577A] focus:border-[#2B577A]
                ${errors.email ? "border-red-300" : "border-gray-300"}`}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                focus:outline-none focus:ring-[#2B577A] focus:border-[#2B577A]
                ${errors.password ? "border-red-300" : "border-gray-300"}`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-[#2B577A]
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2B577A]
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          <div className="text-center text-sm text-gray-500">
            <p>Para demostración, use:</p>
            <p>• admin@example.com (Superadministrador)</p>
            <p>• user@example.com (Usuario)</p>
            <p className="mt-1">
              Con cualquier contraseña de al menos 4 caracteres
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
