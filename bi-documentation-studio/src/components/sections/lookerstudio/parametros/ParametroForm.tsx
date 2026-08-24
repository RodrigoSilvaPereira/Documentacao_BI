import { useState, useEffect } from 'react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Select } from '@components/common/Select';
import { Button } from '@components/common/Button';
import { ListaStrings } from '@components/common/ListaStrings';
import { generateId } from '@utils/id';
import { cn } from '@utils/cn';
import {
  OPCOES_TIPO_PARAMETRO,
  criarLSParametroVazio,
  type TipoParametro,
  type LSParametro,
} from '@models/schema.lookerstudio';

interface ParametroFormProps {
  aberto:    boolean;
  parametro?: LSParametro;
  onSave:    (parametro: LSParametro) => void;
  onClose:   () => void;
}

export function ParametroForm({ aberto, parametro, onSave, onClose }: ParametroFormProps) {
  const [form, setForm] = useState<LSParametro>(() => parametro ?? criarLSParametroVazio());

  useEffect(() => {
    if (aberto) setForm(parametro ?? criarLSParametroVazio());
  }, [aberto, parametro]);

  function handleOpenChange(open: boolean) { if (!open) onClose(); }

  function set<K extends keyof LSParametro>(campo: K, valor: LSParametro[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleSalvar() {
    if (!form.nome.trim()) return;
    onSave({ ...form, nome: form.nome.trim() });
    onClose();
  }

  return (
    <Modal
      open={aberto}
      onOpenChange={handleOpenChange}
      title={parametro ? 'Editar parâmetro' : 'Novo parâmetro'}
      maxWidth="md"
    >
      <div className="space-y-4">

        <Input
          label="Nome do parâmetro" required
          placeholder="Ex: meta_mensal, filtro_regiao, ano_referencia"
          value={form.nome}
          onChange={(e) => set('nome', e.target.value)}
          hint="Use nomes descritivos sem espaços. Este nome aparece nas fórmulas dos campos calculados."
        />

        <Select
          label="Tipo"
          options={OPCOES_TIPO_PARAMETRO}
          value={form.tipo}
          onChange={(e) => set('tipo', e.target.value as TipoParametro)}
        />

        <Input
          label="Valor padrão"
          placeholder={
            form.tipo === 'numero'   ? 'Ex: 100000'  :
            form.tipo === 'booleano' ? 'true / false' :
                                       'Ex: Sul'
          }
          value={form.valor_padrao ?? ''}
          onChange={(e) => set('valor_padrao', e.target.value)}
        />

        <Textarea
          label="Descrição"
          placeholder="Descreva o propósito do parâmetro e como ele afeta o relatório."
          value={form.descricao ?? ''}
          onChange={(e) => set('descricao', e.target.value)}
          rows={2}
        />

        {/* Visibilidade para o visualizador */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            Visível para o visualizador?
          </label>
          <p className="text-xs text-slate-400 -mt-0.5">
            Quando ativado, o usuário final pode alterar o valor deste parâmetro no relatório.
          </p>
          <div className="flex gap-2">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => set('visivel_viewer', v)}
                className={cn(
                  'flex-1 h-9 rounded-lg border text-sm font-medium transition-colors',
                  form.visivel_viewer === v
                    ? v
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-slate-800 text-white border-slate-800'
                    : 'text-slate-600 border-slate-300 hover:border-slate-400',
                )}
              >
                {v ? 'Sim' : 'Não'}
              </button>
            ))}
          </div>
        </div>

        {/* Onde é usado */}
        <ListaStrings
          label="Onde é utilizado"
          value={form.usado_em}
          onChange={(items) => set('usado_em', items)}
          placeholder="Ex: Campo calculado 'Atingimento de Meta', Filtro de região"
          emptyText="Nenhum uso documentado."
        />

        <Textarea
          label="Observações"
          placeholder="Regras de validação, faixa de valores aceitos, impacto no relatório..."
          value={form.observacoes ?? ''}
          onChange={(e) => set('observacoes', e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" size="md" onClick={handleSalvar} disabled={!form.nome.trim()}>
          {parametro ? 'Salvar alterações' : 'Adicionar parâmetro'}
        </Button>
      </div>
    </Modal>
  );
}