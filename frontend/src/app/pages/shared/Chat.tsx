import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { chatService } from "../../../services/chatService";
import { IConversation, IMessage } from "../../../types/chat";
import { useLocation } from "react-router-dom";

import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Send, Paperclip, Trash2 } from "lucide-react";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ======================================================================
// 🔥 HÀM HELPER CHUẨN HÓA ID: Xử lý an toàn cả Object lẫn String/Number
// ======================================================================
const getCleanId = (item: any): string => {
  if (!item) return "";
  if (typeof item === "object") {
    return String(item._id || item.id || "");
  }
  return String(item);
};

const Chat = () => {
  const [user, setUser] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const notificationSound = useRef(
    new Audio("https://assets.mixkit.co/active_storage/sfx/2357/2357-84.wav"),
  );

  const activeConvRef = useRef(activeConversation);
  const convsRef = useRef(conversations);
  
  // KHÓA CHỐNG LẶP LOGIC: Đảm bảo chỉ tự động định tuyến chat từ JobDetail sang DUY NHẤT một lần ban đầu
  const initialChatProcessedRef = useRef(false);

  useEffect(() => {
    activeConvRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    convsRef.current = conversations;
  }, [conversations]);

  // ======================================================================
  // 🔥 FETCH DATA & XỬ LÝ NHẢY TRANG CHUNG MỘT LUỒNG (TRÁNH XUNG ĐỘT)
  // ======================================================================
  const fetchLatestConversations = async (updatedActiveId?: string) => {
    try {
      const response = await chatService.getConversations();
      let dataList = Array.isArray(response) ? response : response?.data || [];

      // 1. XỬ LÝ NHẢY TRANG TỪ JOB DETAIL (Chỉ chạy 1 lần)
      const incomingUser = location.state?.targetUser;
      
      if (incomingUser && !initialChatProcessedRef.current && user) {
        const targetIdStr = getCleanId(incomingUser.id || incomingUser._id);
        const currentUserIdStr = getCleanId(user.id || user._id);

        if (targetIdStr !== currentUserIdStr) {
          const existingConv = dataList.find((c: any) =>
            getCleanId(c.targetUser?.id) === targetIdStr
          );

          if (existingConv) {
            setActiveConversation(existingConv);
          } else {
            const tempConv: IConversation = {
              _id: "new_chat",
              targetUser: incomingUser,
              updatedAt: new Date().toISOString(),
              participants: [],
            };
            dataList = [tempConv, ...dataList];
            setActiveConversation(tempConv);
          }
          
          initialChatProcessedRef.current = true;
          window.history.replaceState({}, "", location.pathname);
        }
      }

      // 2. DUY TRÌ "new_chat" NẾU ĐANG CHAT CHƯA LƯU
      if (!incomingUser) {
        const currentActive = activeConvRef.current;
        if (currentActive?._id === "new_chat") {
          const exists = dataList.some((c: any) => c._id === "new_chat");
          if (!exists) {
            dataList = [currentActive, ...dataList];
          }
        }
      }

      // 3. ĐỒNG BỘ DỮ LIỆU CHUẨN TỪ DB
      if (updatedActiveId) {
        const freshActiveConv = dataList.find((c: any) => c._id === updatedActiveId);
        if (freshActiveConv) {
          setActiveConversation(freshActiveConv);
        }
      }

      setConversations(dataList);

      // 4. TÍNH TOÁN SỐ LƯỢNG CHƯA ĐỌC VÀ BẮN SANG NAVBAR
      if (dataList.length > 0) {
        const currentUserStr = localStorage.getItem("user");
        const parsedUser = currentUserStr ? JSON.parse(currentUserStr) : null;
        const currentUserId = parsedUser?.id || parsedUser?._id || user?.id;

        const totalUnread = dataList.reduce((sum: number, c: any) => {
          const senderId = c.lastMessage?.senderId || c.lastSenderId;
          if (senderId && getCleanId(senderId) === getCleanId(currentUserId)) {
            return sum;
          }
          return sum + Number(c.unreadCount ?? c.unread_count ?? 0);
        }, 0);

        window.dispatchEvent(
          new CustomEvent("update-chat-count", {
            detail: { count: totalUnread },
          }),
        );
      }
    } catch (err) {
      console.error("List synchronization error:", err);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("List synchronization error:", e);
      }
    }
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!user || !user.id) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    newSocket.emit("add_user", user.id);

    fetchLatestConversations();
    setIsLoaded(true);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // ======================================================================
  // SOCKET LẮNG NGHE TIN NHẮN REALTIME
  // ======================================================================
  useEffect(() => {
    if (!socket || !user) return;

    const handleReceiveMessage = (msg: IMessage) => {
      const isCurrentTabActive = document.visibilityState === "visible";
      const currentActiveConv = activeConvRef.current;
      const isThisChatActive =
        currentActiveConv && msg.conversationId === currentActiveConv._id;

      if (isThisChatActive && isCurrentTabActive) {
        msg.isRead = true;
        setMessages((prev) => {
          // BẢO VỆ CHỐNG TRÙNG LẶP (Tránh lỗi undefined vs undefined)
          const newId = getCleanId(msg);
          if (newId && prev.some((m) => getCleanId(m) === newId)) return prev;
          return [...prev, msg];
        });

        socket.emit("mark_messages_as_read", {
          conversationId: currentActiveConv._id,
          userId: user.id,
        });
      } else {
        notificationSound.current?.play().catch(() => {});
        if (Notification.permission === "granted") {
          const currentConvs = convsRef.current;
          const existingConv = currentConvs.find(
            (c) => c._id === msg.conversationId,
          );
          const senderName = existingConv?.targetUser?.name || "New users";
          const notification = new Notification(`Message from ${senderName}`, {
            body: msg.text,
            icon: existingConv?.targetUser?.avatar_url || "/default-avatar.png",
            tag: msg.conversationId,
            renotify: true,
          });
          notification.onclick = () => window.focus();
          setTimeout(() => notification.close(), 4000);
        }
        fetchLatestConversations();
      }
    };

    const handleGetOnlineUsers = (users: string[]) => setOnlineUsers(users);

    socket.on("receive_message", handleReceiveMessage);
    socket.on("get_online_users", handleGetOnlineUsers);
    socket.on("update_unread_total", () => {
      fetchLatestConversations();
    });

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("get_online_users", handleGetOnlineUsers);
      socket.off("update_unread_total");
    };
  }, [socket, user]);

  // ======================================================================
  // KHI CLICK MỞ 1 ĐOẠN CHAT HOẶC ACTIVE CHAT THAY ĐỔI
  // ======================================================================
  useEffect(() => {
    if (!activeConversation || !user?.id) return;

    if (activeConversation._id === "new_chat") {
      setMessages([]);
      return;
    }

    if (socket) {
      socket.emit("mark_messages_as_read", {
        conversationId: activeConversation._id,
        userId: user.id,
      });
    }

    chatService
      .getMessages(activeConversation._id)
      .then((res: any) => {
        const data = res?.data || res || [];
        
        // KIỂM SOÁT RACE CONDITION: Merge data từ Server với dữ liệu Local hiện tại
        // Đề phòng trường hợp API trả về chậm hơn tốc độ gửi tin nhắn và xóa trắng UI
        setMessages((prev) => {
          const apiIds = new Set(data.map((m: any) => getCleanId(m)));
          const localOnly = prev.filter(
            (m) => !apiIds.has(getCleanId(m)) && m.conversationId === activeConversation._id
          );
          return [...data, ...localOnly];
        });
        
        fetchLatestConversations();
      })
      .catch((err) => console.error("Message loading error:", err));

    return () => {
      if (socket && user?.id) {
        socket.emit("leave_room", user.id);
      }
    };
  }, [activeConversation?._id, socket, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [messages]);

  // ======================================================================
  // 🔥 XỬ LÝ GỬI TIN NHẮN 
  // ======================================================================
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    const targetUserIdStr = getCleanId(
      activeConversation.targetUser?.id || activeConversation.targetUser?._id
    );

    if (!targetUserIdStr) return;

    const textToSend = newMessage;
    setNewMessage("");

    try {
      const savedMsg = await chatService.sendMessage(Number(targetUserIdStr), textToSend);
      savedMsg.isRead = true;

      let currentConvId = activeConversation._id;

      // THAY THẾ ID "new_chat" THÀNH ID THẬT CỦA MONGODB NGAY LẬP TỨC
      if (currentConvId === "new_chat" && savedMsg.conversationId) {
        currentConvId = String(savedMsg.conversationId);
        
        setConversations((prev) => 
          prev.map((c) => (c._id === "new_chat" ? { ...c, _id: currentConvId } : c))
        );
        setActiveConversation((prev) => 
          prev ? { ...prev, _id: currentConvId } : null
        );
      }

      // Gửi qua socket bằng ID chuẩn
      socket?.emit("send_message", {
        ...savedMsg,
        conversationId: currentConvId, 
        receiverId: targetUserIdStr,
      });

      // BẢO VỆ CHỐNG GHI ĐÈ BẰNG HÀM getCleanId()
      setMessages((prev) => {
        const msgId = getCleanId(savedMsg);
        if (msgId && prev.some((m) => getCleanId(m) === msgId)) return prev;
        return [...prev, savedMsg];
      });

      // Fetch lại để đồng bộ hoàn toàn
      fetchLatestConversations(currentConvId);

    } catch (error) {
      console.error("Message sending error:", error);
      setNewMessage(textToSend);
    }
  };

  const handleDeleteConversation = async (
    e: React.MouseEvent,
    conversationId: string,
  ) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat?"))
      return;

    try {
      await chatService.deleteConversation(conversationId);
      if (socket && activeConversation?._id === conversationId) {
        socket.emit("leave_room", user?.id);
      }

      if (activeConversation?._id === conversationId) {
        setActiveConversation(null);
        setMessages([]);
      }

      fetchLatestConversations();
    } catch (error) {
      console.error("Chat deletion error:", error);
    }
  };

  const targetUserIdStr = activeConversation?.targetUser?.id || activeConversation?.targetUser?._id;
  const isTargetActiveOnline =
    activeConversation && targetUserIdStr
      ? onlineUsers.includes(getCleanId(targetUserIdStr))
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

      {/* SIDEBAR LIST */}
      <div className="w-1/3 shrink-0 border-r border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0E1422]/40 flex flex-col h-full min-h-0">
        <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0E1422] font-semibold text-lg text-slate-800 dark:text-white">
          Message
        </div>
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv, index) => {
              const targetUser = conv.targetUser;
              const isActive = activeConversation?._id === conv._id;
              const isOnline = targetUser
                ? onlineUsers.includes(getCleanId(targetUser.id || targetUser._id))
                : false;

              const currentUnreadCount = Number(
                (conv as any).unreadCount ?? (conv as any).unread_count ?? 0,
              );
              const isUnread =
                currentUnreadCount > 0 ||
                (conv.lastMessage &&
                  getCleanId(conv.lastMessage.senderId) !== getCleanId(user?.id) &&
                  !conv.lastMessage.isRead &&
                  !isActive);

              return (
                <div
                  key={conv._id || index}
                  onClick={() => {
                    initialChatProcessedRef.current = true;
                    setActiveConversation(conv);
                  }}
                  className={`flex items-center gap-3 p-4 border-b border-gray-100 dark:border-white/5 cursor-pointer transition-all duration-200 opacity-0 animate-fade-in-up group relative
                    ${isActive ? "bg-blue-50 dark:bg-blue-950/40 border-l-2 border-l-blue-600" : "hover:bg-gray-100 dark:hover:bg-white/5"}`}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={targetUser?.avatar_url || ""} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold">
                        {targetUser?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#0E1422] rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-8">
                    <h4
                      className={`text-sm truncate ${isUnread ? "font-bold text-slate-950 dark:text-gray-50" : "font-semibold text-slate-800 dark:text-white"}`}
                    >
                      {targetUser?.name || "Anonymous user"}
                    </h4>
                    <p
                      className={`text-xs truncate mt-0.5 ${isUnread ? "font-bold text-slate-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {conv.lastMessage?.text || "Start a conversation..."}
                    </p>
                  </div>

                  {currentUnreadCount > 0 && !isActive && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                      {currentUnreadCount > 99 ? "99+" : currentUnreadCount}
                    </div>
                  )}

                  {conv._id !== "new_chat" && (
                    <button
                      onClick={(e) => handleDeleteConversation(e, conv._id)}
                      className="absolute right-3 p-1.5 text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </ScrollArea>
      </div>

      {/* CHAT WINDOW */}
      <div className="w-2/3 min-w-0 flex flex-col bg-white dark:bg-[#0E1422] h-full min-h-0">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center gap-3 bg-white dark:bg-[#0E1422] shadow-sm z-10 text-slate-800 dark:text-white">
              <div className="relative">
                <Avatar>
                  <AvatarImage
                    src={activeConversation.targetUser?.avatar_url || ""}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold">
                    {activeConversation.targetUser?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {isTargetActiveOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#0E1422] rounded-full"></span>
                )}
              </div>
              <div className="flex flex-col">
                <h3 className="font-semibold text-slate-800 dark:text-white leading-tight">
                  {activeConversation.targetUser?.name || "Starting a conversation..."}
                </h3>
                {isTargetActiveOnline && (
                  <span className="text-xs text-green-500 font-medium mt-0.5">
                    Online
                  </span>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-gray-50/50 dark:bg-[#0E1422]/20 min-h-0">
              <div className="flex flex-col gap-3">
                {messages.map((msg, idx) => {
                  const isMe = getCleanId(msg.senderId) === getCleanId(user?.id);
                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 text-sm shadow-sm rounded-2xl ${isMe ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-gray-100 dark:bg-white/5 dark:border-white/10 text-slate-800 dark:text-gray-200 rounded-tl-sm"}`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0E1422] flex items-center gap-2"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 shrink-0"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Enter your message..."
                className="flex-1 rounded-full bg-gray-100 dark:bg-white/5 border-transparent text-slate-800 dark:text-white"
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-full bg-blue-600 hover:bg-blue-700 shrink-0"
                disabled={!newMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4 bg-gray-50/30 dark:bg-[#0E1422]/40">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center">
              <Send className="w-8 h-8 text-blue-300 ml-1" />
            </div>
            <p className="font-medium text-gray-500">
              Select a conversation to start
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;