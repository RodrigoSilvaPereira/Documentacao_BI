import { useState } from 'react';
import { Layers, Plus } from 'lucide-react';
import { useDocStore } from '@store/useDocStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { PaginaCard } from './PaginaCard';
import { PaginaForm } from './PaginaForm';
import type { Pagina } from '@models/schema';

export function PaginasSection() {
  const documento      = useDocStore((s) => s.documento);
  const adicionarPagina = useDocStore((s) => s.adicionarPagina);
  const atualizarPagina = useDocStore((s) => s.atualizarPagina);
  const removerPagina   = useDocStore((s) => s.removerPagina);
  const duplicarPagina = useDocStore((s) => s.duplicarPagina);

  const [modalAberto,    setModalAberto]    = useState(false);
  const [paginaEditando, setPaginaEditando] = useState<Pagina | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!documento) return null;

  const { paginas, kpis, medidas_dax, queries } = documento;

  function abrirNovo() {
    setPaginaEditando(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(pagina: Pagina) {
    setPaginaEditando(pagina);
    setModalAberto(true);
  }

  function handleSave(pagina: Pagina) {
    if (paginaEditando) {
      atualizarPagina(paginaEditando.id, pagina);
    } else {
      adicionarPagina(pagina);
    }
    setModalAberto(false);
    setPaginaEditando(undefined);
  }

  function handleDeleteConfirm() {
    if (!confirmDeleteId) return;
    removerPagina(confirmDeleteId);
    setConfirmDeleteId(null);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto pb-16">
      <SectionHeader
        icon={<Layers size={20} />}
        title="Páginas"
        description="Documente as páginas do relatório com seus visuais e filtros."
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
            Adicionar Página
          </Button>
        }
      />

      {paginas.length > 0 ? (
        <div className="grid gap-3">
          {paginas.map((pagina) => (
            <PaginaCard
              key={pagina.id}
              pagina={pagina}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
              onDuplicate={(id) => duplicarPagina(id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Layers size={32} />}
          title="Nenhuma página cadastrada"
          description="Documente as páginas do relatório e seus elementos visuais."
          action={
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
              Adicionar Página
            </Button>
          }
        />
      )}

      <PaginaForm
        aberto={modalAberto}
        pagina={paginaEditando}
        kpis={kpis}
        medidas={medidas_dax}
        queries={queries}
        onSave={handleSave}
        onClose={() => {
          setModalAberto(false);
          setPaginaEditando(undefined);
        }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir Página"
        description="A página e todos os seus visuais e filtros serão removidos permanentemente."
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />
    </div>
  );
}