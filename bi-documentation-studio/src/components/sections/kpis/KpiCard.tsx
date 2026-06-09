import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@components/common/Badge';
import { LABELS_TIPO_VISUAL_KPI, type TipoVisualKPI } from '@models/enums';
import type { KPI } from '@models/schema';

// Mapeamento de tipo visual → variante de badge
const BADGE_VARIANT: Record<TipoVisualKPI, 'blue' | 'purple' | 'green' | 'default'> = {
  card:       'blue',
  gauge:      'purple',
  kpi_nativo: 'green',
  outro:      'default',
};

interface KpiCardProps {
  kpi:       KPI;
  onEdit:    (kpi: KPI) => void;
  onDelete:  (id: string) => void;
}

export function KpiCard({ kpi, onEdit, onDelete }: KpiCardProps) {
  const labelTipo = kpi.tipo_visual === 'outro' && kpi.tipo_outro
    ? kpi.tipo_outro
    : LABELS_TIPO_VISUAL_KPI[kpi.tipo_visual];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">

      {/* ── Cabeçalho ─────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant={BADGE_VARIANT[kpi.tipo_visual]}>
            {labelTipo}
          </Badge>
          <h3 className="text-sm font-semibold text-slate-800 truncate">
            {kpi.nome}
          </h3>
        </div>

        {/* Ações — visíveis no hover */}
        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(kpi)}
            aria-label="Editar KPI"
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(kpi.id)}
            aria-label="Excluir KPI"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ── Corpo ─────────────────────────────────────── */}
      <div className="mt-3 space-y-1.5">
        {kpi.o_que_mede && (
          <div className="flex gap-1.5">
            <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">Mede</span>
            <p className="text-sm text-slate-600 leading-snug">{kpi.o_que_mede}</p>
          </div>
        )}
        {kpi.objetivo_meta && (
          <div className="flex gap-1.5">
            <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">Meta</span>
            <p className="text-sm text-slate-500 leading-snug">{kpi.objetivo_meta}</p>
          </div>
        )}
      </div>

      {/* ── Rodapé com contadores ─────────────────────── */}
      {kpi.regras_negocio.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            {kpi.regras_negocio.length}{' '}
            {kpi.regras_negocio.length === 1 ? 'regra de negócio' : 'regras de negócio'}
          </span>
        </div>
      )}
    </div>
  );
}