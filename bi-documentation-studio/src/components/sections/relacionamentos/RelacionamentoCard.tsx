import { ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@components/common/Badge';
import { LABELS_CARDINALIDADE, LABELS_DIRECAO } from '@models/enums';
import type { Relacionamento } from '@models/schema';

interface RelacionamentoCardProps {
  relacionamento: Relacionamento;
  onEdit:         (rel: Relacionamento) => void;
  onDelete:       (id: string) => void;
}

export function RelacionamentoCard({
  relacionamento: rel,
  onEdit,
  onDelete,
}: RelacionamentoCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">

      {/* -- Conexão: origem → destino -- */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">

          {/* Origem */}
          <div className="min-w-0">
            <p className="text-xs text-slate-400 leading-none mb-1">
              {rel.tabela_origem}
            </p>
            <p className="text-sm font-mono font-semibold text-slate-800 truncate">
              [{rel.coluna_origem || '—'}]
            </p>
          </div>

          {/* Seta de conexão */}
          <div className="flex items-center gap-1 flex-shrink-0 mt-3">
            <div className="w-6 h-px bg-slate-300" />
            <ArrowRight size={14} className="text-slate-400" />
          </div>

          {/* Destino */}
          <div className="min-w-0">
            <p className="text-xs text-slate-400 leading-none mb-1">
              {rel.tabela_destino}
            </p>
            <p className="text-sm font-mono font-semibold text-slate-800 truncate">
              [{rel.coluna_destino || '—'}]
            </p>
          </div>
        </div>

        {/* Ações — visíveis no hover */}
        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(rel)}
            aria-label="Editar relacionamento"
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(rel.id)}
            aria-label="Excluir relacionamento"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* -- Badges de propriedades -- */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        <Badge variant="default">
          {LABELS_CARDINALIDADE[rel.cardinalidade]}
        </Badge>
        <Badge variant="default">
          {LABELS_DIRECAO[rel.direcao]}
        </Badge>
        <Badge variant={rel.ativo ? 'green' : 'default'}>
          {rel.ativo ? '● Ativo' : '○ Inativo'}
        </Badge>

        {/* Observação resumida à direita */}
        {rel.observacoes && (
          <span className="ml-auto text-xs text-slate-400 truncate max-w-xs">
            {rel.observacoes}
          </span>
        )}
      </div>
    </div>
  );
}