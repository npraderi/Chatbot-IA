"use client";
import { useState, useEffect, useCallback } from "react";
import { chatService, Conversation } from "../services/chatService";
import { User } from "../services/authService";
import { toast } from "sonner";

export const useChat = (currentUser: User | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  const loadConversations = useCallback(() => {
    if (!currentUser) return;
    try {
      const convs = chatService.getConversations(currentUser.id);
      setConversations(convs);
      if (!activeConversation && convs.length) {
        setActiveConversation(convs[0]);
      }
    } catch {
      toast.error("Error al cargar las conversaciones");
    }
  }, [currentUser, activeConversation]);

  useEffect(() => {
    loadConversations();
  }, [currentUser, loadConversations]);

  const createNewConversation = useCallback(() => {
    if (!currentUser) return null;
    try {
      const newConv = chatService.createConversation(
        currentUser.id,
        `Conversación ${conversations.length + 1}`
      );
      setConversations((c) => [newConv, ...c]);
      setActiveConversation(newConv);
      return newConv;
    } catch {
      toast.error("Error al crear conversación");
      return null;
    }
  }, [currentUser, conversations.length]);

  const deleteConversation = useCallback(
    (id: string) => {
      if (!currentUser) return;
      try {
        chatService.deleteConversation(currentUser.id, id);
        setConversations((c) => c.filter((x) => x.id !== id));
        if (activeConversation?.id === id) {
          setActiveConversation(conversations[0] || null);
        }
        toast.success("Conversación eliminada");
      } catch {
        toast.error("Error al eliminar conversación");
      }
    },
    [currentUser, activeConversation, conversations]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!currentUser || !activeConversation || !text.trim()) return null;
      try {
        // 1) Envía y renderiza YA el mensaje del usuario
        const { conversation: convAfterUser } = chatService.sendUserMessage(
          currentUser.id,
          activeConversation.id,
          text.trim()
        );
        setActiveConversation(convAfterUser);
        setConversations((c) => [
          convAfterUser,
          ...c.filter((x) => x.id !== convAfterUser.id),
        ]);

        // 2) Luego pide broma y la añade
        const convWithBot = await chatService.sendBotResponse(
          currentUser.id,
          activeConversation.id
        );
        setActiveConversation(convWithBot);
        setConversations((c) => [
          convWithBot,
          ...c.filter((x) => x.id !== convWithBot.id),
        ]);

        return { conversation: convWithBot };
      } catch {
        toast.error("Error al enviar mensaje");
        return null;
      }
    },
    [currentUser, activeConversation]
  );

  return {
    conversations,
    activeConversation,
    setActiveConversation,
    createNewConversation,
    deleteConversation,
    sendMessage,
  };
};
