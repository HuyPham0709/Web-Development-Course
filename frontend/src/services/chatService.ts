import { api } from "./api";
import { IConversation, IMessage } from "../types/chat";
import axios from "axios";
export const chatService = {
  getconversations: async () => {
    const token = localStorage.getItem("token");
    if (!token) return []; // Thêm chốt chặn an toàn

    const response = await api.get<{ success: boolean; data: IConversation[] }>(
      "/api/messages/conversations",
      {
        headers: { Authorization: `Bearer ${token}` } // Đính kèm token
      }
    );
    return response.data.data;
  },

  getmessages: async (conversationId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return [];

    const response = await api.get<{ success: boolean; data: IMessage[] }>(
      `/api/messages/${conversationId}`,
      {
        headers: { Authorization: `Bearer ${token}` } // Đính kèm token
      }
    );
    return response.data.data;
  },

  sendMessage: async (receiverId: number, text: string, fileUrl?: string) => {
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
        headers: { Authorization: `Bearer ${token}` } // Đính kèm token
      }
    );
    return response.data.data;
  },

  deleteConversation: async (conversationId: string) => {
    const token = localStorage.getItem("token");
    // Đồng bộ dùng api.delete thay vì axios.delete cho chuẩn với các hàm trên
    const response = await api.delete(
      `/api/messages/conversations/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },
};
