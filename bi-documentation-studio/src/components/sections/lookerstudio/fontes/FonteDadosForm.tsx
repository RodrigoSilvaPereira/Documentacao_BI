import { useState, useEffect } from 'react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Select } from '@components/common/Select';
import { Button } from '@components/common/Button';
import { CamposEditorLS } from './CamposEditorLS';
import { useLSStore } from '@store/useLSStore';
import { generateId } from '@utils/id';
import { cn } from '@utils/cn';
import {
  OPCOES_TIPO_CONECTOR_LS, type TipoConectorLS,
} from '@models/schema.lookerstudio';
import type { LSDataSource } from '@models/schema.lookerstudio';

function fonteVazia(): LSDataSource {
  return { id: generateId(), nome: '', tipo_conector: 'bigquery', campos: [] };
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

interface FonteDadosFormProps {
  aberto:  boolean;
  fonte?:  LSDataSource;
  onSave:  (fonte: LSDataSource) => void;
  onClose: () => void;
}

export function FonteDadosForm({ aberto, fonte, onSave, onClose }: FonteDadosFormProps) {
  const lsData = useLSStore((s) => s.lsData);
  const [form, setForm] = useState<LSDataSource>(() => fonte ?? fonteVazia());

  useEffect(() => {
    if (aberto) setForm(fonte ?? fonteVazia());
  }, [aberto, fonte]);

  function handleOpenChange(open: boolean) { if (!open) onClose(); }

  function set<K extends keyof LSDataSource>(campo: K, valor: LSDataSource[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleTipoConector(e: React.ChangeEvent<HTMLSelectElement>) {
    const tipo = e.target.value as TipoConectorLS;
    setForm((prev) => ({
      ...prev,
      tipo_conector:        tipo,
      tipo_conector_outro:  tipo !== 'outro' ? undefined : prev.tipo_conector_outro,
      bigquery_source_id:   tipo !== 'bigquery' ? undefined : prev.bigquery_source_id,
    }));
  }

  function handleSalvar() {
    if (!form.nome.trim()) return;
    onSave({ ...form, nome: form.nome.trim() });
    onClose();
  }

  const ehBigQuery = form.tipo_conector === 'bigquery';
  const bqSources  = lsData?.bigquery_sources ?? [];

  const bqOptions = [
    { value: '', label: '— Selecionar objeto BigQuery —' },
    ...bqSources.map((b) => ({
      value: b.id,
      label: `${b.projeto_gcp}.${b.dataset}.${b.nome}`,
    })),
  ];

  return (
    <Modal
      open={aberto}
      onOpenChange={handleOpenChange}
      title={fonte ? 'Editar fonte de dados' : 'Nova fonte de dados'}
      maxWidth="2xl"
    >
      <div className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">

        {/* Identificação */}
        <Input
          label="Nome da fonte de dados" required
          placeholder="Ex: Pedidos — BigQuery, Metas — Planilhas"
          value={form.nome}
          onChange={(e) => set('nome', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Tipo de conector"
            options={OPCOES_TIPO_CONECTOR_LS}
            value={form.tipo_conector}
            onChange={handleTipoConector}
          />
          {form.tipo_conector === 'outro' && (
            <Input
              label="Conector personalizado"
              placeholder="Descreva o tipo de conector"
              value={form.tipo_conector_outro ?? ''}
              onChange={(e) => set('tipo_conector_outro', e.target.value)}
            />
          )}
        </div>

        <Textarea
          label="Descrição"
          placeholder="Descreva o que esta fonte fornece e como é utilizada no dashboard."
          value={form.descricao ?? ''}
          onChange={(e) => set('descricao', e.target.value)}
          rows={2}
        />

        {/* Conexão BigQuery */}
        {ehBigQuery && (
          <>
            <Separador label="Objeto BigQuery" />
            {bqSources.length === 0 ? (
              <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                <span>⚠️</span>
                <span>Nenhum objeto BigQuery cadastrado. Adicione um objeto na seção BigQuery antes de referenciar aqui.</span>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Objeto BigQuery utilizado
                </label>
                <select
                  value={form.bigquery_source_id ?? ''}
                  onChange={(e) => set('bigquery_source_id', e.target.value || undefined)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 bg-white"
                >
                  {bqOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Selecione a tabela ou view do BigQuery que esta fonte consome. O objeto deve estar cadastrado na seção BigQuery deste projeto.
                </p>
              </div>
            )}
          </>
        )}

        {/* Credenciais */}
        <Separador label="Credenciais" />
        <p className="text-xs text-slate-400 -mt-1">
          Documente apenas a referência às credenciais — nunca insira senhas, tokens ou chaves aqui.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Responsável pela credencial"
            placeholder="Ex: service account bi-readonly@empresa.iam.gserviceaccount.com"
            value={form.proprietario_credencial ?? ''}
            onChange={(e) => set('proprietario_credencial', e.target.value)}
          />
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Tipo de credencial</label>
            <div className="flex gap-2">
              {(['proprietario', 'visualizador'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('tipo_credencial', v)}
                  className={cn(
                    'flex-1 h-9 rounded-lg border text-sm font-medium transition-colors capitalize',
                    form.tipo_credencial === v
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'text-slate-600 border-slate-300 hover:border-slate-400',
                  )}
                >
                  {v === 'proprietario' ? 'Do proprietário' : 'Do visualizador'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Input
          label="Frequência de atualização"
          placeholder="Ex: Diária às 6h, tempo real, manual"
          value={form.frequencia_atualizacao ?? ''}
          onChange={(e) => set('frequencia_atualizacao', e.target.value)}
        />

        {/* Campos */}
        <Separador label="Campos disponíveis" />
        <CamposEditorLS
          value={form.campos}
          onChange={(campos) => set('campos', campos)}
        />

        <Textarea
          label="Observações"
          placeholder="Particularidades, filtros padrão aplicados, combinações de dados, limitações conhecidas..."
          value={form.observacoes ?? ''}
          onChange={(e) => set('observacoes', e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" size="md" onClick={handleSalvar} disabled={!form.nome.trim()}>
          {fonte ? 'Salvar alterações' : 'Adicionar fonte de dados'}
        </Button>
      </div>
    </Modal>
  );
}