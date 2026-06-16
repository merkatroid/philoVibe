'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChat } from 'ai/react';
import { ChatWindow } from '@/components/ChatWindow';
import { ChevronDown, Sparkles, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { toast as sonnerToast } from 'sonner';
import {
  CHAT_PERSONAS,
  getClientModelLabel,
  getPersonaEmoji,
  getPersonaName,
  resolvePersonaFromParams,
} from '@/lib/chat/personas';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const [selectedPersona, setSelectedPersona] = useState('socrates');
  const [customName, setCustomName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const urlParamsApplied = useRef(false);
  const modelLabel = getClientModelLabel();

  const personaRef = useRef<{ persona: string; customName?: string }>({
    persona: selectedPersona,
    customName: undefined,
  });
  personaRef.current = {
    persona: selectedPersona,
    customName: selectedPersona === 'custom' ? customName || undefined : undefined,
  };

  // Debate Mode states
  const [debateMode, setDebateMode] = useState(false);
  const [debaterA, setDebaterA] = useState('socrates');
  const [debaterB, setDebaterB] = useState('nietzsche');
  const [debateMessages, setDebateMessages] = useState<any[]>([]);
  const [isDebateLoading, setIsDebateLoading] = useState(false);

  const currentPersona =
    CHAT_PERSONAS.find((p) => p.id === selectedPersona) ?? CHAT_PERSONAS[0];

  const displayPersonaName =
    selectedPersona === 'custom' && customName
      ? customName
      : getPersonaName(selectedPersona, customName);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setMessages,
    setInput,
    append,
  } = useChat({
    api: '/api/chat',
    experimental_prepareRequestBody: ({ messages: chatMessages }) => ({
      messages: chatMessages,
      persona: personaRef.current.persona,
      customName: personaRef.current.customName,
    }),
    onError: (err) => {
      console.error('Chat stream error:', err);
      const hint =
        err.message?.includes('An error occurred')
          ? 'Check GROQ_API_KEY in .env.local (must start with gsk_). Restart the dev server after changes.'
          : err.message || 'Streaming failed.';
      toast.error(hint, { duration: 5000 });
    },
    initialMessages: [],
  });

  // Apply persona/customName from encyclopedia or deep links
  useEffect(() => {
    if (urlParamsApplied.current) return;

    const personaParam = searchParams.get('persona');
    const customNameParam = searchParams.get('customName');
    const promptParam = searchParams.get('prompt');

    if (personaParam) {
      const resolved = resolvePersonaFromParams(personaParam, customNameParam);
      if (resolved) {
        setSelectedPersona(resolved.personaId);
        setCustomName(resolved.customName);
        toast.success(`Now speaking with ${resolved.displayName}`, { duration: 2400 });
      }
      urlParamsApplied.current = true;

      const nextUrl = promptParam
        ? `/chat?prompt=${encodeURIComponent(promptParam)}`
        : '/chat';
      window.history.replaceState({}, '', nextUrl);
    }
  }, [searchParams]);

  // Auto-send prompt from home page quick searches
  useEffect(() => {
    const promptFromUrl = searchParams.get('prompt');
    if (promptFromUrl && messages.length === 0) {
      append({
        role: 'user',
        content: promptFromUrl,
      });
      window.history.replaceState({}, '', '/chat');
    }
  }, [searchParams, append, messages.length]);

  // When persona changes mid-conversation, optionally keep history but update system via new body
  const handlePersonaChange = (newPersona: string) => {
    const previous = selectedPersona;
    setSelectedPersona(newPersona);
    setDropdownOpen(false);

    if (messages.length > 0 && newPersona !== previous) {
      toast.success(`Now speaking with ${getPersonaName(newPersona, customName)}`, {
        duration: 2200,
      });
      // Note: the next message will use the new persona system prompt automatically
    }
  };

  const handleClear = () => {
    setMessages([]);
    toast('Conversation cleared', { icon: '🧹' });
  };

  // Allow Enter in custom name field to focus chat
  const handleCustomNameKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setDropdownOpen(false);
    }
  };

  // Simple but gorgeous debate streaming helper
  const generateDebateTurn = async (personaId: string, cName: string | undefined, prompt: string, speaker: 'A' | 'B') => {
    const tempId = `d-${Date.now()}`;
    const speakerName = getPersonaName(personaId, cName);

    // Add empty streaming message with skeleton
    setDebateMessages(prev => [...prev, {
      id: tempId,
      speaker,
      persona: personaId,
      content: '',
      name: speakerName,
      isStreaming: true
    }]);

    setIsDebateLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          persona: personaId,
          customName: personaId === 'custom' ? cName : undefined,
        })
      });

      if (!res.body) throw new Error('No stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse AI SDK data stream format (0:"text")
        const matches = [...buffer.matchAll(/0:"((?:[^"\\]|\\.)*)"/g)];
        const parsed = matches.map(m => m[1].replace(/\\"/g, '"')).join('');
        if (parsed && parsed.length > accumulated.length) {
          accumulated = parsed;
          setDebateMessages(prev => prev.map(m => 
            m.id === tempId ? { ...m, content: accumulated } : m
          ));
        }
      }

      // finalize
      setDebateMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, isStreaming: false } : m
      ));
    } catch (err) {
      console.error(err);
      sonnerToast.error('Failed to generate debate response');
      setDebateMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsDebateLoading(false);
    }
  };

  const handleDebateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const topic = input.trim();
    if (!topic || isDebateLoading) return;

    // Add the user's topic / interjection
    setDebateMessages(prev => [...prev, {
      id: Date.now(),
      speaker: 'user',
      content: topic,
    }]);
    setInput('');

    const nameA = getPersonaName(debaterA);
    const nameB = getPersonaName(debaterB);

    // A opens
    await generateDebateTurn(
      debaterA, 
      debaterA === 'custom' ? /* handle custom for A if needed */ undefined : undefined, 
      `As ${nameA}, give a thoughtful opening statement on the topic: "${topic}". Speak in your authentic voice.`,
      'A'
    );

    // B responds
    await generateDebateTurn(
      debaterB,
      undefined,
      `As ${nameB}, respond directly to the previous point in the debate about "${topic}". Challenge it, agree with nuance, or offer a counter-perspective. Stay fully in character.`,
      'B'
    );

    sonnerToast.success('Exchange complete', { 
      description: `${nameA} and ${nameB} have spoken.` 
    });
  };

  const toggleDebateMode = () => {
    const next = !debateMode;
    setDebateMode(next);
    if (next) {
      setDebateMessages([]);
      sonnerToast.success('Debate Mode activated', {
        description: 'Two philosophers will now argue. Choose your debaters and propose a topic.',
      });
    } else {
      sonnerToast.info('Returned to single philosopher chat');
      setDebateMessages([]);
    }
  };

  // Reset debaters when toggling or persona changes (basic)
  const handleDebaterChange = (which: 'A' | 'B', newId: string) => {
    if (which === 'A') setDebaterA(newId);
    else setDebaterB(newId);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-y-3">
        <div>
          <div className="uppercase tracking-[3px] text-xs font-medium text-amber-400">LIVE DIALOGUE</div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-1.8px] text-white mt-1">
            Speak with the greats
          </h1>
        </div>
        <div className="text-sm text-zinc-500 max-w-xs md:text-right">
          Every reply streams from{' '}
          <span className="font-mono text-amber-400">{modelLabel}</span> strictly in the chosen
          philosopher&apos;s character, grounded in primary sources.
        </div>
      </div>

      {/* Gorgeous Debate Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={toggleDebateMode}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all text-sm font-medium",
              debateMode 
                ? "bg-amber-500/10 border-amber-500/60 text-amber-400" 
                : "border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            )}
          >
            <Scale className="h-4 w-4" />
            {debateMode ? 'Debate Mode ON' : 'Enable Debate Mode'}
          </button>
          <span className="text-xs text-zinc-500 hidden sm:inline">Two philosophers. One stage.</span>
        </div>
      </div>

      {/* Persona Selector — Beautiful & functional */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-2 pl-1 text-sm text-zinc-400">
          <Sparkles className="h-4 w-4" /> 
          {debateMode ? 'Choose the debaters' : 'Choose your interlocutor'}
        </div>

        {!debateMode ? (
          <>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="persona-select w-full md:w-[460px] flex items-center justify-between rounded-2xl px-5 py-3.5 text-left focus-ring"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl leading-none pt-0.5">
                  {getPersonaEmoji(selectedPersona)}
                </div>
                <div>
                  <div className="font-semibold text-lg tracking-[-0.3px]">
                    {displayPersonaName}
                  </div>
                  <div className="text-xs text-zinc-500 -mt-0.5">
                    {selectedPersona === 'custom' && customName
                      ? 'Custom philosopher'
                      : currentPersona.subtitle}
                  </div>
                </div>
              </div>
              <ChevronDown className={cn("h-5 w-5 text-zinc-400 transition-transform", dropdownOpen && "rotate-180")} />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute z-50 mt-2 w-full md:w-[460px] rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl py-2 text-sm overflow-hidden">
                {CHAT_PERSONAS.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => handlePersonaChange(persona.id)}
                    className={cn(
                      "w-full px-5 py-3 text-left flex items-start gap-4 hover:bg-zinc-950 transition-colors",
                      selectedPersona === persona.id && "bg-zinc-950"
                    )}
                  >
                    <span className="text-2xl pt-px w-7 flex-shrink-0">
                      {persona.emoji}
                    </span>
                    <div className="text-left min-w-0">
                      <div className="font-medium text-zinc-100">{persona.name}</div>
                      <div className="text-xs text-zinc-500">{persona.subtitle}</div>
                      <div className="text-xs text-amber-400/90 mt-px">{persona.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Custom persona name input */}
            {selectedPersona === 'custom' && (
              <div className="mt-3 max-w-md">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={handleCustomNameKey}
                  placeholder="Name of your philosopher (e.g. Hypatia, Camus, Zhuangzi...)"
                  className="search-input w-full rounded-xl px-4 py-2.5 text-sm placeholder:text-zinc-500"
                />
                <p className="text-[11px] mt-1.5 pl-1 text-zinc-500">The system prompt will adapt to this name.</p>
              </div>
            )}
          </>
        ) : (
          /* Debate Mode: Two debaters side by side */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['A', 'B'] as const).map((slot, idx) => {
              const currentId = slot === 'A' ? debaterA : debaterB;
              const setFn = slot === 'A' ? setDebaterA : setDebaterB;
              const label = slot === 'A' ? 'Philosopher A' : 'Philosopher B';
              const personaObj = CHAT_PERSONAS.find((p) => p.id === currentId)!;
              return (
                <div key={slot} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <div className="text-xs uppercase tracking-widest text-amber-400/80 mb-1.5">{label}</div>
                  <select
                    value={currentId}
                    onChange={(e) => handleDebaterChange(slot, e.target.value)}
                    className="persona-select w-full rounded-xl px-4 py-3 text-base focus-ring bg-zinc-950"
                  >
                    {CHAT_PERSONAS.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <div className="mt-2 text-xs text-zinc-400 flex items-center gap-2">
                    <span className="text-lg">{getPersonaEmoji(currentId)}</span>
                    {personaObj.subtitle}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* The actual chat / debate area - gorgeous conditional UI */}
      <div className="h-[calc(100vh-340px)] min-h-[520px]">
        {!debateMode ? (
          <ChatWindow
            messages={messages}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            personaName={displayPersonaName}
            modelLabel={modelLabel}
            onClear={handleClear}
          />
        ) : (
          /* Gorgeous Debate Arena */
          <div className="flex flex-col h-full rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
            {/* Debate Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 bg-zinc-900/70">
              <div className="flex items-center gap-3">
                <div className="text-3xl">⚔️</div>
                <div>
                  <div className="font-semibold tracking-tight">Debate Arena</div>
                  <div className="text-xs text-amber-400/80">
                    {getPersonaName(debaterA)} vs {getPersonaName(debaterB)}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setDebateMessages([])} 
                className="btn btn-ghost text-xs px-3 py-1.5"
                disabled={isDebateLoading}
              >
                Clear Arena
              </button>
            </div>

            {/* Transcript */}
            <div className="flex-1 overflow-y-auto p-6 space-y-7 bg-[#0a0a0b] chat-scroll">
              {debateMessages.length === 0 && !isDebateLoading && (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <div className="text-4xl mb-4 opacity-60">⚔️</div>
                    <p className="text-zinc-400 max-w-xs mx-auto">
                      Enter a philosophical question or topic below. The two debaters will take turns making their case.
                    </p>
                  </div>
                </div>
              )}

              {debateMessages.map((msg, idx) => {
                const isUser = msg.speaker === 'user';
                const isA = msg.speaker === 'A';
                return (
                  <div key={idx} className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
                    {!isUser && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-zinc-800 text-lg mt-0.5">
                        {isA ? '🏛️' : '⚡'}
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[82%] rounded-3xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm",
                      isUser 
                        ? "chat-bubble-user rounded-tr-md" 
                        : isA 
                          ? "bg-amber-950/30 border border-amber-900/40 rounded-tl-md" 
                          : "bg-zinc-800 border border-zinc-700 rounded-tl-md"
                    )}>
                      {!isUser && (
                        <div className="text-xs font-medium tracking-wide mb-1 text-amber-400/70">
                          {msg.name}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap break-words">
                        {msg.content || (msg.isStreaming && (
                          <div className="space-y-1.5">
                            <div className="h-3 bg-zinc-700 rounded w-3/4 animate-pulse" />
                            <div className="h-3 bg-zinc-700 rounded w-1/2 animate-pulse" />
                          </div>
                        ))}
                        {msg.isStreaming && <span className="streaming-cursor ml-1" />}
                      </div>
                    </div>
                    {isUser && (
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-zinc-700 text-zinc-400">
                        You
                      </div>
                    )}
                  </div>
                );
              })}

              {isDebateLoading && debateMessages.length > 0 && (
                <div className="flex items-center gap-2 pl-11 text-sm text-zinc-500">
                  <div className="h-3 w-3 rounded-full bg-amber-400 animate-pulse" /> 
                  A philosopher is composing their argument...
                </div>
              )}
            </div>

            {/* Debate Input */}
            <div className="border-t border-zinc-800 bg-zinc-900/70 p-4">
              <form onSubmit={handleDebateSubmit} className="flex items-end gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Propose a topic for debate (e.g. the nature of justice)..."
                  className="search-input w-full rounded-2xl border px-5 py-[17px] text-[15px] placeholder:text-zinc-500 focus-ring"
                  disabled={isDebateLoading}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isDebateLoading}
                  className="btn btn-primary h-14 px-6 rounded-2xl disabled:opacity-40"
                >
                  {isDebateLoading ? 'Thinking...' : 'Submit to the Arena'}
                </button>
              </form>
              <div className="mt-2 text-[10px] text-center text-zinc-600">
                The debaters will respond in turn using {modelLabel}, grounded in their primary texts.
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-[11px] text-center text-zinc-500 pt-2">
        {debateMode 
          ? "Debate Mode uses the same strict in-character + RAG system for each speaker." 
          : "System prompt enforces strict persona fidelity + requires citation of primary sources when applicable."
        }
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-zinc-500">Loading philosopher interface…</div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
