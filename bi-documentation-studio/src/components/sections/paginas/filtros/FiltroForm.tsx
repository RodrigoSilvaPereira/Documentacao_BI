import { useState } from 'react';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Select } from '@components/common/Select';
import { Button } from '@components/common/Button';
import { MultiSelect } from '@components/common/MultiSelect';
import { generateId } from '@utils/id';
import { OPCOES_TIPO_FILTRO, type TipoFiltro } from '@models/enums';
import type { Filtro, Visual } from '@models/schema';

interface FiltroFormProps {
  filtro?:  Filtro;
  visuais:  Visual[];   // visuais da página para o MultiSelect "visuais afetados"
  onSave:   (filtro: Filtro) => void;
  onCancel: () => void;
}

function filtroVazio(): Filtro {
  return {
    id:               generateId(),
    nome:             '',
    tipo:             'slicer',
    campo:            '',
    descricao:        '',
    visuais_afetados: [],
    observacoes:      '',
  };
}

export function FiltroForm({ filtro, visuais, onSave, onCancel }: FiltroFormProps) {
  const [form, setForm] = useState<Filtro>(() => filtro ?? filtroVazio());

  function set<K extends keyof Filtro>(campo: K, valor: Filtro[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleSalvar() {
    if (!form.nome.trim()) return;
    onSave({ ...form, nome: form.nome.trim() });
  }

  const visualOptions = visuais.map((v) => ({ value: v.id, label: v.nome }));
  const formValido    = form.nome.trim() !== '';

  return (
    <div className="border border-brand-200 rounded-xl p-4 bg-brand-50/30 space-y-4">
      <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
        {filtro ? 'Editar filtro' : 'Novo filtro'}
      </p>

      {/* Nome + Tipo */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Nome do filtro"
          placeholder="Ex: Período"
          value={form.nome}
          onChange={(e) => set('nome', e.target.value)}
          required
        />
        <Select
          label="Tipo"
          options={OPCOES_TIPO_FILTRO}
          value={form.tipo}
          onChange={(e) => set('tipo', e.target.value as TipoFiltro)}
        />
      </div>

      {/* Campo */}
      <Input
        label="Campo utilizado"
        placeholder="Ex: dCalendario[Data]"
        value={form.campo}
        onChange={(e) => set('campo', e.target.value)}
      />

      {/* Descrição */}
      <Textarea
        label="Descrição"
        placeholder="Ex: Permite selecionar o período de análise."
        value={form.descricao}
        onChange={(e) => set('descricao', e.target.value)}
        rows={2}
      />

      {/* Visuais afetados */}
      <MultiSelect
        label="Visuais afetados"
        options={visualOptions}
        value={form.visuais_afetados}
        onChange={(ids) => set('visuais_afetados', ids)}
        placeholder={visuais.length === 0 ? 'Nenhum visual cadastrado ainda' : 'Selecionar visuais...'}
      />

      {/* Observações */}
      <Textarea
        label="Observações"
        placeholder="Ex: Seleção única habilitada."
        value={form.observacoes}
        onChange={(e) => set('observacoes', e.target.value)}
        rows={2}
      />

      {/* Ações */}
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" size="sm" onClick={handleSalvar} disabled={!formValido}>
          {filtro ? 'Salvar' : 'Adicionar filtro'}
        </Button>
      </div>
    </div>
  );
}