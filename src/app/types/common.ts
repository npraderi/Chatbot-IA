export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "User";
  fullName?: string;
}

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
  userId: string;
  createdAt: number;
}

export type UserRole = "Admin" | "User";
