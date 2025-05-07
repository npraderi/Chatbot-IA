import React from "react";
import { Conversation } from "@/services/chatService";
import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation: (e: React.MouseEvent, conversationId: string) => void;
  currentUserId: string;
  isAdmin: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onDeleteConversation,
  currentUserId,
  isAdmin,
}) => {
  const formatDate = (date: Date) => {
    return format(date, "Pp", { locale: es });
  };

  return (
    <ScrollArea className="h-full w-full">
      <div className="py-2">
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={`p-3 border-b cursor-pointer flex justify-between items-center ${
                activeConversation?.id === conv.id
                  ? "bg-[#BED1E0]/30"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center flex-grow">
                <div className="w-10 h-10 rounded-full bg-[#2B577A] flex items-center justify-center">
                  <MessageSquare size={18} className="text-white" />
                </div>
                <div className="ml-3 flex-grow">
                  <div className="font-medium">{conv.title}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[180px]">
                    {conv.messages.length > 0
                      ? conv.messages[conv.messages.length - 1].content
                      : "Nueva conversación"}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 mb-1">
                  {formatDate(new Date(conv.lastMessageDate))}
                </span>
                {(isAdmin || conv.userId === currentUserId) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                    onClick={(e) => onDeleteConversation(e, conv.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
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
