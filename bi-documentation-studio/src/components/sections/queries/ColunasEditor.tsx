import { useState } from 'react';
import { Plus, X, Zap } from 'lucide-react';
import { Input } from '@components/common/Input';
import { Button } from '@components/common/Button';
import { cn } from '@utils/cn';
import { generateId } from '@utils/id';
import type { ColunaPrincipal } from '@models/schema';

interface ColunasEditorProps {
  value:    ColunaPrincipal[];
  onChange: (colunas: ColunaPrincipal[]) => void;
}

export function ColunasEditor({ value, onChange }: ColunasEditorProps) {
  const [nome,      setNome]      = useState('');
  const [tipo,      setTipo]      = useState('');
  const [descricao, setDescricao] = useState('');
  const [calculada, setCalculada] = useState(false);
  const [formula,   setFormula]   = useState('');

  const podeAdicionar = nome.trim() !== '';

  function adicionar() {
    if (!podeAdicionar) return;
    onChange([
      ...value,
      {
        id:             generateId(),
        nome:           nome.trim(),
        tipo:           tipo.trim(),
        descricao:      descricao.trim(),
        calculada:      calculada || undefined,
        formula_coluna: calculada && formula.trim() ? formula.trim() : undefined,
      },
    ]);
    setNome('');
    setTipo('');
    setDescricao('');
    setCalculada(false);
    setFormula('');
  }

  function remover(id: string) {
    onChange(value.filter((c) => c.id !== id));
  }

  // Enter só adiciona quando não há campo de fórmula aberto
  // (textarea de fórmula precisa do Enter para quebrar linha)
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !calculada) {
      e.preventDefault();
      adicionar();
    }
  }

  return (
    <div className="space-y-2">

      {/* ── Lista de colunas cadastradas ─────────────────────────── */}
      {value.length > 0 && (
        <div className="space-y-1.5">

          {/* Cabeçalho */}
          <div
            className="grid gap-3 px-3 py-1"
            style={{ gridTemplateColumns: '1fr 90px 1.5fr 28px' }}
          >
            <span className="text-xs font-medium text-slate-400">Coluna</span>
            <span className="text-xs font-medium text-slate-400">Tipo</span>
            <span className="text-xs font-medium text-slate-400">Descrição</span>
          </div>

          {value.map((col) => (
            <div
              key={col.id}
              className={cn(
                'px-3 py-2.5 border rounded-lg',
                col.calculada
                  ? 'bg-purple-50/40 border-purple-200'
                  : 'bg-slate-50 border-slate-200',
              )}
            >
              {/* Linha principal */}
              <div
                className="grid items-center gap-3"
                style={{ gridTemplateColumns: '1fr 90px 1.5fr 28px' }}
              >
                {/* Nome + ícone calculada */}
                <div className="flex items-center gap-1.5 min-w-0">
                  {col.calculada && (
                    <Zap
                      size={11}
                      className="text-purple-500 flex-shrink-0"
                      title="Coluna calculada"
                    />
                  )}
                  <span className="text-sm font-mono text-slate-800 truncate">
                    {col.nome}
                  </span>
                </div>
                <span className="text-xs text-slate-500 truncate">
                  {col.tipo || '—'}
                </span>
                <span className="text-sm text-slate-600 truncate">
                  {col.descricao || '—'}
                </span>
                <button
                  onClick={() => remover(col.id)}
                  aria-label={`Remover coluna ${col.nome}`}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Fórmula (apenas quando calculada) */}
              {col.calculada && col.formula_coluna && (
                <div className="mt-2 px-2.5 py-2 bg-slate-900 rounded-md">
                  <code className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-all">
                    {col.formula_coluna}
                  </code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Formulário de adição ──────────────────────────────────── */}
      <div className="space-y-2.5 border border-slate-200 rounded-lg p-3 bg-white">

        {/* Linha 1: Nome | Tipo | Descrição */}
        <div className="flex gap-2 items-end">
          <div className="flex-1 min-w-0">
            <Input
              label="Nome da coluna"
              placeholder="Ex: IDPedido"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
          <div className="w-24 flex-shrink-0">
            <Input
              label="Tipo"
              placeholder="Ex: INT"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
          <div className="flex-[1.5] min-w-0">
            <Input
              label="Descrição"
              placeholder="Ex: Identificador único"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
        </div>

        {/* Linha 2: Toggle calculada + Botão Adicionar */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCalculada((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              calculada
                ? 'bg-purple-50 text-purple-700 border-purple-300'
                : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400',
            )}
          >
            <Zap size={12} className={calculada ? 'text-purple-500' : 'text-slate-400'} />
            Coluna calculada
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={adicionar}
            disabled={!podeAdicionar}
            leftIcon={<Plus size={13} />}
          >
            Adicionar coluna
          </Button>
        </div>

        {/* Linha 3: Fórmula (apenas quando calculada está ativo) */}
        {calculada && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2">
              <label className="text-xs font-medium text-slate-700">Fórmula</label>
              <span className="text-xs text-slate-400">DAX, M ou SQL</span>
            </div>
            <textarea
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder={
                `Ex (DAX):   = RELATED(dimClientes[NomeCliente])\n` +
                `Ex (M):     Table.AddColumn(Fonte, "Total", each [Qtd] * [Preco])\n` +
                `Ex (SQL):   CASE WHEN Status = 1 THEN 'Ativo' ELSE 'Inativo' END`
              }
              rows={3}
              spellCheck={false}
              className="px-3 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-100 bg-slate-900 font-mono placeholder:text-slate-600 outline-none focus:outline-none focus:border-brand-500 resize-y transition-colors leading-relaxed"
              style={{ minHeight: '72px' }}
            />
          </div>
        )}
      </div>

      {value.length === 0 && (
        <p className="text-xs text-slate-400">
          Ex: <span className="font-mono">IDPedido — INT</span>
          {' · '}
          <span className="font-mono">Data — DATE</span>
          {' · '}
          <span className="font-mono">ValorLiquido — DECIMAL</span>
        </p>
      )}
    </div>
  );
}