import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
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
        className="flex-grow min-h-[50px] max-h-[150px] resize-none rounded-lg border-gray-300 focus:border-[#2B577A] focus:ring-1 focus:ring-[#2B577A]"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (message.trim()) {
              handleSubmit(e);
            }
          }
        }}
      />
      <Button
        type="submit"
        disabled={!message.trim()}
        className="bg-[#2B577A] hover:bg-[#2B577A]/90 text-white h-[50px] disabled:opacity-50"
      >
        <Send size={20} />
      </Button>
    </form>
  );
};

export default MessageInput;
