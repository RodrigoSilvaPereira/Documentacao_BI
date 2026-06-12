import { useState, useEffect } from 'react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Select } from '@components/common/Select';
import { Button } from '@components/common/Button';
import { ListaStrings } from '@components/common/ListaStrings';
import { generateId } from '@utils/id';
import { OPCOES_TIPO_VISUAL_KPI, type TipoVisualKPI } from '@models/enums';
import type { KPI } from '@models/schema';

interface KpiFormProps {
  aberto:  boolean;
  kpi?:    KPI;
  onSave:  (kpi: KPI) => void;
  onClose: () => void;
}

function kpiVazio(): KPI {
  return {
    id: generateId(),
    nome: '', tipo_visual: 'card', tipo_outro: '',
    o_que_mede: '', objetivo_meta: '', formula: '',
    o_que_entra: '', o_que_nao_entra: '', excecoes: '',
    regras_temporais: '', fonte_dados_kpi: '', responsavel_validacao: '',
    regras_negocio: [], observacoes: '',
  };
}

function Secao({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

export function KpiForm({ aberto, kpi, onSave, onClose }: KpiFormProps) {
  const [form, setForm] = useState<KPI>(() => kpi ?? kpiVazio());

  // Reidrata o formulário sempre que o modal é aberto.
  // Necessário porque o Radix Dialog não chama onOpenChange(true)
  // quando o `open` é alterado programaticamente pelo componente pai.
  useEffect(() => {
    if (aberto) setForm(kpi ?? kpiVazio());
  }, [aberto, kpi]);

  function handleOpenChange(open: boolean) {
    if (!open) onClose();
  }

  function set<K extends keyof KPI>(campo: K, valor: KPI[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleTipoVisualChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const novoTipo = e.target.value as TipoVisualKPI;
    setForm((prev) => ({
      ...prev,
      tipo_visual: novoTipo,
      tipo_outro:  novoTipo !== 'outro' ? '' : prev.tipo_outro,
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
      title={kpi ? 'Editar KPI' : 'Novo KPI'}
      maxWidth="xl"
    >
      <div className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nome do KPI"
            placeholder="Ex: Taxa de Conversão"
            value={form.nome}
            onChange={(e) => set('nome', e.target.value)}
            required
          />
          <Select
            label="Tipo de visual"
            options={OPCOES_TIPO_VISUAL_KPI}
            value={form.tipo_visual}
            onChange={handleTipoVisualChange}
          />
        </div>

        {form.tipo_visual === 'outro' && (
          <Input
            label="Tipo personalizado"
            placeholder="Descreva o tipo de visual"
            value={form.tipo_outro ?? ''}
            onChange={(e) => set('tipo_outro', e.target.value)}
          />
        )}

        <Secao label="O que calcula" />

        <Textarea
          label="O que mede"
          placeholder="Ex: Percentual de leads que se converteram em clientes no período selecionado."
          value={form.o_que_mede}
          onChange={(e) => set('o_que_mede', e.target.value)}
          rows={2}
        />

        <Input
          label="Objetivo / Meta"
          placeholder="Ex: Meta mensal de 15%. Acompanhar evolução vs. período anterior."
          value={form.objetivo_meta}
          onChange={(e) => set('objetivo_meta', e.target.value)}
        />

        <Input
          label="Fórmula"
          placeholder="Ex: (Clientes Novos ÷ Leads Totais) × 100"
          value={form.formula ?? ''}
          onChange={(e) => set('formula', e.target.value)}
          hint="Expressão do cálculo em linguagem natural ou notação matemática."
        />

        <Secao label="Escopo do cálculo" />

        <Textarea
          label="O que entra"
          placeholder="Ex: Todos os leads com status Convertido no período selecionado, independente do canal."
          value={form.o_que_entra ?? ''}
          onChange={(e) => set('o_que_entra', e.target.value)}
          rows={2}
        />

        <Textarea
          label="O que não entra"
          placeholder="Ex: Leads sem interação nos últimos 90 dias, leads de campanhas pagas canceladas."
          value={form.o_que_nao_entra ?? ''}
          onChange={(e) => set('o_que_nao_entra', e.target.value)}
          rows={2}
        />

        <Textarea
          label="Exceções"
          placeholder="Ex: Clientes migrados do sistema legado antes de Jan/2023 são tratados como convertidos independente do status."
          value={form.excecoes ?? ''}
          onChange={(e) => set('excecoes', e.target.value)}
          rows={2}
        />

        <Secao label="Temporalidade" />

        <Textarea
          label="Regras temporais"
          placeholder="Ex: Considera o mês completo mesmo se o período selecionado for parcial. Para YTD, acumula a partir de Jan do ano corrente."
          value={form.regras_temporais ?? ''}
          onChange={(e) => set('regras_temporais', e.target.value)}
          rows={2}
        />

        <Secao label="Origem e validação" />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Fonte dos dados"
            placeholder="Ex: CRM Salesforce — tabela Oportunidades"
            value={form.fonte_dados_kpi ?? ''}
            onChange={(e) => set('fonte_dados_kpi', e.target.value)}
          />
          <Input
            label="Responsável pela validação"
            placeholder="Ex: Ana Costa — Gerência Comercial"
            value={form.responsavel_validacao ?? ''}
            onChange={(e) => set('responsavel_validacao', e.target.value)}
          />
        </div>

        <Secao label="Regras de negócio" />

        <ListaStrings
          value={form.regras_negocio}
          onChange={(items) => set('regras_negocio', items)}
          placeholder="Ex: Considera apenas registros com Status = Aprovado"
          emptyText="Nenhuma regra cadastrada."
        />

        <Textarea
          label="Observações / Contexto"
          placeholder="Condicionais de cor, alertas, limites, benchmarks..."
          value={form.observacoes}
          onChange={(e) => set('observacoes', e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" size="md" onClick={handleSalvar} disabled={!form.nome.trim()}>
          {kpi ? 'Salvar alterações' : 'Adicionar KPI'}
        </Button>
      </div>
    </Modal>
  );
}