// frontend/src/services/chatBotService.ts

import { api } from "./api";

export const sendMessageToBot = async (text: string) => {
  try {
    const response = await api.post("/api/messages/bot", { text });
    return response.data; // Trả về object { success: true, reply: "..." }
  } catch (error) {
    console.error("Lỗi khi gọi chatbot API:", error);
    throw error;
  }
};