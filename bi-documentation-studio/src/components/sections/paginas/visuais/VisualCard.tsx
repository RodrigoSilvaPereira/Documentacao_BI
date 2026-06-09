import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@components/common/Badge';
import { LABELS_TIPO_VISUAL } from '@models/enums';
import { cn } from '@utils/cn';
import type { Visual } from '@models/schema';

interface VisualCardProps {
  visual:      Visual;
  destacado?:  boolean;   // true quando este visual está sendo editado
  onEdit:      (visual: Visual) => void;
  onDelete:    (id: string) => void;
}

export function VisualCard({ visual, destacado, onEdit, onDelete }: VisualCardProps) {
  const labelTipo = visual.tipo === 'outro' && visual.tipo_outro
    ? visual.tipo_outro
    : LABELS_TIPO_VISUAL[visual.tipo];

  const totalRefs =
    visual.kpis_ids.length +
    visual.medidas_ids.length +
    visual.tabelas_ids.length;

  return (
    <div className={cn(
      'flex items-start justify-between gap-3 px-4 py-3 rounded-lg border transition-colors group',
      destacado
        ? 'border-brand-300 bg-brand-50/40'
        : 'border-slate-200 bg-white hover:border-slate-300',
    )}>
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <Badge variant="default" className="flex-shrink-0 mt-0.5">{labelTipo}</Badge>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">{visual.nome}</p>
          {(visual.descricao || visual.objetivo) && (
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {visual.descricao || visual.objetivo}
            </p>
          )}
          {totalRefs > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">
              {visual.kpis_ids.length > 0    && `${visual.kpis_ids.length} KPI${visual.kpis_ids.length > 1 ? 's' : ''}`}
              {visual.medidas_ids.length > 0  && `${visual.kpis_ids.length > 0 ? ' · ' : ''}${visual.medidas_ids.length} medida${visual.medidas_ids.length > 1 ? 's' : ''}`}
              {visual.tabelas_ids.length > 0  && ` · ${visual.tabelas_ids.length} tabela${visual.tabelas_ids.length > 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(visual)}
          aria-label="Editar visual"
          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(visual.id)}
          aria-label="Excluir visual"
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}