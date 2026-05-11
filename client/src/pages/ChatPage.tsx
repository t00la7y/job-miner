import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream");
      }

      const decoder = new TextDecoder();
      let botMessageContent = "";
      let botMessageId = "";

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    botMessageContent += parsed.content;

                    // Create or update bot message
                    setMessages((prev) => {
                      const existingBotMessage = prev.find(
                        (msg) => msg.id === botMessageId && !msg.isUser,
                      );

                      if (existingBotMessage) {
                        // Update existing message
                        return prev.map((msg) =>
                          msg.id === botMessageId && !msg.isUser
                            ? { ...msg, content: botMessageContent }
                            : msg,
                        );
                      } else {
                        // Create new message
                        botMessageId = (Date.now() + 1).toString();
                        return [
                          ...prev,
                          {
                            id: botMessageId,
                            content: botMessageContent,
                            isUser: false,
                            timestamp: new Date(),
                          },
                        ];
                      }
                    });
                  }
                } catch (parseError) {
                  // Skip invalid JSON
                  continue;
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      };

      await processStream();
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <button
            onClick={() => navigate("/jobs")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Jobs</span>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">
              Job Search Assistant
            </h1>
            <p className="text-sm text-gray-500">
              Ask me anything about jobs and career advice
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={32} className="text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome to Job Search Assistant
                </h2>
                <p className="text-sm mb-6">
                  I'm here to help you with job searching, career advice, and
                  answering questions about job opportunities.
                </p>
                <div className="space-y-2 text-left">
                  <p className="text-sm font-medium text-gray-700">
                    Try asking:
                  </p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>• "What are the best remote jobs for developers?"</p>
                    <p>• "How should I prepare for a React interview?"</p>
                    <p>• "What skills are most in demand right now?"</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-lg ${
                  message.isUser
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.isUser ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Loader2 size={20} className="animate-spin text-blue-600" />
                  <span className="text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-6">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  ref={inputRef as any}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about jobs, career advice, or anything related to job searching..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={1}
                  disabled={isLoading}
                  style={{ minHeight: "48px", maxHeight: "120px" }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height =
                      Math.min(target.scrollHeight, 120) + "px";
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Send size={20} />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
