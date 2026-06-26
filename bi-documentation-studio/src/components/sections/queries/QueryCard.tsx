import { Pencil, Trash2, Copy } from 'lucide-react';
import { Badge } from '@components/common/Badge';
import { LABELS_FONTE_DADOS } from '@models/enums';
import type { Query } from '@models/schema';

interface QueryCardProps {
  query:        Query;
  onEdit:       (query: Query) => void;
  onDelete:     (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export function QueryCard({ query, onEdit, onDelete, onDuplicate }: QueryCardProps) {
  const fonteLabel = query.fonte_dados === 'outro' && query.fonte_dados_outro
    ? query.fonte_dados_outro
    : (LABELS_FONTE_DADOS[query.fonte_dados] ?? query.fonte_dados);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant="default">{fonteLabel}</Badge>
          <h3 className="text-sm font-semibold text-slate-800 font-mono truncate">{query.nome}</h3>
        </div>
        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDuplicate && (
            <button onClick={() => onDuplicate(query.id)} aria-label="Duplicar Query"
              title="Duplicar"
              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
              <Copy size={14} />
            </button>
          )}
          <button onClick={() => onEdit(query)} aria-label="Editar Query"
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(query.id)} aria-label="Excluir Query"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {query.descricao && (
        <p className="text-sm text-slate-600 mt-2 leading-snug line-clamp-2">{query.descricao}</p>
      )}

      {(query.colunas.length > 0 || query.transformacoes.length > 0) && (
        <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100">
          {query.colunas.length > 0 && (
            <span className="text-xs text-slate-400">
              {query.colunas.length} coluna{query.colunas.length > 1 ? 's' : ''}
            </span>
          )}
          {query.transformacoes.length > 0 && (
            <span className="text-xs text-slate-400">
              {query.transformacoes.length} transformação{query.transformacoes.length > 1 ? 'ões' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
}