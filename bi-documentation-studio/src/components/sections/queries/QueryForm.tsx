import { useState, useEffect } from 'react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Select } from '@components/common/Select';
import { Button } from '@components/common/Button';
import { ListaStrings } from '@components/common/ListaStrings';
import { ColunasEditor } from './ColunasEditor';
import { generateId } from '@utils/id';
import { OPCOES_FONTE_DADOS, type FonteDadosQuery } from '@models/enums';
import type { Query } from '@models/schema';

interface QueryFormProps {
  aberto:  boolean;
  query?:  Query;
  onSave:  (query: Query) => void;
  onClose: () => void;
}

function queryVazia(): Query {
  return {
    id: generateId(), nome: '', fonte_dados: 'sql_server', fonte_dados_outro: '',
    descricao: '', codigo: '', transformacoes: [], colunas: [], observacoes: '',
  };
}

export function QueryForm({ aberto, query, onSave, onClose }: QueryFormProps) {
  const [form, setForm] = useState<Query>(() => query ?? queryVazia());

  useEffect(() => {
    if (aberto) setForm(query ?? queryVazia());
  }, [aberto, query]);

  function handleOpenChange(open: boolean) {
    if (!open) onClose();
  }

  function set<K extends keyof Query>(campo: K, valor: Query[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleFonteDadosChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const novaFonte = e.target.value as FonteDadosQuery;
    setForm((prev) => ({
      ...prev,
      fonte_dados:       novaFonte,
      fonte_dados_outro: novaFonte !== 'outro' ? '' : prev.fonte_dados_outro,
    }));
  }

  function handleSalvar() {
    if (!form.nome.trim()) return;
    onSave({ ...form, nome: form.nome.trim() });
    onClose();
  }

  return (
    <Modal
      open={aberto}
      onOpenChange={handleOpenChange}
      title={query ? 'Editar Query' : 'Nova Query'}
      maxWidth="xl"
    >
      <div className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nome da tabela / query"
            placeholder="Ex: fVendas"
            value={form.nome}
            onChange={(e) => set('nome', e.target.value)}
            required
          />
          <Select
            label="Fonte de dados"
            options={OPCOES_FONTE_DADOS}
            value={form.fonte_dados}
            onChange={handleFonteDadosChange}
          />
        </div>

        {form.fonte_dados === 'outro' && (
          <Input
            label="Fonte personalizada"
            placeholder="Descreva a fonte de dados"
            value={form.fonte_dados_outro ?? ''}
            onChange={(e) => set('fonte_dados_outro', e.target.value)}
          />
        )}

        <Textarea
          label="Descrição da tabela"
          placeholder="Ex: Fato de vendas com granularidade por pedido"
          value={form.descricao}
          onChange={(e) => set('descricao', e.target.value)}
          rows={2}
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-2">
            <label className="text-sm font-medium text-slate-700">Código da Query</label>
            <span className="text-xs text-slate-400">SQL ou M (Power Query)</span>
          </div>
          <textarea
            value={form.codigo}
            onChange={(e) => set('codigo', e.target.value)}
            placeholder={`SELECT\n    id_pedido,\n    data_pedido,\n    valor_liquido\nFROM dbo.fVendas\nWHERE status = 'Aprovado'`}
            rows={7}
            spellCheck={false}
            className="px-3 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-100 bg-slate-900 font-mono placeholder:text-slate-600 outline-none focus:outline-none focus:border-brand-500 resize-y transition-colors leading-relaxed"
            style={{ minHeight: '140px' }}
          />
        </div>

        <ListaStrings
          label="Transformações aplicadas (Power Query)"
          value={form.transformacoes}
          onChange={(items) => set('transformacoes', items)}
          placeholder="Ex: Removidas colunas desnecessárias"
          emptyText="Nenhuma transformação cadastrada."
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Colunas principais</label>
          <ColunasEditor value={form.colunas} onChange={(cols) => set('colunas', cols)} />
        </div>

        <Textarea
          label="Observações"
          placeholder="Informações complementares sobre a tabela ou processo de carga..."
          value={form.observacoes}
          onChange={(e) => set('observacoes', e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" size="md" onClick={handleSalvar} disabled={!form.nome.trim()}>
          {query ? 'Salvar alterações' : 'Adicionar Query'}
        </Button>
      </div>
    </Modal>
  );
}