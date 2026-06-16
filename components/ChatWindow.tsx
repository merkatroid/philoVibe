'use client';

import React, { useRef, useEffect } from 'react';
import { Send, Square, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system' | 'data' | string;
  content: string;
}

interface ChatWindowProps {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop: () => void;
  personaName: string;
  modelLabel: string;
  onClear?: () => void;
}

export function ChatWindow({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  personaName,
  modelLabel,
  onClear,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredMessages = messages.filter((m) => m.role !== 'system');
  const lastMessage = filteredMessages[filteredMessages.length - 1];
  const isStreamingAssistant =
    isLoading && lastMessage?.role === 'assistant' && Boolean(lastMessage.content);
  const waitingForFirstToken =
    isLoading && (!lastMessage || lastMessage.role === 'user');

  return (
    <div className="flex flex-col h-full rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/70">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/90 to-amber-600 text-zinc-950">
            <Bot className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="font-semibold tracking-tight">{personaName}</div>
            <div className="text-xs text-zinc-500 flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {modelLabel} • stays strictly in character
            </div>
          </div>
        </div>
        {onClear && filteredMessages.length > 0 && (
          <button onClick={onClear} className="btn btn-ghost text-xs px-3 py-1.5">
            Clear conversation
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="chat-scroll flex-1 overflow-y-auto px-6 py-8 space-y-7 bg-[#0a0a0b]"
      >
        {filteredMessages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center px-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 ring-1 ring-zinc-800">
              <Bot className="h-8 w-8 text-amber-400/80" />
            </div>
            <h3 className="font-medium text-lg tracking-tight">Begin the dialogue</h3>
            <p className="mt-2 max-w-xs text-sm text-zinc-500">
              Speak with {personaName}. Responses stream in real time, grounded in primary sources
              and historical context.
            </p>
            <div className="mt-6 text-[11px] uppercase tracking-[2px] text-zinc-600">
              Primary sources via RAG • low hallucination mode
            </div>
          </div>
        )}

        {filteredMessages.map((message, index) => {
          const isUser = message.role === 'user';
          const isLast = index === filteredMessages.length - 1;
          const showCursor = isLoading && isLast && !isUser;

          return (
            <div
              key={message.id || index}
              className={cn('flex gap-3.5', isUser ? 'justify-end' : 'justify-start')}
            >
              {!isUser && (
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-zinc-800 text-amber-400">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={cn(
                  'max-w-[82%] rounded-3xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm',
                  isUser ? 'chat-bubble-user rounded-tr-md' : 'chat-bubble-assistant rounded-tl-md'
                )}
              >
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                  {showCursor && <span className="streaming-cursor" />}
                </div>
              </div>

              {isUser && (
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-zinc-700 text-zinc-400">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {waitingForFirstToken && (
          <div className="flex gap-3.5 pl-11">
            <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-zinc-800 text-amber-400">
              <Bot className="h-4 w-4 animate-pulse" />
            </div>
            <div className="max-w-[82%] rounded-3xl border border-zinc-800 bg-zinc-900/60 px-5 py-3.5">
              <div className="space-y-2">
                <div className="h-3.5 w-3/4 bg-zinc-700 rounded animate-pulse" />
                <div className="h-3.5 w-1/2 bg-zinc-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {isStreamingAssistant && (
          <div className="pl-11 text-xs text-zinc-500">Composing response…</div>
        )}
      </div>

      <div className="border-t border-zinc-800 bg-zinc-900/70 p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder={`Ask ${personaName.split(',')[0]}…`}
              className="search-input w-full rounded-2xl border px-5 py-[17px] pr-12 text-[15px] placeholder:text-zinc-500 focus-ring"
              disabled={isLoading}
            />
          </div>

          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="btn h-14 w-14 flex-shrink-0 rounded-2xl border border-zinc-700 bg-zinc-900 hover:bg-red-950/70 hover:border-red-900 text-red-400"
              title="Stop generation"
            >
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="btn btn-primary h-14 w-14 flex-shrink-0 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </form>
        <div className="mt-2 px-1 text-center text-[10px] text-zinc-600">
          Powered by {modelLabel} + basic RAG from primary texts. Always verify with original
          sources.
        </div>
      </div>
    </div>
  );
}