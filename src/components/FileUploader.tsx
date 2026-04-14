import { useState, useRef } from 'react';
import { Upload, FileText, X, Check, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onFileProcessed: (data: { title: string; content: string; source: string }) => Promise<void>;
}

const ACCEPTED_TYPES = [
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/json',
];

const ACCEPTED_EXTENSIONS = ['.txt', '.csv', '.md', '.json'];

function getFileExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx).toLowerCase() : '';
}

function isAccepted(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  return ACCEPTED_EXTENSIONS.includes(getFileExtension(file.name));
}

export function FileUploader({ onFileProcessed }: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!isAccepted(file)) {
      setResult({ success: false, message: `Formato nao suportado: ${getFileExtension(file.name) || file.type}. Use .txt, .csv, .md ou .json` });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResult({ success: false, message: 'Arquivo muito grande. Limite de 5MB.' });
      return;
    }

    setProcessing(true);
    setResult(null);

    try {
      const text = await file.text();

      if (!text.trim()) {
        setResult({ success: false, message: 'Arquivo vazio.' });
        setProcessing(false);
        return;
      }

      const title = file.name.replace(/\.[^.]+$/, '');

      await onFileProcessed({
        title,
        content: text.trim(),
        source: `Arquivo: ${file.name}`,
      });

      setResult({ success: true, message: `"${file.name}" adicionado a base de conhecimento.` });
    } catch {
      setResult({ success: false, message: 'Erro ao processar o arquivo.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.csv,.md,.json"
          onChange={handleFileSelect}
          className="hidden"
        />
        {processing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-blue-500 animate-spin" />
            <p className="text-sm text-slate-600">Processando arquivo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
              <Upload size={22} className="text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                Arraste um arquivo aqui ou clique para selecionar
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Formatos aceitos: .txt, .csv, .md, .json (max 5MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div
          className={`flex items-start gap-2 px-4 py-3 rounded-xl text-sm ${
            result.success
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {result.success ? (
            <Check size={16} className="mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          )}
          <span className="flex-1">{result.message}</span>
          <button
            onClick={() => setResult(null)}
            className="text-current opacity-50 hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <FileText size={12} />
        <span>O conteudo do arquivo sera adicionado como material de consulta para o agente.</span>
      </div>
    </div>
  );
}
