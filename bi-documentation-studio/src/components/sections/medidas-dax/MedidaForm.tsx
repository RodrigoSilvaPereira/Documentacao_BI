import { useState } from 'react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Button } from '@components/common/Button';
import { MultiSelect } from '@components/common/MultiSelect';
import { generateId } from '@utils/id';
import type { MedidaDAX, KPI } from '@models/schema';

interface MedidaFormProps {
  aberto:  boolean;
  medida?: MedidaDAX;
  kpis:    KPI[];
  medidas: MedidaDAX[];
  onSave:  (medida: MedidaDAX) => void;
  onClose: () => void;
}

function medidaVazia(): MedidaDAX {
  return {
    id: generateId(), nome: '', tabela: '', descricao: '', formula: '',
    dependencias: [], kpis_relacionados: [],
    comportamento_esperado: '', query_validacao: '',
  };
}

export function MedidaForm({ aberto, medida, kpis, medidas, onSave, onClose }: MedidaFormProps) {
  const [form, setForm] = useState<MedidaDAX>(() => medida ?? medidaVazia());

  function handleOpenChange(open: boolean) {
    if (open) setForm(medida ?? medidaVazia());
    else onClose();
  }

  function set<K extends keyof MedidaDAX>(campo: K, valor: MedidaDAX[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleSalvar() {
    if (!form.nome.trim()) return;
    onSave({ ...form, nome: form.nome.trim(), tabela: form.tabela.trim() });
    onClose();
  }

  const dependencyOptions = medidas
    .filter((m) => m.id !== form.id)
    .map((m) => ({ value: m.id, label: m.tabela ? `${m.tabela}[${m.nome}]` : m.nome }));

  const kpiOptions = kpis.map((k) => ({ value: k.id, label: k.nome }));

  return (
    <Modal
      open={aberto}
      onOpenChange={handleOpenChange}
      title={medida ? 'Editar Medida DAX' : 'Nova Medida DAX'}
      maxWidth="xl"
    >
      <div className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">

        {/* Identificação */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nome da medida"
            placeholder="Ex: Total Vendas"
            value={form.nome}
            onChange={(e) => set('nome', e.target.value)}
            required
          />
          <Input
            label="Tabela"
            placeholder="Ex: fVendas"
            value={form.tabela}
            onChange={(e) => set('tabela', e.target.value)}
          />
        </div>

        <Textarea
          label="Descrição"
          placeholder="Ex: Soma do valor líquido de todas as vendas aprovadas no período."
          value={form.descricao}
          onChange={(e) => set('descricao', e.target.value)}
          rows={2}
        />

        {/* Fórmula DAX */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Fórmula DAX</label>
          <textarea
            value={form.formula}
            onChange={(e) => set('formula', e.target.value)}
            placeholder={`Total Vendas =\nCALCULATE(\n    SUM(fVendas[ValorLiquido]),\n    fVendas[Status] = "Aprovado"\n)`}
            rows={6}
            spellCheck={false}
            className="px-3 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-100 bg-slate-900 font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y leading-relaxed"
            style={{ minHeight: '120px' }}
          />
        </div>

        {/* Referências cruzadas */}
        <div className="grid grid-cols-2 gap-4">
          <MultiSelect
            label="Dependências"
            options={dependencyOptions}
            value={form.dependencias}
            onChange={(ids) => set('dependencias', ids)}
            placeholder={dependencyOptions.length === 0 ? 'Nenhuma medida disponível' : 'Selecionar medidas...'}
          />
          <MultiSelect
            label="KPIs relacionados"
            options={kpiOptions}
            value={form.kpis_relacionados}
            onChange={(ids) => set('kpis_relacionados', ids)}
            placeholder={kpiOptions.length === 0 ? 'Nenhum KPI disponível' : 'Selecionar KPIs...'}
          />
        </div>

        {/* Validação — campo relabelado */}
        <Textarea
          label="Como validar a medida"
          hint="Descreva como confirmar que o cálculo está correto: comparações esperadas, amostras, cenários de teste."
          placeholder="Ex: Com filtro de Jan/2024, espera-se R$ 1.2M. Validar comparando com relatório legado."
          value={form.comportamento_esperado}
          onChange={(e) => set('comportamento_esperado', e.target.value)}
          rows={3}
        />

        {/* Query de validação — campo novo */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-2">
            <label className="text-sm font-medium text-slate-700">Query de Validação</label>
            <span className="text-xs text-slate-400">SQL ou DAX para cruzar com a fonte</span>
          </div>
          <textarea
            value={form.query_validacao ?? ''}
            onChange={(e) => set('query_validacao', e.target.value)}
            placeholder={`-- Comparar resultado da medida com a origem\nSELECT SUM(ValorLiquido)\nFROM fVendas\nWHERE Status = 'Aprovado'\n  AND YEAR(Data) = 2024`}
            rows={5}
            spellCheck={false}
            className="px-3 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-100 bg-slate-900 font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
            style={{ minHeight: '100px' }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" size="md" onClick={handleSalvar} disabled={!form.nome.trim()}>
          {medida ? 'Salvar alterações' : 'Adicionar Medida'}
        </Button>
      </div>
    </Modal>
  );
}