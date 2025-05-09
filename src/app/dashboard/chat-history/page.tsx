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
import { LoadingWrapper } from "@/components/ui/LoadingWrapper";
import { Spinner } from "@/components/ui/Spinner";

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

  // Cargar usuarios primero
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user) {
          router.replace("/dashboard/login");
          return;
        }
        setCurrentUser(user);

        if (user.role === "Admin") {
          const allUsers = await userService.getUsers();
          const normalUsers = allUsers.filter((u) => u.role === "User");
          setUsers(normalUsers);
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        toast.error("Error al cargar los usuarios");
      }
    };
    loadUsers();
  }, [router]);

  // Cargar conversaciones después de que los usuarios estén disponibles
  useEffect(() => {
    const loadConversations = async () => {
      if (!currentUser) return;

      try {
        const loadedConversations =
          currentUser.role === "Admin"
            ? await chatService.getAllConversations()
            : await chatService.getConversations(currentUser.id);

        // Filtrar conversaciones de admin si el usuario actual es admin
        const filteredConversations =
          currentUser.role === "Admin"
            ? loadedConversations.filter((conv) => {
                const conversationUser = users.find(
                  (u) => u.id === conv.userId
                );
                return conversationUser?.role === "User";
              })
            : loadedConversations;

        setConversations(filteredConversations);
      } catch (error) {
        console.error("Error al cargar conversaciones:", error);
        toast.error("Error al cargar el historial");
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [currentUser, users]);

  if (loading) {
    return (
      <LoadingWrapper isLoading={true} className="h-screen">
        <Spinner size="lg" />
      </LoadingWrapper>
    );
  }
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

        <div className="flex-1 flex flex-col text-gray-500 bg-gray-50 overflow-hidden">
          <div className="bg-white p-4 shadow-sm text-gray-500">
            <h2 className="font-bold text-gray-500">
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
