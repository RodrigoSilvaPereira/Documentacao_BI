import { useState } from 'react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Button } from '@components/common/Button';
import { VisuaisEditor } from './visuais/VisuaisEditor';
import { FiltrosEditor } from './filtros/FiltrosEditor';
import { generateId } from '@utils/id';
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
  return {
    id:       generateId(),
    titulo:   '',
    objetivo: '',
    descricao:'',
    captura:  null,
    visuais:  [],
    filtros:  [],
  };
}

// Separador visual entre seções dentro do modal
function Separador({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

export function PaginaForm({ aberto, pagina, kpis, medidas, queries, onSave, onClose }: PaginaFormProps) {
  const [form, setForm] = useState<Pagina>(() => pagina ?? paginaVazia());

  function handleOpenChange(open: boolean) {
    if (open) setForm(pagina ?? paginaVazia());
    else onClose();
  }

  function set<K extends keyof Pagina>(campo: K, valor: Pagina[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleSalvar() {
    if (!form.titulo.trim()) return;
    onSave({ ...form, titulo: form.titulo.trim() });
    onClose();
  }

  const formValido = form.titulo.trim() !== '';

  return (
    <Modal
      open={aberto}
      onOpenChange={handleOpenChange}
      title={pagina ? 'Editar Página' : 'Nova Página'}
      maxWidth="2xl"
    >
      <div className="space-y-5 max-h-[78vh] overflow-y-auto pr-1">

        {/* ── Informações da página ──────────────── */}
        <div className="space-y-4">
          <Input
            label="Nome da página"
            placeholder="Ex: Resumo Executivo"
            value={form.titulo}
            onChange={(e) => set('titulo', e.target.value)}
            required
          />
          <Textarea
            label="Objetivo da página"
            placeholder="Ex: Apresentar os principais indicadores para acompanhamento da diretoria."
            value={form.objetivo}
            onChange={(e) => set('objetivo', e.target.value)}
            rows={2}
          />
          <Textarea
            label="Descrição da página"
            placeholder="Ex: Página inicial contendo visão geral dos resultados comerciais."
            value={form.descricao}
            onChange={(e) => set('descricao', e.target.value)}
            rows={2}
          />
        </div>

        {/* ── Visuais ────────────────────────────── */}
        <Separador label="Visuais da página" />
        <VisuaisEditor
          visuais={form.visuais}
          onChange={(visuais) => set('visuais', visuais)}
          kpis={kpis}
          medidas={medidas}
          queries={queries}
        />

        {/* ── Filtros ────────────────────────────── */}
        <Separador label="Filtros da página" />
        <FiltrosEditor
          filtros={form.filtros}
          onChange={(filtros) => set('filtros', filtros)}
          visuais={form.visuais}
        />
      </div>

      {/* Rodapé */}
      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" size="md" onClick={handleSalvar} disabled={!formValido}>
          {pagina ? 'Salvar alterações' : 'Adicionar Página'}
        </Button>
      </div>
    </Modal>
  );
}