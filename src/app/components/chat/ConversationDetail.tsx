
import { Conversation } from '@/services/chatService';
import { MessageSquare } from 'lucide-react';
import Message from './Message';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConversationDetailProps {
  conversation: Conversation | null;
}

const ConversationDetail = ({ conversation }: ConversationDetailProps) => {
  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
        <div className="text-center">
          <MessageSquare className="mx-auto mb-3 h-14 w-14 text-azul-principal opacity-50" />
          <p className="text-lg">Selecciona una conversación para ver su historial</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
      <div className="p-4 border-b bg-azul-principal text-white">
        <h3 className="font-bold text-lg">
          {conversation.title} - {conversation.userName}
        </h3>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {conversation.messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationDetail;
