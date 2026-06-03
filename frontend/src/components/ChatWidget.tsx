"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date; // Đã sửa từ 'limeslamp: Dale' thành 'timestamp: Date' chuẩn TypeScript
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Xin chào! Em là Trợ lý ảo Resort. Em có thể giúp gì cho Anh/Chị trong việc quản trị và kiểm tra phòng hôm nay ạ?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessageText = inputValue.trim();
    setInputValue("");

    // 1. Thêm tin nhắn của người dùng vào UI
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userMessageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Đọc link chatbot từ biến môi trường (mặc định nếu thiếu là cổng 8081)
      const CHAT_BASE_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:8081';
      const token = localStorage.getItem('token');

      // Tự gọi fetch thẳng sang cổng 8081 của chatbot
      // Tự gọi fetch thẳng sang cổng 8080 của chatbot
      const res = await fetch(`${CHAT_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userMessageText }), 
      });

      // === ĐÃ CẬP NHẬT ĐOẠN NÀY ĐỂ BẮT LỖI CHÍNH XÁC ===
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("👉 LỖI THỰC TẾ TỪ PYTHON:", errorData);
        throw new Error(errorData.detail || `Mã lỗi hệ thống: ${res.status}`);
      }
      // ===============================================

      const response = await res.json();

      // Xử lý phản hồi từ Backend Chatbot (Đọc thuộc tính .answer từ ChatResponse)
      const aiAnswer = response?.answer;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: aiAnswer || "Em đã nhận được thông tin nhưng hệ thống phản hồi chưa đúng định dạng.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      
    } catch (error) {
      console.error("Lỗi khi kết nối hệ thống Chatbot:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Hệ thống đang bận hoặc Phiên đăng nhập hết hạn. Anh/Chị vui lòng thử lại sau nhé!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Nút Bấm Mở Cửa Sổ Chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 bg-blue-600 text-white"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Hộp Thoại Giao Diện Chat */}
      {isOpen && (
        <div className="flex h-[500px] w-[380px] flex-col rounded-2xl border shadow-2xl overflow-hidden bg-white border-slate-200">
          {/* Header Cửa Sổ Chat */}
          <div className="flex items-center justify-between bg-blue-600 p-4 text-white">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white/20 p-1">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Trợ Lý Ảo Resort</h3>
                <span className="text-xs text-blue-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Trực tuyến
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Khu Vực Hiển Thị Nội Dung Tin Nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full text-xs font-medium ${
                    msg.sender === "user"
                      ? "bg-slate-200 text-slate-800"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Nội dung text bong bóng chat */}
                <div className="space-y-1">
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm shadow-sm whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <p className="text-[10px] text-slate-400 px-1 text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Hiệu ứng loading khi chờ AI trả lời */}
            {isLoading && (
              <div className="flex gap-2 max-w-[85%] mr-auto items-center text-slate-400 text-xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <span>Trợ lý đang suy nghĩ...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ô Nhập Tin Nhắn Gửi Đi */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 border-t p-3 bg-white border-slate-100"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập câu hỏi của bạn tại đây..."
              disabled={isLoading}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}