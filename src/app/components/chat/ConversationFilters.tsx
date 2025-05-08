import React from "react";
import { Search } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import { User } from "@/services/authService";

interface ConversationFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedUser: string;
  setSelectedUser: (user: string) => void;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  users: User[];
  isAdmin: boolean;
}

const ConversationFilters: React.FC<ConversationFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedUser,
  setSelectedUser,
  users,
  isAdmin,
}) => {
  return (
    <div className="p-4 border-b ">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {isAdmin && (
          <div>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full cursor-pointer text-gray-500 bg-white px-3 py-2 border border-gray-300 rounded-md "
            >
              <option value="all">Todos los usuarios</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationFilters;
