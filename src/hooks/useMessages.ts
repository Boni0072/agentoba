import { useState, useEffect, useCallback } from 'react';
import type { Message } from '../lib/types';

const getStorageKey = (id: string) => `agente_messages_${id}`;

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const stored = localStorage.getItem(getStorageKey(conversationId));
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const addMessage = useCallback((
    convId: string,
    role: 'user' | 'assistant',
    content: string
  ): Message => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: convId,
      role,
      content,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];
      localStorage.setItem(getStorageKey(convId), JSON.stringify(updated));
      return updated;
    });

    return newMessage;
  }, []);

  const addOptimisticMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const replaceOptimisticMessage = useCallback((tempId: string, real: Message) => {
    setMessages(prev => prev.map(m => (m.id === tempId ? real : m)));
  }, []);

  return { messages, loading, addMessage, addOptimisticMessage, replaceOptimisticMessage };
}
