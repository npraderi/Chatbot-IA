
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CalendarIcon, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
}

interface ConversationFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedUser: string;
  setSelectedUser: (user: string) => void;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  mockUsers: User[];
}

const ConversationFilters = ({
  searchTerm,
  setSearchTerm,
  selectedUser,
  setSelectedUser,
  date,
  setDate,
  open,
  setOpen,
  mockUsers
}: ConversationFiltersProps) => {
  return (
    <div className="p-4 space-y-4 border-b">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar conversaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy")} -{" "}
                  {format(date.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Seleccionar fecha</span>
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
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedUser === "all" 
              ? "Todos los usuarios" 
              : selectedUser}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar usuario..." />
            <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setSelectedUser("all");
                    setOpen(false);
                  }}
                >
                  Todos los usuarios
                </CommandItem>
                {mockUsers.map(user => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => {
                      setSelectedUser(user.name);
                      setOpen(false);
                    }}
                  >
                    {user.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ConversationFilters;
