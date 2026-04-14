import { useState } from 'react';
import {
  X, Plus, Trash2, CreditCard as Edit3, Search,
  ToggleLeft, ToggleRight, FileText, ChevronDown,
  ChevronUp, Check, Upload, LogOut, BookOpen,
} from 'lucide-react';
import { AdminLogin } from './AdminLogin';
import { FileUploader } from './FileUploader';
import { useKnowledgeBase } from '../hooks/useKnowledgeBase';
import type { KnowledgeBaseEntry } from '../lib/types';

const CATEGORIES = [
  'CPC 27 / IAS 16',
  'CAPEX',
  'OPEX',
  'Fiscal',
  'Depreciacão',
  'Arrendamento',
  'Impairment',
  'Governanca',
  'Geral',
];

interface EntryFormData {
  title: string;
  category: string;
  content: string;
  source: string;
}

const emptyForm: EntryFormData = { title: '', category: '', content: '', source: '' };

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('admin_auth') === '1'
  );

  if (!authenticated) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-semibold text-slate-900">Administrador</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <AdminLogin onAuthenticated={() => setAuthenticated(true)} />
      </div>
    );
  }

  return <AdminDashboard onClose={onClose} />;
}

function AdminDashboard({ onClose }: { onClose: () => void }) {
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useKnowledgeBase();
  const [activeTab, setActiveTab] = useState<'knowledge' | 'upload' | 'manage'>('knowledge');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EntryFormData>(emptyForm);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('Geral');

  const filtered = entries.filter(e => {
    const matchesSearch = !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filterCategory || e.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateEntry(editingId, form);
      } else {
        await addEntry(form);
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry: KnowledgeBaseEntry) => {
    setForm({
      title: entry.title,
      category: entry.category,
      content: entry.content,
      source: entry.source,
    });
    setEditingId(entry.id);
    setShowForm(true);
    setActiveTab('manage');
  };

  const handleToggleActive = async (entry: KnowledgeBaseEntry) => {
    await updateEntry(entry.id, { is_active: !entry.is_active });
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
    if (expandedId === id) setExpandedId(null);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const handleFileProcessed = async (data: { title: string; content: string; source: string }) => {
    await addEntry({ ...data, category: uploadCategory });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    onClose();
  };

  const usedCategories = [...new Set(entries.map(e => e.category).filter(Boolean))];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Painel do Administrador</h2>
          <p className="text-xs text-slate-500">
            {entries.length} {entries.length === 1 ? 'material' : 'materiais'} na base
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-red-600 text-xs font-medium rounded-lg transition-colors hover:bg-red-50"
            title="Sair"
          >
            <LogOut size={14} />
            Sair
          </button>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 bg-white px-6 flex-shrink-0">
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'knowledge'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <BookOpen size={15} />
            Base de Conhecimento
          </span>
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'upload'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <Upload size={15} />
            Anexar Arquivo
          </span>
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'manage'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText size={15} />
            Gerenciar Base
          </span>
        </button>
      </div>

      {activeTab === 'knowledge' && (
        <>
          <div className="px-6 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar materiais..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Todas categorias</option>
              {usedCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">
                  {entries.length === 0
                    ? 'Nenhum material cadastrado ainda.'
                    : 'Nenhum material encontrado com os filtros aplicados.'}
                </p>
                {entries.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    Use a aba "Anexar Arquivo" ou "Gerenciar Base" para adicionar materiais.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(entry => (
                  <div
                    key={entry.id}
                    className={`bg-white border rounded-xl transition-all ${
                      entry.is_active ? 'border-slate-200' : 'border-slate-100 opacity-60'
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800 truncate">{entry.title}</span>
                          {entry.category && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex-shrink-0">
                              {entry.category}
                            </span>
                          )}
                          {!entry.is_active && (
                            <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full flex-shrink-0">
                              Inativo
                            </span>
                          )}
                        </div>
                        {entry.source && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">Fonte: {entry.source}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); handleToggleActive(entry); }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                          title={entry.is_active ? 'Desativar' : 'Ativar'}
                        >
                          {entry.is_active ? <ToggleRight size={18} className="text-blue-600" /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleEdit(entry); }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(entry.id); }}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        {expandedId === entry.id ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                    </div>
                    {expandedId === entry.id && (
                      <div className="px-4 pb-4 border-t border-slate-100">
                        <pre className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap mt-3 max-h-64 overflow-y-auto">
                          {entry.content}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'upload' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1">Anexar Arquivo</h3>
              <p className="text-xs text-slate-500">
                Envie arquivos de texto para alimentar a base de consulta do agente.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Categoria do arquivo
              </label>
              <select
                value={uploadCategory}
                onChange={e => setUploadCategory(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <FileUploader onFileProcessed={handleFileProcessed} />
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <>
          {showForm && (
            <div className="bg-white border-b border-slate-200 px-6 py-5 flex-shrink-0">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                {editingId ? 'Editar Material' : 'Novo Material'}
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Titulo</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="Ex: CPC 27 - Reconhecimento"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Categoria</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
                    >
                      <option value="">Selecione...</option>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fonte (opcional)</label>
                  <input
                    type="text"
                    value={form.source}
                    onChange={e => setForm(p => ({ ...p, source: e.target.value }))}
                    placeholder="Ex: Lei 6.404/76, CPC 27, IN RFB 1700/2017"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Conteudo</label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    placeholder="Cole aqui o texto, trecho de lei, norma ou material de referencia..."
                    rows={8}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-y"
                  />
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!form.title.trim() || !form.content.trim() || saving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Check size={14} />
                    {saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar materiais..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Todas categorias</option>
              {usedCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0"
            >
              <Plus size={14} />
              Adicionar
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">
                  {entries.length === 0
                    ? 'Nenhum material cadastrado ainda.'
                    : 'Nenhum material encontrado com os filtros aplicados.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(entry => (
                  <div
                    key={entry.id}
                    className={`bg-white border rounded-xl transition-all ${
                      entry.is_active ? 'border-slate-200' : 'border-slate-100 opacity-60'
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800 truncate">{entry.title}</span>
                          {entry.category && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex-shrink-0">
                              {entry.category}
                            </span>
                          )}
                          {!entry.is_active && (
                            <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full flex-shrink-0">
                              Inativo
                            </span>
                          )}
                        </div>
                        {entry.source && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">Fonte: {entry.source}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); handleToggleActive(entry); }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                          title={entry.is_active ? 'Desativar' : 'Ativar'}
                        >
                          {entry.is_active ? <ToggleRight size={18} className="text-blue-600" /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleEdit(entry); }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(entry.id); }}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        {expandedId === entry.id ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                    </div>
                    {expandedId === entry.id && (
                      <div className="px-4 pb-4 border-t border-slate-100">
                        <pre className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap mt-3 max-h-64 overflow-y-auto">
                          {entry.content}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
