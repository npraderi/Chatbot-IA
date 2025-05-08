import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<boolean>;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      const success = await onSendMessage(message.trim());
      if (success) {
        setMessage("");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 border-t flex items-end gap-2 mt-auto"
    >
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Escribe un mensaje..."
        className="flex-grow min-h-[50px] bg-white text-gray-500 max-h-[150px] resize-none rounded-lg border-gray-300 "
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        disabled={isSending}
      />
      <Button
        type="submit"
        disabled={!message.trim() || isSending}
        className="bg-[#2B577A] hover:bg-[#2B577A]/90 text-white h-[50px] disabled:opacity-50"
      >
        <Send size={20} />
      </Button>
    </form>
  );
};

export default MessageInput;
