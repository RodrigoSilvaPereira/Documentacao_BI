import { useState } from 'react';
import { Save, FolderOpen, X, Circle, Check, Loader2 } from 'lucide-react';
import { useProject } from '@hooks/useProject';
import { useDocStore } from '@store/useDocStore';
import { useSaveShortcut } from '@hooks/useSaveShortcut';
import { cn } from '@utils/cn';

export function TopBar() {
  const { projetoAberto, temAlteracoes, salvar, fechar } = useProject();

  // Lê o título em tempo real direto do documento — atualiza ao digitar
  const tituloAtual = useDocStore((s) => s.documento?.projeto.titulo_relatorio);
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
      <div className="flex items-center gap-2 min-w-0">
        <FolderOpen size={14} className="text-slate-400 flex-shrink-0" />
        <span className="text-sm font-medium text-slate-700 truncate">{nomeProjeto}</span>
        {temAlteracoes && !feedbackSalvo && (
          <span title="Há alterações não salvas">
            <Circle size={7} className="text-amber-500 fill-amber-500 flex-shrink-0" />
          </span>
        )}
      </div>

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
            podeSalvar ? 'bg-brand-600 text-white hover:bg-brand-700' : 'text-slate-400 cursor-not-allowed',
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