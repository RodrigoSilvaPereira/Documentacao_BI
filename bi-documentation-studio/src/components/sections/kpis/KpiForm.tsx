import { useState } from 'react';
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
  aberto:   boolean;
  kpi?:     KPI;               // undefined = novo KPI, KPI = edição
  onSave:   (kpi: KPI) => void;
  onClose:  () => void;
}

function kpiVazio(): KPI {
  return {
    id:             generateId(),
    nome:           '',
    tipo_visual:    'card',
    tipo_outro:     '',
    o_que_mede:     '',
    objetivo_meta:  '',
    regras_negocio: [],
    observacoes:    '',
  };
}

export function KpiForm({ aberto, kpi, onSave, onClose }: KpiFormProps) {
  const [form, setForm] = useState<KPI>(() => kpi ?? kpiVazio());

  // Sincroniza quando o modal é reaberto com dados diferentes
  // (ex: usuário fecha sem salvar e abre outro KPI para editar)
  function handleOpenChange(open: boolean) {
    if (open) {
      setForm(kpi ?? kpiVazio());
    } else {
      onClose();
    }
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

  const formValido = form.nome.trim() !== '';
  const titulo     = kpi ? 'Editar KPI' : 'Novo KPI';

  return (
    <Modal
      open={aberto}
      onOpenChange={handleOpenChange}
      title={titulo}
      maxWidth="lg"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

        {/* Nome */}
        <Input
          label="Nome do KPI"
          placeholder="Ex: Total de Vendas"
          value={form.nome}
          onChange={(e) => set('nome', e.target.value)}
          required
        />

        {/* Tipo de visual */}
        <Select
          label="Tipo de Visual"
          options={OPCOES_TIPO_VISUAL_KPI}
          value={form.tipo_visual}
          onChange={handleTipoVisualChange}
        />

        {/* Tipo personalizado — visível apenas quando "outro" */}
        {form.tipo_visual === 'outro' && (
          <Input
            label="Tipo personalizado"
            placeholder="Descreva o tipo de visual utilizado"
            value={form.tipo_outro ?? ''}
            onChange={(e) => set('tipo_outro', e.target.value)}
          />
        )}

        {/* O que mede */}
        <Textarea
          label="O que mede"
          placeholder="Ex: Soma do faturamento bruto no período selecionado"
          value={form.o_que_mede}
          onChange={(e) => set('o_que_mede', e.target.value)}
          rows={2}
        />

        {/* Objetivo / Meta */}
        <Textarea
          label="Objetivo / Meta"
          placeholder="Ex: Monitorar receita versus meta mensal"
          value={form.objetivo_meta}
          onChange={(e) => set('objetivo_meta', e.target.value)}
          rows={2}
        />

        {/* Regras de negócio */}
        <ListaStrings
          label="Regras de Negócio"
          value={form.regras_negocio}
          onChange={(items) => set('regras_negocio', items)}
          placeholder="Ex: Considera apenas vendas com status = Aprovado"
          emptyText="Nenhuma regra cadastrada. Adicione as regras que definem como este KPI é calculado."
        />

        {/* Observações */}
        <Textarea
          label="Observações / Contexto"
          placeholder="Condicionais de cor, alertas, limites, interpretações..."
          value={form.observacoes}
          onChange={(e) => set('observacoes', e.target.value)}
          rows={2}
        />
      </div>

      {/* Rodapé com ações */}
      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleSalvar}
          disabled={!formValido}
        >
          {kpi ? 'Salvar alterações' : 'Adicionar KPI'}
        </Button>
      </div>
    </Modal>
  );
}