import { Pencil, Trash2, Copy, Database } from 'lucide-react';
import { Badge } from '@components/common/Badge';
import { useLSStore } from '@store/useLSStore';
import { LABELS_TIPO_CONECTOR_LS } from '@models/schema.lookerstudio';
import type { LSDataSource } from '@models/schema.lookerstudio';

const CONECTOR_VARIANT: Record<string, 'blue' | 'green' | 'purple' | 'default'> = {
  bigquery:         'blue',
  planilhas_google: 'green',
  analytics:        'purple',
  search_console:   'purple',
  ads:              'default',
  csv:              'default',
  postgresql:       'default',
  mysql:            'default',
  outro:            'default',
};

interface FonteDadosCardProps {
  fonte:        LSDataSource;
  onEdit:       (fonte: LSDataSource) => void;
  onDelete:     (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export function FonteDadosCard({ fonte, onEdit, onDelete, onDuplicate }: FonteDadosCardProps) {
  const lsData = useLSStore((s) => s.lsData);

  const labelConector = fonte.tipo_conector === 'outro' && fonte.tipo_conector_outro
    ? fonte.tipo_conector_outro
    : (LABELS_TIPO_CONECTOR_LS[fonte.tipo_conector] ?? fonte.tipo_conector);

  const bqSource = fonte.bigquery_source_id
    ? lsData?.bigquery_sources.find((b) => b.id === fonte.bigquery_source_id)
    : null;

  const totalCampos    = fonte.campos.length;
  const totalCalculados = fonte.campos.filter((c) => c.calculado).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">
      <div className="flex items-start justify-between gap-3">

        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0 mt-0.5">
            <Database size={15} className="text-slate-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-800">{fonte.nome}</h3>
              <Badge variant={CONECTOR_VARIANT[fonte.tipo_conector] ?? 'default'}>
                {labelConector}
              </Badge>
            </div>

            {/* Referência BigQuery */}
            {bqSource && (
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                → {bqSource.projeto_gcp}.{bqSource.dataset}.{bqSource.nome}
              </p>
            )}

            {fonte.descricao && (
              <p className="text-sm text-slate-500 mt-1 leading-snug line-clamp-2">{fonte.descricao}</p>
            )}
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDuplicate && (
            <button onClick={() => onDuplicate(fonte.id)} title="Duplicar"
              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
              <Copy size={14} />
            </button>
          )}
          <button onClick={() => onEdit(fonte)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(fonte.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {(totalCampos > 0 || fonte.proprietario_credencial) && (
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-100">
          {totalCampos > 0 && (
            <span className="text-xs text-slate-400">
              {totalCampos} campo{totalCampos > 1 ? 's' : ''}
            </span>
          )}
          {totalCalculados > 0 && (
            <span className="text-xs text-slate-400">
              {totalCalculados} calculado{totalCalculados > 1 ? 's' : ''}
            </span>
          )}
          {fonte.proprietario_credencial && (
            <span className="text-xs text-slate-400 ml-auto truncate">
              {fonte.proprietario_credencial}
            </span>
          )}
        </div>
      )}
    </div>
  );
}