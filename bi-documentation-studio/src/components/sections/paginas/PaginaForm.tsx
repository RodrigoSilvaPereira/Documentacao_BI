import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Button } from '@components/common/Button';
import { VisuaisEditor } from './visuais/VisuaisEditor';
import { FiltrosEditor } from './filtros/FiltrosEditor';
import { generateId } from '@utils/id';
import { imageService } from '@services/imageService';
import { useAppStore } from '@store/useAppStore';
import type { Pagina, KPI, MedidaDAX, Query } from '@models/schema';

interface PaginaFormProps {
  aberto:   boolean;
  pagina?:  Pagina;
  kpis:     KPI[];
  medidas:  MedidaDAX[];
  queries:  Query[];
  onSave:   (pagina: Pagina) => void;
  onClose:  () => void;
}

function paginaVazia(): Pagina {
  return { id: generateId(), titulo: '', objetivo: '', descricao: '', captura: null, visuais: [], filtros: [] };
}

function Separador({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

export function PaginaForm({ aberto, pagina, kpis, medidas, queries, onSave, onClose }: PaginaFormProps) {
  const projetoAberto = useAppStore((s) => s.projetoAberto);
  const [form, setForm] = useState<Pagina>(() => pagina ?? paginaVazia());
  const [previewCaptura, setPreviewCaptura] = useState<string | null>(null);
  const [carregandoImg, setCarregandoImg] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function handleOpenChange(open: boolean) {
    if (open) {
      setForm(pagina ?? paginaVazia());
      setPreviewCaptura(null);
    } else {
      onClose();
    }
  }

  useEffect(() => {
    if (!aberto || !pagina?.captura || !projetoAberto) { setPreviewCaptura(null); return; }
    imageService.resolverUrl(pagina.captura, projetoAberto.caminho).then(setPreviewCaptura);
  }, [aberto, pagina?.id]);

  function set<K extends keyof Pagina>(campo: K, valor: Pagina[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSelecionarCaptura() {
    if (!projetoAberto) return;
    setCarregandoImg(true);
    try {
      const path = await imageService.selecionarImagem();
      if (!path) return;

      const tituloAtual = form.titulo.trim() || 'pagina';
      const imagem = await imageService.importarPagina(path, projetoAberto.caminho, tituloAtual, form.captura);
      const url    = await imageService.resolverUrl(imagem, projetoAberto.caminho);

      setForm((prev) => ({ ...prev, captura: imagem }));
      setPreviewCaptura(url);
    } catch (err) {
      console.error('Erro ao importar imagem:', err);
    } finally {
      setCarregandoImg(false);
    }
  }

  function handleRemoverCaptura() {
    setForm((prev) => ({ ...prev, captura: null }));
    setPreviewCaptura(null);
  }

  async function handleSalvar() {
    const titulo = form.titulo.trim();
    if (!titulo) return;

    setSalvando(true);
    try {
      let novaForm: Pagina = { ...form, titulo };

      // Se o título da página mudou e existem imagens vinculadas,
      // renomeia os arquivos (página e visuais) para refletir o novo nome.
      if (projetoAberto && pagina && pagina.titulo !== titulo) {

        if (novaForm.captura) {
          const novaCaptura = await imageService.renomearImagemPagina(projetoAberto.caminho, novaForm.captura, titulo);
          if (novaCaptura) novaForm.captura = novaCaptura;
        }

        novaForm.visuais = await Promise.all(
          novaForm.visuais.map(async (v) => {
            if (!v.captura) return v;
            const nova = await imageService.renomearImagemVisual(projetoAberto.caminho, v.captura, titulo, v.nome);
            return nova ? { ...v, captura: nova } : v;
          }),
        );
      }

      onSave(novaForm);
      onClose();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal open={aberto} onOpenChange={handleOpenChange} title={pagina ? 'Editar Página' : 'Nova Página'} maxWidth="2xl">
      <div className="space-y-5 max-h-[78vh] overflow-y-auto pr-1">

        <Input label="Nome da página" placeholder="Ex: Resumo Executivo" value={form.titulo}
          onChange={(e) => set('titulo', e.target.value)} required />
        <Textarea label="Objetivo" placeholder="Ex: Apresentar os principais indicadores para a diretoria."
          value={form.objetivo} onChange={(e) => set('objetivo', e.target.value)} rows={2} />
        <Textarea label="Descrição" placeholder="Ex: Página inicial com visão geral dos resultados comerciais."
          value={form.descricao} onChange={(e) => set('descricao', e.target.value)} rows={2} />

        {/* Captura da página */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Captura da página</label>
          {previewCaptura ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              <img src={previewCaptura} alt="Captura da página" className="w-full h-48 object-cover" />
              <button onClick={handleRemoverCaptura}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow text-slate-600 hover:text-red-600 transition-colors">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={handleSelecionarCaptura} disabled={carregandoImg || !imageService.isTauri()}
              className="h-32 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:border-slate-400 flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Upload size={18} className="text-slate-400" />
              <p className="text-sm text-slate-500">
                {imageService.isTauri()
                  ? carregandoImg ? 'Importando...' : 'Clique para selecionar imagem'
                  : 'Disponível no app desktop (npm run tauri dev)'}
              </p>
              <p className="text-xs text-slate-400">PNG, JPG, JPEG</p>
            </button>
          )}
        </div>

        <Separador label="Visuais da página" />
        <VisuaisEditor
          visuais={form.visuais}
          onChange={(v) => set('visuais', v)}
          kpis={kpis}
          medidas={medidas}
          queries={queries}
          paginaTitulo={form.titulo}
        />

        <Separador label="Filtros da página" />
        <FiltrosEditor filtros={form.filtros} onChange={(f) => set('filtros', f)} visuais={form.visuais} />
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" size="md" onClick={handleSalvar} disabled={!form.titulo.trim()} loading={salvando}>
          {pagina ? 'Salvar alterações' : 'Adicionar Página'}
        </Button>
      </div>
    </Modal>
  );
}