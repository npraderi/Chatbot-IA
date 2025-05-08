import React from "react";
import { Conversation } from "@/services/chatService";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ConversationDetailProps {
  conversation: Conversation | null;
}

const ConversationDetail: React.FC<ConversationDetailProps> = ({
  conversation,
}) => {
  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 ">
        Selecciona una conversación para ver su historial
      </div>
    );
  }

  // Función para asegurar que la fecha sea válida
  const ensureValidDate = (date: Date | string | number | undefined): Date => {
    if (!date) return new Date();

    if (date instanceof Date) {
      return isNaN(date.getTime()) ? new Date() : date;
    }

    // Si es un timestamp numérico
    if (typeof date === "number") {
      return new Date(date);
    }

    // Si es un string, intentar convertirlo
    try {
      const parsed = new Date(date);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    } catch (e) {
      console.error("Error al parsear fecha:", e);
      return new Date();
    }
  };

  return (
    <div className="space-y-4">
      {conversation.messages &&
        conversation.messages.map((message) => (
          <div
            key={`${message.id}-${message.timestamp?.toString() || Date.now()}`}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.isUser
                  ? "bg-[#2B577A] text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.isUser ? "text-gray-200" : "text-gray-500"
                }`}
              >
                {format(ensureValidDate(message.timestamp), "Pp", {
                  locale: es,
                })}
              </p>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ConversationDetail;
