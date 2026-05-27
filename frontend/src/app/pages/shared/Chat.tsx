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

const Chat = () => {
  const [user, setUser] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<IConversation | null>(null);
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

  useEffect(() => {
    activeConvRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    convsRef.current = conversations;
  }, [conversations]);

  // LUÔN FETCH TỪ API ĐỂ ĐẢM BẢO REALTIME & TÍNH TOÁN UNREAD CHUẨN XÁC TỪ DATABASE
  const fetchLatestConversations = () => {
    chatService
      .getConversations()
      .then((response) => {
        // 🔥 FIX: Lấy chuẩn xác mảng để không bị lỗi .reduce is not a function
        const dataList = Array.isArray(response)
          ? response
          : response?.data || [];

        setConversations(dataList);

        if (dataList && dataList.length > 0) {
          const currentUserStr = localStorage.getItem("user");
          const parsedUser = currentUserStr ? JSON.parse(currentUserStr) : null;
          const currentUserId = parsedUser?.id || parsedUser?._id || user?.id;

          const totalUnread = dataList.reduce((sum: number, c: any) => {
            const senderId = c.lastMessage?.senderId || c.lastSenderId;
            if (senderId && String(senderId) === String(currentUserId)) {
              return sum;
            }
            return sum + Number(c.unreadCount ?? c.unread_count ?? 0);
          }, 0);

          // Bắn sang Navbar hiển thị chấm đỏ
          window.dispatchEvent(
            new CustomEvent("update-chat-count", {
              detail: { count: totalUnread },
            }),
          );
        }
      })
      .catch((err) => console.error("Lỗi đồng bộ danh sách:", err));
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Lỗi parse user:", e);
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

  useEffect(() => {
    if (!user || !isLoaded) return;

    const incomingUser = location.state?.targetUser;
    if (!incomingUser) return;

    if (incomingUser.id === user.id) {
      window.history.replaceState({}, "", location.pathname);
      return;
    }

    const existingConversation = conversations.find((conv) =>
      conv.participants.includes(incomingUser.id),
    );

    if (existingConversation) {
      setActiveConversation(existingConversation);
    } else {
      const isNewChatExist = conversations.find((c) => c._id === "new_chat");
      if (!isNewChatExist) {
        const tempConversation: IConversation = {
          _id: "new_chat",
          participants: [user.id, incomingUser.id],
          targetUser: incomingUser,
          updatedAt: new Date().toISOString(),
        };
        setConversations((prev) => [tempConversation, ...prev]);
        setActiveConversation(tempConversation);
      }
    }
    window.history.replaceState({}, "", location.pathname);
  }, [location.state, conversations, user, isLoaded, location.pathname]);

  // ==========================================
  // SOCKET LẮNG NGHE TIN NHẮN (LOGIC ĐÃ SỬA)
  // ==========================================
  useEffect(() => {
    if (!socket || !user) return;

    const handleReceiveMessage = (msg: IMessage) => {
      const isCurrentTabActive = document.visibilityState === "visible";
      const currentActiveConv = activeConvRef.current;
      const isThisChatActive =
        currentActiveConv && msg.conversationId === currentActiveConv._id;

      if (isThisChatActive && isCurrentTabActive) {
        // TRƯỜNG HỢP 1: ĐANG MỞ CHAT VÀ TAB ĐANG ACTIVE
        // Hiển thị tin nhắn ngay lập tức và bắn socket mark_messages_as_read
        msg.isRead = true;
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });

        socket.emit("mark_messages_as_read", {
          conversationId: currentActiveConv._id,
          userId: user.id,
        });

        // Không gọi fetchLatestConversations() ở đây để tránh race-condition với server.
        // Server sẽ xử lý reset về 0 rồi tự bắn lại "update_unread_total" về máy khách.
      } else {
        // TRƯỜNG HỢP 2: ĐANG Ở TAB KHÁC HOẶC MỞ CHAT KHÁC
        notificationSound.current?.play().catch(() => {});
        if (Notification.permission === "granted") {
          const currentConvs = convsRef.current;
          const existingConv = currentConvs.find(
            (c) => c._id === msg.conversationId,
          );
          const senderName = existingConv?.targetUser?.name || "Người dùng mới";
          const notification = new Notification(`Tin nhắn từ ${senderName}`, {
            body: msg.text,
            icon: existingConv?.targetUser?.avatar_url || "/default-avatar.png",
            tag: msg.conversationId,
            renotify: true,
          });
          notification.onclick = () => window.focus();
          setTimeout(() => notification.close(), 4000);
        }

        // Fetch lại API để lấy đúng số unreadCount đã tăng từ DB
        fetchLatestConversations();
      }
    };

    const handleGetOnlineUsers = (users: string[]) => setOnlineUsers(users);

    socket.on("receive_message", handleReceiveMessage);
    socket.on("get_online_users", handleGetOnlineUsers);

    // Lắng nghe tín hiệu reset hoặc cập nhật unread từ server
    socket.on("update_unread_total", () => {
      fetchLatestConversations();
    });

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("get_online_users", handleGetOnlineUsers);
      socket.off("update_unread_total");
    };
  }, [socket, user]);

  // KHI CLICK MỞ 1 ĐOẠN CHAT
  useEffect(() => {
    if (!activeConversation || !user?.id) return;

    if (activeConversation._id === "new_chat") {
      setMessages([]);
      return;
    }

    // Gửi tín hiệu reset unreadCount = 0 lên Database
    if (socket) {
      socket.emit("mark_messages_as_read", {
        conversationId: activeConversation._id,
        userId: user.id,
      });
    }

    chatService
      .getMessages(activeConversation._id)
      .then((res: any) => {
        setMessages(res?.data || res || []);
        // Bắt buộc fetch lại danh sách để DB đồng bộ số liệu unread = 0 về phía UI Navbar
        fetchLatestConversations();
      })
      .catch((err) => console.error("Lỗi tải tin nhắn:", err));

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    const targetUserId = activeConversation.participants.find(
      (id) => id !== user.id,
    );
    if (!targetUserId) return;

    const textToSend = newMessage;
    setNewMessage("");

    try {
      const savedMsg = await chatService.sendMessage(targetUserId, textToSend);
      savedMsg.isRead = true;

      socket?.emit("send_message", {
        ...savedMsg,
        receiverId: targetUserId,
      });

      // Vẫn update local Messages để khung chat mượt mà
      setMessages((prev) => {
        if (prev.some((m) => m._id === savedMsg._id)) return prev;
        return [...prev, savedMsg];
      });

      // THAY VÌ TỰ VIẾT LOGIC SET LẠI STATE BÊN TRÁI RẤT DỄ LỖI -> ĐỒNG BỘ THẲNG TỪ DB LÀ CHUẨN NHẤT
      fetchLatestConversations();
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      setNewMessage(textToSend);
    }
  };

  const handleDeleteConversation = async (
    e: React.MouseEvent,
    conversationId: string,
  ) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa đoạn chat này không?"))
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

      // Đồng bộ DB luôn
      fetchLatestConversations();
    } catch (error) {
      console.error("Lỗi xóa chat:", error);
    }
  };

  const isTargetActiveOnline =
    activeConversation && activeConversation.targetUser?.id
      ? onlineUsers.includes(String(activeConversation.targetUser.id))
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
        <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0E1422] font-semibold text-lg text-slate-800 dark:text-white">
          Tin nhắn
        </div>
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Chưa có cuộc trò chuyện nào
            </div>
          ) : (
            conversations.map((conv, index) => {
              const targetUser = conv.targetUser;
              const isActive = activeConversation?._id === conv._id;
              const isOnline = targetUser?.id
                ? onlineUsers.includes(String(targetUser.id))
                : false;

              const currentUnreadCount = Number(
                (conv as any).unreadCount ?? (conv as any).unread_count ?? 0,
              );
              const isUnread =
                currentUnreadCount > 0 ||
                (conv.lastMessage &&
                  conv.lastMessage.senderId !== user?.id &&
                  !conv.lastMessage.isRead &&
                  !isActive);

              return (
                <div
                  key={conv._id || index}
                  onClick={() => setActiveConversation(conv)}
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
                      {targetUser?.name || "Người dùng ẩn danh"}
                    </h4>
                    <p
                      className={`text-xs truncate mt-0.5 ${isUnread ? "font-bold text-slate-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {conv.lastMessage?.text || "Bắt đầu trò chuyện..."}
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
                  {activeConversation.targetUser?.name || "Đang trò chuyện..."}
                </h3>
                {isTargetActiveOnline && (
                  <span className="text-xs text-green-500 font-medium mt-0.5">
                    Đang hoạt động
                  </span>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-gray-50/50 dark:bg-[#0E1422]/20 min-h-0">
              <div className="flex flex-col gap-3">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === user?.id;
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
                placeholder="Nhập tin nhắn của bạn..."
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
              Chọn một cuộc hội thoại để bắt đầu
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
