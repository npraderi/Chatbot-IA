import React from "react";
import { Conversation } from "@/services/chatService";
import { MessageSquare, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  currentUserId: string;
  isAdmin: boolean;
  userRole: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  userRole,
}) => {
  const formatDate = (date: Date) => {
    return format(date, "Pp", { locale: es });
  };

  const getExpirationDate = (createdAt: Date) => {
    return addDays(new Date(createdAt), 1);
  };

  return (
    <ScrollArea className="h-full w-full ">
      <div className="py-2">
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={`p-3 text-gray-500 border-b cursor-pointer flex justify-between items-center ${
                activeConversation?.id === conv.id
                  ? "bg-[#BED1E0]/30"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center flex-grow text-gray-500">
                <div className="w-10 h-10 rounded-full bg-[#2B577A] flex items-center justify-center ">
                  <MessageSquare size={18} className="text-white" />
                </div>
                <div className="ml-3 flex-grow">
                  <div className="font-medium truncate max-w-[180px]">
                    {conv.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-[180px]">
                    {conv.messages.length > 0
                      ? conv.messages[conv.messages.length - 1].content
                      : "Sin mensajes"}
                  </div>
                  {userRole === "User" && (
                    <div className="text-xs text-gray-400 flex items-center mt-1">
                      <Clock size={12} className="mr-1" />
                      <span>
                        Se eliminará el{" "}
                        {formatDate(getExpirationDate(conv.createdAt))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500  flex-nowrap w-12 mr-6">
                  {formatDate(new Date(conv.lastMessageDate))}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No hay conversaciones. ¡Crea una nueva!
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ConversationList;
