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
  FirestoreError,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { handleError, AppError } from "@/lib/error-handler";

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

export class ChatServiceError extends Error implements AppError {
  code?: string;
  status?: number;
  details?: string;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = "ChatServiceError";
    this.code = code;
    this.status = status;
  }
}

export const chatService = {
  async getConversations(
    userId: string,
    role: string = "User"
  ): Promise<Conversation[]> {
    try {
      const conversationsRef = collection(db, "conversations");
      const q = query(conversationsRef, where("userId", "==", userId));

      const querySnapshot = await getDocs(q);
      let conversations = querySnapshot.docs.map((doc) => {
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

      // Filtrar conversaciones por tiempo de creación (solo últimas 24h) ÚNICAMENTE para usuarios normales
      if (role === "User") {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1); // 24 horas atrás

        conversations = conversations.filter(
          (conv) => conv.createdAt && conv.createdAt > yesterday
        );
      }
      // Los Admin y SuperAdmin ven todas las conversaciones sin filtro de tiempo

      // Ordenar las conversaciones por fecha del último mensaje
      conversations.sort(
        (a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime()
      );

      return conversations;
    } catch (error) {
      const firestoreError = error as FirestoreError;
      const serviceError = new ChatServiceError(
        "Error al obtener conversaciones",
        firestoreError.code,
        500
      );
      handleError(serviceError);
      throw serviceError;
    }
  },

  async getAllConversations(): Promise<Conversation[]> {
    try {
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

      return conversations;
    } catch (error) {
      const firestoreError = error as FirestoreError;
      const serviceError = new ChatServiceError(
        "Error al obtener todas las conversaciones",
        firestoreError.code,
        500
      );
      handleError(serviceError);
      throw serviceError;
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
      const firestoreError = error as FirestoreError;
      const serviceError = new ChatServiceError(
        "Error al obtener conversación",
        firestoreError.code,
        500
      );
      handleError(serviceError);
      throw serviceError;
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
      const firestoreError = error as FirestoreError;
      const serviceError = new ChatServiceError(
        "Error al crear conversación",
        firestoreError.code,
        500
      );
      handleError(serviceError);
      throw serviceError;
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
      const firestoreError = error as FirestoreError;
      const serviceError = new ChatServiceError(
        "Error al actualizar título de conversación",
        firestoreError.code,
        500
      );
      handleError(serviceError);
      throw serviceError;
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
        throw new ChatServiceError(
          "Conversación no encontrada",
          "not_found",
          404
        );
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
      if (error instanceof ChatServiceError) {
        handleError(error);
        throw error;
      }

      const firestoreError = error as FirestoreError;
      const serviceError = new ChatServiceError(
        "Error al agregar mensaje",
        firestoreError.code,
        500
      );
      handleError(serviceError);
      throw serviceError;
    }
  },

  async sendBotResponse(conversationId: string): Promise<Conversation | null> {
    try {
      // Obtener la conversación actual
      const conversationRef = doc(db, "conversations", conversationId);
      const conversationDoc = await getDoc(conversationRef);

      if (!conversationDoc.exists()) {
        throw new ChatServiceError(
          "Conversación no encontrada",
          "not_found",
          404
        );
      }

      // Obtener un chiste de la API
      let botText = "Lo siento, no pude obtener una respuesta en este momento.";
      try {
        const res = await fetch("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new ChatServiceError(
            "Error al obtener respuesta del servidor externo",
            "external_api_error",
            res.status
          );
        }

        const data = await res.json();
        if (data && data.joke) {
          botText = data.joke;
        }
      } catch (jokeError) {
        // Solo registramos el error, pero continuamos con una respuesta predeterminada
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
      if (error instanceof ChatServiceError) {
        handleError(error);
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      const serviceError = new ChatServiceError(
        "Error al enviar respuesta del bot: " + errorMessage,
        "bot_response_error",
        500
      );
      handleError(serviceError);
      throw serviceError;
    }
  },

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      await deleteDoc(conversationRef);
    } catch (error) {
      const firestoreError = error as FirestoreError;
      const serviceError = new ChatServiceError(
        "Error al eliminar conversación",
        firestoreError.code,
        500
      );
      handleError(serviceError);
      throw serviceError;
    }
  },
};
