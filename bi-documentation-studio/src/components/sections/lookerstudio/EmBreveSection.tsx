import type { ReactNode } from 'react';
import { Clock } from 'lucide-react';

interface EmBreveSectionProps {
  titulo:     string;
  descricao?: string;
  icone?:     ReactNode;
}

export function EmBreveSection({ titulo, descricao, icone }: EmBreveSectionProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto pb-16">
      <div className="flex flex-col items-center justify-center py-24 text-center">

        {/* Ícone */}
        <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center mb-6">
          {icone ?? <Clock size={28} className="text-green-600" />}
        </div>

        {/* Título */}
        <h2 className="text-xl font-bold text-slate-700 mb-2">{titulo}</h2>

        {/* Descrição */}
        <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
          {descricao ?? 'Esta seção está em desenvolvimento e estará disponível em breve.'}
        </p>

        {/* Badge */}
        <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <p className="text-xs text-green-700 font-semibold">
            Looker Studio — Em desenvolvimento
          </p>
        </div>
      </div>
    </div>
  );
}