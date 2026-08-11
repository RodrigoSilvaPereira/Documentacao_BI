import { Pencil, Trash2, Copy, TrendingUp } from 'lucide-react';
import { useLSStore } from '@store/useLSStore';
import type { LSMetric } from '@models/schema.lookerstudio';

interface MetricaCardProps {
  metrica:      LSMetric;
  onEdit:       (m: LSMetric) => void;
  onDelete:     (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export function MetricaCard({ metrica, onEdit, onDelete, onDuplicate }: MetricaCardProps) {
  const lsData = useLSStore((s) => s.lsData);

  // Resolve nome da fonte ou combinação referenciada
  const fonteNome = metrica.fonte_dados_id
    ? (lsData?.fontes_dados.find((f) => f.id === metrica.fonte_dados_id)?.nome
      ?? lsData?.combinacoes.find((c) => c.id === metrica.fonte_dados_id)?.nome)
    : null;

  // Preview da fórmula (primeira linha não vazia)
  const formulaPreview = metrica.formula
    ? metrica.formula.split('\n').find((l) => l.trim() !== '') ?? ''
    : '';

  const temEscopo = metrica.o_que_entra || metrica.o_que_nao_entra || metrica.excecoes;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0 mt-0.5">
            <TrendingUp size={15} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-800">{metrica.nome}</h3>

            {/* Origem */}
            {(fonteNome || metrica.campo_origem) && (
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {fonteNome && <span>{fonteNome}</span>}
                {fonteNome && metrica.campo_origem && <span className="text-slate-300"> › </span>}
                {metrica.campo_origem && <span>{metrica.campo_origem}</span>}
              </p>
            )}

            {metrica.descricao && (
              <p className="text-sm text-slate-600 mt-1 leading-snug line-clamp-2">{metrica.descricao}</p>
            )}
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDuplicate && (
            <button onClick={() => onDuplicate(metrica.id)} title="Duplicar"
              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
              <Copy size={14} />
            </button>
          )}
          <button onClick={() => onEdit(metrica)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(metrica.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Preview da fórmula */}
      {formulaPreview && (
        <div className="mt-3 px-3 py-2 bg-slate-900 rounded-lg">
          <code className="text-xs font-mono text-slate-300 truncate block">{formulaPreview}</code>
        </div>
      )}

      {/* Escopo resumido */}
      {temEscopo && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
          {metrica.o_que_entra && (
            <p className="text-xs text-slate-500 leading-snug">
              <span className="text-green-600 font-semibold">✅ Entra: </span>
              {metrica.o_que_entra}
            </p>
          )}
          {metrica.o_que_nao_entra && (
            <p className="text-xs text-slate-500 leading-snug">
              <span className="text-red-500 font-semibold">❌ Não entra: </span>
              {metrica.o_que_nao_entra}
            </p>
          )}
          {metrica.excecoes && (
            <p className="text-xs text-slate-500 leading-snug">
              <span className="text-amber-600 font-semibold">⚠️ Exceções: </span>
              {metrica.excecoes}
            </p>
          )}
        </div>
      )}

      {/* Rodapé: responsável + unidade */}
      {(metrica.responsavel_validacao || metrica.unidade) && (
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-100">
          {metrica.unidade && (
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-mono">
              {metrica.unidade}
            </span>
          )}
          {metrica.granularidade && (
            <span className="text-xs text-slate-400">{metrica.granularidade}</span>
          )}
          {metrica.responsavel_validacao && (
            <span className="text-xs text-slate-400 ml-auto truncate">
              {metrica.responsavel_validacao}
            </span>
          )}
        </div>
      )}
    </div>
  );
}