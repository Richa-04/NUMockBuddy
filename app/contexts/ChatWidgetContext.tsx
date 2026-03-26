"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface ChatWidgetContextType {
  isOpen: boolean;
  activeTab: "messages" | "articles";
  messages: Message[];
  isTyping: boolean;
  hasUnread: boolean;
  sessionId: string | null;
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  setActiveTab: (tab: "messages" | "articles") => void;
  sendMessage: (content: string) => Promise<void>;
  setSessionId: (id: string) => void;
  clearMessages: () => void;
}

const ChatWidgetContext = createContext<ChatWidgetContextType | null>(null);

export function ChatWidgetProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"messages" | "articles">("messages");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const hasOpenedBefore = useRef(false);

  const openWidget = useCallback(() => {
    setIsOpen(true);
    setHasUnread(false);
    hasOpenedBefore.current = true;
  }, []);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleWidget = useCallback(() => {
    if (isOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  }, [isOpen, openWidget, closeWidget]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setHasUnread(false);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat/widget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (!isOpen && hasOpenedBefore.current) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error("Widget chat error:", err);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, sessionId, isOpen]);

  return (
    <ChatWidgetContext.Provider
      value={{
        isOpen,
        activeTab,
        messages,
        isTyping,
        hasUnread,
        sessionId,
        openWidget,
        closeWidget,
        toggleWidget,
        setActiveTab,
        sendMessage,
        setSessionId,
        clearMessages,
      }}
    >
      {children}
    </ChatWidgetContext.Provider>
  );
}

export function useChatWidget() {
  const ctx = useContext(ChatWidgetContext);
  if (!ctx) throw new Error("useChatWidget must be used inside ChatWidgetProvider");
  return ctx;
}
