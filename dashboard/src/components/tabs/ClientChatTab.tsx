"use client";

import { useState } from "react";
import { MOCK_MESSAGES, type Client, type Message } from "@/lib/mock";

export function ClientChatTab({
  client,
}: {
  client: Client;
}) {
  const [messages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} clientColor={client.color} />
        ))}
      </div>

      {/* Input */}
      <div className="px-6 pb-6">
        <div className="flex items-end gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message — ${client.name} (global)…`}
              rows={1}
              className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none resize-none leading-relaxed"
              style={{ minHeight: "24px", maxHeight: "160px" }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = t.scrollHeight + "px";
              }}
            />
            <button
              disabled={!input.trim()}
              className="shrink-0 w-8 h-8 rounded-lg disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 flex items-center justify-center transition-colors"
              style={{ background: input.trim() ? client.color : undefined }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
        </div>
        <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-700 text-center">
          Chat global client — contexte : {client.name}
        </p>
      </div>
    </div>
  );
}

function ChatMessage({
  msg,
  clientColor,
}: {
  msg: Message;
  clientColor: string;
}) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">✦</span>
        </div>
      )}
      <div
        className={`max-w-[68%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-zinc-200 text-zinc-800 rounded-br-sm dark:bg-zinc-800 dark:text-zinc-200"
            : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-bl-sm"
        }`}
        style={{ whiteSpace: "pre-wrap" }}
      >
        {msg.content}
      </div>
      {isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold"
          style={{
            background: clientColor + "30",
            color: clientColor,
            border: `1px solid ${clientColor}40`,
          }}
        >
          Y
        </div>
      )}
    </div>
  );
}
