"use client";
import React, { useState, useEffect } from "react";
import { Conversation } from "@/services/chatService";
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

        // Si es Admin o SuperAdmin, cargar los usuarios para el filtro
        if (user.role === "Admin" || user.role === "SuperAdmin") {
          const allUsers = await userService.getUsers();

          // Para SuperAdmin: mostrar todos los usuarios
          // Para Admin: mostrar solo usuarios normales
          const filteredUsers =
            user.role === "SuperAdmin"
              ? allUsers
              : allUsers.filter((u) => u.role === "User");

          setUsers(filteredUsers);
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
          currentUser.role === "Admin" || currentUser.role === "SuperAdmin"
            ? await chatService.getAllConversations()
            : await chatService.getConversations(
                currentUser.id,
                currentUser.role
              );

        // Filtrar conversaciones según el rol
        let filteredConversations = loadedConversations;

        if (currentUser.role === "Admin") {
          // Los Admin solo ven conversaciones de usuarios normales
          filteredConversations = loadedConversations.filter((conv) => {
            const conversationUser = users.find((u) => u.id === conv.userId);
            return conversationUser?.role === "User";
          });
        } else if (currentUser.role === "SuperAdmin") {
          // Los SuperAdmin ven todas las conversaciones por defecto
          // No se aplica filtro adicional aquí, pueden ver todo
          filteredConversations = loadedConversations;
        }

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

    return matchesSearch && matchesUser;
  });

  return (
    <div className="h-[calc(100vh-4rem)] max-w-full overflow-hidden">
      <div className="flex h-full max-w-full">
        <div className="bg-white shadow-md w-96 flex-shrink-0 flex flex-col h-full overflow-hidden">
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
            users={users}
            isAdmin={
              currentUser.role === "Admin" || currentUser.role === "SuperAdmin"
            }
            isSuperAdmin={currentUser.role === "SuperAdmin"}
          />

          <ConversationList
            conversations={filteredConversations}
            activeConversation={activeConversation}
            onSelectConversation={setActiveConversation}
            currentUserId={currentUser.id}
            isAdmin={
              currentUser.role === "Admin" || currentUser.role === "SuperAdmin"
            }
            userRole={currentUser.role}
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
