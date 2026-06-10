import { useState } from 'react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Button } from '@components/common/Button';
import { generateId } from '@utils/id';
import type { TermoGlossario } from '@models/schema';

interface TermoFormProps {
  aberto:  boolean;
  termo?:  TermoGlossario;
  onSave:  (termo: TermoGlossario) => void;
  onClose: () => void;
}

function termoVazio(): TermoGlossario {
  return { id: generateId(), termo: '', definicao: '' };
}

export function TermoForm({ aberto, termo, onSave, onClose }: TermoFormProps) {
  const [form, setForm] = useState<TermoGlossario>(() => termo ?? termoVazio());

  function handleOpenChange(open: boolean) {
    if (open) setForm(termo ?? termoVazio());
    else onClose();
  }

  function handleSalvar() {
    if (!form.termo.trim()) return;
    onSave({ ...form, termo: form.termo.trim() });
    onClose();
  }

  return (
    <Modal
      open={aberto}
      onOpenChange={handleOpenChange}
      title={termo ? 'Editar Termo' : 'Novo Termo'}
      maxWidth="sm"
    >
      <div className="space-y-4">
        <Input
          label="Termo"
          placeholder="Ex: Star Schema, DAX, Cardinalidade..."
          value={form.termo}
          onChange={(e) => setForm((prev) => ({ ...prev, termo: e.target.value }))}
          required
        />
        <Textarea
          label="Definição"
          placeholder="Ex: Modelo dimensional com uma tabela fato central conectada a tabelas dimensão."
          value={form.definicao}
          onChange={(e) => setForm((prev) => ({ ...prev, definicao: e.target.value }))}
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleSalvar}
          disabled={!form.termo.trim()}
        >
          {termo ? 'Salvar alterações' : 'Adicionar Termo'}
        </Button>
      </div>
    </Modal>
  );
}