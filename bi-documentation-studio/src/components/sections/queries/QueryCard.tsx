import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@components/common/Badge';
import { LABELS_FONTE_DADOS, type FonteDadosQuery } from '@models/enums';
import type { Query } from '@models/schema';

type BadgeVariant = 'blue' | 'green' | 'purple' | 'default';

const FONTE_BADGE: Partial<Record<FonteDadosQuery, BadgeVariant>> = {
  sql_server: 'blue',  postgresql: 'blue', mysql:     'blue',
  oracle:     'blue',  azure_sql:  'blue',
  excel_csv:  'green', sharepoint: 'green',
  api_web:    'purple', databricks: 'purple',
};

interface QueryCardProps {
  query:     Query;
  onEdit:    (query: Query) => void;
  onDelete:  (id: string) => void;
}

export function QueryCard({ query, onEdit, onDelete }: QueryCardProps) {
  const labelFonte = query.fonte_dados === 'outro' && query.fonte_dados_outro
    ? query.fonte_dados_outro
    : LABELS_FONTE_DADOS[query.fonte_dados];

  const badgeVariant = FONTE_BADGE[query.fonte_dados] ?? 'default';

  // Preview: primeira linha do código (sem comentários em branco)
  const codigoPreview = query.codigo
    .split('\n')
    .find((l) => l.trim().length > 0) ?? '';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">

      {/* ── Cabeçalho ─────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant={badgeVariant}>{labelFonte}</Badge>
          <h3 className="text-sm font-semibold text-slate-800 truncate">{query.nome}</h3>
        </div>
        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(query)}
            aria-label="Editar query"
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(query.id)}
            aria-label="Excluir query"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ── Descrição ─────────────────────────────── */}
      {query.descricao && (
        <p className="text-sm text-slate-600 mt-2 leading-snug">{query.descricao}</p>
      )}

      {/* ── Preview do código ─────────────────────── */}
      {codigoPreview && (
        <div className="mt-3 px-3 py-2 bg-slate-900 rounded-lg">
          <code className="text-xs font-mono text-slate-300 truncate block">
            {codigoPreview}
          </code>
        </div>
      )}

      {/* ── Contadores ────────────────────────────── */}
      {(query.colunas.length > 0 || query.transformacoes.length > 0) && (
        <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100">
          {query.colunas.length > 0 && (
            <span className="text-xs text-slate-400">
              {query.colunas.length}{' '}
              {query.colunas.length === 1 ? 'coluna' : 'colunas'}
            </span>
          )}
          {query.transformacoes.length > 0 && (
            <span className="text-xs text-slate-400">
              {query.transformacoes.length}{' '}
              {query.transformacoes.length === 1 ? 'transformação' : 'transformações'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}