import { useState, useEffect, useMemo } from 'react';
import { Upload, X, Plus } from 'lucide-react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Select } from '@components/common/Select';
import { Button } from '@components/common/Button';
import { ListaStrings } from '@components/common/ListaStrings';
import { CamposCalculadosEditor } from './CamposCalculadosEditor';
import { imageService } from '@services/imageService';
import { useLSStore } from '@store/useLSStore';
import { useAppStore } from '@store/useAppStore';
import { generateId } from '@utils/id';
import { cn } from '@utils/cn';
import {
  OPCOES_TIPO_COMPONENTE_LS,
  type TipoComponenteLS,
  type LSComponent,
} from '@models/schema.lookerstudio';
import type { PendingImagem } from '@models/app';

function componenteVazio(): LSComponent {
  return {
    id:                generateId(),
    nome:              '',
    tipo:              'scorecard',
    fontes_dados_ids:  [],
    dimensoes:         [],
    metricas:          [],
    campos_calculados: [],
    filtros_aplicados: [],
    captura:           null,
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

// Editor de tags com sugestões
function TagsEditor({
  label, hint, value, onChange, sugestoes, placeholder,
}: {
  label:       string;
  hint?:       string;
  value:       string[];
  onChange:    (items: string[]) => void;
  sugestoes?:  string[];
  placeholder: string;
}) {
  const [input, setInput] = useState('');

  const sugestoesFiltradas = (sugestoes ?? [])
    .filter((s) => !value.includes(s))
    .filter((s) => !input || s.toLowerCase().includes(input.toLowerCase()))
    .slice(0, 8);

  function adicionar(item: string) {
    const v = item.trim();
    if (!v || value.includes(v)) return;
    onChange([...value, v]);
    setInput('');
  }

  function remover(item: string) { onChange(value.filter((v) => v !== item)); }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); adicionar(input); }
    if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>

      {/* Tags existentes + input */}
      <div className="flex flex-wrap gap-1.5 min-h-[38px] px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus-within:border-brand-400 transition-colors">
        {value.map((v) => (
          <span key={v} className="flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 text-xs font-mono rounded border border-brand-200">
            {v}
            <button onClick={() => remover(v)} className="text-brand-400 hover:text-brand-700">
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* Sugestões */}
      {sugestoesFiltradas.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {sugestoesFiltradas.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => adicionar(s)}
              className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-mono rounded transition-colors"
            >
              <Plus size={9} /> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ComponenteFormProps {
  aberto:      boolean;
  componente?: LSComponent;
  onSave:      (componente: LSComponent) => void;
  onClose:     () => void;
}

export function ComponenteForm({ aberto, componente, onSave, onClose }: ComponenteFormProps) {
  const lsData        = useLSStore((s) => s.lsData);
  const projetoAberto = useAppStore((s) => s.projetoAberto);

  const [form,    setForm]    = useState<LSComponent>(() => componente ?? componenteVazio());
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingImagem | null>(null);
  const [salvando,setSalvando]= useState(false);

  useEffect(() => {
    if (!aberto) return;
    const novo = componente ?? componenteVazio();
    setForm(novo);
    setPending(null);
    if (novo.captura && projetoAberto) {
      imageService.resolverUrl(novo.captura, projetoAberto.caminho).then(setPreview);
    } else {
      setPreview(null);
    }
  }, [aberto, componente?.id]);

  function handleOpenChange(open: boolean) { if (!open) onClose(); }

  function set<K extends keyof LSComponent>(campo: K, valor: LSComponent[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  // ── Fontes disponíveis (Fontes de Dados + Combinações) ───────────────────
  const fontesDisponiveis = useMemo(() => [
    ...(lsData?.fontes_dados ?? []).map((f) => ({ id: f.id, nome: f.nome, tipo: 'Fonte' as const })),
    ...(lsData?.combinacoes  ?? []).map((c) => ({ id: c.id, nome: c.nome, tipo: 'Combinação' as const })),
  ], [lsData]);

  function toggleFonte(id: string) {
    const atual = form.fontes_dados_ids;
    set('fontes_dados_ids', atual.includes(id) ? atual.filter((f) => f !== id) : [...atual, id]);
  }

  // ── Campos disponíveis das fontes selecionadas ───────────────────────────
  const { dimensoesSugeridas, metricasSugeridas } = useMemo(() => {
    const dimensoes: string[] = [];
    const metricas:  string[] = [];

    form.fontes_dados_ids.forEach((id) => {
      const fonte      = lsData?.fontes_dados.find((f) => f.id === id);
      const combinacao = lsData?.combinacoes.find((c) => c.id === id);

      const campos = [
        ...(fonte?.campos                    ?? []),
        ...(combinacao?.campos_resultantes   ?? []),
      ];

      campos.forEach((c) => {
        if (c.tipo === 'metrica') metricas.push(c.nome);
        else                      dimensoes.push(c.nome);
      });
    });

    // Métricas documentadas na seção de Métricas
    (lsData?.metricas ?? []).forEach((m) => metricas.push(m.nome));

    return {
      dimensoesSugeridas: [...new Set(dimensoes)],
      metricasSugeridas:  [...new Set(metricas)],
    };
  }, [form.fontes_dados_ids, lsData]);

  // ── Parâmetros disponíveis ───────────────────────────────────────────────
  const parametrosDisponiveis = lsData?.parametros ?? [];

  // ── Páginas disponíveis ──────────────────────────────────────────────────
  const paginasDisponiveis = [...(lsData?.paginas ?? [])]
    .sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));

  // ── Captura ──────────────────────────────────────────────────────────────
  async function handleSelecionarCaptura() {
    const path = await imageService.selecionarImagem();
    if (!path) return;
    setPending({ acao: 'novo', origemPath: path });
    setPreview(await imageService.resolverUrlOrigem(path));
  }

  function handleRemoverCaptura() {
    setPending(form.captura ? { acao: 'remover' } : null);
    setPreview(null);
  }

  async function handleSalvar() {
    if (!form.nome.trim() || !projetoAberto) return;
    setSalvando(true);
    try {
      let novaForm: LSComponent = { ...form, nome: form.nome.trim() };

      if (pending?.acao === 'novo') {
        novaForm.captura = await imageService.importarVisual(
          pending.origemPath,
          projetoAberto.caminho,
          paginasDisponiveis.find((p) => p.id === novaForm.pagina_id)?.titulo ?? 'componentes',
          novaForm.nome,
          novaForm.captura,
        );
      } else if (pending?.acao === 'remover') {
        await imageService.removerImagem(projetoAberto.caminho, novaForm.captura);
        novaForm.captura = null;
      }

      onSave(novaForm);
      onClose();
    } finally {
      setSalvando(false);
    }
  }

  const mostrarTipoOutro = form.tipo === 'outro';

  return (
    <Modal
      open={aberto}
      onOpenChange={handleOpenChange}
      title={componente ? 'Editar componente visual' : 'Novo componente visual'}
      maxWidth="2xl"
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">

        {/* ── Identificação ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nome do componente" required
            placeholder="Ex: Receita Líquida, Evolução de Vendas"
            value={form.nome}
            onChange={(e) => set('nome', e.target.value)}
          />
          <Select
            label="Tipo"
            options={OPCOES_TIPO_COMPONENTE_LS}
            value={form.tipo}
            onChange={(e) => set('tipo', e.target.value as TipoComponenteLS)}
          />
        </div>

        {mostrarTipoOutro && (
          <Input
            label="Tipo personalizado"
            placeholder="Descreva o tipo de componente"
            value={form.tipo_outro ?? ''}
            onChange={(e) => set('tipo_outro', e.target.value)}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Título exibido no dashboard"
            placeholder="Ex: 💰 Receita Líquida do Período"
            value={form.titulo_exibido ?? ''}
            onChange={(e) => set('titulo_exibido', e.target.value)}
            hint="Como aparece no Looker Studio"
          />
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Página onde está
            </label>
            <select
              value={form.pagina_id ?? ''}
              onChange={(e) => set('pagina_id', e.target.value || undefined)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 bg-white"
            >
              <option value="">— Nenhuma selecionada —</option>
              {paginasDisponiveis.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.ordem != null ? `${p.ordem}. ` : ''}{p.titulo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Textarea
          label="Objetivo"
          placeholder="Descreva o propósito deste componente e qual análise ele apoia."
          value={form.objetivo ?? ''}
          onChange={(e) => set('objetivo', e.target.value)}
          rows={2}
        />

        <Textarea
          label="Descrição"
          placeholder="Contexto adicional sobre o componente, leitura esperada, público-alvo..."
          value={form.descricao ?? ''}
          onChange={(e) => set('descricao', e.target.value)}
          rows={2}
        />

        {/* ── Fontes de dados ───────────────────────────────────── */}
        <Separador label="Fontes de dados" />

        {fontesDisponiveis.length === 0 ? (
          <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            <span>⚠️</span>
            <span>Nenhuma fonte de dados ou combinação cadastrada. Adicione na seção Fontes de Dados antes.</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {fontesDisponiveis.map((fonte) => {
              const selecionada = form.fontes_dados_ids.includes(fonte.id);
              return (
                <button
                  key={fonte.id}
                  type="button"
                  onClick={() => toggleFonte(fonte.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors',
                    selecionada
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400',
                  )}
                >
                  <span className={cn(
                    'text-[10px] font-bold px-1 py-0.5 rounded',
                    selecionada ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500',
                  )}>
                    {fonte.tipo === 'Combinação' ? 'COMB' : 'FONTE'}
                  </span>
                  {fonte.nome}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Dimensões e Métricas ──────────────────────────────── */}
        <Separador label="Campos utilizados" />

        <TagsEditor
          label="Dimensões"
          hint="campos de agrupamento"
          value={form.dimensoes}
          onChange={(items) => set('dimensoes', items)}
          sugestoes={dimensoesSugeridas}
          placeholder="Ex: Região, Produto, Mês — pressione Enter para adicionar"
        />

        <TagsEditor
          label="Métricas"
          hint="campos de medição"
          value={form.metricas}
          onChange={(items) => set('metricas', items)}
          sugestoes={metricasSugeridas}
          placeholder="Ex: Receita Líquida, Qtd. Pedidos — pressione Enter para adicionar"
        />

        {/* ── Campos calculados no componente ──────────────────── */}
        <Separador label="Campos calculados neste componente" />
        <p className="text-xs text-slate-400 -mt-1">
          Campos calculados criados dentro deste componente específico — diferentes dos campos calculados da fonte de dados.
        </p>
        <CamposCalculadosEditor
          value={form.campos_calculados}
          onChange={(campos) => set('campos_calculados', campos)}
        />

        {/* ── Parâmetros ────────────────────────────────────────── */}
        {parametrosDisponiveis.length > 0 && (
          <>
            <Separador label="Parâmetros utilizados" />
            <div className="flex flex-wrap gap-2">
              {parametrosDisponiveis.map((param) => {
                const usado = form.filtros_aplicados.includes(`[Parâmetro] ${param.nome}`);
                return (
                  <button
                    key={param.id}
                    type="button"
                    onClick={() => {
                      const tag = `[Parâmetro] ${param.nome}`;
                      const atual = form.filtros_aplicados;
                      set('filtros_aplicados', usado
                        ? atual.filter((f) => f !== tag)
                        : [...atual, tag]);
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors',
                      usado
                        ? 'bg-slate-800 text-slate-100 border-slate-700'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400',
                    )}
                  >
                    {param.nome}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Configuração visual ───────────────────────────────── */}
        <Separador label="Configuração visual" />

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Ordenação"
            placeholder="Ex: Receita Desc, Nome Asc"
            value={form.ordenacao ?? ''}
            onChange={(e) => set('ordenacao', e.target.value)}
          />
          <Input
            label="Formato numérico"
            placeholder="Ex: R$ #.##0,00 · 0,0%"
            value={form.formato_numerico ?? ''}
            onChange={(e) => set('formato_numerico', e.target.value)}
          />
          <Input
            label="Período de comparação"
            placeholder="Ex: Mês anterior, Mesmo período ano ant."
            value={form.periodo_comparacao ?? ''}
            onChange={(e) => set('periodo_comparacao', e.target.value)}
          />
        </div>

        {/* ── Filtros aplicados ─────────────────────────────────── */}
        <Separador label="Filtros aplicados" />
        <ListaStrings
          value={form.filtros_aplicados.filter((f) => !f.startsWith('[Parâmetro]'))}
          onChange={(items) => {
            const params = form.filtros_aplicados.filter((f) => f.startsWith('[Parâmetro]'));
            set('filtros_aplicados', [...params, ...items]);
          }}
          placeholder="Ex: Status = Aprovado, Filial IN (SP, RJ)"
          emptyText="Nenhum filtro cadastrado."
        />

        {/* ── Comportamento e validação ─────────────────────────── */}
        <Separador label="Comportamento e validação" />

        <Textarea
          label="Comportamento esperado"
          placeholder="Descreva como este componente deve se comportar — valores esperados, tendências, leitura correta."
          value={form.comportamento_esperado ?? ''}
          onChange={(e) => set('comportamento_esperado', e.target.value)}
          rows={3}
        />

        <Textarea
          label="Observações"
          placeholder="Limitações conhecidas, contexto técnico, histórico de alterações..."
          value={form.observacoes ?? ''}
          onChange={(e) => set('observacoes', e.target.value)}
          rows={2}
        />

        {/* ── Captura de tela ───────────────────────────────────── */}
        <Separador label="Captura de tela" />

        {preview ? (
          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            <img src={preview} alt="Captura" className="w-full h-48 object-contain" />
            <button
              onClick={handleRemoverCaptura}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow text-slate-600 hover:text-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSelecionarCaptura}
            disabled={!imageService.isTauri()}
            className="w-full h-24 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:border-slate-400 flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={16} className="text-slate-400" />
            <p className="text-sm text-slate-500">
              {imageService.isTauri() ? 'Clique para selecionar imagem' : 'Disponível no app desktop'}
            </p>
            <p className="text-xs text-slate-400">PNG, JPG, JPEG</p>
          </button>
        )}
        {pending && (
          <p className="text-xs text-amber-600">
            {pending.acao === 'novo' ? 'Nova imagem — será salva ao confirmar.' : 'Imagem será removida ao salvar.'}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
        <Button
          variant="primary" size="md"
          onClick={handleSalvar}
          disabled={!form.nome.trim()}
          loading={salvando}
        >
          {componente ? 'Salvar alterações' : 'Adicionar componente'}
        </Button>
      </div>
    </Modal>
  );
}