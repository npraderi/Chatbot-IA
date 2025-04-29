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

const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;

const STORAGE_KEY = (userId: string) => `conversations_${userId}`;

export const chatService = {
  getConversations(userId: string): Conversation[] {
    const json = localStorage.getItem(STORAGE_KEY(userId));
    return json ? JSON.parse(json) : [];
  },

  saveConversations(userId: string, convs: Conversation[]) {
    localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(convs));
  },

  createConversation(userId: string, title: string): Conversation {
    const convs = this.getConversations(userId);
    const newConv: Conversation = {
      id: generateId(),
      title: title || `Conversación ${convs.length + 1}`,
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
    convs.unshift(newConv);
    this.saveConversations(userId, convs);
    return newConv;
  },

  sendUserMessage(
    userId: string,
    conversationId: string,
    content: string
  ): { conversation: Conversation; message: Message } {
    const convs = this.getConversations(userId);
    const idx = convs.findIndex((c) => c.id === conversationId);
    if (idx === -1) throw new Error("Conversación no encontrada");

    const userMsg: Message = {
      id: generateId(),
      content,
      timestamp: Date.now(),
      senderId: userId,
      isUser: true,
    };
    convs[idx].messages.push(userMsg);
    convs[idx].lastMessageDate = userMsg.timestamp;
    convs.sort((a, b) => b.lastMessageDate - a.lastMessageDate);
    this.saveConversations(userId, convs);

    return { conversation: convs[idx], message: userMsg };
  },

  async sendBotResponse(
    userId: string,
    conversationId: string
  ): Promise<Conversation> {
    const convs = this.getConversations(userId);
    const idx = convs.findIndex((c) => c.id === conversationId);
    if (idx === -1) throw new Error("Conversación no encontrada");

    let botText: string;
    try {
      const res = await fetch("https://icanhazdadjoke.com/", {
        headers: { Accept: "application/json" },
      });
      const { joke } = await res.json();
      botText = joke;
    } catch {
      botText = "Oops, no pude conseguir una broma 😅";
    }

    const botMsg: Message = {
      id: generateId(),
      content: botText,
      timestamp: Date.now(),
      senderId: "bot",
      isUser: false,
    };
    convs[idx].messages.push(botMsg);
    convs[idx].lastMessageDate = botMsg.timestamp;
    convs.sort((a, b) => b.lastMessageDate - a.lastMessageDate);
    this.saveConversations(userId, convs);

    return convs[idx];
  },

  deleteConversation(userId: string, conversationId: string): void {
    const convs = this.getConversations(userId).filter(
      (c) => c.id !== conversationId
    );
    this.saveConversations(userId, convs);
  },
};
