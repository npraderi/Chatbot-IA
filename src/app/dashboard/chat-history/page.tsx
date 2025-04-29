"use client";
import React, { useState, useEffect } from "react";
import { Conversation } from "@/services/chatService";
import { DateRange } from "react-day-picker";
import ConversationList from "@/components/chat/ConversationList";
import ConversationFilters from "@/components/chat/ConversationFilters";
import ConversationDetail from "@/components/chat/ConversationDetail";
import { toast } from "sonner";

export default function ChatHistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [open, setOpen] = useState(false);

  const mockUsers = [
    { id: "1", name: "Juan Pérez" },
    { id: "2", name: "María González" },
    { id: "3", name: "Carlos Rodríguez" },
    { id: "4", name: "Ana López" },
    { id: "5", name: "Pedro Martínez" },
    { id: "6", name: "Laura García" },
    { id: "7", name: "Miguel Fernández" },
    { id: "8", name: "Sofía Martín" },
    { id: "9", name: "Javier Gutiérrez" },
    { id: "10", name: "Carmen López" },
    { id: "11", name: "Pablo Sánchez" },
    { id: "12", name: "Elena Díaz" },
  ];

  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: "1",
        title: "Consulta sobre facturación",
        userName: "Juan Pérez",
        lastMessageDate: new Date("2024-04-26T10:30:00").getTime(),
        messages: [
          {
            id: "1",
            content: "¿Cómo puedo obtener mi factura del mes pasado?",
            timestamp: new Date("2024-04-26T10:30:00").getTime(),
            senderId: "user1",
            isUser: true,
          },
          {
            id: "2",
            content:
              'Puedes descargar tu factura desde la sección "Mis Facturas" en tu perfil.',
            timestamp: new Date("2024-04-26T10:31:00").getTime(),
            senderId: "bot",
            isUser: false,
          },
        ],
      },
      {
        id: "2",
        title: "Soporte técnico",
        userName: "María González",
        lastMessageDate: new Date("2024-04-25T15:45:00").getTime(),
        messages: [
          {
            id: "3",
            content: "Mi aplicación no está funcionando correctamente",
            timestamp: new Date("2024-04-25T15:45:00").getTime(),
            senderId: "user2",
            isUser: true,
          },
          {
            id: "4",
            content:
              "Por favor, intenta cerrar sesión y volver a iniciar. Si el problema persiste, limpia el caché del navegador.",
            timestamp: new Date("2024-04-25T15:46:00").getTime(),
            senderId: "bot",
            isUser: false,
          },
        ],
      },
      {
        id: "3",
        title: "Cambio de contraseña",
        userName: "Carlos Rodríguez",
        lastMessageDate: new Date("2024-04-24T09:15:00").getTime(),
        messages: [
          {
            id: "5",
            content: "Necesito cambiar mi contraseña",
            timestamp: new Date("2024-04-24T09:15:00").getTime(),
            senderId: "user3",
            isUser: true,
          },
          {
            id: "6",
            content:
              'Ve a la sección de "Configuraci��n de cuenta" y selecciona "Cambiar contraseña".',
            timestamp: new Date("2024-04-24T09:16:00").getTime(),
            senderId: "bot",
            isUser: false,
          },
        ],
      },
      {
        id: "4",
        title: "Problema de conexión",
        userName: "Ana López",
        lastMessageDate: new Date("2024-04-23T14:20:00").getTime(),
        messages: [
          {
            id: "7",
            content: "No puedo conectarme al sistema",
            timestamp: new Date("2024-04-23T14:20:00").getTime(),
            senderId: "user4",
            isUser: true,
          },
          {
            id: "8",
            content:
              "Verifique su conexión a internet y pruebe refrescar la página.",
            timestamp: new Date("2024-04-23T14:21:00").getTime(),
            senderId: "bot",
            isUser: false,
          },
        ],
      },
      {
        id: "5",
        title: "Consulta de precios",
        userName: "Pedro Martínez",
        lastMessageDate: new Date("2024-04-22T11:30:00").getTime(),
        messages: [
          {
            id: "9",
            content: "¿Cuál es el precio del plan premium?",
            timestamp: new Date("2024-04-22T11:30:00").getTime(),
            senderId: "user5",
            isUser: true,
          },
          {
            id: "10",
            content: "El plan premium cuesta $29.99 por mes.",
            timestamp: new Date("2024-04-22T11:31:00").getTime(),
            senderId: "bot",
            isUser: false,
          },
        ],
      },
      {
        id: "6",
        title: "Solicitud de reembolso",
        userName: "Laura García",
        lastMessageDate: new Date("2024-04-21T09:45:00").getTime(),
        messages: [
          {
            id: "11",
            content: "Necesito solicitar un reembolso",
            timestamp: new Date("2024-04-21T09:45:00").getTime(),
            senderId: "user6",
            isUser: true,
          },
          {
            id: "12",
            content:
              "Por favor, proporcione el número de orden y el motivo del reembolso.",
            timestamp: new Date("2024-04-21T09:46:00").getTime(),
            senderId: "bot",
            isUser: false,
          },
        ],
      },
    ];

    const additionalConversations = [
      {
        id: "7",
        title: "Problema con la aplicación móvil",
        userName: "Miguel Fernández",
        lastMessageDate: new Date("2024-04-20T14:30:00").getTime(),
        messages: [
          {
            id: "13",
            content: "La aplicación móvil se cierra inesperadamente",
            timestamp: new Date("2024-04-20T14:30:00").getTime(),
            senderId: "user7",
            isUser: true,
          },
          {
            id: "14",
            content:
              "Por favor, intenta actualizar la aplicación a la última versión disponible.",
            timestamp: new Date("2024-04-20T14:31:00").getTime(),
            senderId: "bot",
            isUser: false,
          },
        ],
      },
      {
        id: "8",
        title: "Información sobre productos",
        userName: "Sofía Martín",
        lastMessageDate: new Date("2024-04-19T10:15:00").getTime(),
        messages: [
          {
            id: "15",
            content: "¿Tienen disponible el modelo X-200?",
            timestamp: new Date("2024-04-19T10:15:00").getTime(),
            senderId: "user8",
            isUser: true,
          },
          {
            id: "16",
            content:
              "Sí, contamos con stock del modelo X-200 en colores negro, blanco y azul.",
            timestamp: new Date("2024-04-19T10:16:00").getTime(),
            senderId: "bot",
            isUser: false,
          },
        ],
      },
      {
        id: "9",
        title: "Problema de acceso",
        userName: "Javier Gutiérrez",
        lastMessageDate: new Date("2024-04-18T09:30:00").getTime(),
        messages: [
          {
            id: "17",
            content: "No puedo acceder a mi cuenta",
            timestamp: new Date("2024-04-18T09:30:00").getTime(),
            senderId: "user9",
            isUser: true,
          },
          {
            id: "18",
            content:
              "¿Ha intentado restablecer su contraseña desde la página de inicio de sesión?",
            timestamp: new Date("2024-04-18T09:31:00").getTime(),
            senderId: "bot",
            isUser: false,
          },
        ],
      },
      {
        id: "10",
        title: "Consulta de envío",
        userName: "Carmen López",
        lastMessageDate: new Date("2024-04-17T16:45:00").getTime(),
        messages: [
          {
            id: "19",
            content: "¿Cuándo llegará mi pedido #45678?",
            timestamp: new Date("2024-04-17T16:45:00").getTime(),
            senderId: "user10",
            isUser: true,
          },
          {
            id: "20",
            content:
              "Su pedido #45678 está en camino y será entregado mañana entre las 9:00 y 14:00.",
            timestamp: new Date("2024-04-17T16:46:00").getTime(),
            senderId: "bot",
            isUser: false,
          },
        ],
      },
      {
        id: "11",
        title: "Consulta sobre devoluciones",
        userName: "Pablo Sánchez",
        lastMessageDate: new Date("2024-04-16T11:20:00").getTime(),
        messages: [
          {
            id: "21",
            content: "¿Cuál es la política de devoluciones?",
            timestamp: new Date("2024-04-16T11:20:00").getTime(),
            senderId: "user11",
            isUser: true,
          },
          {
            id: "22",
            content:
              "Puede devolver cualquier producto en un plazo de 14 días desde la recepción si no está satisfecho.",
            timestamp: new Date("2024-04-16T11:21:00").getTime(),
            senderId: "bot",
            isUser: false,
          },
        ],
      },
      {
        id: "12",
        title: "Problema con el pago",
        userName: "Elena Díaz",
        lastMessageDate: new Date("2024-04-15T13:10:00").getTime(),
        messages: [
          {
            id: "23",
            content: "Mi tarjeta fue rechazada al intentar hacer una compra",
            timestamp: new Date("2024-04-15T13:10:00").getTime(),
            senderId: "user12",
            isUser: true,
          },
          {
            id: "24",
            content:
              "Por favor, verifique que los datos de su tarjeta sean correctos y que tenga fondos suficientes.",
            timestamp: new Date("2024-04-15T13:11:00").getTime(),
            senderId: "bot",
            isUser: false,
          },
        ],
      },
    ];

    setConversations([...mockConversations, ...additionalConversations]);
  }, []);

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      searchTerm === "" ||
      conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUser =
      selectedUser === "all" || conv.userName === selectedUser;

    const matchesDate = !date?.from
      ? true
      : conv.lastMessageDate >= date.from.getTime() &&
        (!date.to || conv.lastMessageDate <= date.to.getTime());

    return matchesSearch && matchesUser && matchesDate;
  });

  const handleDeleteConversation = (
    e: React.MouseEvent,
    conversationId: string
  ) => {
    e.stopPropagation();

    // Find and remove the conversation by ID
    const updatedConversations = conversations.filter(
      (conv) => conv.id !== conversationId
    );
    setConversations(updatedConversations);

    // If the active conversation is deleted, set it to null
    if (activeConversation && activeConversation.id === conversationId) {
      setActiveConversation(null);
    }

    toast.success("Conversación eliminada");
  };

  return (
    <div className="h-[calc(100vh-4rem)] max-w-full overflow-hidden">
      <div className="flex h-full max-w-full">
        <div className="bg-white shadow-md w-80 flex-shrink-0 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b bg-[#2B577A]">
            <h2 className="font-bold text-lg text-white text-left">
              Historial de chats
            </h2>
          </div>

          <ConversationFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            date={date}
            setDate={setDate}
            open={open}
            setOpen={setOpen}
            mockUsers={mockUsers}
          />

          <ConversationList
            conversations={filteredConversations}
            activeConversation={activeConversation}
            onSelectConversation={setActiveConversation}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>

        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          <div className="bg-white p-4 shadow-sm">
            <h2 className="font-bold">
              {activeConversation
                ? activeConversation.title
                : "Selecciona una conversación para ver su historial"}
            </h2>
          </div>

          <div className="flex-1 p-4 overflow-hidden">
            <ConversationDetail conversation={activeConversation} />
          </div>
        </div>
      </div>
    </div>
  );
}
