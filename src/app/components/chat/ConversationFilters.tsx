import React from "react";
import { Search } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
  date,
  setDate,
  open,
  setOpen,
  users,
  isAdmin,
}) => {
  return (
    <div className="p-4 border-b">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#2B577A] focus:border-[#2B577A]"
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

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "P", { locale: es })} -{" "}
                    {format(date.to, "P", { locale: es })}
                  </>
                ) : (
                  format(date.from, "P", { locale: es })
                )
              ) : (
                <span>Filtrar por fecha</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ConversationFilters;
