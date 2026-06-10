import { useState } from 'react';
import { BookOpen, Plus, Pencil, Trash2 } from 'lucide-react';
import { useDocStore } from '@store/useDocStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { TermoForm } from './TermoForm';
import type { TermoGlossario } from '@models/schema';

export function GlossarioSection() {
  const documento      = useDocStore((s) => s.documento);
  const adicionarTermo = useDocStore((s) => s.adicionarTermo);
  const atualizarTermo = useDocStore((s) => s.atualizarTermo);
  const removerTermo   = useDocStore((s) => s.removerTermo);

  const [modalAberto,    setModalAberto]    = useState(false);
  const [termoEditando,  setTermoEditando]  = useState<TermoGlossario | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!documento) return null;

  // Exibe em ordem alfabética
  const termosOrdenados = [...documento.glossario].sort((a, b) =>
    a.termo.localeCompare(b.termo, 'pt-BR'),
  );

  function abrirNovo() {
    setTermoEditando(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(termo: TermoGlossario) {
    setTermoEditando(termo);
    setModalAberto(true);
  }

  function handleSave(termo: TermoGlossario) {
    if (termoEditando) {
      atualizarTermo(termoEditando.id, termo);
    } else {
      adicionarTermo(termo);
    }
    setModalAberto(false);
    setTermoEditando(undefined);
  }

  function handleDeleteConfirm() {
    if (!confirmDeleteId) return;
    removerTermo(confirmDeleteId);
    setConfirmDeleteId(null);
  }

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

      {termosOrdenados.length > 0 ? (
        <div className="space-y-2">
          {termosOrdenados.map((termo) => (
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
                <button
                  onClick={() => abrirEdicao(termo)}
                  aria-label="Editar termo"
                  className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(termo.id)}
                  aria-label="Excluir termo"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
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
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />
    </div>
  );
}