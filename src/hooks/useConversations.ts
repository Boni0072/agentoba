import { useState, useEffect, useCallback } from 'react';
import type { Conversation } from '../lib/types';

const STORAGE_KEY = 'agente_conversations';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setConversations(parsed.sort((a: any, b: any) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, []);

  const createConversation = useCallback((title: string): Conversation => {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title,
      session_id: 'local',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newConv, ...conversations];
    setConversations(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newConv;
  }, []);

  const updateConversationTitle = useCallback((id: string, title: string) => {
    setConversations(prev => {
      const updated = prev.map(c => 
        c.id === id ? { ...c, title, updated_at: new Date().toISOString() } : c
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      localStorage.removeItem(`agente_messages_${id}`);
      return filtered;
    });
  }, []);

  const touchConversation = useCallback((id: string) => {
    setConversations(prev => {
      const found = prev.find(c => c.id === id);
      if (!found) return prev;
      const updated = { ...found, updated_at: new Date().toISOString() };
      const newList = [updated, ...prev.filter(c => c.id !== id)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      return newList;
    });
  }, []);

  return {
    conversations,
    loading,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    touchConversation,
    refresh: fetchConversations,
  };
}
