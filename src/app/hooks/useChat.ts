"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { chatService, Conversation, Message } from "../services/chatService";
import { User } from "../services/authService";
import { toast } from "sonner";

export const useChat = (currentUser: User | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBotResponding, setIsBotResponding] = useState(false);

  // Usar useRef para evitar múltiples llamadas simultáneas
  const loadingRef = useRef(false);

  // Carga las conversaciones del usuario actual
  const loadConversations = useCallback(async () => {
    // Evitar múltiples llamadas simultáneas
    if (!currentUser?.id || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      console.log("Cargando conversaciones para usuario:", currentUser.id);
      const convs = await chatService
        .getConversations(currentUser.id)
        .catch((err) => {
          console.error("Error en getConversations:", err);
          return [] as Conversation[];
        });

      // Validar que convs es un array
      if (!Array.isArray(convs)) {
        console.error("getConversations no devolvió un array:", convs);
        setConversations([]);
      } else {
        setConversations(convs);

        // Solo establecemos la conversación activa si no hay una seleccionada
        // y si hay conversaciones disponibles
        if (!activeConversation && convs.length > 0) {
          setActiveConversation(convs[0]);
        }
      }

      setIsInitialized(true);
    } catch (error) {
      console.error("Error al cargar conversaciones:", error);
      toast.error("Error al cargar las conversaciones");
      setConversations([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [currentUser?.id, activeConversation]);

  // Cargar conversaciones cuando cambia el usuario
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (currentUser?.id) {
        await loadConversations();
      } else if (isMounted) {
        // Limpiar el estado si no hay usuario
        setConversations([]);
        setActiveConversation(null);
        setIsInitialized(false);
      }
    };

    load();

    // Cleanup para evitar actualizar estado en componentes desmontados
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, loadConversations]);

  // Crear una nueva conversación
  const createNewConversation = useCallback(async () => {
    if (!currentUser?.id || loadingRef.current) {
      if (!currentUser?.id) {
        toast.error("Debes iniciar sesión para crear una conversación");
      }
      return null;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      const newConv = await chatService.createConversation(currentUser.id);

      if (!newConv || !newConv.id) {
        console.error(
          "createConversation devolvió un objeto inválido:",
          newConv
        );
        toast.error("Error al crear conversación: datos inválidos");
        return null;
      }

      // Actualizar el estado con la nueva conversación
      setConversations((prevConversations) => [newConv, ...prevConversations]);
      setActiveConversation(newConv);

      return newConv;
    } catch (error) {
      console.error("Error al crear conversación:", error);
      toast.error("Error al crear conversación");
      return null;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [currentUser?.id]);

  // Eliminar una conversación
  const deleteConversation = useCallback(
    async (id: string) => {
      if (!id || !currentUser?.id || loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        await chatService.deleteConversation(id);

        // Actualizar el estado eliminando la conversación
        const updatedConversations = conversations.filter(
          (conv) => conv.id !== id
        );
        setConversations(updatedConversations);

        // Si la conversación activa es la que eliminamos, seleccionar otra
        if (activeConversation?.id === id) {
          const firstAvailableConversation = updatedConversations[0] || null;
          setActiveConversation(firstAvailableConversation);
        }

        toast.success("Conversación eliminada");
      } catch (error) {
        console.error("Error al eliminar conversación:", error);
        toast.error("Error al eliminar conversación");
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [currentUser?.id, activeConversation?.id, conversations]
  );

  // Enviar un mensaje en la conversación activa
  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      if (!currentUser?.id || !activeConversation?.id || !text.trim()) {
        if (!text.trim()) {
          toast.error("El mensaje no puede estar vacío");
        }
        if (!currentUser?.id) {
          toast.error("Debes iniciar sesión para enviar mensajes");
        }
        if (!activeConversation?.id) {
          toast.error("Selecciona una conversación");
        }
        return false;
      }

      const messageText = text.trim();

      try {
        const userName = currentUser?.name || "Usuario";

        const newMessage: Message = {
          id: `temp-${Date.now()}`,
          content: messageText,
          timestamp: new Date(),
          userId: currentUser.id,
          userName: userName,
          isUser: true,
        };

        // Actualizar la UI inmediatamente con el mensaje del usuario
        const updatedConversation = {
          ...activeConversation,
          messages: [...activeConversation.messages, newMessage],
          lastMessageDate: new Date(),
        };

        setActiveConversation(updatedConversation);
        setConversations((prevConversations) => [
          updatedConversation,
          ...prevConversations.filter(
            (conv) => conv.id !== updatedConversation.id
          ),
        ]);

        // Indicar que el bot está respondiendo
        setIsBotResponding(true);

        // Enviar el mensaje al backend en segundo plano
        try {
          await chatService.addMessage(activeConversation.id, {
            content: messageText,
            timestamp: new Date(),
            userId: currentUser.id,
            userName: userName,
            isUser: true,
          });

          // Obtener respuesta del bot
          const conversationWithBotResponse = await chatService.sendBotResponse(
            activeConversation.id
          );

          if (conversationWithBotResponse) {
            setActiveConversation(conversationWithBotResponse);
            setConversations((prevConversations) => [
              conversationWithBotResponse,
              ...prevConversations.filter(
                (conv) => conv.id !== conversationWithBotResponse.id
              ),
            ]);
          }
        } catch (error) {
          console.error("Error al procesar mensaje:", error);
          toast.error("Error al procesar el mensaje");
        } finally {
          setIsBotResponding(false);
        }

        return true;
      } catch (error) {
        console.error("Error al enviar mensaje:", error);
        toast.error("Error al enviar mensaje");
        return false;
      }
    },
    [currentUser?.id, currentUser?.name, activeConversation]
  );

  return {
    conversations,
    activeConversation,
    loading,
    isInitialized,
    isBotResponding,
    setActiveConversation,
    createNewConversation,
    deleteConversation,
    sendMessage,
    loadConversations,
  };
};
