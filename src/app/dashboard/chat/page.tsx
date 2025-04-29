"use client";
import React, { useState, useRef, useEffect } from "react";
import { authService } from "../../services/authService";
import { Conversation } from "../../services/chatService";
import { MessageSquare, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import ConversationList from "@/components/chat/ConversationList";
import ConversationDetail from "@/components/chat/ConversationDetail";
import MessageInput from "@/components/chat/MessageInput";
import { useChat } from "@/hooks/useChat";

const Chat: React.FC = () => {
  const [, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Usar useEffect para cargar el usuario actual solo en el cliente
  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, []);

  const {
    conversations,
    activeConversation,
    setActiveConversation,
    createNewConversation,
    deleteConversation,
    sendMessage,
  } = useChat(currentUser);

  // Separar el useEffect para el scroll del de carga de usuario
  useEffect(() => {
    if (messagesEndRef.current) {
      scrollToBottom();
    }
  }, [activeConversation?.messages?.length]);

  const selectConversation = (conversation: Conversation) => {
    // Verificamos si la conversación seleccionada ya está activa
    if (activeConversation?.id === conversation.id) {
      return; // Si ya está activa, no hacemos nada
    }

    setActiveConversation(conversation);

    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteConversation = (
    e: React.MouseEvent,
    conversationId: string
  ) => {
    e.stopPropagation();
    deleteConversation(conversationId);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (message: string) => {
    // Si no hay conversación activa, creamos una nueva
    if (!activeConversation) {
      const newConversation = createNewConversation();
      if (newConversation) {
        setActiveConversation(newConversation); // Establecemos la nueva conversación como activa
        setTimeout(() => {
          const result = sendMessage(message);
          if (result) {
            scrollToBottom();
          }
        }, 100);
      }
    } else {
      // Si ya hay una conversación activa, enviamos el mensaje directamente a ella
      const result = sendMessage(message);
      if (result) {
        scrollToBottom();
      }
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] max-w-full overflow-hidden ">
      <div className="flex h-full max-w-full">
        <div className="bg-white shadow-md w-80 flex-shrink-0 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b bg-azul-principal">
            <h2 className="font-bold text-lg text-white text-left">
              Conversaciones
            </h2>
          </div>

          <div className="flex-1 overflow-hidden">
            {conversations && (
              <ConversationList
                conversations={conversations}
                activeConversation={activeConversation}
                onSelectConversation={selectConversation}
                onDeleteConversation={handleDeleteConversation}
              />
            )}
          </div>

          <div className="p-4 border-t">
            <Button
              onClick={createNewConversation}
              className="w-full bg-azul-principal hover:bg-azul-principal/90 text-white "
            >
              <Plus className="mr-2" size={18} />
              Nueva conversación
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          <div className="bg-white p-4 shadow-sm">
            <h2 className="font-bold">
              {activeConversation
                ? activeConversation.title
                : "Selecciona una conversación"}
            </h2>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {activeConversation ? (
              <>
                <ScrollArea className="flex-1">
                  <div className="space-y-4 p-4 pb-4">
                    <ConversationDetail conversation={activeConversation} />
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <MessageInput onSendMessage={handleSendMessage} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="mx-auto mb-4" size={48} />
                  <p className="text-lg mb-4">
                    Selecciona una conversación o crea una nueva
                  </p>
                  <Button
                    onClick={createNewConversation}
                    className="bg-azul-principal hover:bg-azul-principal/90 text-white"
                  >
                    <Plus className="mr-2" size={18} />
                    Nueva conversación
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
