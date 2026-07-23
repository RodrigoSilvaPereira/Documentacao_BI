import { useState, useCallback } from 'react';
import { BookOpen, Plus, Pencil, Trash2, Copy } from 'lucide-react';
import { useDocStore } from '@store/useDocStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { SearchInput } from '@components/common/SearchInput';
import { TermoForm } from './TermoForm';
import { useSearchFilter } from '@hooks/useSearchFilter';
import type { TermoGlossario } from '@models/schema';

export function GlossarioSection() {
  const documento      = useDocStore((s) => s.documento);
  const adicionarTermo = useDocStore((s) => s.adicionarTermo);
  const atualizarTermo = useDocStore((s) => s.atualizarTermo);
  const removerTermo   = useDocStore((s) => s.removerTermo);
  const duplicarTermo  = useDocStore((s) => s.duplicarTermo);

  const [modalAberto,     setModalAberto]     = useState(false);
  const [termoEditando,   setTermoEditando]   = useState<TermoGlossario | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getTermos = useCallback((t: TermoGlossario) => [t.termo, t.definicao], []);

  const termosOrdenados = [...(documento?.glossario ?? [])].sort((a, b) =>
    a.termo.localeCompare(b.termo, 'pt-BR'),
  );

  const { busca, setBusca, limpar, itensFiltrados } = useSearchFilter(
    termosOrdenados, getTermos,
  );

  if (!documento) return null;

  function abrirNovo()               { setTermoEditando(undefined); setModalAberto(true); }
  function abrirEdicao(t: TermoGlossario) { setTermoEditando(t); setModalAberto(true); }

  function handleSave(termo: TermoGlossario) {
    if (termoEditando) atualizarTermo(termoEditando.id, termo);
    else               adicionarTermo(termo);
    setModalAberto(false);
    setTermoEditando(undefined);
  }

  const total    = documento.glossario.length;
  const filtrado = itensFiltrados.length;

  return (
    <div className="p-8 max-w-3xl mx-auto pb-16">
      <SectionHeader
        icon={<BookOpen size={20} />}
        title="Glossário"
        description="Defina termos de negócio para facilitar a compreensão do relatório."
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
            Adicionar Termo
          </Button>
        }
      />

      {total > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <SearchInput
            value={busca}
            onChange={setBusca}
            onClear={limpar}
            placeholder="Buscar por termo ou definição..."
            className="flex-1"
          />
          {busca && (
            <span className="text-xs text-slate-400 flex-shrink-0">
              {filtrado} de {total}
            </span>
          )}
        </div>
      )}

      {itensFiltrados.length > 0 ? (
        <div className="space-y-2">
          {itensFiltrados.map((termo) => (
            <div
              key={termo.id}
              className="flex items-start justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">{termo.termo}</p>
                {termo.definicao && (
                  <p className="text-sm text-slate-500 mt-1 leading-snug">{termo.definicao}</p>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => duplicarTermo(termo.id)} title="Duplicar"
                  className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
                  <Copy size={14} />
                </button>
                <button onClick={() => abrirEdicao(termo)} aria-label="Editar termo"
                  className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setConfirmDeleteId(termo.id)} aria-label="Excluir termo"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : busca ? (
        <EmptyState
          icon={<BookOpen size={32} />}
          title={`Nenhum termo encontrado para "${busca}"`}
          description="Tente buscar por outro termo."
        />
      ) : (
        <EmptyState
          icon={<BookOpen size={32} />}
          title="Glossário vazio"
          description="Adicione termos de negócio para facilitar a compreensão do relatório."
          action={
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
              Adicionar Termo
            </Button>
          }
        />
      )}

      <TermoForm
        aberto={modalAberto}
        termo={termoEditando}
        onSave={handleSave}
        onClose={() => { setModalAberto(false); setTermoEditando(undefined); }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir Termo"
        description="O termo será removido permanentemente do glossário."
        confirmLabel="Excluir"
        onConfirm={() => { if (confirmDeleteId) { removerTermo(confirmDeleteId); setConfirmDeleteId(null); } }}
        variant="danger"
      />
    </div>
  );
}