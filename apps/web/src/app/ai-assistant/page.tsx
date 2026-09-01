"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, User, RotateCcw, BookOpen, Briefcase, FileText, Mic2, Map, Target } from "lucide-react";
import api from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestions = [
  { icon: BookOpen, label: "Learning advice", prompt: "What should I focus on learning next based on my career goals?" },
  { icon: Target, label: "Skill guidance", prompt: "How can I improve my skill set to become job-ready?" },
  { icon: Map, label: "Career roadmap", prompt: "Can you help me create a career roadmap for becoming a full-stack developer?" },
  { icon: FileText, label: "Resume tips", prompt: "What are the most important things to include in a tech resume?" },
  { icon: Mic2, label: "Interview prep", prompt: "What are common interview questions for a software engineering role?" },
  { icon: Briefcase, label: "Job readiness", prompt: "How do I know if I'm ready to start applying for jobs?" },
];

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          isUser ? "bg-brand-600 text-white" : "bg-gradient-to-br from-brand-500 to-violet-600 text-white"
        }`}
      >
        {isUser ? <User size={14} /> : <Sparkles size={14} />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-brand-600 text-white rounded-tr-sm"
            : "bg-surface border border-border text-text-primary rounded-tl-sm"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={`text-[10px] mt-1.5 ${isUser ? "text-brand-200" : "text-text-muted"}`}>
          {message.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  const { user } = useAuthStore();
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi ${user?.name?.split(" ")[0] ?? "there"}! I'm your AI learning and career assistant powered by Gemini. I can help you with:\n\n• Learning recommendations\n• Career guidance and planning\n• Skill development strategies\n• Resume improvement tips\n• Interview preparation\n• Study recommendations\n\nWhat would you like to work on today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Build conversation context for the AI
      const conversationHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n");

      const prompt = conversationHistory
        ? `${conversationHistory}\nUser: ${content.trim()}`
        : content.trim();

      const response = await api.post("/ai/roadmap", {
        customPrompt: prompt,
      });

      // The roadmap endpoint returns roadmap field; use that or fall back to a generic response
      const reply = response.data.roadmap || response.data.message || response.data.response || "I couldn't generate a response. Please try again.";

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      toast.error("Failed to get response", "Could not reach the AI assistant.");
      // Remove the user message if the request failed
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content: `Chat cleared! What would you like help with?`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="max-w-3xl flex flex-col" style={{ height: "calc(100vh - 7rem)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            AI Assistant
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Your intelligent learning and career companion
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} leftIcon={<RotateCcw size={13} />}>
          New Chat
        </Button>
      </div>

      {/* Messages */}
      <Card padding="none" className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-5">
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips — only show when chat is at welcome state */}
        {messages.length <= 1 && (
          <div className="px-4 pb-3 border-t border-border pt-3">
            <p className="text-xs text-text-muted mb-2 font-medium">Quick suggestions</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => sendMessage(s.prompt)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-surface-3 border border-border text-text-secondary hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all"
                >
                  <s.icon size={11} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-border p-3">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about learning, career, skills, resume, interviews…"
              rows={1}
              className="flex-1 rounded-xl border border-border bg-surface text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder:text-text-muted resize-none"
              style={{ maxHeight: "120px", overflowY: "auto" }}
            />
            <Button
              onClick={handleSend}
              loading={loading}
              disabled={!input.trim()}
              size="md"
              className="shrink-0"
              leftIcon={<Send size={14} />}
            >
              Send
            </Button>
          </div>
          <p className="text-[10px] text-text-muted mt-1.5 text-center">
            Powered by Google Gemini AI · Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </Card>
    </div>
  );
}
