import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Button } from '@components/common/Button';
import { ListaStrings } from '@components/common/ListaStrings';
import { imageService } from '@services/imageService';
import { useAppStore } from '@store/useAppStore';
import { criarLSPageVazia } from '@models/schema.lookerstudio';
import type { LSPage } from '@models/schema.lookerstudio';
import type { PendingImagem } from '@models/app';

interface PaginaLSFormProps {
  aberto:   boolean;
  pagina?:  LSPage;
  ordem?:   number;
  onSave:   (pagina: LSPage) => void;
  onClose:  () => void;
}

export function PaginaLSForm({ aberto, pagina, ordem, onSave, onClose }: PaginaLSFormProps) {
  const projetoAberto = useAppStore((s) => s.projetoAberto);

  const [form, setForm]             = useState<LSPage>(() => pagina ?? criarLSPageVazia());
  const [previewCaptura, setPreview] = useState<string | null>(null);
  const [pendingPagina, setPending]  = useState<PendingImagem | null>(null);
  const [salvando, setSalvando]      = useState(false);

  useEffect(() => {
    if (!aberto) return;
    const novaForm = pagina ?? { ...criarLSPageVazia(), ordem: ordem ?? 1 };
    setForm(novaForm);
    setPending(null);

    if (novaForm.captura && projetoAberto) {
      imageService.resolverUrl(novaForm.captura, projetoAberto.caminho).then(setPreview);
    } else {
      setPreview(null);
    }
  }, [aberto, pagina?.id]);

  function handleOpenChange(open: boolean) { if (!open) onClose(); }

  function set<K extends keyof LSPage>(campo: K, valor: LSPage[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

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
    const titulo = form.titulo.trim();
    if (!titulo || !projetoAberto) return;

    setSalvando(true);
    try {
      let novaForm: LSPage = { ...form, titulo };

      if (pendingPagina?.acao === 'novo') {
        novaForm.captura = await imageService.importarPagina(
          pendingPagina.origemPath,
          projetoAberto.caminho,
          titulo,
          novaForm.captura,
        );
      } else if (pendingPagina?.acao === 'remover') {
        await imageService.removerImagem(projetoAberto.caminho, novaForm.captura);
        novaForm.captura = null;
      } else if (pagina && pagina.titulo !== titulo && novaForm.captura) {
        const nova = await imageService.renomearImagemPagina(
          projetoAberto.caminho, novaForm.captura, titulo,
        );
        if (nova) novaForm.captura = nova;
      }

      onSave(novaForm);
      onClose();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      open={aberto}
      onOpenChange={handleOpenChange}
      title={pagina ? 'Editar página' : 'Nova página'}
      maxWidth="lg"
    >
      <div className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">

        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-3">
            <Input
              label="Título da página" required
              placeholder="Ex: Visão Geral, Análise por Produto"
              value={form.titulo}
              onChange={(e) => set('titulo', e.target.value)}
            />
          </div>
          <Input
            label="Ordem"
            placeholder="Ex: 1"
            value={String(form.ordem ?? '')}
            onChange={(e) => {
              const n = parseInt(e.target.value);
              set('ordem', isNaN(n) ? undefined : n);
            }}
            hint="Posição no relatório"
          />
        </div>

        <Textarea
          label="Objetivo"
          placeholder="Descreva o propósito desta página e quais análises ela apresenta."
          value={form.objetivo ?? ''}
          onChange={(e) => set('objetivo', e.target.value)}
          rows={2}
        />

        <Textarea
          label="Descrição"
          placeholder="Contexto adicional sobre a página, público-alvo, navegação..."
          value={form.descricao ?? ''}
          onChange={(e) => set('descricao', e.target.value)}
          rows={2}
        />

        {/* Filtros globais */}
        <ListaStrings
          label="Filtros globais desta página"
          value={form.filtros_globais}
          onChange={(items) => set('filtros_globais', items)}
          placeholder="Ex: Período de análise, Região, Filial"
          emptyText="Nenhum filtro global cadastrado."
        />

        {/* Captura da página */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Captura da página</label>
          {previewCaptura ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              <img src={previewCaptura} alt="Captura" className="w-full h-48 object-contain" />
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
              className="h-28 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:border-slate-400 flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={18} className="text-slate-400" />
              <p className="text-sm text-slate-500">
                {imageService.isTauri()
                  ? 'Clique para selecionar imagem'
                  : 'Disponível no app desktop'}
              </p>
              <p className="text-xs text-slate-400">PNG, JPG, JPEG</p>
            </button>
          )}
          {pendingPagina && (
            <p className="text-xs text-amber-600">
              {pendingPagina.acao === 'novo'
                ? 'Nova imagem — será salva ao confirmar.'
                : 'Imagem será removida ao salvar.'}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleSalvar}
          disabled={!form.titulo.trim()}
          loading={salvando}
        >
          {pagina ? 'Salvar alterações' : 'Adicionar página'}
        </Button>
      </div>
    </Modal>
  );
}