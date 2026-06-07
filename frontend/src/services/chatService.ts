import { api } from "./api";
import { IConversation, IMessage } from "../types/chat";

// 1. Export lẻ từng hàm (Đặt tên chuẩn chữ C viết hoa để Navbar.tsx import lẻ được)
export const getconversations = async (): Promise<IConversation[]> => {
  const token = localStorage.getItem("token");
  if (!token) return [];

  const response = await api.get<{ success: boolean; data: IConversation[] }>(
    "/api/messages/conversations",
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data.data;
};

export const getMessages = async (conversationId: string): Promise<IMessage[]> => {
  const token = localStorage.getItem("token");
  if (!token) return [];

  const response = await api.get<{ success: boolean; data: IMessage[] }>(
    `/api/messages/${conversationId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data.data;
};

export const sendMessage = async (receiverId: number, text: string, fileUrl?: string): Promise<IMessage> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await api.post<{ success: boolean; data: IMessage }>(
    "/api/messages/send",
    {
      receiverId,
      text,
      fileUrl,
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data.data;
};

export const deleteConversation = async (conversationId: string) => {
  const token = localStorage.getItem("token");
  const response = await api.delete(
    `/api/messages/conversations/${conversationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};

// 2. Gom cụm lại thành object và Export Default để tương thích với các file import kiểu cũ
const chatService = {
  getconversations,
  getMessages,
  sendMessage,
  deleteConversation,
};

export default chatService;