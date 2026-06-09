import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { VisualCard } from './VisualCard';
import { VisualForm } from './VisualForm';
import type { Visual, KPI, MedidaDAX, Query } from '@models/schema';

interface VisuaisEditorProps {
  visuais:  Visual[];
  onChange: (visuais: Visual[]) => void;
  kpis:     KPI[];
  medidas:  MedidaDAX[];
  queries:  Query[];
}

export function VisuaisEditor({ visuais, onChange, kpis, medidas, queries }: VisuaisEditorProps) {
  const [formAberto,      setFormAberto]      = useState(false);
  const [visualEditando,  setVisualEditando]  = useState<Visual | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function abrirNovo() {
    setVisualEditando(undefined);
    setFormAberto(true);
  }

  function abrirEdicao(visual: Visual) {
    setVisualEditando(visual);
    setFormAberto(true);
  }

  function handleSalvar(visual: Visual) {
    if (visualEditando) {
      onChange(visuais.map((v) => (v.id === visualEditando.id ? visual : v)));
    } else {
      onChange([...visuais, visual]);
    }
    setFormAberto(false);
    setVisualEditando(undefined);
  }

  function handleCancelar() {
    setFormAberto(false);
    setVisualEditando(undefined);
  }

  function handleExcluir() {
    if (!confirmDeleteId) return;
    onChange(visuais.filter((v) => v.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  }

  return (
    <div className="space-y-2">
      {/* Cabeçalho */}
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

      {/* Lista de visuais */}
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

      {/* Formulário inline */}
      {formAberto && (
        <VisualForm
          key={visualEditando?.id ?? 'novo'}
          visual={visualEditando}
          kpis={kpis}
          medidas={medidas}
          queries={queries}
          onSave={handleSalvar}
          onCancel={handleCancelar}
        />
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir visual"
        description="O visual será removido permanentemente desta página."
        confirmLabel="Excluir"
        onConfirm={handleExcluir}
        variant="danger"
      />
    </div>
  );
}