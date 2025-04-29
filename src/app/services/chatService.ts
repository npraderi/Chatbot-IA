export interface Message {
  id: string;
  content: string;
  timestamp: number;
  senderId: string;
  isUser: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastMessageDate: number;
  userName: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// Respuestas predefinidas del chatbot
const BOT_RESPONSES = [
  "¿En qué puedo ayudarte hoy?",
  "Gracias por tu mensaje. Estoy procesando tu solicitud.",
  "Entiendo lo que necesitas. ¿Hay algo más en lo que pueda ayudarte?",
  "Estoy aquí para asistirte con cualquier consulta que tengas.",
  "Por favor, dame más detalles sobre tu consulta.",
  "Estoy verificando esa información para ti.",
  "¿Necesitas alguna otra información?",
  "Comprendo tu situación. Vamos a resolverla juntos.",
  "Esta es una respuesta simulada. En la integración real, aquí iría la respuesta del chatbot.",
];

// Servicio para gestionar las conversaciones
export const chatService = {
  getConversations: (userId: string): Conversation[] => {
    const key = `conversations_${userId}`;
    const conversationsJson = localStorage.getItem(key);

    if (!conversationsJson) {
      return [];
    }

    return JSON.parse(conversationsJson);
  },

  createConversation: (userId: string, title: string): Conversation => {
    const conversations = chatService.getConversations(userId);

    const newConversation: Conversation = {
      id: generateId(),
      title: title || `Conversación ${conversations.length + 1}`,
      messages: [
        {
          id: generateId(),
          content: "¡Hola! ¿En qué puedo ayudarte hoy?",
          timestamp: Date.now(),
          senderId: "bot",
          isUser: false,
        },
      ],
      lastMessageDate: Date.now(),
      userName: "",
    };

    conversations.unshift(newConversation);
    localStorage.setItem(
      `conversations_${userId}`,
      JSON.stringify(conversations)
    );

    return newConversation;
  },

  getConversation: (
    userId: string,
    conversationId: string
  ): Conversation | null => {
    const conversations = chatService.getConversations(userId);
    return conversations.find((conv) => conv.id === conversationId) || null;
  },

  sendMessage: (
    userId: string,
    conversationId: string,
    content: string
  ): { conversation: Conversation; message: Message } => {
    const conversations = chatService.getConversations(userId);
    const conversationIndex = conversations.findIndex(
      (conv) => conv.id === conversationId
    );

    if (conversationIndex === -1) {
      throw new Error("Conversación no encontrada");
    }

    const userMessage: Message = {
      id: generateId(),
      content,
      timestamp: Date.now(),
      senderId: userId,
      isUser: true,
    };

    // Añadir el mensaje del usuario a la conversación
    conversations[conversationIndex].messages.push(userMessage);
    conversations[conversationIndex].lastMessageDate = userMessage.timestamp;

    // Simular respuesta del bot
    setTimeout(() => {
      const botResponse: Message = {
        id: generateId(),
        content:
          BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)],
        timestamp: Date.now(),
        senderId: "bot",
        isUser: false,
      };

      const currentConversations = chatService.getConversations(userId);
      const currentIndex = currentConversations.findIndex(
        (conv) => conv.id === conversationId
      );

      if (currentIndex !== -1) {
        currentConversations[currentIndex].messages.push(botResponse);
        currentConversations[currentIndex].lastMessageDate =
          botResponse.timestamp;
        localStorage.setItem(
          `conversations_${userId}`,
          JSON.stringify(currentConversations)
        );
      }
    }, 1000);

    // Reordenar conversaciones por fecha
    conversations.sort((a, b) => b.lastMessageDate - a.lastMessageDate);

    localStorage.setItem(
      `conversations_${userId}`,
      JSON.stringify(conversations)
    );

    return {
      conversation: conversations[conversationIndex],
      message: userMessage,
    };
  },

  deleteConversation: (userId: string, conversationId: string): void => {
    const conversations = chatService.getConversations(userId);
    const filteredConversations = conversations.filter(
      (conv) => conv.id !== conversationId
    );

    localStorage.setItem(
      `conversations_${userId}`,
      JSON.stringify(filteredConversations)
    );
  },
};
