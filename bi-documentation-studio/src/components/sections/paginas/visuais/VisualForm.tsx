import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Select } from '@components/common/Select';
import { Button } from '@components/common/Button';
import { MultiSelect } from '@components/common/MultiSelect';
import { ListaStrings } from '@components/common/ListaStrings';
import { generateId } from '@utils/id';
import { imageService } from '@services/imageService';
import { useAppStore } from '@store/useAppStore';
import { OPCOES_TIPO_VISUAL, type TipoVisual } from '@models/enums';
import type { Visual, KPI, MedidaDAX, Query } from '@models/schema';

interface VisualFormProps {
  visual?:      Visual;
  kpis:         KPI[];
  medidas:      MedidaDAX[];
  queries:      Query[];
  paginaTitulo: string;  // usado na nomenclatura da imagem do visual
  onSave:       (visual: Visual) => void;
  onCancel:     () => void;
}

function visualVazio(): Visual {
  return {
    id: generateId(), nome: '', tipo: 'cartao', tipo_outro: '',
    objetivo: '', descricao: '', kpis_ids: [], medidas_ids: [],
    tabelas_ids: [], campos: [], observacoes: '', captura: null,
  };
}

export function VisualForm({ visual, kpis, medidas, queries, paginaTitulo, onSave, onCancel }: VisualFormProps) {
  const projetoAberto = useAppStore((s) => s.projetoAberto);
  const [form, setForm] = useState<Visual>(() => visual ?? visualVazio());
  const [previewCaptura, setPreviewCaptura] = useState<string | null>(null);
  const [carregandoImg, setCarregandoImg] = useState(false);

  useEffect(() => {
    if (!visual?.captura || !projetoAberto) { setPreviewCaptura(null); return; }
    imageService.resolverUrl(visual.captura, projetoAberto.caminho).then(setPreviewCaptura);
  }, [visual?.id]);

  function set<K extends keyof Visual>(campo: K, valor: Visual[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleTipoChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const novoTipo = e.target.value as TipoVisual;
    setForm((prev) => ({ ...prev, tipo: novoTipo, tipo_outro: novoTipo !== 'outro' ? '' : prev.tipo_outro }));
  }

  async function handleSelecionarCaptura() {
    if (!projetoAberto) return;
    setCarregandoImg(true);
    try {
      const path = await imageService.selecionarImagem();
      if (!path) return;

      const nomeAtual = form.nome.trim() || 'visual';
      const imagem = await imageService.importarVisual(path, projetoAberto.caminho, paginaTitulo, nomeAtual, form.captura);
      const url    = await imageService.resolverUrl(imagem, projetoAberto.caminho);

      setForm((prev) => ({ ...prev, captura: imagem }));
      setPreviewCaptura(url);
    } catch (err) {
      console.error('Erro ao importar imagem do visual:', err);
    } finally {
      setCarregandoImg(false);
    }
  }

  function handleRemoverCaptura() {
    setForm((prev) => ({ ...prev, captura: null }));
    setPreviewCaptura(null);
  }

  function handleSalvar() {
    if (!form.nome.trim()) return;
    onSave({ ...form, nome: form.nome.trim() });
  }

  const kpiOptions    = kpis.map((k) => ({ value: k.id, label: k.nome }));
  const medidaOptions = medidas.map((m) => ({ value: m.id, label: m.tabela ? `${m.tabela}[${m.nome}]` : m.nome }));
  const tabelaOptions = queries.map((q) => ({ value: q.id, label: q.nome }));

  return (
    <div className="border border-brand-200 rounded-xl p-4 bg-brand-50/30 space-y-4">
      <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
        {visual ? 'Editar visual' : 'Novo visual'}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Nome do visual" placeholder="Ex: Faturamento por Região" value={form.nome}
          onChange={(e) => set('nome', e.target.value)} required />
        <Select label="Tipo de visual" options={OPCOES_TIPO_VISUAL} value={form.tipo} onChange={handleTipoChange} />
      </div>

      {form.tipo === 'outro' && (
        <Input label="Tipo personalizado" placeholder="Descreva o tipo de visual" value={form.tipo_outro ?? ''}
          onChange={(e) => set('tipo_outro', e.target.value)} />
      )}

      <Input label="Objetivo" placeholder="Ex: Demonstrar o faturamento por região" value={form.objetivo}
        onChange={(e) => set('objetivo', e.target.value)} />
      <Textarea label="Descrição" placeholder="Ex: Gráfico de barras com faturamento consolidado por região comercial."
        value={form.descricao} onChange={(e) => set('descricao', e.target.value)} rows={2} />

      <div className="grid grid-cols-2 gap-3">
        <MultiSelect label="KPIs utilizados" options={kpiOptions} value={form.kpis_ids}
          onChange={(ids) => set('kpis_ids', ids)} placeholder="Selecionar KPIs..." />
        <MultiSelect label="Medidas DAX" options={medidaOptions} value={form.medidas_ids}
          onChange={(ids) => set('medidas_ids', ids)} placeholder="Selecionar medidas..." />
      </div>

      <MultiSelect label="Tabelas utilizadas" options={tabelaOptions} value={form.tabelas_ids}
        onChange={(ids) => set('tabelas_ids', ids)} placeholder="Selecionar tabelas..." />

      <ListaStrings label="Campos utilizados" value={form.campos} onChange={(c) => set('campos', c)}
        placeholder="Ex: Região, ValorVenda..." />

      <Textarea label="Observações" placeholder="Ex: Ordenado do maior para o menor faturamento."
        value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} rows={2} />

      {/* Captura do visual */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Captura do visual</label>
        {previewCaptura ? (
          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            <img src={previewCaptura} alt="Captura do visual" className="w-full h-36 object-cover" />
            <button onClick={handleRemoverCaptura}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow text-slate-600 hover:text-red-600 transition-colors">
              <X size={13} />
            </button>
          </div>
        ) : (
          <button type="button" onClick={handleSelecionarCaptura} disabled={carregandoImg || !imageService.isTauri()}
            className="h-24 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:border-slate-400 flex flex-col items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Upload size={16} className="text-slate-400" />
            <p className="text-xs text-slate-500">
              {imageService.isTauri()
                ? carregandoImg ? 'Importando...' : 'Clique para selecionar'
                : 'Disponível no app desktop'}
            </p>
          </button>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" size="sm" onClick={handleSalvar} disabled={!form.nome.trim()}>
          {visual ? 'Salvar' : 'Adicionar visual'}
        </Button>
      </div>
    </div>
  );
}