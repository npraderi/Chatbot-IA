"use client";
import React, { useState, useEffect } from "react";
import { Conversation } from "@/services/chatService";
import { DateRange } from "react-day-picker";
import ConversationList from "@/components/chat/ConversationList";
import ConversationFilters from "@/components/chat/ConversationFilters";
import ConversationDetail from "@/components/chat/ConversationDetail";
import { toast } from "sonner";
import { authService, User } from "@/services/authService";
import { chatService } from "@/services/chatService";
import { userService } from "@/services/userService";
import { useRouter } from "next/navigation";

export default function ChatHistoryPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user) {
          router.replace("/dashboard/login");
          return;
        }
        setCurrentUser(user);

        // Si es Admin, cargamos todos los usuarios
        if (user.role === "Admin") {
          const allUsers = await userService.getUsers();
          setUsers(allUsers);
        }

        // Si es Admin, cargamos todas las conversaciones
        // Si no, solo las del usuario actual
        const loadedConversations =
          user.role === "Admin"
            ? await chatService.getAllConversations()
            : await chatService.getConversations(user.id);

        console.log("Conversaciones cargadas:", loadedConversations);
        setConversations(loadedConversations);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar el historial");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  if (loading) return null;
  if (!currentUser) return null;

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      searchTerm === "" ||
      conv.messages.some((msg) =>
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesUser = selectedUser === "all" || conv.userId === selectedUser;

    const matchesDate = !date?.from
      ? true
      : conv.lastMessageDate >= date.from &&
        (!date.to || conv.lastMessageDate <= date.to);

    console.log("Filtrado de conversaciones:", {
      convId: conv.id,
      convUserId: conv.userId,
      selectedUser,
      matchesUser,
      matchesSearch,
      matchesDate,
    });

    return matchesSearch && matchesUser && matchesDate;
  });

  const handleDeleteConversation = async (
    e: React.MouseEvent,
    conversationId: string
  ) => {
    e.stopPropagation();

    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      // Solo permitir eliminar si es Admin o si es el dueño de la conversación
      const conversation = conversations.find((c) => c.id === conversationId);
      if (user.role !== "Admin" && conversation?.userId !== user.id) {
        toast.error("No tienes permiso para eliminar esta conversación");
        return;
      }

      await chatService.deleteConversation(conversationId);
      const updatedConversations = conversations.filter(
        (conv) => conv.id !== conversationId
      );
      setConversations(updatedConversations);

      if (activeConversation && activeConversation.id === conversationId) {
        setActiveConversation(null);
      }

      toast.success("Conversación eliminada");
    } catch (error) {
      console.error("Error al eliminar conversación:", error);
      toast.error("Error al eliminar la conversación");
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] max-w-full overflow-hidden">
      <div className="flex h-full max-w-full">
        <div className="bg-white shadow-md w-80 flex-shrink-0 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b bg-[#2B577A]">
            <h2 className="font-bold text-lg text-white text-left">
              Historial de chats
            </h2>
          </div>

          <ConversationFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            date={date}
            setDate={setDate}
            open={open}
            setOpen={setOpen}
            users={users}
            isAdmin={currentUser.role === "Admin"}
          />

          <ConversationList
            conversations={filteredConversations}
            activeConversation={activeConversation}
            onSelectConversation={setActiveConversation}
            onDeleteConversation={handleDeleteConversation}
            currentUserId={currentUser.id}
            isAdmin={currentUser.role === "Admin"}
          />
        </div>

        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          <div className="bg-white p-4 shadow-sm">
            <h2 className="font-bold">
              {activeConversation
                ? `Conversación ${activeConversation.id}`
                : "Selecciona una conversación para ver su historial"}
            </h2>
          </div>

          <div className="flex-1 p-4 overflow-hidden">
            <ConversationDetail conversation={activeConversation} />
          </div>
        </div>
      </div>
    </div>
  );
}
