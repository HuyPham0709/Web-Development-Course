// frontend/src/types/chat.ts
export interface IMessage {
  _id?: string;
  conversationId: string;
  senderId: number; 
  text: string;
  fileUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface IConversation {
  _id: string;
  candidateId?: number; // Thêm
  companyId?: number;   // Thêm
  lastMessage?: IMessage;
  updatedAt: string;
  targetUser?: {
    id: number;
    name: string;
    avatar_url: string;
    isOnline?: boolean; 
  }
}