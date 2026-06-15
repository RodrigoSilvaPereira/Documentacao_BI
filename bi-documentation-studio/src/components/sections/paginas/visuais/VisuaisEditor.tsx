import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { VisualCard } from './VisualCard';
import { VisualForm } from './VisualForm';

import type { PendingImagem } from '@models/app';
import type { Visual, KPI, MedidaDAX, Query } from '@models/schema';

interface VisuaisEditorProps {
  visuais: Visual[];
  onChange: (visuais: Visual[]) => void;
  kpis: KPI[];
  medidas: MedidaDAX[];
  queries: Query[];
  paginaTitulo: string;

  pendingVisuais: Record<string, PendingImagem>;
  setPendingVisual: (
    id: string,
    pending: PendingImagem | null
  ) => void;
}

export function VisuaisEditor({
  visuais,
  onChange,
  kpis,
  medidas,
  queries,
  paginaTitulo,
  pendingVisuais,
  setPendingVisual,
}: VisuaisEditorProps) {
  const [formAberto, setFormAberto] = useState(false);
  const [visualEditando, setVisualEditando] = useState<Visual | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function abrirNovo() {
    setVisualEditando(undefined);
    setFormAberto(true);
  }

  function abrirEdicao(visual: Visual) {
    setVisualEditando(visual);
    setFormAberto(true);
  }

  // A pendência de imagem chega junto com o visual salvo — funciona
  // identicamente para visual novo (id gerado em visualVazio()) e
  // para edição (id já existente). A renomeação física do arquivo
  // (quando o nome do visual muda sem troca de imagem) é tratada no
  // commit final em PaginaForm.handleSalvar, mantendo a regra de que
  // nada toca o disco antes de salvar a página.
  function handleSalvar(visualNovo: Visual, pending: PendingImagem | null) {
    if (visualEditando) {
      onChange(
        visuais.map((x) =>
          x.id === visualEditando.id ? visualNovo : x,
        ),
      );
    } else {
      onChange([...visuais, visualNovo]);
    }

    setPendingVisual(visualNovo.id, pending);

    setFormAberto(false);
    setVisualEditando(undefined);
  }

  function handleCancelar() {
    setFormAberto(false);
    setVisualEditando(undefined);
  }

  function handleExcluir() {
    if (!confirmDeleteId) return;

    onChange(
      visuais.filter((v) => v.id !== confirmDeleteId),
    );

    // Descarta qualquer pendência de imagem associada ao visual removido
    setPendingVisual(confirmDeleteId, null);

    setConfirmDeleteId(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          Visuais{visuais.length > 0 && ` (${visuais.length})`}
        </span>

        {!formAberto && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus size={12} />}
            onClick={abrirNovo}
          >
            Adicionar visual
          </Button>
        )}
      </div>

      {visuais.length > 0 && (
        <div className="space-y-1.5">
          {visuais.map((visual) => (
            <VisualCard
              key={visual.id}
              visual={visual}
              destacado={visualEditando?.id === visual.id}
              onEdit={abrirEdicao}
              onDelete={(id) => setConfirmDeleteId(id)}
            />
          ))}
        </div>
      )}

      {visuais.length === 0 && !formAberto && (
        <EmptyState
          title="Nenhum visual cadastrado"
          description="Adicione os visuais desta página."
          className="py-6"
        />
      )}

      {formAberto && (
        <VisualForm
          key={visualEditando?.id ?? 'novo'}
          visual={visualEditando}
          kpis={kpis}
          medidas={medidas}
          queries={queries}
          paginaTitulo={paginaTitulo}
          pendingImagem={
            visualEditando
              ? pendingVisuais[visualEditando.id]
              : undefined
          }
          onSave={handleSalvar}
          onCancel={handleCancelar}
        />
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null);
        }}
        title="Excluir visual"
        description="O visual será removido permanentemente desta página."
        confirmLabel="Excluir"
        onConfirm={handleExcluir}
        variant="danger"
      />
    </div>
  );
}