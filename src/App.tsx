import { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { AdminPanel } from './components/AdminPanel';
import { useConversations } from './hooks/useConversations';
import { useMessages } from './hooks/useMessages';
import { GEMINI_MODEL } from './lib/constants';
import { generateChatResponse } from './lib/gemini';

export default function App() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const {
    conversations,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    touchConversation,
  } = useConversations();

  const { messages, addMessage } = useMessages(activeConversationId);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setShowAdmin(false);
  }, []);

  const handleDeleteConversation = useCallback((id: string) => {
    deleteConversation(id);
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  }, [deleteConversation, activeConversationId]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    let convId = activeConversationId;

    if (!convId) {
      const title = trimmed.length > 55 ? trimmed.slice(0, 55) + '...' : trimmed;
      const conv = createConversation(title);
      convId = conv.id;
      setActiveConversationId(convId);
    }

    addMessage(convId, 'user', trimmed);

    // Pega o histórico local atualizado
    const history = messages.concat({ 
      id: 'temp', role: 'user', content: trimmed, conversation_id: convId, created_at: '' 
    }).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    try {
      const result = await generateChatResponse(history, GEMINI_MODEL);
      
      addMessage(convId, 'assistant', result.content);
      touchConversation(convId);
      
      console.log(`Resposta gerada usando: ${result.actualModel}`);

      const currentTitle = conversations.find(c => c.id === convId)?.title ?? '';
      if (currentTitle === trimmed || currentTitle === trimmed.slice(0, 55) + '...') {
        const shortTitle = trimmed.length > 55 ? trimmed.slice(0, 55) + '...' : trimmed;
        updateConversationTitle(convId, shortTitle);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro inesperado.';
      addMessage(
        convId,
        'assistant',
        `Desculpe, ocorreu um erro ao processar sua solicitação: ${errorMsg}\n\nVerifique se a chave da API do Gemini em constants.ts está correta.`
      );
    } finally {
      setIsLoading(false);
      setStreamingContent(null);
    }
  }, [
    activeConversationId,
    isLoading,
    createConversation,
    addMessage,
    touchConversation,
    updateConversationTitle,
    conversations,
  ]);

  const handleSend = useCallback(() => {
    sendMessage(input);
  }, [sendMessage, input]);

  const handleSuggestion = useCallback((text: string) => {
    sendMessage(text);
  }, [sendMessage]);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        onNew={() => { setActiveConversationId(null); setShowAdmin(false); }}
        onDelete={handleDeleteConversation}
        onOpenAdmin={() => setShowAdmin(true)}
      />

      <main className="flex flex-col flex-1 min-w-0 bg-slate-50">
        {showAdmin ? (
          <AdminPanel onClose={() => setShowAdmin(false)} />
        ) : (
          <>
            <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
              <div>
                <h1 className="text-sm font-semibold text-slate-900">
                  {activeConversationId
                    ? (conversations.find(c => c.id === activeConversationId)?.title || 'Conversa')
                    : 'Especialista em Ativo Imobilizado'}
                </h1>
                <p className="text-xs text-slate-500">
                  {activeConversationId
                    ? 'Ativo Imobilizado · CAPEX / OPEX'
                    : 'Pronto para responder suas duvidas'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-xs text-slate-500">Online</span>
              </div>
            </header>

            <ChatView
              messages={messages}
              input={input}
              onInputChange={setInput}
              onSend={handleSend}
              isLoading={isLoading}
              streamingMessage={streamingContent}
              onSuggestion={handleSuggestion}
            />
          </>
        )}
      </main>
    </div>
  );
}
