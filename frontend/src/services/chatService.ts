import { api } from "./api";
import { IConversation, IMessage } from "../types/chat";
import axios from "axios";
export const chatService = {
  getConversations: async () => {
    const response = await api.get<{ success: boolean; data: IConversation[] }>(
      "/api/messages/conversations",
    );
    return response.data.data;
  },

  getMessages: async (conversationId: string) => {
    const response = await api.get<{ success: boolean; data: IMessage[] }>(
      `/api/messages/${conversationId}`,
    );
    return response.data.data;
  },

  sendMessage: async (receiverId: number, text: string, fileUrl?: string) => {
    const response = await api.post<{ success: boolean; data: IMessage }>(
      "/api/messages/send",
      {
        receiverId,
        text,
        fileUrl,
      },
    );
    return response.data.data;
  },

  // THÊM HÀM XÓA ĐOẠN CHAT NÀY VÀO ĐÂY CHUẨN THEO INSTANCE API CỦA BẠN
  deleteConversation: async (conversationId: string) => {
    const token = localStorage.getItem("token");
    // Sử dụng BASE_URL hoặc endpoint tương ứng của project bạn
    const response = await axios.delete(
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
