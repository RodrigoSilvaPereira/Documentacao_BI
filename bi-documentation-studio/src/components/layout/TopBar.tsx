import { useState } from 'react';
import { Save, FolderOpen, X, Circle, Check, Loader2 } from 'lucide-react';
import { useProject } from '@hooks/useProject';
import { useDocStore } from '@store/useDocStore';
import { useAppStore } from '@store/useAppStore';
import { useSaveShortcut } from '@hooks/useSaveShortcut';
import { cn } from '@utils/cn';

// Badge de plataforma — identidade visual permanente para evitar confusão
function PlatformBadge({ platform }: { platform: 'POWER_BI' | 'LOOKER_STUDIO' }) {
  if (platform === 'LOOKER_STUDIO') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-green-200 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Looker Studio
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200 flex-shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      Power BI
    </span>
  );
}

export function TopBar() {
  const { projetoAberto, temAlteracoes, salvar, fechar } = useProject();

  const tituloAtual = useDocStore((s) => s.documento?.projeto.titulo_relatorio);
  const biPlatform  = useAppStore((s) => s.projetoAberto?.biPlatform ?? 'POWER_BI');
  const nomeProjeto = tituloAtual || projetoAberto?.nome || 'Sem projeto aberto';

  const [salvando,      setSalvando]      = useState(false);
  const [feedbackSalvo, setFeedbackSalvo] = useState(false);

  async function handleSalvar() {
    if (!projetoAberto || !temAlteracoes || salvando) return;
    setSalvando(true);
    try {
      await salvar();
      setFeedbackSalvo(true);
      setTimeout(() => setFeedbackSalvo(false), 2500);
    } catch (err) {
      console.error('Erro ao salvar:', err);
    } finally {
      setSalvando(false);
    }
  }

  useSaveShortcut(() => { if (temAlteracoes) handleSalvar(); });

  const podeSalvar = !!projetoAberto && (temAlteracoes || salvando);

  return (
    <header className="h-11 flex items-center justify-between px-4 bg-white border-b border-slate-200 flex-shrink-0">

      {/* Nome + badge de plataforma + indicador de alterações */}
      <div className="flex items-center gap-2 min-w-0">
        <FolderOpen size={14} className="text-slate-400 flex-shrink-0" />
        <span className="text-sm font-medium text-slate-700 truncate">{nomeProjeto}</span>

        {projetoAberto && (
          <PlatformBadge platform={biPlatform} />
        )}

        {temAlteracoes && !feedbackSalvo && (
          <span title="Há alterações não salvas">
            <Circle size={7} className="text-amber-500 fill-amber-500 flex-shrink-0" />
          </span>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1.5">
        {feedbackSalvo && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium px-1">
            <Check size={12} /> Salvo
          </span>
        )}

        <button
          onClick={handleSalvar}
          disabled={!podeSalvar}
          title="Salvar (Ctrl+S)"
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
            podeSalvar
              ? 'bg-brand-600 text-white hover:bg-brand-700'
              : 'text-slate-400 cursor-not-allowed',
          )}
        >
          {salvando ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>

        <button
          onClick={fechar}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X size={12} /> Fechar
        </button>
      </div>
    </header>
  );
}