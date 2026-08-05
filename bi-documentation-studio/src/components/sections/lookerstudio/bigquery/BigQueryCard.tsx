import { Pencil, Trash2, Copy, Cloud } from 'lucide-react';
import { Badge } from '@components/common/Badge';
import type { BigQuerySource, TipoObjetoBigQuery } from '@models/schema.lookerstudio';

const TIPO_LABEL: Record<TipoObjetoBigQuery, string> = {
  tabela:            'Tabela',
  view:              'View',
  materialized_view: 'View Mat.',
  procedure:         'Procedure',
  function:          'Function',
  scheduled_query:   'Sched. Query',
};

const TIPO_VARIANT: Record<TipoObjetoBigQuery, 'blue' | 'green' | 'purple' | 'default'> = {
  tabela:            'blue',
  view:              'green',
  materialized_view: 'purple',
  procedure:         'default',
  function:          'default',
  scheduled_query:   'default',
};

interface BigQueryCardProps {
  source:       BigQuerySource;
  onEdit:       (source: BigQuerySource) => void;
  onDelete:     (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export function BigQueryCard({ source, onEdit, onDelete, onDuplicate }: BigQueryCardProps) {
  const metricas  = source.colunas.filter((c) => c.eh_metrica).length;
  const dimensoes = source.colunas.filter((c) => c.eh_dimensao).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">
      <div className="flex items-start justify-between gap-3">

        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0 mt-0.5">
            <Cloud size={15} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            {/* Breadcrumb: projeto.dataset.nome */}
            <p className="text-[11px] text-slate-400 font-mono leading-none mb-1">
              {source.projeto_gcp}<span className="text-slate-300">.</span>{source.dataset}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-800 font-mono">{source.nome}</h3>
              <Badge variant={TIPO_VARIANT[source.tipo]}>{TIPO_LABEL[source.tipo]}</Badge>
            </div>
            {source.descricao && (
              <p className="text-sm text-slate-500 mt-1 leading-snug line-clamp-2">{source.descricao}</p>
            )}
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDuplicate && (
            <button onClick={() => onDuplicate(source.id)} title="Duplicar"
              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
              <Copy size={14} />
            </button>
          )}
          <button onClick={() => onEdit(source)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(source.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Rodapé: contadores */}
      {(source.colunas.length > 0 || source.responsavel || source.dominio_negocio) && (
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-100">
          {source.colunas.length > 0 && (
            <span className="text-xs text-slate-400">
              {source.colunas.length} coluna{source.colunas.length > 1 ? 's' : ''}
            </span>
          )}
          {metricas > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
              {metricas} M
            </span>
          )}
          {dimensoes > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">
              {dimensoes} D
            </span>
          )}
          {source.responsavel && (
            <span className="text-xs text-slate-400 ml-auto truncate">{source.responsavel}</span>
          )}
        </div>
      )}
    </div>
  );
}