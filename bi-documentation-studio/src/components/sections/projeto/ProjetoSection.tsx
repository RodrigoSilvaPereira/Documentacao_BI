import { LayoutDashboard } from 'lucide-react';
import { useDocStore } from '@store/useDocStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Card } from '@components/common/Card';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { FontesEditor } from './FontesEditor';
import type { Projeto } from '@models/schema';

// Helper: gera um handler onChange que atualiza um campo string do projeto
// Evita repetir `updateProjeto({ campo: e.target.value })` em cada campo
function criarHandler(
  campo: keyof Omit<Projeto, 'fontes_dados'>,
  update: (dados: Partial<Projeto>) => void,
) {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    update({ [campo]: e.target.value } as Partial<Projeto>);
}

export function ProjetoSection() {
  const documento    = useDocStore((s) => s.documento);
  const updateProjeto = useDocStore((s) => s.updateProjeto);

  // Seção não renderiza enquanto nenhum projeto estiver aberto
  if (!documento) return null;

  const { projeto } = documento;
  const h = (campo: keyof Omit<Projeto, 'fontes_dados'>) =>
    criarHandler(campo, updateProjeto);

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-5 pb-16">
      <SectionHeader
        icon={<LayoutDashboard size={20} />}
        title="Projeto"
        description="Informações gerais do relatório Power BI."
      />

      {/* ── Card 1: Identificação ─────────────────────────────── */}
      <Card>
        <CardLabel>Identificação</CardLabel>
        <div className="space-y-4">
          <Input
            label="Nome do Relatório"
            placeholder="Ex: Relatório de Vendas Regional"
            value={projeto.titulo_relatorio}
            onChange={h('titulo_relatorio')}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Área / Departamento"
              placeholder="Ex: Comercial, RH, Financeiro..."
              value={projeto.area_departamento}
              onChange={h('area_departamento')}
            />
            <Input
              label="Responsável"
              placeholder="Nome do analista / desenvolvedor"
              value={projeto.responsavel}
              onChange={h('responsavel')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data de criação"
              placeholder="MM/AAAA"
              value={projeto.data_criacao}
              onChange={h('data_criacao')}
              hint="Formato: MM/AAAA"
            />
            <Input
              label="Última atualização"
              placeholder="MM/AAAA"
              value={projeto.ultima_atualizacao}
              onChange={h('ultima_atualizacao')}
              hint="Formato: MM/AAAA"
            />
          </div>
        </div>
      </Card>

      {/* ── Card 2: Objetivo e Contexto ───────────────────────── */}
      <Card>
        <CardLabel>Objetivo e Contexto</CardLabel>
        <div className="space-y-4">
          <Textarea
            label="Objetivo do Relatório"
            placeholder="Descreva o propósito do relatório, o público-alvo e as decisões que ele apoia."
            value={projeto.objetivo}
            onChange={h('objetivo')}
            rows={4}
          />
          <Textarea
            label="Descrição Geral"
            placeholder="Contexto adicional, escopo e abrangência do relatório."
            value={projeto.descricao_geral}
            onChange={h('descricao_geral')}
            rows={3}
          />
        </div>
      </Card>

      {/* ── Card 3: Fontes de dados ───────────────────────────── */}
      <Card>
        <CardLabel>Fontes de Dados</CardLabel>
        <FontesEditor
          value={projeto.fontes_dados}
          onChange={(fontes) => updateProjeto({ fontes_dados: fontes })}
        />
      </Card>

      {/* ── Card 4: Observações ───────────────────────────────── */}
      <Card>
        <CardLabel>Observações Gerais</CardLabel>
        <Textarea
          placeholder="Informações adicionais importantes sobre o projeto, restrições, premissas, contexto de negócio..."
          value={projeto.observacoes_gerais}
          onChange={h('observacoes_gerais')}
          rows={4}
        />
      </Card>
    </div>
  );
}

// ── Sub-componente interno: cabeçalho de cada card ───────────────────────────
function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
      {children}
    </p>
  );
}