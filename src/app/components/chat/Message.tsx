import { Message as MessageType } from "@/services/chatService";

interface MessageProps {
  message: MessageType;
}

const Message = ({ message }: MessageProps) => {
  return (
    <div
      className={`flex ${
        message.isUser ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
          message.isUser
            ? "bg-[#2B577A] text-white"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        <div className="text-sm">{message.content}</div>
        <div
          className={`text-xs  text-right mt-1 ${
            message.isUser ? "text-[#BED1E0]" : "text-gray-500"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

export default Message;
