// components/chat/Chat.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { authService, User } from "../../services/authService";
import { Conversation } from "../../services/chatService";
import { MessageSquare, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import ConversationList from "@/components/chat/ConversationList";
import ConversationDetail from "@/components/chat/ConversationDetail";
import MessageInput from "@/components/chat/MessageInput";
import { useChat } from "@/hooks/useChat";

const Chat: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages.length]);

  const selectConversation = (conv: Conversation) => {
    if (activeConversation?.id === conv.id) return;
    setActiveConversation(conv);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleSendMessage = async (msg: string) => {
    if (!activeConversation) {
      const newConv = createNewConversation();
      if (newConv) {
        setActiveConversation(newConv);
        const res = await sendMessage(msg);
        if (res) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      const res = await sendMessage(msg);
      if (res) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow flex flex-col">
        <div className="p-4 bg-[#2B577A] text-white">Conversaciones</div>
        <div className="flex-1 overflow-auto">
          <ConversationList
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={selectConversation}
            onDeleteConversation={(e, id) => {
              e.stopPropagation();
              deleteConversation(id);
            }}
          />
        </div>
        <div className="p-4 border-t">
          <Button
            onClick={createNewConversation}
            className="w-full bg-[#2B577A] text-white"
          >
            <Plus className="mr-2" /> Nueva conversación
          </Button>
        </div>
      </div>

      {/* Chat pane */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="p-4 bg-white shadow">
          <h2 className="font-bold">
            {activeConversation?.title || "Selecciona una conversación"}
          </h2>
        </div>
        {activeConversation ? (
          <>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <ConversationDetail conversation={activeConversation} />
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <MessageSquare size={48} className="mb-4" />
            <div>
              <p className="mb-4">Selecciona o crea una conversación</p>
              <Button
                onClick={createNewConversation}
                className="bg-[#2B577A] text-white"
              >
                <Plus className="mr-2" /> Nueva conversación
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
