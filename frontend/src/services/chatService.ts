import { api } from './api'; 
import { IConversation, IMessage } from '../types/chat';

export const chatService = {
  getConversations: async () => {
    // Thêm /api vào trước /messages
    const response = await api.get<{success: boolean, data: IConversation[]}>('/api/messages/conversations');
    return response.data.data;
  },
  
  getMessages: async (conversationId: string) => {
    // Thêm /api vào trước /messages
    const response = await api.get<{success: boolean, data: IMessage[]}>(`/api/messages/${conversationId}`);
    return response.data.data;
  },

  sendMessage: async (receiverId: number, text: string, fileUrl?: string) => {
    // Thêm /api vào trước /messages
    const response = await api.post<{success: boolean, data: IMessage}>('/api/messages/send', {
      receiverId, text, fileUrl
    });
    return response.data.data;
  }
};