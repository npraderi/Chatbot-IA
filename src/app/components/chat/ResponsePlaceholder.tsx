import { cn } from "@/lib/utils";

interface ResponsePlaceholderProps {
  className?: string;
}

export const ResponsePlaceholder = ({
  className,
}: ResponsePlaceholderProps) => {
  return (
    <div className={cn("flex items-start space-x-3", className)}>
      <div className="w-8 h-8 rounded-full bg-[#2B577A] flex items-center justify-center text-white font-bold">
        B
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-[#2B577A]">Chatbot</span>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
        <p className="text-sm text-gray-500 animate-pulse">
          Analizando documentación...
        </p>
      </div>
    </div>
  );
};
