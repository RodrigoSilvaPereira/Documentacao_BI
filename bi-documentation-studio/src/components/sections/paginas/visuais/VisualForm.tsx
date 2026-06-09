import { useState } from 'react';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Select } from '@components/common/Select';
import { Button } from '@components/common/Button';
import { MultiSelect } from '@components/common/MultiSelect';
import { ListaStrings } from '@components/common/ListaStrings';
import { generateId } from '@utils/id';
import { OPCOES_TIPO_VISUAL, type TipoVisual } from '@models/enums';
import type { Visual, KPI, MedidaDAX, Query } from '@models/schema';

interface VisualFormProps {
  visual?:  Visual;
  kpis:     KPI[];
  medidas:  MedidaDAX[];
  queries:  Query[];
  onSave:   (visual: Visual) => void;
  onCancel: () => void;
}

function visualVazio(): Visual {
  return {
    id:          generateId(),
    nome:        '',
    tipo:        'cartao',
    tipo_outro:  '',
    objetivo:    '',
    descricao:   '',
    kpis_ids:    [],
    medidas_ids: [],
    tabelas_ids: [],
    campos:      [],
    observacoes: '',
    captura:     null,
  };
}

export function VisualForm({ visual, kpis, medidas, queries, onSave, onCancel }: VisualFormProps) {
  const [form, setForm] = useState<Visual>(() => visual ?? visualVazio());

  function set<K extends keyof Visual>(campo: K, valor: Visual[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleTipoChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const novoTipo = e.target.value as TipoVisual;
    setForm((prev) => ({
      ...prev,
      tipo:       novoTipo,
      tipo_outro: novoTipo !== 'outro' ? '' : prev.tipo_outro,
    }));
  }

  function handleSalvar() {
    if (!form.nome.trim()) return;
    onSave({ ...form, nome: form.nome.trim() });
  }

  const kpiOptions    = kpis.map((k) => ({ value: k.id, label: k.nome }));
  const medidaOptions = medidas.map((m) => ({ value: m.id, label: m.tabela ? `${m.tabela}[${m.nome}]` : m.nome }));
  const tabelaOptions = queries.map((q) => ({ value: q.id, label: q.nome }));
  const formValido    = form.nome.trim() !== '';

  return (
    <div className="border border-brand-200 rounded-xl p-4 bg-brand-50/30 space-y-4">
      <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
        {visual ? 'Editar visual' : 'Novo visual'}
      </p>

      {/* Nome + Tipo */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Nome do visual"
          placeholder="Ex: Faturamento por Região"
          value={form.nome}
          onChange={(e) => set('nome', e.target.value)}
          required
        />
        <Select
          label="Tipo de visual"
          options={OPCOES_TIPO_VISUAL}
          value={form.tipo}
          onChange={handleTipoChange}
        />
      </div>

      {form.tipo === 'outro' && (
        <Input
          label="Tipo personalizado"
          placeholder="Descreva o tipo de visual"
          value={form.tipo_outro ?? ''}
          onChange={(e) => set('tipo_outro', e.target.value)}
        />
      )}

      {/* Objetivo + Descrição */}
      <Input
        label="Objetivo do visual"
        placeholder="Ex: Demonstrar o faturamento por região"
        value={form.objetivo}
        onChange={(e) => set('objetivo', e.target.value)}
      />
      <Textarea
        label="Descrição do visual"
        placeholder="Ex: Gráfico que apresenta o faturamento consolidado por região comercial."
        value={form.descricao}
        onChange={(e) => set('descricao', e.target.value)}
        rows={2}
      />

      {/* Referências cruzadas */}
      <div className="grid grid-cols-2 gap-3">
        <MultiSelect
          label="KPIs utilizados"
          options={kpiOptions}
          value={form.kpis_ids}
          onChange={(ids) => set('kpis_ids', ids)}
          placeholder="Selecionar KPIs..."
        />
        <MultiSelect
          label="Medidas DAX utilizadas"
          options={medidaOptions}
          value={form.medidas_ids}
          onChange={(ids) => set('medidas_ids', ids)}
          placeholder="Selecionar medidas..."
        />
      </div>

      <MultiSelect
        label="Tabelas utilizadas"
        options={tabelaOptions}
        value={form.tabelas_ids}
        onChange={(ids) => set('tabelas_ids', ids)}
        placeholder="Selecionar tabelas..."
      />

      <ListaStrings
        label="Campos utilizados"
        value={form.campos}
        onChange={(campos) => set('campos', campos)}
        placeholder="Ex: Região, ValorVenda..."
      />

      <Textarea
        label="Observações"
        placeholder="Ex: Ordenado do maior para o menor faturamento."
        value={form.observacoes}
        onChange={(e) => set('observacoes', e.target.value)}
        rows={2}
      />

      {/* Ações */}
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" size="sm" onClick={handleSalvar} disabled={!formValido}>
          {visual ? 'Salvar' : 'Adicionar visual'}
        </Button>
      </div>
    </div>
  );
}