import { useState, useEffect } from 'react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Select } from '@components/common/Select';
import { Button } from '@components/common/Button';
import { BigQueryColunasEditor } from './BigQueryColunasEditor';
import { generateId } from '@utils/id';
import type { BigQuerySource, TipoObjetoBigQuery } from '@models/schema.lookerstudio';

const OPCOES_TIPO_OBJETO = [
  { value: 'tabela',            label: 'Tabela'               },
  { value: 'view',              label: 'View'                 },
  { value: 'materialized_view', label: 'View Materializada'   },
  { value: 'procedure',         label: 'Procedure'            },
  { value: 'function',          label: 'Function'             },
  { value: 'scheduled_query',   label: 'Scheduled Query'      },
];

const MOSTRA_SQL: TipoObjetoBigQuery[] = ['view', 'materialized_view', 'procedure', 'function', 'scheduled_query'];

function labelSQL(tipo: TipoObjetoBigQuery): string {
  const map: Partial<Record<TipoObjetoBigQuery, string>> = {
    view:              'Query SQL da View',
    materialized_view: 'Query SQL da View Materializada',
    procedure:         'Código do Procedure',
    function:          'Código da Function',
    scheduled_query:   'Query Agendada (SQL)',
  };
  return map[tipo] ?? 'Código SQL';
}

function bqVazio(): BigQuerySource {
  return {
    id: generateId(), projeto_gcp: '', dataset: '', nome: '',
    tipo: 'tabela', descricao: '', colunas: [],
  };
}

function Separador({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

interface BigQueryFormProps {
  aberto:  boolean;
  source?: BigQuerySource;
  onSave:  (source: BigQuerySource) => void;
  onClose: () => void;
}

export function BigQueryForm({ aberto, source, onSave, onClose }: BigQueryFormProps) {
  const [form, setForm] = useState<BigQuerySource>(() => source ?? bqVazio());

  useEffect(() => {
    if (aberto) setForm(source ?? bqVazio());
  }, [aberto, source]);

  function handleOpenChange(open: boolean) { if (!open) onClose(); }

  function set<K extends keyof BigQuerySource>(campo: K, valor: BigQuerySource[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleSalvar() {
    if (!form.nome.trim() || !form.projeto_gcp.trim() || !form.dataset.trim()) return;
    onSave({ ...form, nome: form.nome.trim() });
    onClose();
  }

  const formValido = form.nome.trim() && form.projeto_gcp.trim() && form.dataset.trim();
  const mostraSQL  = MOSTRA_SQL.includes(form.tipo);

  return (
    <Modal
      open={aberto}
      onOpenChange={handleOpenChange}
      title={source ? 'Editar objeto BigQuery' : 'Novo objeto BigQuery'}
      maxWidth="2xl"
    >
      <div className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">

        {/* Identificação */}
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Projeto GCP" required
            placeholder="Ex: minha-empresa-bi"
            value={form.projeto_gcp}
            onChange={(e) => set('projeto_gcp', e.target.value)}
          />
          <Input
            label="Dataset" required
            placeholder="Ex: analytics_prod"
            value={form.dataset}
            onChange={(e) => set('dataset', e.target.value)}
          />
          <Select
            label="Tipo"
            options={OPCOES_TIPO_OBJETO}
            value={form.tipo}
            onChange={(e) => set('tipo', e.target.value as TipoObjetoBigQuery)}
          />
        </div>

        <Input
          label="Nome da tabela / view" required
          placeholder="Ex: fVendas, vw_pedidos_diarios"
          value={form.nome}
          onChange={(e) => set('nome', e.target.value)}
          hint={`Objeto: ${form.projeto_gcp || 'projeto'}.${form.dataset || 'dataset'}.${form.nome || 'nome'}`}
        />

        <Textarea
          label="Descrição"
          placeholder="Descreva o propósito desta tabela ou view no contexto analítico."
          value={form.descricao}
          onChange={(e) => set('descricao', e.target.value)}
          rows={2}
        />

        {/* Contexto */}
        <Separador label="Contexto e responsabilidade" />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Responsável"
            placeholder="Ex: Time de Engenharia de Dados"
            value={form.responsavel ?? ''}
            onChange={(e) => set('responsavel', e.target.value)}
          />
          <Input
            label="Domínio de negócio"
            placeholder="Ex: Comercial, Financeiro, RH"
            value={form.dominio_negocio ?? ''}
            onChange={(e) => set('dominio_negocio', e.target.value)}
          />
        </div>

        <Input
          label="Granularidade"
          placeholder="Ex: Um registro por pedido, por dia e filial"
          value={form.granularidade ?? ''}
          onChange={(e) => set('granularidade', e.target.value)}
        />

        {/* SQL / Código */}
        {mostraSQL && (
          <>
            <Separador label={labelSQL(form.tipo)} />
            <textarea
              value={form.sql_query ?? ''}
              onChange={(e) => set('sql_query', e.target.value)}
              placeholder="SELECT\n    id_pedido,\n    data_pedido,\n    valor_total\nFROM `projeto.dataset.tabela`\nWHERE status = 'ATIVO'"
              rows={7}
              spellCheck={false}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-100 bg-slate-900 font-mono placeholder:text-slate-600 outline-none focus:border-brand-500 resize-y leading-relaxed"
              style={{ minHeight: '140px' }}
            />
          </>
        )}

        {/* Colunas */}
        <Separador label="Colunas" />
        <BigQueryColunasEditor
          value={form.colunas}
          onChange={(cols) => set('colunas', cols)}
        />

        {/* Técnico */}
        <Separador label="Configurações técnicas" />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Particionamento"
            placeholder="Ex: DATE(data_pedido) — partição por data"
            value={form.particionamento ?? ''}
            onChange={(e) => set('particionamento', e.target.value)}
          />
          <Input
            label="Clusterização"
            placeholder="Ex: filial_id, status"
            value={form.clusterizacao ?? ''}
            onChange={(e) => set('clusterizacao', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Frequência de atualização"
            placeholder="Ex: Diária às 3h"
            value={form.frequencia_atualizacao ?? ''}
            onChange={(e) => set('frequencia_atualizacao', e.target.value)}
          />
          <Input
            label="Volume estimado"
            placeholder="Ex: ~2M registros"
            value={form.volume_estimado ?? ''}
            onChange={(e) => set('volume_estimado', e.target.value)}
          />
          <Input
            label="Retenção"
            placeholder="Ex: 3 anos / sem expiração"
            value={form.retencao ?? ''}
            onChange={(e) => set('retencao', e.target.value)}
          />
        </div>

        <Textarea
          label="Observações"
          placeholder="Dependências, regras especiais, histórico de alterações..."
          value={form.observacoes ?? ''}
          onChange={(e) => set('observacoes', e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" size="md" onClick={handleSalvar} disabled={!formValido}>
          {source ? 'Salvar alterações' : 'Adicionar objeto BigQuery'}
        </Button>
      </div>
    </Modal>
  );
}