import { User } from 'lucide-react';
import type { Message } from '../lib/types';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

function formatContent(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-blue-700 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^>\s?(.*)$/gm, '<blockquote class="border-l-4 border-slate-300 pl-3 py-1 my-2 italic text-slate-600 bg-slate-50">$1</blockquote>')
    .replace(/^#{3}\s(.+)$/gm, '<h3 class="text-base font-semibold text-slate-800 mt-3 mb-1">$1</h3>')
    .replace(/^#{2}\s(.+)$/gm, '<h2 class="text-lg font-semibold text-slate-800 mt-4 mb-2">$1</h2>')
    .replace(/^#{1}\s(.+)$/gm, '<h1 class="text-xl font-bold text-slate-900 mt-4 mb-2">$1</h1>')
    .replace(/^[-•]\s(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\.\s(.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/(<li.*<\/li>\n?)+/g, (match) => `<ul class="space-y-0.5 my-2">${match}</ul>`)
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, '<br/>');
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 group">
        <div className="max-w-[75%]">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <User size={15} className="text-slate-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 group">
      <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden p-1">
        <img src="/inv.png" alt="Assistant" className="w-full h-full object-contain" />
      </div>
      <div className="max-w-[80%]">
        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          {message.content ? (
            <div
              className="text-sm text-slate-700 leading-relaxed prose-sm"
              dangerouslySetInnerHTML={{ __html: `<p>${formatContent(message.content)}</p>` }}
            />
          ) : isStreaming ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
            </div>
          ) : null}
          {isStreaming && message.content && (
            <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-0.5" />
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1 ml-1">Agente Gemini 2.5 generated - Especialista em Ativo Imobilizado</p>
      </div>
    </div>
  );
}
