"use client";
import { useState, useEffect, useCallback } from "react";
import { chatService, Conversation } from "../services/chatService";
import { User } from "../services/authService";
import { toast } from "sonner";

export const useChat = (currentUser: User | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  // Usar useCallback para las funciones que dependen de currentUser
  const loadConversations = useCallback(() => {
    if (!currentUser) return;

    try {
      const userConversations = chatService.getConversations(currentUser.id);
      setConversations(userConversations);

      // Solo establecer la conversación activa si no hay una activa y hay conversaciones
      if (userConversations.length > 0 && !activeConversation) {
        setActiveConversation(userConversations[0]);
      }
    } catch (error) {
      toast.error("Error al cargar las conversaciones");
    }
  }, [currentUser, activeConversation]);

  // Usar useEffect con dependencia en currentUser
  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser, loadConversations]);

  const createNewConversation = useCallback(() => {
    if (!currentUser) return null;

    try {
      const newConversation = chatService.createConversation(
        currentUser.id,
        `Conversación ${conversations.length + 1}`
      );

      setConversations((prevConversations) => [
        newConversation,
        ...prevConversations,
      ]);
      setActiveConversation(newConversation);
      return newConversation;
    } catch (error) {
      toast.error("Error al crear nueva conversación");
      return null;
    }
  }, [currentUser, conversations.length]);

  const deleteConversation = useCallback(
    (conversationId: string) => {
      if (!currentUser) return;

      try {
        chatService.deleteConversation(currentUser.id, conversationId);

        setConversations((prevConversations) => {
          const updatedConversations = prevConversations.filter(
            (conv) => conv.id !== conversationId
          );

          if (activeConversation?.id === conversationId) {
            setActiveConversation(
              updatedConversations.length > 0 ? updatedConversations[0] : null
            );
          }

          return updatedConversations;
        });

        toast.success("Conversación eliminada");
      } catch (error) {
        toast.error("Error al eliminar la conversación");
      }
    },
    [currentUser, activeConversation]
  );

  const sendMessage = useCallback(
    (message: string) => {
      if (!currentUser || !activeConversation || !message.trim()) {
        return null;
      }

      try {
        // Usamos el ID de la conversación activa actual
        const result = chatService.sendMessage(
          currentUser.id,
          activeConversation.id,
          message.trim()
        );

        // Actualizamos la conversación activa con la respuesta
        setActiveConversation(result.conversation);

        // Actualizamos solo la conversación actual en la lista usando una función de actualización
        setConversations((prevConversations) => {
          const updatedConversations = prevConversations.map((conv) => {
            if (conv.id === activeConversation.id) {
              return result.conversation;
            }
            return conv;
          });

          // Reordenamos las conversaciones por fecha
          return [...updatedConversations].sort(
            (a, b) => b.lastMessageDate - a.lastMessageDate
          );
        });

        return result;
      } catch (error) {
        toast.error("Error al enviar el mensaje");
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
