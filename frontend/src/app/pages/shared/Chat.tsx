import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { chatService } from '../../../services/chatService';
import { IConversation, IMessage } from '../../../types/chat';
import { useLocation } from 'react-router-dom';

// UI Components
import { ScrollArea } from '../../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Send, Paperclip } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Chat = () => {
  const [user, setUser] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoaded, setIsLoaded] = useState(false); // Biến cờ kiểm tra đã load xong danh sách chưa
  
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // 0. Lấy thông tin user hiện tại từ localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Lỗi parse user:", e);
      }
    }
  }, []);

  // 1. Init Socket & Fetch danh sách hội thoại
  useEffect(() => {
    if (!user || !user.id) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    newSocket.emit('add_user', user.id);

    chatService.getConversations()
      .then(data => {
        setConversations(data || []); 
        setIsLoaded(true); // Đánh dấu đã load xong danh sách từ Backend
      })
      .catch(err => {
        console.error("Lỗi lấy danh sách chat:", err);
        setIsLoaded(true); // Dù lỗi vẫn đánh dấu load xong để chạy tiếp logic
      });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // 2. Xử lý điều hướng từ trang JobDetail (Tạo phòng chat mới nếu cần)
  useEffect(() => {
    // Chỉ chạy khi user và danh sách chat đã load xong
    if (!user || !isLoaded) return;

    const incomingUser = location.state?.targetUser;
    if (!incomingUser) return;

    // Không cho phép tự nhắn tin cho chính mình
    if (incomingUser.id === user.id) {
       window.history.replaceState({}, document.title);
       return;
    }

    // Kiểm tra xem đã từng chat với người này chưa
    const existingConversation = conversations.find(conv => 
      conv.participants.includes(incomingUser.id)
    );

    if (existingConversation) {
      // Đã từng chat -> Mở phòng cũ
      setActiveConversation(existingConversation);
    } else {
      // Chưa từng chat -> Tạo phòng tạm thời (chưa lưu DB)
      const isNewChatExist = conversations.find(c => c._id === 'new_chat');
      
      if (!isNewChatExist) {
        const tempConversation: IConversation = {
          _id: 'new_chat',
          participants: [user.id, incomingUser.id],
          targetUser: incomingUser,
          updatedAt: new Date().toISOString()
        };
        
        setConversations(prev => [tempConversation, ...prev]);
        setActiveConversation(tempConversation);
      }
    }

    // Xóa state để F5 không bị lặp lại logic tạo phòng
    window.history.replaceState({}, document.title);
  }, [location.state, conversations, user, isLoaded]);

  // 3. Lắng nghe tin nhắn Real-time từ người khác
  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (msg: IMessage) => {
        if (activeConversation && msg.conversationId === activeConversation._id) {
          setMessages(prev => [...prev, msg]);
        }
        
        setConversations(prev => 
          prev.map(conv => conv._id === msg.conversationId 
            ? { ...conv, lastMessage: msg, updatedAt: new Date().toISOString() } 
            : conv)
        );
      });
    }
    return () => {
      socket?.off('receive_message');
    }
  }, [socket, activeConversation]);

  // 4. Load tin nhắn khi chọn 1 phòng chat
  useEffect(() => {
    if (activeConversation) {
      // Nếu là phòng tạm thời (chưa gửi tin nhắn nào) thì ko gọi API tránh lỗi 400/404
      if (activeConversation._id === 'new_chat') {
        setMessages([]);
        return;
      }

      chatService.getMessages(activeConversation._id)
        .then(data => {
          setMessages(data || []);
        })
        .catch(err => console.error("Lỗi lấy tin nhắn:", err));
    }
  }, [activeConversation]);

  // 5. Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 6. Xử lý Gửi tin nhắn
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    const targetUserId = activeConversation.participants.find(id => id !== user.id);
    if (!targetUserId) return;

    try {
      // 1. Lưu tin nhắn vào DB (Backend tự tạo conversation thật nếu là tin nhắn đầu tiên)
      const savedMsg = await chatService.sendMessage(targetUserId, newMessage);
      
      // 2. Bắn Socket cho người nhận
      socket?.emit('send_message', {
        ...savedMsg,
        receiverId: targetUserId
      });

      // 3. Cập nhật giao diện lập tức
      setMessages(prev => [...prev, savedMsg]);
      setNewMessage("");

      // 4. Cập nhật sidebar & Đổi ID phòng tạm thời thành ID thật
      setConversations(prev => {
        return prev.map(conv => {
          if (conv._id === 'new_chat' || conv._id === activeConversation._id) {
            const updatedConv = { 
              ...conv, 
              _id: savedMsg.conversationId, // RẤT QUAN TRỌNG: Gán lại ID thật từ Backend
              lastMessage: savedMsg, 
              updatedAt: new Date().toISOString() 
            };
            // Cập nhật luôn ActiveConversation
            setActiveConversation(updatedConv);
            return updatedConv;
          }
          return conv;
        });
      });
    } catch (error) {
      console.error("Lỗi gửi tin nhắn", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] border rounded-xl overflow-hidden bg-white shadow-sm max-w-6xl mx-auto mt-6">
      {/* SIDEBAR: Danh sách hội thoại */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white font-semibold text-lg text-slate-800">
          Tin nhắn
        </div>
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">Chưa có cuộc trò chuyện nào</div>
          ) : (
            conversations.map((conv, index) => {
              const targetUser = conv.targetUser;
              const isActive = activeConversation?._id === conv._id;
              
              // Dùng index làm fallback key nếu lỡ có 2 new_chat (dù đã chặn)
              return (
                <div 
                  key={conv._id || index} 
                  onClick={() => setActiveConversation(conv)}
                  className={`flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors ${isActive ? 'bg-blue-50' : ''}`}
                >
                  <Avatar>
                    <AvatarImage src={targetUser?.avatar_url || ''} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                      {targetUser?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{targetUser?.name || 'Người dùng ẩn danh'}</h4>
                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastMessage?.text || 'Bắt đầu trò chuyện...'}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </ScrollArea>
      </div>

      {/* CHAT WINDOW: Khung chat chi tiết */}
      <div className="w-2/3 flex flex-col bg-white">
        {activeConversation ? (
          <>
            {/* Header phòng chat */}
            <div className="p-4 border-b flex items-center gap-3 bg-white shadow-sm z-10">
               <Avatar>
                  <AvatarImage src={activeConversation.targetUser?.avatar_url || ''} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                    {activeConversation.targetUser?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-slate-800">
                  {activeConversation.targetUser?.name || 'Đang trò chuyện...'}
                </h3>
            </div>

            {/* Vùng hiển thị tin nhắn */}
            <ScrollArea className="flex-1 p-4 bg-gray-50/50">
              <div className="flex flex-col gap-3">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-gray-100 text-slate-800 rounded-2xl rounded-tl-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  )
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input gửi tin nhắn */}
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex items-center gap-2">
              <Button type="button" variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600 shrink-0">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn của bạn..." 
                className="flex-1 rounded-full bg-gray-100 border-transparent focus-visible:ring-1 focus-visible:ring-blue-500"
              />
              <Button type="submit" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700 shrink-0" disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4 bg-gray-50/30">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
               <Send className="w-8 h-8 text-blue-300 ml-1" />
            </div>
            <p className="font-medium text-gray-500">Chọn một cuộc hội thoại để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;