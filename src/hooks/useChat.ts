import { useState, useCallback, useEffect } from "react";
import { Conversation, chatService } from "@/services/chatService";
import { User } from "@/services/authService";
import { toast } from "sonner";

export const useChat = (currentUser: User | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    try {
      const loadedConversations =
        currentUser.role === "Admin"
          ? await chatService.getAllConversations()
          : await chatService.getConversations(currentUser.id);
      setConversations(loadedConversations);
    } catch (error) {
      console.error("Error al cargar conversaciones:", error);
      toast.error("Error al cargar conversaciones");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const createNewConversation = useCallback(async () => {
    if (!currentUser) return null;
    try {
      const newConversation = await chatService.createConversation(
        currentUser.id
      );
      setConversations((prev) => [newConversation, ...prev]);
      return newConversation;
    } catch (error) {
      console.error("Error al crear conversación:", error);
      toast.error("Error al crear conversación");
      return null;
    }
  }, [currentUser]);

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        await chatService.deleteConversation(conversationId);
        setConversations((prev) =>
          prev.filter((conv) => conv.id !== conversationId)
        );
        if (activeConversation?.id === conversationId) {
          setActiveConversation(null);
        }
        toast.success("Conversación eliminada");
      } catch (error) {
        console.error("Error al eliminar conversación:", error);
        toast.error("Error al eliminar conversación");
      }
    },
    [activeConversation]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentUser || !activeConversation) return false;

      try {
        const message = {
          content,
          userId: currentUser.id,
          userName: currentUser.name,
          timestamp: new Date(),
          isUser: true,
        };

        await chatService.addMessage(activeConversation.id, message);
        await loadConversations();
        return true;
      } catch (error) {
        console.error("Error al enviar mensaje:", error);
        toast.error("Error al enviar mensaje");
        return false;
      }
    },
    [currentUser, activeConversation, loadConversations]
  );

  return {
    conversations,
    activeConversation,
    setActiveConversation,
    createNewConversation,
    deleteConversation,
    sendMessage,
    loading,
  };
};
