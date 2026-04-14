import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { WelcomeScreen } from './WelcomeScreen';
import type { Message } from '../lib/types';

interface ChatViewProps {
  messages: Message[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  isLoading: boolean;
  streamingMessage: string | null;
  onSuggestion: (text: string) => void;
}

export function ChatView({
  messages,
  input,
  onInputChange,
  onSend,
  isLoading,
  streamingMessage,
  onSuggestion,
}: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const showWelcome = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto">
        {showWelcome ? (
          <WelcomeScreen onSuggestion={onSuggestion} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <ChatMessage
                message={{
                  id: 'streaming',
                  conversation_id: '',
                  role: 'assistant',
                  content: streamingMessage || '',
                  created_at: new Date().toISOString(),
                }}
                isStreaming
              />
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            value={input}
            onChange={onInputChange}
            onSend={onSend}
            disabled={isLoading}
            placeholder="Pergunte sobre CAPEX, OPEX, ativo imobilizado, depreciação..."
          />
          <p className="text-xs text-slate-400 text-center mt-2">
            Este agente fornece orientações gerais. Consulte sempre um contador para decisões específicas.
          </p>
        </div>
      </div>
    </div>
  );
}
