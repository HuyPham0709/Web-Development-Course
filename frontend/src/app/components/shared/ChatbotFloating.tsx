// frontend/src/app/components/shared/ChatbotFloating.tsx

import React, { useState, useRef, useEffect } from "react";
import { sendMessageToBot } from "../../../services/chatBotService";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  isGreeting?: boolean; // Đánh dấu tin nhắn chào để hiện nút bấm nhanh
}

// Tập hợp kho câu chào phong phú tránh nhàm chán
const GREETING_POOL = [
  "👋 Xin chào! Tôi là Trợ lý ảo hỗ trợ tìm việc thông minh nội bộ. Hôm nay tôi có thể giúp gì cho hành trình sự nghiệp của bạn?",
  "🚀 Chào bạn! Bạn đang tìm kiếm cơ hội hoặc bến đỗ sự nghiệp tiếp theo? Hãy để tôi hỗ trợ tra cứu thông tin giúp bạn nhé!",
  "✨ Rất vui được gặp bạn! Tôi là AI Assistant, sẵn sàng đồng hành cùng bạn để săn tìm việc làm và tối ưu hồ sơ 24/7."
];

const SUGGESTIONS = [
  { label: "🏢 Địa chỉ của công ty NextGen Tech", value: "Địa chỉ của công ty NextGen Tech" },
  { label: "💼 Tuyển dụng NextGen Tech", value: "Tuyển dụng NextGen Tech" },
  { label: "🎯 Tìm việc ngành Design", value: "Tìm việc ngành Design" },
  { label: "📝 Cách tạo CV", value: "Cách tạo CV như thế nào" }
];

export default function ChatbotFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Khởi tạo câu chào ngẫu nhiên khi component mount
  useEffect(() => {
    const randomGreeting = GREETING_POOL[Math.floor(Math.random() * GREETING_POOL.length)];
    setMessages([
      {
        id: 1,
        text: `${randomGreeting}\n\nBạn có thể chat tự nhiên hoặc chọn nhanh các gợi ý phía dưới nhé:`,
        sender: "bot",
        isGreeting: true
      }
    ]);
  }, []);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Hàm xử lý gửi tin nhắn chung
  const handleProcessSend = async (textToSend: string) => {
    setMessages((prev) => [...prev, { id: Date.now(), text: textToSend, sender: "user" }]);
    setIsLoading(true);

    try {
      const response = await sendMessageToBot(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: response.reply || "Tôi chưa hiểu ý bạn, vui lòng thử lại.",
          sender: "bot",
        },
      ]);
    } catch (error) {
      console.error("Lỗi khi kết nối với chatbot:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "❌ Không thể kết nối với máy chủ. Vui lòng thử lại sau!",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText("");
    handleProcessSend(text);
  };

  return (
    // KHẮC PHỤC LỖI DI CHUYỂN: flex flex-col items-end giữ cố định mọi thứ bên phải
    <div className="fixed bottom-6 right-6 z-50 font-sans text-sm flex flex-col items-end">
      
      {/* Khung Chat chính */}
      {isOpen && (
        <div className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 w-[360px] sm:w-[400px] h-[520px] rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-fade-in origin-bottom-right">
          
          {/* Header Khung Chat */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">🤖</div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="font-semibold text-base tracking-wide">AI Job Assistant</h3>
                <p className="text-xs text-blue-100/80">Trợ lý ảo hỗ trợ 24/7</p>
              </div>
            </div>
            
            {/* Nút hạ ẩn khung chat xuống */}
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Vùng nội dung tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-[#0F172A]/40 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white dark:bg-[#334155] text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>

                {/* Nếu là tin nhắn chào đầu tiên, hiển thị thêm các nút bấm gợi ý nhanh */}
                {msg.isGreeting && (
                  <div className="flex flex-wrap gap-2 pt-1 max-w-[90%] justify-start animate-fade-in">
                    {SUGGESTIONS.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => !isLoading && handleProcessSend(suggestion.value)}
                        disabled={isLoading}
                        className="bg-white hover:bg-blue-50 dark:bg-[#334155] dark:hover:bg-[#475569] border border-gray-200 dark:border-gray-600 text-blue-600 dark:text-blue-400 rounded-xl px-3 py-1.5 text-xs font-medium shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Hiệu ứng Đang gõ (Loading Dots) */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#334155] border border-gray-100 dark:border-gray-600 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-1.5 px-4">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Form nhập chat */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-white dark:bg-[#1E293B] border-t border-gray-100 dark:border-gray-700 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder={isLoading ? "Bot đang phản hồi..." : "Nhập câu hỏi của bạn..."}
              className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-[#334155] dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white p-2.5 rounded-xl disabled:opacity-40 transition-all flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Nút kích hoạt Chat cố định góc phải */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen 
            ? "bg-red-500 hover:bg-red-600 ring-4 ring-red-100 dark:ring-red-900/30" 
            : "bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-100 dark:ring-blue-900/30"
        } text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none flex items-center justify-center`}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
        )}
      </button>
    </div>
  );
}