import { useState, useCallback } from 'react';
import { Layers, Plus } from 'lucide-react';
import { useDocStore } from '@store/useDocStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { SearchInput } from '@components/common/SearchInput';
import { PaginaCard } from './PaginaCard';
import { PaginaForm } from './PaginaForm';
import { useSearchFilter } from '@hooks/useSearchFilter';
import type { Pagina } from '@models/schema';

export function PaginasSection() {
  const documento      = useDocStore((s) => s.documento);
  const adicionarPagina = useDocStore((s) => s.adicionarPagina);
  const atualizarPagina = useDocStore((s) => s.atualizarPagina);
  const removerPagina   = useDocStore((s) => s.removerPagina);
  const duplicarPagina  = useDocStore((s) => s.duplicarPagina);

  const [modalAberto,     setModalAberto]     = useState(false);
  const [paginaEditando,  setPaginaEditando]  = useState<Pagina | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getTermos = useCallback((p: Pagina) => [
    p.titulo, p.objetivo, p.descricao,
    ...p.visuais.map((v) => v.nome),
    ...p.visuais.map((v) => v.descricao),
    ...p.filtros.map((f) => f.nome),
    ...p.filtros.map((f) => f.campo),
  ], []);

  const { busca, setBusca, limpar, itensFiltrados } = useSearchFilter(
    documento?.paginas ?? [], getTermos,
  );

  if (!documento) return null;

  const { kpis, medidas_dax, queries } = documento;

  function abrirNovo()          { setPaginaEditando(undefined); setModalAberto(true); }
  function abrirEdicao(p: Pagina) { setPaginaEditando(p); setModalAberto(true); }

  function handleSave(pagina: Pagina) {
    if (paginaEditando) atualizarPagina(paginaEditando.id, pagina);
    else                adicionarPagina(pagina);
    setModalAberto(false);
    setPaginaEditando(undefined);
  }

  const total    = documento.paginas.length;
  const filtrado = itensFiltrados.length;

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

      {total > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <SearchInput
            value={busca}
            onChange={setBusca}
            onClear={limpar}
            placeholder="Buscar por título, visual, filtro..."
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
        <div className="grid gap-3">
          {itensFiltrados.map((pagina) => (
            <PaginaCard
              key={pagina.id}
              pagina={pagina}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
              onDuplicate={(id) => duplicarPagina(id)}
            />
          ))}
        </div>
      ) : busca ? (
        <EmptyState
          icon={<Layers size={32} />}
          title={`Nenhuma página encontrada para "${busca}"`}
          description="Tente buscar por outro termo."
        />
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
        onClose={() => { setModalAberto(false); setPaginaEditando(undefined); }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir Página"
        description="A página e todos os seus visuais e filtros serão removidos permanentemente."
        confirmLabel="Excluir"
        onConfirm={() => { if (confirmDeleteId) { removerPagina(confirmDeleteId); setConfirmDeleteId(null); } }}
        variant="danger"
      />
    </div>
  );
}