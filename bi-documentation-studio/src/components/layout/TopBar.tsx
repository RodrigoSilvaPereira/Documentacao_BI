import { Save, FolderOpen, X, Circle } from 'lucide-react';
import { useProject } from '@hooks/useProject';
import { cn } from '@utils/cn';

export function TopBar() {
  const { projetoAberto, temAlteracoes, salvar, fechar } = useProject();

  return (
    <header className="h-11 flex items-center justify-between px-4 bg-white border-b border-slate-200 flex-shrink-0">
      {/* Nome do projeto */}
      <div className="flex items-center gap-2 min-w-0">
        <FolderOpen size={14} className="text-slate-400 flex-shrink-0" />
        <span className="text-sm font-medium text-slate-700 truncate">
          {projetoAberto?.nome ?? 'Sem projeto aberto'}
        </span>
        {temAlteracoes && (
          <Circle size={7} className="text-amber-500 fill-amber-500 flex-shrink-0"/>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1.5">
        <button onClick={salvar} disabled={!projetoAberto || !temAlteracoes}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
            projetoAberto && temAlteracoes
              ? 'bg-brand-600 text-white hover:bg-brand-700'
              : 'text-slate-400 cursor-not-allowed',
          )}
        >
          <Save size={12} /> Salvar
        </button>

        <button onClick={fechar}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <X size={12} /> Fechar
        </button>
      </div>
    </header>
  );
}