import { useState, useEffect } from 'react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Select } from '@components/common/Select';
import { Button } from '@components/common/Button';
import { generateId } from '@utils/id';
import { cn } from '@utils/cn';
import { OPCOES_CARDINALIDADE, OPCOES_DIRECAO, type Cardinalidade, type DirecaoFiltro } from '@models/enums';
import type { Relacionamento } from '@models/schema';

interface RelacionamentoFormProps {
  aberto:          boolean;
  relacionamento?: Relacionamento;
  onSave:          (rel: Relacionamento) => void;
  onClose:         () => void;
}

function relacionamentoVazio(): Relacionamento {
  return {
    id: generateId(), tabela_origem: '', tabela_destino: '',
    coluna_origem: '', coluna_destino: '',
    cardinalidade: 'muitos_para_um', direcao: 'unica',
    ativo: true, temporario: false, observacoes: '',
  };
}

export function RelacionamentoForm({ aberto, relacionamento, onSave, onClose }: RelacionamentoFormProps) {
  const [form, setForm] = useState<Relacionamento>(() => relacionamento ?? relacionamentoVazio());

  useEffect(() => {
    if (aberto) setForm(relacionamento ?? relacionamentoVazio());
  }, [aberto, relacionamento]);

  function handleOpenChange(open: boolean) {
    if (!open) onClose();
  }

  function set<K extends keyof Relacionamento>(campo: K, valor: Relacionamento[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleSalvar() {
    if (!form.tabela_origem.trim() || !form.tabela_destino.trim()) return;
    onSave({
      ...form,
      tabela_origem:  form.tabela_origem.trim(),
      tabela_destino: form.tabela_destino.trim(),
      coluna_origem:  form.coluna_origem.trim(),
      coluna_destino: form.coluna_destino.trim(),
    });
    onClose();
  }

  const formValido = form.tabela_origem.trim() !== '' && form.tabela_destino.trim() !== '';

  function ToggleSimNao({ campo, valor }: { campo: 'ativo' | 'temporario'; valor: boolean }) {
    return (
      <div className="flex gap-2">
        {[true, false].map((v) => (
          <button key={String(v)} type="button" onClick={() => set(campo, v)}
            className={cn(
              'flex-1 h-9 rounded-lg border text-sm font-medium transition-colors',
              valor === v
                ? v ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-800 text-white border-slate-800'
                : 'text-slate-600 border-slate-300 hover:border-slate-400',
            )}>
            {v ? 'Sim' : 'Não'}
          </button>
        ))}
      </div>
    );
  }

  return (
    <Modal
      open={aberto}
      onOpenChange={handleOpenChange}
      title={relacionamento ? 'Editar Relacionamento' : 'Novo Relacionamento'}
      maxWidth="md"
    >
      <div className="space-y-4">

        <div className="grid grid-cols-2 gap-4">
          <Input label="Tabela de origem"  placeholder="Ex: fVendas"   value={form.tabela_origem}  onChange={(e) => set('tabela_origem', e.target.value)}  required />
          <Input label="Tabela de destino" placeholder="Ex: dClientes" value={form.tabela_destino} onChange={(e) => set('tabela_destino', e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Coluna de origem"  placeholder="Ex: IDCliente" value={form.coluna_origem}  onChange={(e) => set('coluna_origem', e.target.value)}  />
          <Input label="Coluna de destino" placeholder="Ex: IDCliente" value={form.coluna_destino} onChange={(e) => set('coluna_destino', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Cardinalidade"    options={OPCOES_CARDINALIDADE} value={form.cardinalidade} onChange={(e) => set('cardinalidade', e.target.value as Cardinalidade)} />
          <Select label="Direção do filtro" options={OPCOES_DIRECAO}      value={form.direcao}        onChange={(e) => set('direcao', e.target.value as DirecaoFiltro)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Relacionamento ativo</label>
          <ToggleSimNao campo="ativo" valor={form.ativo} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Relacionamento temporário</label>
          <p className="text-xs text-slate-400 -mt-0.5">
            Ativado via <code className="font-mono">USERELATIONSHIP()</code> em medidas DAX específicas — não está ativo no modelo por padrão.
          </p>
          <ToggleSimNao campo="temporario" valor={form.temporario ?? false} />
        </div>

        <Textarea
          label="Observações"
          placeholder="Ex: Chave ativa para filtrar vendas por cliente."
          value={form.observacoes}
          onChange={(e) => set('observacoes', e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" size="md" onClick={handleSalvar} disabled={!formValido}>
          {relacionamento ? 'Salvar alterações' : 'Adicionar Relacionamento'}
        </Button>
      </div>
    </Modal>
  );
}