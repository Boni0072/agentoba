import { Building2, TrendingUp, Wrench, BookOpen, Scale, BarChart3 } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestion: (text: string) => void;
}

const suggestions = [
  {
    icon: TrendingUp,
    label: 'Classificação CAPEX vs OPEX',
    text: 'Como classifico a troca de um motor de equipamento industrial? É CAPEX ou OPEX?',
  },
  {
    icon: Wrench,
    label: 'Manutenção e Reparos',
    text: 'Qual é o critério para capitalizar um serviço de manutenção em um ativo imobilizado?',
  },
  {
    icon: BookOpen,
    label: 'Normas Contábeis',
    text: 'Quais são os principais requisitos do CPC 27 para reconhecimento de ativo imobilizado?',
  },
  {
    icon: Scale,
    label: 'Aspecto Fiscal',
    text: 'Como funciona o crédito de PIS/COFINS na aquisição de ativo imobilizado no regime não-cumulativo?',
  },
  {
    icon: BarChart3,
    label: 'Depreciação',
    text: 'Qual a diferença entre depreciação contábil e depreciação fiscal? Como conciliar?',
  },
  {
    icon: Building2,
    label: 'Projetos de Capital',
    text: 'Como estruturar o controle de projetos CAPEX em andamento (CIP - Construction in Progress)?',
  },
];

export function WelcomeScreen({ onSuggestion }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-slate-100 overflow-hidden p-4">
        <img src="/inv.png" alt="Sistema Icon" className="w-full h-full object-contain" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Especialista em Ativo Imobilizado
      </h1>
      <p className="text-slate-500 text-center max-w-md mb-10 text-sm leading-relaxed">
        Tire suas dúvidas sobre classificação de projetos CAPEX e OPEX, normas contábeis (CPC 27 / IAS 16),
        depreciação, aspectos fiscais e muito mais.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
        {suggestions.map((s) => (
          <button
            key={s.label}
            onClick={() => onSuggestion(s.text)}
            className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
              <s.icon size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-0.5">{s.label}</p>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{s.text}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
