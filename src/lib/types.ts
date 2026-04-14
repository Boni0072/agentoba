export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  session_id: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  category: string;
  content: string;
  source: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
