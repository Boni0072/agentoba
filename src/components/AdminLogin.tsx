import { useState } from 'react';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

const ADMIN_PASSWORD = 'Obahortfruit@2026';

interface AdminLoginProps {
  onAuthenticated: () => void;
}

export function AdminLogin({ onAuthenticated }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', '1');
      onAuthenticated();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-50">
      <div
        className={`w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-200 p-8 transition-transform ${
          shaking ? 'animate-shake' : ''
        }`}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center mb-4">
            <Shield size={26} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Area do Administrador</h2>
          <p className="text-sm text-slate-500 mt-1">Digite a senha para acessar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false); }}
                placeholder="Digite a senha de administrador"
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors pr-10 ${
                  error
                    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                }`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-red-500">
                <AlertCircle size={13} />
                <span className="text-xs">Senha incorreta. Tente novamente.</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
