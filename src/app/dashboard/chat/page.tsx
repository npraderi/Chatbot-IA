// components/chat/Chat.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { authService, User } from "../../services/authService";
import { Conversation, chatService } from "../../services/chatService";
import { MessageSquare, Plus, Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import ConversationList from "@/components/chat/ConversationList";
import ConversationDetail from "@/components/chat/ConversationDetail";
import MessageInput from "@/components/chat/MessageInput";
import { useChat } from "@/hooks/useChat";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LoadingWrapper } from "@/components/ui/LoadingWrapper";
import { Spinner } from "@/components/ui/Spinner";
import { ResponsePlaceholder } from "../../components/chat/ResponsePlaceholder";

const Chat: React.FC = () => {
  const router = useRouter();
  const [, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user) {
          router.replace("/dashboard/login");
          return;
        }
        setCurrentUser(user);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [router]);

  const {
    conversations,
    activeConversation,
    setActiveConversation,
    createNewConversation,
    sendMessage,
    loading: chatLoading,
    isBotResponding,
  } = useChat(currentUser);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages.length]);

  const selectConversation = (conv: Conversation) => {
    if (activeConversation?.id === conv.id) return;
    setActiveConversation(conv);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleSendMessage = async (msg: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      if (!activeConversation) {
        const newConv = await createNewConversation();
        if (!newConv) return false;

        setActiveConversation(newConv);
        const result = await sendMessage(msg);
        if (result) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          return true;
        }
        return false;
      } else {
        const result = await sendMessage(msg);
        if (result) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast.error("Error al enviar mensaje");
      return false;
    }
  };

  const handleTitleEdit = async () => {
    if (!activeConversation || !newTitle.trim()) return;

    try {
      await chatService.updateConversationTitle(
        activeConversation.id,
        newTitle.trim()
      );
      setActiveConversation({
        ...activeConversation,
        title: newTitle.trim(),
      });
      setEditingTitle(false);
      toast.success("Título actualizado");
    } catch (error) {
      console.error("Error al actualizar título:", error);
      toast.error("Error al actualizar el título");
    }
  };

  if (loading) {
    return (
      <LoadingWrapper isLoading={true} className="h-screen">
        <Spinner size="lg" />
      </LoadingWrapper>
    );
  }
  if (!currentUser) return null;

  return (
    <div className="h-[calc(100vh-4rem)] flex pb-4">
      {/* Sidebar */}
      <div className="w-96 bg-white shadow flex flex-col">
        <div className="p-4 bg-[#2B577A] text-white">Conversaciones</div>
        <div className="flex-1 overflow-auto">
          <ConversationList
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={selectConversation}
            currentUserId={currentUser.id}
            isAdmin={
              currentUser.role === "Admin" || currentUser.role === "SuperAdmin"
            }
            userRole={currentUser.role}
          />
        </div>
        <div className="p-4">
          <Button
            onClick={createNewConversation}
            className="w-full bg-[#2B577A] text-white cursor-pointer"
          >
            <Plus className="mr-2" /> Nueva conversación
          </Button>
        </div>
      </div>

      {/* Chat pane */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="p-4 bg-white shadow flex items-center justify-between">
          {editingTitle ? (
            <div className="flex items-center gap-2 flex-1 text-gray-500">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleEdit();
                  if (e.key === "Escape") setEditingTitle(false);
                }}
                autoFocus
                className="flex-1"
              />
              <Button
                className="cursor-pointer hover:bg-gray-200 hover:text-black"
                onClick={handleTitleEdit}
                variant="ghost"
                size="sm"
              >
                Guardar
              </Button>
              <Button
                className="cursor-pointer hover:bg-gray-200 hover:text-black"
                onClick={() => setEditingTitle(false)}
                variant="ghost"
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 text-gray-500">
              {chatLoading && !activeConversation ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>Cargando...</span>
                </div>
              ) : (
                <>
                  <h2 className="font-bold truncate max-w-[400px]">
                    {activeConversation?.title || "Selecciona una conversación"}
                  </h2>
                  {activeConversation && (
                    <Button
                      onClick={() => {
                        setNewTitle(activeConversation.title);
                        setEditingTitle(true);
                      }}
                      className="cursor-pointer"
                      variant="ghost"
                      size="sm"
                      title="Editar título"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        {chatLoading && !activeConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : !activeConversation ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50 gap-3">
            <MessageSquare size={48} className="mb-2" />
            <div>
              <p className="mb-2 bg-gray-50">
                Selecciona o crea una conversación
              </p>
              <Button
                onClick={createNewConversation}
                className="bg-[#2B577A] text-white cursor-pointer"
              >
                <Plus className="mr-2" /> Nueva conversación
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <ConversationDetail conversation={activeConversation} />
                {isBotResponding && <ResponsePlaceholder />}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
