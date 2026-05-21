export interface IMessage {
  _id?: string;
  conversationId: string;
  senderId: number; // Tương ứng ID MySQL
  text: string;
  fileUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface IConversation {
  _id: string;
  participants: number[];
  lastMessage?: IMessage;
  updatedAt: string;
  // Bổ sung các property để UI hiển thị (sẽ cần fetch chéo sang bảng MySQL để lấy Tên, Avatar)
  targetUser?: {
    id: number;
    name: string;
    avatar_url: string;
  }
}