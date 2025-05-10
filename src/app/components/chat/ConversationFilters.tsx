import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { User } from "@/services/authService";

interface ConversationFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedUser: string;
  setSelectedUser: (userId: string) => void;
  users: User[];
  isAdmin: boolean;
  isSuperAdmin?: boolean;
}

const ConversationFilters: React.FC<ConversationFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedUser,
  setSelectedUser,
  users,
  isAdmin,
  isSuperAdmin = false,
}) => {
  return (
    <div className="p-4 border-b space-y-4">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar conversaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 pr-6"
        />
        {searchTerm && (
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setSearchTerm("")}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filtros adicionales (solo para admin) */}
      {isAdmin && (
        <div>
          {/* Filtro de usuario (volvemos al select original) */}
          <div>
            <label
              htmlFor="userFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filtrar por usuario
            </label>
            <select
              id="userFilter"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full cursor-pointer text-gray-500 bg-white px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todos los usuarios</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {isSuperAdmin && `(${user.role})`}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationFilters;
