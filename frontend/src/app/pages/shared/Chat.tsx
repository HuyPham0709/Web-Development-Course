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
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

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
        setIsLoaded(true);
      })
      .catch(err => {
        console.error("Lỗi lấy danh sách chat:", err);
        setIsLoaded(true);
      });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // 2. Xử lý điều hướng từ trang JobDetail (Tạo phòng chat mới nếu cần)
  useEffect(() => {
    if (!user || !isLoaded) return;

    const incomingUser = location.state?.targetUser;
    if (!incomingUser) return;

    if (incomingUser.id === user.id) {
       window.history.replaceState({}, document.title);
       return;
    }

    const existingConversation = conversations.find(conv => 
      conv.participants.includes(incomingUser.id)
    );

    if (existingConversation) {
      setActiveConversation(existingConversation);
    } else {
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

    window.history.replaceState({}, document.title);
  }, [location.state, conversations, user, isLoaded]);

  // 3. Lắng nghe tin nhắn Real-time & Trạng thái Online
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

      socket.on('get_online_users', (users: number[]) => {
        setOnlineUsers(users);
      });
    }
    return () => {
      socket?.off('receive_message');
      socket?.off('get_online_users');
    }
  }, [socket, activeConversation]);

  // 4. Load tin nhắn khi chọn 1 phòng chat
  useEffect(() => {
    if (activeConversation) {
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
          scrollRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
          });
      }
  }, [messages]);

  // 6. Xử lý Gửi tin nhắn
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    const targetUserId = activeConversation.participants.find(id => id !== user.id);
    if (!targetUserId) return;

    try {
      const savedMsg = await chatService.sendMessage(targetUserId, newMessage);
      
      socket?.emit('send_message', {
        ...savedMsg,
        receiverId: targetUserId
      });

      setMessages(prev => [...prev, savedMsg]);
      setNewMessage("");

      setConversations(prev => {
        return prev.map(conv => {
          if (conv._id === 'new_chat' || conv._id === activeConversation._id) {
            const updatedConv = { 
              ...conv, 
              _id: savedMsg.conversationId,
              lastMessage: savedMsg, 
              updatedAt: new Date().toISOString() 
            };
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

  // Xác định xem user trong phòng chat hiện tại có đang online không
  const isTargetActiveOnline = activeConversation 
    ? onlineUsers.includes(activeConversation.targetUser?.id || -1) 
    : false;

  return (
    <div className="flex h-[calc(100vh-100px)] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#0E1422] shadow-sm max-w-6xl mx-auto mt-6 transition-colors duration-300">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* SIDEBAR */}
      <div className="w-1/3 shrink-0 border-r border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0E1422]/40 flex flex-col h-full min-h-0">
        <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0E1422] font-semibold text-lg text-slate-800 dark:text-white transition-colors duration-300">
          Tin nhắn
        </div>
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Chưa có cuộc trò chuyện nào</div>
          ) : (
            conversations.map((conv, index) => {
              const targetUser = conv.targetUser;
              const isActive = activeConversation?._id === conv._id;
              const isOnline = onlineUsers.includes(targetUser?.id || -1); // Kiểm tra trạng thái online
              
              return (
                <div 
                  key={conv._id || index} 
                  onClick={() => setActiveConversation(conv)}
                  className={`flex items-center gap-3 p-4 border-b border-gray-100 dark:border-white/5 cursor-pointer transition-all duration-200 opacity-0 animate-fade-in-up group
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-l-2 border-l-blue-600 dark:border-l-blue-500' 
                      : 'hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="relative">
                    <Avatar className="ring-2 ring-transparent group-hover:ring-blue-500/30 transition-all">
                      <AvatarImage src={targetUser?.avatar_url || ''} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold">
                        {targetUser?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {/* CHẤM XANH Ở SIDEBAR */}
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#0E1422] rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate text-slate-800 dark:text-white dark:group-hover:text-blue-400 transition-colors">
                      {targetUser?.name || 'Người dùng ẩn danh'}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {conv.lastMessage?.text || 'Bắt đầu trò chuyện...'}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </ScrollArea>
      </div>

      {/* CHAT WINDOW */}
      <div className="w-2/3 min-w-0 flex flex-col bg-white dark:bg-[#0E1422] h-full min-h-0 transition-colors duration-300">
        {activeConversation ? (
          <>
            {/* Header phòng chat */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center gap-3 bg-white dark:bg-[#0E1422] shadow-sm z-10 text-slate-800 dark:text-white transition-colors duration-300">
               <div className="relative">
                 <Avatar>
                    <AvatarImage src={activeConversation.targetUser?.avatar_url || ''} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold">
                      {activeConversation.targetUser?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {/* CHẤM XANH Ở HEADER */}
                  {isTargetActiveOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#0E1422] rounded-full"></span>
                  )}
               </div>
               
               <div className="flex flex-col">
                 <h3 className="font-semibold text-slate-800 dark:text-white leading-tight">
                   {activeConversation.targetUser?.name || 'Đang trò chuyện...'}
                 </h3>
                 {/* TRẠNG THÁI TEXT Ở HEADER */}
                 {isTargetActiveOnline && (
                   <span className="text-xs text-green-500 font-medium mt-0.5">Đang hoạt động</span>
                 )}
               </div>
            </div>

            {/* Vùng hiển thị tin nhắn */}
            <ScrollArea className="flex-1 p-4 bg-gray-50/50 dark:bg-[#0E1422]/20 min-h-0">
              <div className="flex flex-col gap-3">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 text-sm shadow-sm transition-all duration-300
                        ${isMe 
                          ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                          : 'bg-white border border-gray-100 dark:bg-white/5 dark:border-white/10 text-slate-800 dark:text-gray-200 rounded-2xl rounded-tl-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  )
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input gửi tin nhắn */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0E1422] flex items-center gap-2 transition-colors duration-300">
              <Button type="button" variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 shrink-0">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn của bạn..." 
                className="flex-1 rounded-full bg-gray-100 dark:bg-white/5 border-transparent dark:border-white/10 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus-visible:ring-1 focus-visible:ring-blue-500"
              />
              <Button type="submit" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700 shrink-0" disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        ) : (
          /* Trạng thái trống */
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 flex-col gap-4 bg-gray-50/30 dark:bg-[#0E1422]/40">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center border border-transparent dark:border-blue-500/10">
               <Send className="w-8 h-8 text-blue-300 dark:text-blue-500/70 ml-1" />
            </div>
            <p className="font-medium text-gray-500 dark:text-gray-400">Chọn một cuộc hội thoại để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;