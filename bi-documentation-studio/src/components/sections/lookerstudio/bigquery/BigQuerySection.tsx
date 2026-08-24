import { useState, useCallback } from 'react';
import { Cloud, Plus } from 'lucide-react';
import { useLSStore } from '@store/useLSStore';
import { useAppStore } from '@store/useAppStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { SearchInput } from '@components/common/SearchInput';
import { BigQueryCard } from './BigQueryCard';
import { BigQueryForm } from './BigQueryForm';
import { useSearchFilter } from '@hooks/useSearchFilter';
import type { BigQuerySource } from '@models/schema.lookerstudio';

export function BigQuerySection() {
  const lsData                  = useLSStore((s) => s.lsData);
  const adicionarBigQuerySource = useLSStore((s) => s.adicionarBigQuerySource);
  const atualizarBigQuerySource = useLSStore((s) => s.atualizarBigQuerySource);
  const removerBigQuerySource   = useLSStore((s) => s.removerBigQuerySource);
  const duplicarBigQuerySource  = useLSStore((s) => s.duplicarBigQuerySource);

  const biPlatform = useAppStore((s) => s.projetoAberto?.biPlatform);

  const [modalAberto,     setModalAberto]     = useState(false);
  const [sourceEditando,  setSourceEditando]  = useState<BigQuerySource | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getTermos = useCallback((s: BigQuerySource) => [
    s.nome, s.projeto_gcp, s.dataset, s.descricao,
    s.responsavel, s.dominio_negocio, s.tipo,
    ...s.colunas.map((c) => c.nome),
    ...s.colunas.map((c) => c.descricao),
  ], []);

  const sources = lsData?.bigquery_sources ?? [];

  const { busca, setBusca, limpar, itensFiltrados } = useSearchFilter(sources, getTermos);

  if (biPlatform !== 'LOOKER_STUDIO') return null;

  function abrirNovo()               { setSourceEditando(undefined); setModalAberto(true); }
  function abrirEdicao(s: BigQuerySource) { setSourceEditando(s); setModalAberto(true); }

  function handleSave(source: BigQuerySource) {
    if (sourceEditando) atualizarBigQuerySource(sourceEditando.id, source);
    else                adicionarBigQuerySource(source);
    setModalAberto(false);
    setSourceEditando(undefined);
  }

  const total    = sources.length;
  const filtrado = itensFiltrados.length;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-16">
      <SectionHeader
        icon={<Cloud size={20} />}
        title="BigQuery"
        description="Documente as tabelas, views e objetos do BigQuery que alimentam este dashboard."
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
            Adicionar objeto
          </Button>
        }
      />

      {total > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <SearchInput
            value={busca} onChange={setBusca} onClear={limpar}
            placeholder="Buscar por projeto, dataset, tabela, coluna..."
            className="flex-1"
          />
          {busca && <span className="text-xs text-slate-400 flex-shrink-0">{filtrado} de {total}</span>}
        </div>
      )}

      {itensFiltrados.length > 0 ? (
        <div className="grid gap-3">
          {itensFiltrados.map((source) => (
            <BigQueryCard
              key={source.id}
              source={source}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
              onDuplicate={(id) => duplicarBigQuerySource(id)}
            />
          ))}
        </div>
      ) : busca ? (
        <EmptyState
          icon={<Cloud size={32} />}
          title={`Nenhum objeto encontrado para "${busca}"`}
          description="Tente buscar por outro termo."
        />
      ) : (
        <EmptyState
          icon={<Cloud size={32} />}
          title="Nenhum objeto BigQuery cadastrado"
          description="Documente as tabelas e views do BigQuery que alimentam este dashboard."
          action={
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={abrirNovo}>
              Adicionar objeto
            </Button>
          }
        />
      )}

      <BigQueryForm
        aberto={modalAberto}
        source={sourceEditando}
        onSave={handleSave}
        onClose={() => { setModalAberto(false); setSourceEditando(undefined); }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir objeto BigQuery"
        description="O objeto e todas as suas colunas serão removidos. Fontes de dados que referenciam este objeto perderão a referência."
        confirmLabel="Excluir"
        onConfirm={() => { if (confirmDeleteId) { removerBigQuerySource(confirmDeleteId); setConfirmDeleteId(null); } }}
        variant="danger"
      />
    </div>
  );
}