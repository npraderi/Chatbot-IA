"use client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  userId: string;
  userName: string;
  isUser: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  lastMessageDate: Date;
  createdAt: Date;
}

export const chatService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      console.log("Obteniendo conversaciones para usuario:", userId);
      const conversationsRef = collection(db, "conversations");
      const q = query(conversationsRef, where("userId", "==", userId));

      const querySnapshot = await getDocs(q);
      const conversations = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title || `Conversación ${doc.id}`,
          messages: data.messages || [],
          lastMessageDate:
            data.lastMessageDate instanceof Timestamp
              ? data.lastMessageDate.toDate()
              : new Date(data.lastMessageDate),
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate()
              : new Date(data.createdAt),
        };
      });

      // Ordenar las conversaciones por fecha del último mensaje
      conversations.sort(
        (a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime()
      );

      console.log("Conversaciones obtenidas:", conversations);
      return conversations;
    } catch (error) {
      console.error("Error al obtener conversaciones:", error);
      throw error;
    }
  },

  async getAllConversations(): Promise<Conversation[]> {
    try {
      console.log("Obteniendo todas las conversaciones");
      const conversationsRef = collection(db, "conversations");
      const querySnapshot = await getDocs(conversationsRef);

      const conversations = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title || `Conversación ${doc.id}`,
          messages: data.messages || [],
          lastMessageDate:
            data.lastMessageDate instanceof Timestamp
              ? data.lastMessageDate.toDate()
              : new Date(data.lastMessageDate),
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate()
              : new Date(data.createdAt),
        };
      });

      // Ordenar las conversaciones por fecha del último mensaje
      conversations.sort(
        (a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime()
      );

      console.log("Todas las conversaciones obtenidas:", conversations);
      return conversations;
    } catch (error) {
      console.error("Error al obtener todas las conversaciones:", error);
      throw error;
    }
  },

  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      const conversationDoc = await getDoc(conversationRef);

      if (!conversationDoc.exists()) {
        return null;
      }

      const data = conversationDoc.data();
      return {
        id: conversationDoc.id,
        userId: data.userId,
        title: data.title || `Conversación ${conversationDoc.id}`,
        messages: data.messages || [],
        lastMessageDate:
          data.lastMessageDate instanceof Timestamp
            ? data.lastMessageDate.toDate()
            : new Date(data.lastMessageDate),
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date(data.createdAt),
      };
    } catch (error) {
      console.error("Error al obtener conversación:", error);
      throw error;
    }
  },

  async createConversation(userId: string): Promise<Conversation> {
    try {
      const conversationsRef = collection(db, "conversations");
      const newConversationRef = doc(conversationsRef);
      const now = new Date();

      const newConversation: Conversation = {
        id: newConversationRef.id,
        userId,
        title: `Conversación ${newConversationRef.id}`,
        messages: [],
        lastMessageDate: now,
        createdAt: now,
      };

      await setDoc(newConversationRef, {
        ...newConversation,
        lastMessageDate: Timestamp.fromDate(now),
        createdAt: Timestamp.fromDate(now),
      });

      return newConversation;
    } catch (error) {
      console.error("Error al crear conversación:", error);
      throw error;
    }
  },

  async updateConversationTitle(
    conversationId: string,
    newTitle: string
  ): Promise<void> {
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      await updateDoc(conversationRef, {
        title: newTitle,
      });
    } catch (error) {
      console.error("Error al actualizar título de conversación:", error);
      throw error;
    }
  },

  async addMessage(
    conversationId: string,
    message: Omit<Message, "id">
  ): Promise<void> {
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      const conversationDoc = await getDoc(conversationRef);

      if (!conversationDoc.exists()) {
        throw new Error("Conversación no encontrada");
      }

      const data = conversationDoc.data();
      const messages = data.messages || [];
      const newMessage = {
        ...message,
        id: Date.now().toString(),
        isUser: true,
      };

      messages.push(newMessage);

      await updateDoc(conversationRef, {
        messages,
        lastMessageDate: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error("Error al agregar mensaje:", error);
      throw error;
    }
  },

  async sendBotResponse(conversationId: string): Promise<Conversation | null> {
    try {
      // Obtener la conversación actual
      const conversationRef = doc(db, "conversations", conversationId);
      const conversationDoc = await getDoc(conversationRef);

      if (!conversationDoc.exists()) {
        throw new Error("Conversación no encontrada");
      }

      // Obtener un chiste de la API
      let botText = "Lo siento, no pude obtener una respuesta en este momento.";
      try {
        const res = await fetch("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" },
        });
        const data = await res.json();
        if (data && data.joke) {
          botText = data.joke;
        }
      } catch (jokeError) {
        console.error("Error al obtener chiste:", jokeError);
      }

      // Crear el mensaje del bot
      const data = conversationDoc.data();
      const messages = data.messages || [];
      const now = new Date();

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: botText,
        timestamp: now,
        userId: "bot",
        userName: "Chatbot",
        isUser: false,
      };

      // Añadir el mensaje a la conversación
      messages.push(botMessage);

      // Actualizar la conversación en Firestore
      await updateDoc(conversationRef, {
        messages,
        lastMessageDate: Timestamp.fromDate(now),
      });

      // Devolver la conversación actualizada
      return this.getConversation(conversationId);
    } catch (error) {
      console.error("Error al enviar respuesta del bot:", error);
      throw error;
    }
  },

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      await deleteDoc(conversationRef);
    } catch (error) {
      console.error("Error al eliminar conversación:", error);
      throw error;
    }
  },
};
