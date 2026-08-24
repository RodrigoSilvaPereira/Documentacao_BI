import { useState } from 'react';
import { Plus, X, Zap } from 'lucide-react';
import { Button } from '@components/common/Button';
import { cn } from '@utils/cn';
import { generateId } from '@utils/id';
import type { BigQueryColumn } from '@models/schema.lookerstudio';

const BQ_TIPOS = [
  'STRING','INT64','FLOAT64','NUMERIC','BIGNUMERIC',
  'BOOL','DATE','DATETIME','TIME','TIMESTAMP',
  'BYTES','GEOGRAPHY','JSON','RECORD','ARRAY',
].map((v) => ({ value: v, label: v }));

interface BigQueryColunasEditorProps {
  value:    BigQueryColumn[];
  onChange: (colunas: BigQueryColumn[]) => void;
}

function colunaVazia(): Omit<BigQueryColumn, 'id'> {
  return { nome: '', tipo: 'STRING', descricao: '', calculada: false };
}

export function BigQueryColunasEditor({ value, onChange }: BigQueryColunasEditorProps) {
  const [nome,      setNome]      = useState('');
  const [tipo,      setTipo]      = useState('STRING');
  const [descricao, setDescricao] = useState('');
  const [ehMetrica, setEhMetrica] = useState(false);
  const [ehDimensao,setEhDimensao]= useState(false);
  const [calculada, setCalculada] = useState(false);
  const [formula,   setFormula]   = useState('');
  const [nullable,  setNullable]  = useState(true);

  const podeAdicionar = nome.trim() !== '';

  function adicionar() {
    if (!podeAdicionar) return;
    onChange([
      ...value,
      {
        id:          generateId(),
        nome:        nome.trim(),
        tipo,
        descricao:   descricao.trim(),
        eh_metrica:  ehMetrica  || undefined,
        eh_dimensao: ehDimensao || undefined,
        calculada:   calculada  || undefined,
        formula:     calculada && formula.trim() ? formula.trim() : undefined,
        nullable:    nullable,
      },
    ]);
    setNome(''); setTipo('STRING'); setDescricao('');
    setEhMetrica(false); setEhDimensao(false);
    setCalculada(false); setFormula(''); setNullable(true);
  }

  function remover(id: string) { onChange(value.filter((c) => c.id !== id)); }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !calculada) { e.preventDefault(); adicionar(); }
  }

  return (
    <div className="space-y-2">
      {/* Lista */}
      {value.length > 0 && (
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          <div className="grid gap-2 px-3 py-1" style={{ gridTemplateColumns: '1.2fr 90px 70px 1.5fr 24px' }}>
            <span className="text-xs font-medium text-slate-400">Coluna</span>
            <span className="text-xs font-medium text-slate-400">Tipo</span>
            <span className="text-xs font-medium text-slate-400">M / D</span>
            <span className="text-xs font-medium text-slate-400">Descrição</span>
          </div>

          {value.map((col) => (
            <div
              key={col.id}
              className={cn(
                'px-3 py-2.5 border rounded-lg',
                col.calculada ? 'bg-purple-50/40 border-purple-200' : 'bg-slate-50 border-slate-200',
              )}
            >
              <div className="grid items-center gap-2" style={{ gridTemplateColumns: '1.2fr 90px 70px 1.5fr 24px' }}>
                <div className="flex items-center gap-1 min-w-0">
                  {col.calculada && <Zap size={10} className="text-purple-500 flex-shrink-0" />}
                  <span className="text-sm font-mono text-slate-800 truncate">{col.nome}</span>
                </div>
                <span className="text-xs bg-slate-200 text-slate-700 rounded px-1.5 py-0.5 font-mono truncate">{col.tipo}</span>
                <div className="flex gap-1">
                  {col.eh_metrica  && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">M</span>}
                  {col.eh_dimensao && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">D</span>}
                  {!col.nullable   && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full">NN</span>}
                </div>
                <span className="text-xs text-slate-500 truncate">{col.descricao || '—'}</span>
                <button onClick={() => remover(col.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X size={13} />
                </button>
              </div>
              {col.calculada && col.formula && (
                <div className="mt-2 px-2.5 py-1.5 bg-slate-900 rounded-md">
                  <code className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-all">{col.formula}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formulário de adição */}
      <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2.5">
        {/* Linha 1: Nome | Tipo | Descrição */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Coluna</label>
            <input
              type="text" value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ex: id_pedido"
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 font-mono"
            />
          </div>
          <div className="w-36 flex-shrink-0">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Tipo BigQuery</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 bg-white"
            >
              {BQ_TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-[1.5]">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Descrição</label>
            <input
              type="text" value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ex: Identificador único do pedido"
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400"
            />
          </div>
        </div>

        {/* Linha 2: toggles */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2 flex-wrap">
            {([
              { label: 'Métrica',    value: ehMetrica,  set: setEhMetrica,  cls: 'bd-blue'   },
              { label: 'Dimensão',   value: ehDimensao, set: setEhDimensao, cls: 'bd-green'  },
              { label: 'Calculada',  value: calculada,  set: setCalculada,  cls: 'bd-purple' },
              { label: 'Not Null',   value: !nullable,  set: (v: boolean) => setNullable(!v), cls: 'bd-red' },
            ] as const).map(({ label, value: val, set, cls }) => (
              <button
                key={label}
                type="button"
                onClick={() => set(!val)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                  val
                    ? cls === 'bd-blue'   ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : cls === 'bd-green'  ? 'bg-green-50 text-green-700 border-green-300'
                    : cls === 'bd-purple' ? 'bg-purple-50 text-purple-700 border-purple-300'
                    :                       'bg-red-50 text-red-600 border-red-300'
                    : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={adicionar} disabled={!podeAdicionar} leftIcon={<Plus size={13} />}>
            Adicionar
          </Button>
        </div>

        {/* Fórmula (quando calculada) */}
        {calculada && (
          <textarea
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="Ex: CASE WHEN status = 'A' THEN 'Ativo' ELSE 'Inativo' END"
            rows={3}
            spellCheck={false}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-100 bg-slate-900 font-mono placeholder:text-slate-600 outline-none focus:border-brand-500 resize-y leading-relaxed"
          />
        )}
      </div>

      {value.length === 0 && (
        <p className="text-xs text-slate-400">
          Adicione as colunas da tabela ou view — ex: <span className="font-mono">id_pedido — INT64</span>
        </p>
      )}
    </div>
  );
}