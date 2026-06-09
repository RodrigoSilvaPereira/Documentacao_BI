import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@components/common/Badge';
import type { MedidaDAX, KPI } from '@models/schema';

interface MedidaCardProps {
  medida:       MedidaDAX;
  kpis:         KPI[];       // para resolver IDs → nomes
  todasMedidas: MedidaDAX[]; // para resolver dependências
  onEdit:       (medida: MedidaDAX) => void;
  onDelete:     (id: string) => void;
}

export function MedidaCard({ medida, kpis, todasMedidas, onEdit, onDelete }: MedidaCardProps) {

  // Resolve IDs de dependências → nomes das medidas
  const depNomes = medida.dependencias
    .map((id) => todasMedidas.find((m) => m.id === id))
    .filter((m): m is MedidaDAX => m !== undefined)
    .map((m) => m.nome);

  // Resolve IDs de KPIs → nomes
  const kpiNomes = medida.kpis_relacionados
    .map((id) => kpis.find((k) => k.id === id))
    .filter((k): k is KPI => k !== undefined)
    .map((k) => k.nome);

  // Preview da fórmula: primeira linha não vazia
  const formulaPreview = medida.formula
    .split('\n')
    .find((l) => l.trim() !== '') ?? '';

  const temReferencias = depNomes.length > 0 || kpiNomes.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors group">

      {/* ── Cabeçalho ─────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {medida.tabela && (
            <p className="text-xs font-mono text-slate-400 leading-none mb-1">
              {medida.tabela}
            </p>
          )}
          <h3 className="text-sm font-semibold text-slate-800">{medida.nome}</h3>
        </div>

        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(medida)}
            aria-label="Editar medida"
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(medida.id)}
            aria-label="Excluir medida"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ── Descrição ─────────────────────────────── */}
      {medida.descricao && (
        <p className="text-sm text-slate-600 mt-2 leading-snug">{medida.descricao}</p>
      )}

      {/* ── Preview da fórmula ────────────────────── */}
      {formulaPreview && (
        <div className="mt-3 px-3 py-2 bg-slate-900 rounded-lg">
          <code className="text-xs font-mono text-slate-300 truncate block">
            {formulaPreview}
          </code>
        </div>
      )}

      {/* ── Referências cruzadas ─────────────────── */}
      {temReferencias && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
          {depNomes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 flex-shrink-0">Deps</span>
              {depNomes.map((nome, i) => (
                <span
                  key={i}
                  className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded font-mono"
                >
                  [{nome}]
                </span>
              ))}
            </div>
          )}
          {kpiNomes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 flex-shrink-0">KPIs</span>
              {kpiNomes.map((nome, i) => (
                <Badge key={i} variant="blue">{nome}</Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}