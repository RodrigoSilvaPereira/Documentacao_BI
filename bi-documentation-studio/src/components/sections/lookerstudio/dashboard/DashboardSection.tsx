import { Monitor } from 'lucide-react';
import { useLSStore } from '@store/useLSStore';
import { useAppStore } from '@store/useAppStore';
import { SectionHeader } from '@components/layout/SectionHeader';
import { Card } from '@components/common/Card';
import { Input } from '@components/common/Input';
import { Textarea } from '@components/common/Textarea';
import { Select } from '@components/common/Select';
import { ListaStrings } from '@components/common/ListaStrings';
import { cn } from '@utils/cn';
import {
  OPCOES_STATUS_DASHBOARD,
  OPCOES_NIVEL_ACESSO,
  OPCOES_NIVEL_PERMISSAO,
  type StatusDashboard,
  type NivelAcesso,
  type NivelPermissao,
} from '@models/schema.lookerstudio';

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
      {children}
    </p>
  );
}

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

export function DashboardSection() {
  const lsData            = useLSStore((s) => s.lsData);
  const atualizarDashboard = useLSStore((s) => s.atualizarDashboard);
  const atualizarSeguranca = useLSStore((s) => s.atualizarSeguranca);

  const biPlatform = useAppStore((s) => s.projetoAberto?.biPlatform);

  if (biPlatform !== 'LOOKER_STUDIO' || !lsData) return null;

  const db  = lsData.dashboard;
  const seg = lsData.seguranca;

  function setDB<K extends keyof typeof db>(campo: K, valor: (typeof db)[K]) {
    atualizarDashboard({ [campo]: valor } as Partial<typeof db>);
  }

  function setSeg<K extends keyof typeof seg>(campo: K, valor: (typeof seg)[K]) {
    atualizarSeguranca({ [campo]: valor } as Partial<typeof seg>);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-5 pb-16">
      <SectionHeader
        icon={<Monitor size={20} />}
        title="Dashboard"
        description="Informações gerais, configurações e segurança do relatório no Looker Studio."
      />

      {/* ── Card 1: Identificação ────────────────────────────────────── */}
      <Card>
        <CardLabel>Identificação</CardLabel>
        <div className="space-y-4">
          <Input
            label="Nome do relatório"
            placeholder="Ex: Dashboard Comercial — Visão Gerencial"
            value={db.nome}
            onChange={(e) => setDB('nome', e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              options={OPCOES_STATUS_DASHBOARD}
              value={db.status}
              onChange={(e) => setDB('status', e.target.value as StatusDashboard)}
            />
            <Input
              label="Versão"
              placeholder="Ex: 1.0, 2.3, Beta"
              value={db.versao ?? ''}
              onChange={(e) => setDB('versao', e.target.value)}
            />
          </div>

          <Input
            label="Link do relatório"
            placeholder="Ex: https://lookerstudio.google.com/reporting/..."
            value={db.link_relatorio ?? ''}
            onChange={(e) => setDB('link_relatorio', e.target.value)}
            hint="URL pública ou interna. Não insira credenciais de acesso aqui."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Área de negócio"
              placeholder="Ex: Comercial, Financeiro, RH"
              value={db.area_negocio ?? ''}
              onChange={(e) => setDB('area_negocio', e.target.value)}
            />
            <Input
              label="Ambiente"
              placeholder="Ex: Produção, Homologação"
              value={db.ambiente ?? ''}
              onChange={(e) => setDB('ambiente', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* ── Card 2: Objetivo ─────────────────────────────────────────── */}
      <Card>
        <CardLabel>Objetivo e contexto</CardLabel>
        <div className="space-y-4">
          <Textarea
            label="Objetivo"
            placeholder="Descreva o propósito do dashboard e quais decisões ele apoia."
            value={db.objetivo ?? ''}
            onChange={(e) => setDB('objetivo', e.target.value)}
            rows={3}
          />
          <Textarea
            label="Descrição geral"
            placeholder="Contexto adicional, público-alvo, escopo e abrangência do relatório."
            value={db.descricao ?? ''}
            onChange={(e) => setDB('descricao', e.target.value)}
            rows={3}
          />
          <Textarea
            label="Observações gerais"
            placeholder="Informações importantes sobre o relatório, premissas, limitações conhecidas..."
            value={db.observacoes_gerais ?? ''}
            onChange={(e) => setDB('observacoes_gerais', e.target.value)}
            rows={2}
          />
        </div>
      </Card>

      {/* ── Card 3: Responsabilidade ─────────────────────────────────── */}
      <Card>
        <CardLabel>Responsabilidade</CardLabel>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Proprietário"
              placeholder="Ex: Carlos Mendes"
              value={db.proprietario ?? ''}
              onChange={(e) => setDB('proprietario', e.target.value)}
            />
            <Input
              label="Responsável técnico"
              placeholder="Ex: Ana Paula Ferreira"
              value={db.responsavel_tecnico ?? ''}
              onChange={(e) => setDB('responsavel_tecnico', e.target.value)}
            />
          </div>

          <ListaStrings
            label="Responsáveis funcionais"
            value={db.responsaveis_funcionais ?? []}
            onChange={(items) => setDB('responsaveis_funcionais', items)}
            placeholder="Ex: Gerência Comercial, Diretoria de Operações"
            emptyText="Nenhum responsável funcional cadastrado."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data de criação"
              placeholder="MM/AAAA"
              value={db.data_criacao ?? ''}
              onChange={(e) => setDB('data_criacao', e.target.value)}
            />
            <Input
              label="Última atualização"
              placeholder="MM/AAAA"
              value={db.data_ultima_atualizacao ?? ''}
              onChange={(e) => setDB('data_ultima_atualizacao', e.target.value)}
            />
          </div>

          <Input
            label="Periodicidade de revisão"
            placeholder="Ex: Mensal, Trimestral, Sob demanda"
            value={db.periodicidade_revisao ?? ''}
            onChange={(e) => setDB('periodicidade_revisao', e.target.value)}
          />

          <Input
            label="Template visual"
            placeholder="Ex: Template Corporativo v2.1 — Marketing"
            value={db.template_visual ?? ''}
            onChange={(e) => setDB('template_visual', e.target.value)}
          />
        </div>
      </Card>

      {/* ── Card 4: Segurança ────────────────────────────────────────── */}
      <Card>
        <CardLabel>Segurança e acesso</CardLabel>
        <div className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Nível de acesso"
              options={OPCOES_NIVEL_ACESSO}
              value={db.nivel_acesso}
              onChange={(e) => setDB('nivel_acesso', e.target.value as NivelAcesso)}
            />
            <Select
              label="Nível de permissão padrão"
              options={OPCOES_NIVEL_PERMISSAO}
              value={seg.nivel_permissao}
              onChange={(e) => setSeg('nivel_permissao', e.target.value as NivelPermissao)}
            />
          </div>

          {/* Tipo de credencial */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Tipo de credencial</label>
            <p className="text-xs text-slate-400 -mt-0.5">
              Define se os dados são carregados com as credenciais do proprietário do relatório ou do usuário visualizador.
            </p>
            <div className="flex gap-2">
              {(['proprietario', 'visualizador'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSeg('tipo_credencial', v)}
                  className={cn(
                    'flex-1 h-9 rounded-lg border text-sm font-medium transition-colors',
                    seg.tipo_credencial === v
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'text-slate-600 border-slate-300 hover:border-slate-400',
                  )}
                >
                  {v === 'proprietario' ? 'Do proprietário' : 'Do visualizador'}
                </button>
              ))}
            </div>
          </div>

          <Separador label="Usuários e grupos" />

          <Input
            label="Proprietário do relatório"
            placeholder="Ex: ana.ferreira@empresa.com"
            value={seg.proprietario_relatorio ?? ''}
            onChange={(e) => setSeg('proprietario_relatorio', e.target.value)}
          />

          <ListaStrings
            label="Grupos com acesso"
            value={seg.grupos_acesso}
            onChange={(items) => setSeg('grupos_acesso', items)}
            placeholder="Ex: grupo-comercial@empresa.com"
            emptyText="Nenhum grupo cadastrado."
          />

          <ListaStrings
            label="Usuários com acesso"
            value={seg.usuarios_acesso}
            onChange={(items) => setSeg('usuarios_acesso', items)}
            placeholder="Ex: joao.silva@empresa.com"
            emptyText="Nenhum usuário cadastrado."
          />

          <Separador label="Dados sensíveis" />

          <p className="text-xs text-slate-400 -mt-2">
            Liste as categorias de dados sensíveis apresentadas — nunca insira dados reais aqui.
          </p>

          <ListaStrings
            label="Dados sensíveis apresentados"
            value={seg.dados_sensiveis_apresentados}
            onChange={(items) => setSeg('dados_sensiveis_apresentados', items)}
            placeholder="Ex: Dados salariais, Informações pessoais de colaboradores"
            emptyText="Nenhum dado sensível documentado."
          />

          <Input
            label="Escopo por área"
            placeholder="Ex: Cada gerente visualiza apenas sua equipe"
            value={seg.escopo_por_area ?? ''}
            onChange={(e) => setSeg('escopo_por_area', e.target.value)}
          />

          <Textarea
            label="Restrições"
            placeholder="Ex: Acesso bloqueado para usuários externos. Dados disponíveis apenas para a rede corporativa."
            value={seg.restricoes ?? ''}
            onChange={(e) => setSeg('restricoes', e.target.value)}
            rows={2}
          />

          <Textarea
            label="Política de compartilhamento"
            placeholder="Ex: Compartilhamento externo desabilitado. Link restrito à organização."
            value={seg.politica_compartilhamento ?? ''}
            onChange={(e) => setSeg('politica_compartilhamento', e.target.value)}
            rows={2}
          />

          <Textarea
            label="Regras de privilégio mínimo"
            placeholder="Ex: Analistas têm acesso somente leitura. Dados de RH requerem aprovação do CISO."
            value={seg.regras_privilegio_minimo ?? ''}
            onChange={(e) => setSeg('regras_privilegio_minimo', e.target.value)}
            rows={2}
          />

          <Textarea
            label="Observações de segurança"
            placeholder="Particularidades de acesso, auditorias periódicas, histórico de incidentes..."
            value={seg.observacoes ?? ''}
            onChange={(e) => setSeg('observacoes', e.target.value)}
            rows={2}
          />
        </div>
      </Card>
    </div>
  );
}