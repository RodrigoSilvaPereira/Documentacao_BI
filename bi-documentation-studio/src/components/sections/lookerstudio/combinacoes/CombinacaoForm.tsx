import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Select } from '@components/common/Select';
import { Button } from '@components/common/Button';
import { CamposEditorLS } from '../fontes/CamposEditorLS';
import { useLSStore } from '@store/useLSStore';
import { generateId } from '@utils/id';
import { cn } from '@utils/cn';
import {
  OPCOES_TIPO_JOIN,
  criarLSCombinacaoVazia,
  type TipoJoin,
  type LSCombinacao,
  type LSFonteNaCombinacao,
  type LSJoinKey,
} from '@models/schema.lookerstudio';

function Separador({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

interface CombinacaoFormProps {
  aberto:      boolean;
  combinacao?: LSCombinacao;
  onSave:      (combinacao: LSCombinacao) => void;
  onClose:     () => void;
}

export function CombinacaoForm({ aberto, combinacao, onSave, onClose }: CombinacaoFormProps) {
  const lsData = useLSStore((s) => s.lsData);
  const [form, setForm] = useState<LSCombinacao>(() => combinacao ?? criarLSCombinacaoVazia());

  useEffect(() => {
    if (aberto) setForm(combinacao ?? criarLSCombinacaoVazia());
  }, [aberto, combinacao]);

  function handleOpenChange(open: boolean) { if (!open) onClose(); }

  function set<K extends keyof LSCombinacao>(campo: K, valor: LSCombinacao[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  // ── Fontes da combinação ─────────────────────────────────────────────────

  function adicionarFonte(fonte_dados_id: string) {
    if (!fonte_dados_id) return;
    if (form.fontes.some((f) => f.fonte_dados_id === fonte_dados_id)) return;
    set('fontes', [...form.fontes, { fonte_dados_id, campos_usados: [] }]);
  }

  function removerFonte(fonte_dados_id: string) {
    set('fontes', form.fontes.filter((f) => f.fonte_dados_id !== fonte_dados_id));
    // Remove chaves de join que referenciam campos desta fonte
    set('chaves_join', form.chaves_join.filter((k) =>
      !k.campo_fonte_a.startsWith(`${fonte_dados_id}:`) &&
      !k.campo_fonte_b.startsWith(`${fonte_dados_id}:`),
    ));
  }

  function atualizarCamposUsados(fonte_dados_id: string, campos_usados: string[]) {
    set('fontes', form.fontes.map((f) =>
      f.fonte_dados_id === fonte_dados_id ? { ...f, campos_usados } : f,
    ));
  }

  // ── Chaves de join ───────────────────────────────────────────────────────

  function adicionarChave() {
    set('chaves_join', [...form.chaves_join, {
      id: generateId(), campo_fonte_a: '', campo_fonte_b: '',
    }]);
  }

  function atualizarChave(id: string, campo: keyof LSJoinKey, valor: string) {
    set('chaves_join', form.chaves_join.map((k) =>
      k.id === id ? { ...k, [campo]: valor } : k,
    ));
  }

  function removerChave(id: string) {
    set('chaves_join', form.chaves_join.filter((k) => k.id !== id));
  }

  // ────────────────────────────────────────────────────────────────────────

  function handleSalvar() {
    if (!form.nome.trim() || form.fontes.length < 2) return;
    onSave({ ...form, nome: form.nome.trim() });
    onClose();
  }

  const fontesDisponiveis = lsData?.fontes_dados ?? [];
  const fontesNaoAdicionadas = fontesDisponiveis.filter(
    (f) => !form.fontes.some((ff) => ff.fonte_dados_id === f.id),
  );
  const formValido = form.nome.trim() && form.fontes.length >= 2;

  return (
    <Modal
      open={aberto}
      onOpenChange={handleOpenChange}
      title={combinacao ? 'Editar combinação de dados' : 'Nova combinação de dados'}
      maxWidth="2xl"
    >
      <div className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">

        {/* Identificação */}
        <Input
          label="Nome da combinação" required
          placeholder="Ex: Pedidos + Clientes, Vendas Consolidadas"
          value={form.nome}
          onChange={(e) => set('nome', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Tipo de join"
            options={OPCOES_TIPO_JOIN}
            value={form.tipo_join}
            onChange={(e) => set('tipo_join', e.target.value as TipoJoin)}
          />
          <div />
        </div>

        <Textarea
          label="Descrição"
          placeholder="Descreva o objetivo desta combinação e como as fontes se relacionam."
          value={form.descricao ?? ''}
          onChange={(e) => set('descricao', e.target.value)}
          rows={2}
        />

        {/* Fontes */}
        <Separador label="Fontes de dados da combinação (mínimo 2)" />

        {fontesDisponiveis.length === 0 ? (
          <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            <span>⚠️</span>
            <span>Nenhuma fonte de dados cadastrada. Cadastre fontes na seção Fontes de Dados antes de criar uma combinação.</span>
          </div>
        ) : (
          <>
            {/* Fontes já adicionadas */}
            {form.fontes.map((fonteNaComb) => {
              const fonte = fontesDisponiveis.find((f) => f.id === fonteNaComb.fonte_dados_id);
              if (!fonte) return null;
              return (
                <div key={fonteNaComb.fonte_dados_id}
                  className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">{fonte.nome}</span>
                    <button
                      onClick={() => removerFonte(fonteNaComb.fonte_dados_id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {/* Campos usados desta fonte */}
                  {fonte.campos.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1.5">Campos utilizados desta fonte:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {fonte.campos.map((campo) => {
                          const selecionado = fonteNaComb.campos_usados.includes(campo.nome);
                          return (
                            <button
                              key={campo.id}
                              type="button"
                              onClick={() => {
                                const novos = selecionado
                                  ? fonteNaComb.campos_usados.filter((c) => c !== campo.nome)
                                  : [...fonteNaComb.campos_usados, campo.nome];
                                atualizarCamposUsados(fonteNaComb.fonte_dados_id, novos);
                              }}
                              className={cn(
                                'px-2 py-1 rounded text-xs font-mono border transition-colors',
                                selecionado
                                  ? 'bg-brand-600 text-white border-brand-600'
                                  : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400',
                              )}
                            >
                              {campo.nome}
                            </button>
                          );
                        })}
                      </div>
                      {fonteNaComb.campos_usados.length === 0 && (
                        <p className="text-xs text-slate-400 mt-1">Nenhum campo selecionado — todos os campos estarão disponíveis.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Adicionar fonte */}
            {fontesNaoAdicionadas.length > 0 && (
              <div className="flex gap-2">
                <select
                  defaultValue=""
                  onChange={(e) => { if (e.target.value) { adicionarFonte(e.target.value); e.target.value = ''; } }}
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-400 bg-white"
                >
                  <option value="">— Adicionar fonte de dados —</option>
                  {fontesNaoAdicionadas.map((f) => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>
            )}

            {form.fontes.length < 2 && (
              <p className="text-xs text-amber-600">⚠️ Uma combinação requer pelo menos 2 fontes de dados.</p>
            )}
          </>
        )}

        {/* Chaves de join */}
        {form.fontes.length >= 2 && (
          <>
            <Separador label="Chaves de join" />
            <p className="text-xs text-slate-400 -mt-1">
              Defina os campos que relacionam as fontes entre si.
            </p>

            {form.chaves_join.map((chave) => (
              <div key={chave.id} className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Campo — Fonte A</label>
                  <input
                    type="text"
                    value={chave.campo_fonte_a}
                    onChange={(e) => atualizarChave(chave.id, 'campo_fonte_a', e.target.value)}
                    placeholder="Ex: id_cliente"
                    className="w-full px-3 py-1.5 text-sm font-mono border border-slate-200 rounded-lg outline-none focus:border-brand-400"
                  />
                </div>
                <span className="text-slate-400 pb-2 flex-shrink-0">=</span>
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Campo — Fonte B</label>
                  <input
                    type="text"
                    value={chave.campo_fonte_b}
                    onChange={(e) => atualizarChave(chave.id, 'campo_fonte_b', e.target.value)}
                    placeholder="Ex: cliente_id"
                    className="w-full px-3 py-1.5 text-sm font-mono border border-slate-200 rounded-lg outline-none focus:border-brand-400"
                  />
                </div>
                <button
                  onClick={() => removerChave(chave.id)}
                  className="pb-1.5 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus size={13} />}
              onClick={adicionarChave}
            >
              Adicionar chave de join
            </Button>
          </>
        )}

        {/* Campos resultantes */}
        <Separador label="Campos resultantes" />
        <p className="text-xs text-slate-400 -mt-1">
          Campos disponíveis após a combinação — o que os componentes podem consumir.
        </p>
        <CamposEditorLS
          value={form.campos_resultantes}
          onChange={(campos) => set('campos_resultantes', campos)}
        />

        <Textarea
          label="Observações"
          placeholder="Regras específicas do join, limitações, comportamento com valores nulos..."
          value={form.observacoes ?? ''}
          onChange={(e) => set('observacoes', e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" size="md" onClick={handleSalvar} disabled={!formValido}>
          {combinacao ? 'Salvar alterações' : 'Adicionar combinação'}
        </Button>
      </div>
    </Modal>
  );
}