import { useState } from 'react';
import { MessageSquare, Plus, Trash2, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import type { Conversation } from '../lib/types';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onOpenAdmin: () => void;
}

export function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, onOpenAdmin }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <aside
      className={`flex flex-col bg-slate-900 border-r border-slate-700 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-72'
      } flex-shrink-0`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-white/10 p-1">
              <img src="/inv.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">Ativo Imobilizado</p>
              <p className="text-slate-400 text-xs">Especialista CAPEX/OPEX</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto overflow-hidden bg-white/10 p-1">
            <img src="/inv.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded ml-auto"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="p-3 space-y-2">
        <button
          onClick={onNew}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <Plus size={16} />
          {!collapsed && <span>Nova Conversa</span>}
        </button>
        <button
          onClick={onOpenAdmin}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-600 text-slate-300 text-sm font-medium transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <Shield size={16} />
          {!collapsed && <span>Administrador</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {conversations.length === 0 && !collapsed && (
          <p className="text-slate-500 text-xs text-center py-8 px-2">
            Nenhuma conversa ainda. Comece fazendo uma pergunta!
          </p>
        )}
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
              activeId === conv.id
                ? 'bg-slate-700 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            onClick={() => onSelect(conv.id)}
            onMouseEnter={() => setHoveredId(conv.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <MessageSquare size={15} className="flex-shrink-0 text-slate-400" />
            {!collapsed && (
              <>
                <span className="text-sm truncate flex-1">{conv.title}</span>
                {hoveredId === conv.id && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {!collapsed && (
        <div className="p-4 border-t border-slate-700">
          <p className="text-slate-500 text-xs text-center">
            Powered by Gemini 2.0 Pro Intelligence
          </p>
        </div>
      )}
    </aside>
  );
}
