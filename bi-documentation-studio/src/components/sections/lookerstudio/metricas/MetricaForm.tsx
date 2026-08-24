import { useState, useEffect } from 'react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Button } from '@components/common/Button';
import { useLSStore } from '@store/useLSStore';
import { generateId } from '@utils/id';
import type { LSMetric } from '@models/schema.lookerstudio';

function metricaVazia(): LSMetric {
  return { id: generateId(), nome: '' };
}

function Separador({ label }: { label: string }) {
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

interface MetricaFormProps {
  aberto:   boolean;
  metrica?: LSMetric;
  onSave:   (metrica: LSMetric) => void;
  onClose:  () => void;
}

export function MetricaForm({ aberto, metrica, onSave, onClose }: MetricaFormProps) {
  const lsData = useLSStore((s) => s.lsData);
  const [form, setForm] = useState<LSMetric>(() => metrica ?? metricaVazia());

  useEffect(() => {
    if (aberto) setForm(metrica ?? metricaVazia());
  }, [aberto, metrica]);

  function handleOpenChange(open: boolean) { if (!open) onClose(); }

  function set<K extends keyof LSMetric>(campo: K, valor: LSMetric[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleSalvar() {
    if (!form.nome.trim()) return;
    onSave({ ...form, nome: form.nome.trim() });
    onClose();
  }

  // Fontes disponíveis = Fontes de Dados + Combinações (ambas podem ser origem de uma métrica)
  const fontesDisponiveis = [
    ...(lsData?.fontes_dados ?? []).map((f) => ({ id: f.id, nome: f.nome, tipo: 'Fonte' })),
    ...(lsData?.combinacoes  ?? []).map((c) => ({ id: c.id, nome: c.nome, tipo: 'Combinação' })),
  ];

  // Campos disponíveis da fonte selecionada
  const fonteAtual = form.fonte_dados_id
    ? lsData?.fontes_dados.find((f) => f.id === form.fonte_dados_id)
    : undefined;

  const combinacaoAtual = form.fonte_dados_id
    ? lsData?.combinacoes.find((c) => c.id === form.fonte_dados_id)
    : undefined;

  const camposDisponiveis = [
    ...(fonteAtual?.campos           ?? []).map((c) => c.nome),
    ...(combinacaoAtual?.campos_resultantes ?? []).map((c) => c.nome),
  ];

  return (
    <Modal
      open={aberto}
      onOpenChange={handleOpenChange}
      title={metrica ? 'Editar métrica' : 'Nova métrica'}
      maxWidth="xl"
    >
      <div className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">

        {/* ── Identificação ─────────────────────────────────────────── */}
        <Input
          label="Nome da métrica" required
          placeholder="Ex: Receita Líquida, Taxa de Conversão, NPS"
          value={form.nome}
          onChange={(e) => set('nome', e.target.value)}
        />

        <Textarea
          label="Descrição"
          placeholder="Descreva o que esta métrica representa no contexto do negócio."
          value={form.descricao ?? ''}
          onChange={(e) => set('descricao', e.target.value)}
          rows={2}
        />

        {/* ── Origem dos dados ──────────────────────────────────────── */}
        <Separador label="Origem dos dados" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Fonte de dados ou combinação
            </label>
            <select
              value={form.fonte_dados_id ?? ''}
              onChange={(e) => {
                set('fonte_dados_id', e.target.value || undefined);
                set('campo_origem', undefined);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 bg-white"
            >
              <option value="">— Nenhuma selecionada —</option>
              {fontesDisponiveis.length > 0 && (
                <>
                  <optgroup label="Fontes de Dados">
                    {(lsData?.fontes_dados ?? []).map((f) => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </optgroup>
                  {(lsData?.combinacoes ?? []).length > 0 && (
                    <optgroup label="Combinações">
                      {(lsData?.combinacoes ?? []).map((c) => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </optgroup>
                  )}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Campo de origem
            </label>
            {camposDisponiveis.length > 0 ? (
              <select
                value={form.campo_origem ?? ''}
                onChange={(e) => set('campo_origem', e.target.value || undefined)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 bg-white"
              >
                <option value="">— Selecionar campo —</option>
                {camposDisponiveis.map((campo) => (
                  <option key={campo} value={campo}>{campo}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.campo_origem ?? ''}
                onChange={(e) => set('campo_origem', e.target.value || undefined)}
                placeholder="Ex: valor_liquido"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 font-mono"
              />
            )}
          </div>
        </div>

        {/* ── Cálculo ───────────────────────────────────────────────── */}
        <Separador label="Cálculo e fórmula" />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-2">
            <label className="text-sm font-medium text-slate-700">Fórmula</label>
            <span className="text-xs text-slate-400">Expressão do Looker Studio ou linguagem natural</span>
          </div>
          <textarea
            value={form.formula ?? ''}
            onChange={(e) => set('formula', e.target.value)}
            placeholder={
              'Ex (campo calculado): SUM(ValorBruto) - SUM(Desconto)\n' +
              'Ex (linguagem natural): Soma da receita após descontos e devoluções'
            }
            rows={4}
            spellCheck={false}
            className="px-3 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-100 bg-slate-900 font-mono placeholder:text-slate-600 outline-none focus:border-brand-500 resize-y leading-relaxed"
            style={{ minHeight: '90px' }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Unidade"
            placeholder="Ex: R$, %, dias, unidades"
            value={form.unidade ?? ''}
            onChange={(e) => set('unidade', e.target.value)}
          />
          <Input
            label="Formato de exibição"
            placeholder="Ex: #.##0,00 · 0,0% · #.##0"
            value={form.formato ?? ''}
            onChange={(e) => set('formato', e.target.value)}
          />
          <Input
            label="Granularidade"
            placeholder="Ex: Por dia, por SKU, acumulado"
            value={form.granularidade ?? ''}
            onChange={(e) => set('granularidade', e.target.value)}
          />
        </div>

        {/* ── Regra de negócio ──────────────────────────────────────── */}
        <Separador label="Regra de negócio" />

        <Textarea
          label="O que mede"
          placeholder="Ex: Receita total de vendas aprovadas no período, descontados cancelamentos e devoluções."
          value={form.o_que_mede ?? ''}
          onChange={(e) => set('o_que_mede', e.target.value)}
          rows={2}
        />

        <Textarea
          label="O que entra"
          placeholder="Ex: Pedidos com status Aprovado, Faturado ou Entregue."
          value={form.o_que_entra ?? ''}
          onChange={(e) => set('o_que_entra', e.target.value)}
          rows={2}
        />

        <Textarea
          label="O que não entra"
          placeholder="Ex: Pedidos cancelados, devolvidos ou com pagamento pendente."
          value={form.o_que_nao_entra ?? ''}
          onChange={(e) => set('o_que_nao_entra', e.target.value)}
          rows={2}
        />

        <Textarea
          label="Exceções"
          placeholder="Ex: Vendas intercompany são excluídas na visão consolidada mas incluídas por empresa."
          value={form.excecoes ?? ''}
          onChange={(e) => set('excecoes', e.target.value)}
          rows={2}
        />

        <Textarea
          label="Regras temporais"
          placeholder="Ex: Considera a data de faturamento, não a data do pedido. YTD acumula a partir de Jan."
          value={form.regras_temporais ?? ''}
          onChange={(e) => set('regras_temporais', e.target.value)}
          rows={2}
        />

        <Textarea
          label="Regra de negócio completa"
          placeholder="Descreva em linguagem de negócio como este indicador é calculado e interpretado."
          value={form.regra_negocio ?? ''}
          onChange={(e) => set('regra_negocio', e.target.value)}
          rows={3}
        />

        {/* ── Validação ─────────────────────────────────────────────── */}
        <Separador label="Validação e responsabilidade" />

        <Input
          label="Responsável pela validação"
          placeholder="Ex: Ana Costa — Gerência Comercial"
          value={form.responsavel_validacao ?? ''}
          onChange={(e) => set('responsavel_validacao', e.target.value)}
        />

        <Textarea
          label="Limitações conhecidas"
          placeholder="Ex: Não considera vendas realizadas antes de Jan/2023. Dados atualizados diariamente às 6h."
          value={form.limitacoes_conhecidas ?? ''}
          onChange={(e) => set('limitacoes_conhecidas', e.target.value)}
          rows={2}
        />

        <Textarea
          label="Observações"
          placeholder="Contexto adicional, histórico de alterações na regra, benchmarks..."
          value={form.observacoes ?? ''}
          onChange={(e) => set('observacoes', e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" size="md" onClick={handleSalvar} disabled={!form.nome.trim()}>
          {metrica ? 'Salvar alterações' : 'Adicionar métrica'}
        </Button>
      </div>
    </Modal>
  );
}