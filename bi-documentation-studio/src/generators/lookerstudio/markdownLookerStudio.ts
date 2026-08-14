import type { Documentacao } from '@models/schema';
import type {
  LookerStudioData, BigQuerySource, LSDataSource,
  LSCombinacao, LSParametro, LSMetric, LSPage, LSComponent,
} from '@models/schema.lookerstudio';
import {
  LABELS_TIPO_COMPONENTE_LS, LABELS_TIPO_CONECTOR_LS, LABELS_TIPO_JOIN,
} from '@models/schema.lookerstudio';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-');
}

function cell(text?: string | null): string {
  if (!text) return '';
  return text.replace(/\|/g, '\\|').replace(/\r?\n+/g, '<br>');
}

function prettify(value?: string | null): string {
  if (!value) return '—';
  const s = value.replace(/_/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function bq(text: string): string {
  return text.split('\n').map((l) => `> ${l}`).join('\n');
}

function anchorTag(id: string): string  { return `<a id="${id}"></a>`; }
function link(label: string, anchor: string): string { return `[${label}](#${anchor})`; }

const anchorBQ      = (b: BigQuerySource) => `bq-${slugify(b.nome)}-${b.id.slice(0,8)}`;
const anchorFonte   = (f: LSDataSource)   => `fonte-${slugify(f.nome)}-${f.id.slice(0,8)}`;
const anchorComb    = (c: LSCombinacao)   => `comb-${slugify(c.nome)}-${c.id.slice(0,8)}`;
const anchorParam   = (p: LSParametro)    => `param-${slugify(p.nome)}-${p.id.slice(0,8)}`;
const anchorMetrica = (m: LSMetric)       => `metrica-${slugify(m.nome)}-${m.id.slice(0,8)}`;
const anchorPagina  = (p: LSPage)         => `pag-${slugify(p.titulo)}-${p.id.slice(0,8)}`;
const anchorComp    = (c: LSComponent)    => `comp-${slugify(c.nome)}-${c.id.slice(0,8)}`;

// ─── Gerador ──────────────────────────────────────────────────────────────────

export function gerarMarkdownLookerStudio(
  doc:    Documentacao,
  lsData: LookerStudioData,
): string {
  const { projeto, glossario, metadados }                                         = doc;
  const { dashboard, bigquery_sources, fontes_dados, combinacoes,
          parametros, metricas, paginas, componentes, seguranca }                 = lsData;

  const L: string[] = [];
  const add = (...linhas: string[]) => L.push(...linhas);

  // Lookup: id → nome (fontes + combinações)
  const fonteById = new Map<string, string>([
    ...fontes_dados.map((f) => [f.id, f.nome] as [string, string]),
    ...combinacoes.map((c)  => [c.id, c.nome] as [string, string]),
  ]);

  const paginasOrdenadas = [...paginas].sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));

  // ── Cabeçalho ───────────────────────────────────────────────────────────────

  add(`# ${dashboard.nome || projeto.titulo_relatorio || 'Dashboard Looker Studio'}`, '');
  add('> 📊 Documentação técnica gerada pelo **BI Documentation Studio** · Plataforma: **Looker Studio**', '');

  // Estatísticas
  add('| Indicador | Qtd. | Indicador | Qtd. |');
  add('|---|---|---|---|');
  add(`| BigQuery Sources | ${bigquery_sources.length} | Fontes de Dados | ${fontes_dados.length} |`);
  add(`| Combinações | ${combinacoes.length} | Parâmetros | ${parametros.length} |`);
  add(`| Métricas | ${metricas.length} | Páginas | ${paginas.length} |`);
  add(`| Componentes | ${componentes.length} | Glossário | ${glossario.length} |`);
  add('');

  // ── Sumário ──────────────────────────────────────────────────────────────────

  add('## 📑 Sumário', '');
  add(`- ${link('📋 Projeto', 'sec-projeto')}`);
  add(`- ${link('📊 Dashboard', 'sec-dashboard')}`);

  if (bigquery_sources.length > 0) {
    add(`- ${link('☁️ BigQuery', 'sec-bigquery')}`);
    bigquery_sources.forEach((b) =>
      add(`  - ${link(`\`${b.projeto_gcp}.${b.dataset}.${b.nome}\``, anchorBQ(b))}`));
  }

  if (fontes_dados.length > 0) {
    add(`- ${link('🗄️ Fontes de Dados', 'sec-fontes')}`);
    fontes_dados.forEach((f) => add(`  - ${link(f.nome, anchorFonte(f))}`));
  }

  if (combinacoes.length > 0) {
    add(`- ${link('🔗 Combinações', 'sec-combinacoes')}`);
    combinacoes.forEach((c) => add(`  - ${link(c.nome, anchorComb(c))}`));
  }

  if (parametros.length > 0) {
    add(`- ${link('⚙️ Parâmetros', 'sec-parametros')}`);
    parametros.forEach((p) => add(`  - ${link(`\`${p.nome}\``, anchorParam(p))}`));
  }

  if (metricas.length > 0) {
    add(`- ${link('📐 Métricas', 'sec-metricas')}`);
    metricas.forEach((m) => add(`  - ${link(m.nome, anchorMetrica(m))}`));
  }

  if (paginas.length > 0) {
    add(`- ${link('📄 Páginas e Componentes', 'sec-paginas')}`);
    paginasOrdenadas.forEach((p) => {
      add(`  - ${link(p.titulo, anchorPagina(p))}`);
      componentes.filter((c) => c.pagina_id === p.id).forEach((c) =>
        add(`    - ${link(c.nome, anchorComp(c))}`));
    });
    const semPag = componentes.filter((c) => !c.pagina_id);
    if (semPag.length) add(`  - ${link('Sem página associada', 'sec-sem-pagina')}`);
  }

  if (glossario.length > 0) add(`- ${link('📖 Glossário', 'sec-glossario')}`);
  add('');

  // ── Projeto ──────────────────────────────────────────────────────────────────

  add('---', '');
  add(anchorTag('sec-projeto'));
  add('## 📋 Projeto', '');
  add('| Campo | Valor |', '|---|---|');
  if (projeto.area_departamento) add(`| **Área / Departamento** | ${cell(projeto.area_departamento)} |`);
  if (projeto.responsavel)       add(`| **Responsável** | ${cell(projeto.responsavel)} |`);
  if (projeto.data_criacao)      add(`| **Data de Criação** | ${cell(projeto.data_criacao)} |`);
  if (projeto.ultima_atualizacao)add(`| **Última Atualização** | ${cell(projeto.ultima_atualizacao)} |`);
  add('');
  if (projeto.objetivo)           add('### Objetivo', '', projeto.objetivo, '');
  if (projeto.descricao_geral)    add('### Descrição Geral', '', projeto.descricao_geral, '');
  if (projeto.observacoes_gerais) add('### Observações Gerais', '', projeto.observacoes_gerais, '');
  if (projeto.melhorias_futuras?.length) {
    add('### 💡 Possíveis Melhorias / Atualizações Futuras', '');
    projeto.melhorias_futuras.forEach((m) => add(`- ${m}`));
    add('');
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────

  add('---', '');
  add(anchorTag('sec-dashboard'));
  add('## 📊 Dashboard', '');
  add('| Campo | Valor |', '|---|---|');
  if (dashboard.status)                  add(`| **Status** | ${prettify(dashboard.status)} |`);
  if (dashboard.versao)                  add(`| **Versão** | ${cell(dashboard.versao)} |`);
  if (dashboard.ambiente)                add(`| **Ambiente** | ${cell(dashboard.ambiente)} |`);
  if (dashboard.area_negocio)            add(`| **Área de Negócio** | ${cell(dashboard.area_negocio)} |`);
  if (dashboard.proprietario)            add(`| **Proprietário** | ${cell(dashboard.proprietario)} |`);
  if (dashboard.responsavel_tecnico)     add(`| **Responsável Técnico** | ${cell(dashboard.responsavel_tecnico)} |`);
  if (dashboard.data_criacao)            add(`| **Data de Criação** | ${cell(dashboard.data_criacao)} |`);
  if (dashboard.data_ultima_atualizacao) add(`| **Última Atualização** | ${cell(dashboard.data_ultima_atualizacao)} |`);
  if (dashboard.nivel_acesso)            add(`| **Nível de Acesso** | ${prettify(dashboard.nivel_acesso)} |`);
  if (dashboard.template_visual)         add(`| **Template Visual** | ${cell(dashboard.template_visual)} |`);
  add('');
  if (dashboard.link_relatorio) add(`🔗 **Link do Relatório:** ${dashboard.link_relatorio}`, '');
  if (dashboard.objetivo)       add('### Objetivo', '', bq(dashboard.objetivo), '');
  if (dashboard.descricao)      add('### Descrição', '', dashboard.descricao, '');
  if (dashboard.responsaveis_funcionais?.length) {
    add('### Responsáveis Funcionais', '');
    dashboard.responsaveis_funcionais.forEach((r) => add(`- ${r}`));
    add('');
  }
  if (dashboard.observacoes_gerais) add('### Observações Gerais', '', dashboard.observacoes_gerais, '');

  // Segurança
  if (seguranca) {
    add('### 🔒 Segurança', '');
    add('| Campo | Valor |', '|---|---|');
    if (seguranca.nivel_permissao)       add(`| **Permissão padrão** | ${prettify(seguranca.nivel_permissao)} |`);
    if (seguranca.tipo_credencial)       add(`| **Tipo de credencial** | ${prettify(seguranca.tipo_credencial)} |`);
    if (seguranca.proprietario_relatorio)add(`| **Proprietário do relatório** | ${cell(seguranca.proprietario_relatorio)} |`);
    if (seguranca.escopo_por_area)       add(`| **Escopo por área** | ${cell(seguranca.escopo_por_area)} |`);
    add('');
    if (seguranca.grupos_acesso.length > 0) {
      add('**Grupos com acesso:**');
      seguranca.grupos_acesso.forEach((g) => add(`- ${g}`));
      add('');
    }
    if (seguranca.usuarios_acesso.length > 0) {
      add('**Usuários com acesso:**');
      seguranca.usuarios_acesso.forEach((u) => add(`- ${u}`));
      add('');
    }
    if (seguranca.dados_sensiveis_apresentados.length > 0) {
      add('**Dados sensíveis apresentados:**');
      seguranca.dados_sensiveis_apresentados.forEach((d) => add(`- ${d}`));
      add('');
    }
    if (seguranca.restricoes)                add(`**Restrições:** ${seguranca.restricoes}`, '');
    if (seguranca.politica_compartilhamento) add(`**Política de compartilhamento:** ${seguranca.politica_compartilhamento}`, '');
    if (seguranca.regras_privilegio_minimo)  add(`**Regras de privilégio mínimo:** ${seguranca.regras_privilegio_minimo}`, '');
  }

  // ── BigQuery ──────────────────────────────────────────────────────────────────

  if (bigquery_sources.length > 0) {
    add('---', '');
    add(anchorTag('sec-bigquery'));
    add(`## ☁️ BigQuery (${bigquery_sources.length})`, '');

    bigquery_sources.forEach((b) => {
      add(anchorTag(anchorBQ(b)));
      add(`### \`${b.projeto_gcp}.${b.dataset}.${b.nome}\``, '');
      add(`**Tipo:** ${prettify(b.tipo)}`, '');
      if (b.descricao) add('', b.descricao, '');

      const rows: string[] = [];
      if (b.responsavel)            rows.push(`| **Responsável** | ${cell(b.responsavel)} |`);
      if (b.dominio_negocio)        rows.push(`| **Domínio** | ${cell(b.dominio_negocio)} |`);
      if (b.granularidade)          rows.push(`| **Granularidade** | ${cell(b.granularidade)} |`);
      if (b.frequencia_atualizacao) rows.push(`| **Atualização** | ${cell(b.frequencia_atualizacao)} |`);
      if (b.volume_estimado)        rows.push(`| **Volume** | ${cell(b.volume_estimado)} |`);
      if (b.retencao)               rows.push(`| **Retenção** | ${cell(b.retencao)} |`);
      if (b.particionamento)        rows.push(`| **Particionamento** | ${cell(b.particionamento)} |`);
      if (b.clusterizacao)          rows.push(`| **Clusterização** | ${cell(b.clusterizacao)} |`);
      if (rows.length) { add('| Campo | Valor |', '|---|---|', ...rows, ''); }

      if (b.sql_query) {
        add('<details>', '<summary>📄 Ver SQL / código</summary>', '', '```sql', b.sql_query, '```', '', '</details>', '');
      }

      if (b.colunas.length > 0) {
        add('**Colunas:**', '', '| Coluna | Tipo | M | D | NN | Descrição |', '|---|---|:---:|:---:|:---:|---|');
        b.colunas.forEach((c) => add(
          `| \`${c.nome}\` | ${cell(c.tipo)} | ${c.eh_metrica ? '✅' : ''} | ${c.eh_dimensao ? '✅' : ''} | ${!c.nullable ? '✅' : ''} | ${cell(c.descricao)} |`,
        ));
        add('');
      }

      if (b.observacoes) add(`**Observações:** ${b.observacoes}`, '');
    });
  }

  // ── Fontes de Dados ───────────────────────────────────────────────────────────

  if (fontes_dados.length > 0) {
    add('---', '');
    add(anchorTag('sec-fontes'));
    add(`## 🗄️ Fontes de Dados (${fontes_dados.length})`, '');

    fontes_dados.forEach((f) => {
      add(anchorTag(anchorFonte(f)));
      const conector = f.tipo_conector === 'outro' && f.tipo_conector_outro
        ? f.tipo_conector_outro
        : (LABELS_TIPO_CONECTOR_LS[f.tipo_conector] ?? f.tipo_conector);

      add(`### ${f.nome}`, '');
      add(`**Conector:** ${conector}`, '');
      if (f.descricao) add('', f.descricao, '');

      if (f.bigquery_source_id) {
        const bq = bigquery_sources.find((b) => b.id === f.bigquery_source_id);
        if (bq) add(`**Objeto BigQuery:** \`${bq.projeto_gcp}.${bq.dataset}.${bq.nome}\``, '');
      }

      if (f.proprietario_credencial) add(`**Credencial:** ${f.proprietario_credencial}`, '');
      if (f.tipo_credencial)         add(`**Tipo:** ${prettify(f.tipo_credencial)}`, '');
      if (f.frequencia_atualizacao)  add(`**Atualização:** ${f.frequencia_atualizacao}`, '');

      if (f.campos.length > 0) {
        add('', '**Campos:**', '', '| Campo | Tipo | Calc. | Descrição |', '|---|---|:---:|---|');
        f.campos.forEach((c) => add(
          `| \`${c.nome}\` | ${prettify(c.tipo)} | ${c.calculado ? '⚡' : ''} | ${cell(c.descricao ?? '')} |`,
        ));
        add('');
      }

      if (f.observacoes) add(`**Observações:** ${f.observacoes}`, '');
    });
  }

  // ── Combinações ───────────────────────────────────────────────────────────────

  if (combinacoes.length > 0) {
    add('---', '');
    add(anchorTag('sec-combinacoes'));
    add(`## 🔗 Combinações de Dados (${combinacoes.length})`, '');

    combinacoes.forEach((c) => {
      add(anchorTag(anchorComb(c)));
      add(`### ${c.nome}`, '');
      add(`**Tipo de join:** ${LABELS_TIPO_JOIN[c.tipo_join]}`, '');
      if (c.descricao) add('', c.descricao, '');

      if (c.fontes.length > 0) {
        add('**Fontes utilizadas:**');
        c.fontes.forEach((f) => {
          const nome   = fonteById.get(f.fonte_dados_id) ?? f.fonte_dados_id;
          const campos = f.campos_usados.length > 0 ? ` _(${f.campos_usados.join(', ')})_` : '';
          add(`- ${nome}${campos}`);
        });
        add('');
      }

      if (c.chaves_join.length > 0) {
        add('**Chaves de join:**', '', '| Campo Fonte A | Campo Fonte B |', '|---|---|');
        c.chaves_join.forEach((k) => add(`| \`${k.campo_fonte_a}\` | \`${k.campo_fonte_b}\` |`));
        add('');
      }

      if (c.campos_resultantes.length > 0) {
        add('**Campos resultantes:**', '', '| Campo | Tipo | Descrição |', '|---|---|---|');
        c.campos_resultantes.forEach((cf) => add(
          `| \`${cf.nome}\` | ${prettify(cf.tipo)} | ${cell(cf.descricao ?? '')} |`,
        ));
        add('');
      }

      if (c.observacoes) add(`**Observações:** ${c.observacoes}`, '');
    });
  }

  // ── Parâmetros ────────────────────────────────────────────────────────────────

  if (parametros.length > 0) {
    add('---', '');
    add(anchorTag('sec-parametros'));
    add(`## ⚙️ Parâmetros (${parametros.length})`, '');
    add('| Parâmetro | Tipo | Padrão | Viewer | Descrição |', '|---|---|---|:---:|---|');
    parametros.forEach((p) => add(
      `| \`${p.nome}\` | ${prettify(p.tipo)} | ${cell(p.valor_padrao ?? '—')} | ${p.visivel_viewer ? '✅' : '—'} | ${cell(p.descricao ?? '')} |`,
    ));
    add('');

    parametros.filter((p) => p.usado_em.length > 0).forEach((p) => {
      add(anchorTag(anchorParam(p)));
      add(`**\`${p.nome}\`** — utilizado em:`);
      p.usado_em.forEach((u) => add(`- ${u}`));
      add('');
    });
  }

  // ── Métricas ──────────────────────────────────────────────────────────────────

  if (metricas.length > 0) {
    add('---', '');
    add(anchorTag('sec-metricas'));
    add(`## 📐 Métricas (${metricas.length})`, '');

    metricas.forEach((m) => {
      add(anchorTag(anchorMetrica(m)));
      add(`### ${m.nome}`, '');
      if (m.descricao) add(m.descricao, '');

      // Origem
      const nomeFonte = m.fonte_dados_id ? (fonteById.get(m.fonte_dados_id) ?? m.fonte_dados_id) : null;
      if (nomeFonte && m.campo_origem) add(`**Origem:** ${nomeFonte} › \`${m.campo_origem}\``, '');
      else if (nomeFonte)              add(`**Origem:** ${nomeFonte}`, '');
      else if (m.campo_origem)         add(`**Campo:** \`${m.campo_origem}\``, '');

      if (m.formula) { add('**Fórmula:**', '', bq(m.formula), ''); }

      const infoRows: string[] = [];
      if (m.unidade)       infoRows.push(`| **Unidade** | ${cell(m.unidade)} |`);
      if (m.formato)       infoRows.push(`| **Formato** | ${cell(m.formato)} |`);
      if (m.granularidade) infoRows.push(`| **Granularidade** | ${cell(m.granularidade)} |`);
      if (m.responsavel_validacao) infoRows.push(`| **Responsável** | ${cell(m.responsavel_validacao)} |`);
      if (infoRows.length) { add('| Campo | Valor |', '|---|---|', ...infoRows, ''); }

      if (m.o_que_mede || m.o_que_entra || m.o_que_nao_entra || m.excecoes) {
        add('#### Escopo do Cálculo', '');
        if (m.o_que_mede)      add(`**O que mede:** ${m.o_que_mede}`, '');
        if (m.o_que_entra)     add(`- ✅ **O que entra:** ${m.o_que_entra}`);
        if (m.o_que_nao_entra) add(`- ❌ **O que não entra:** ${m.o_que_nao_entra}`);
        if (m.excecoes)        add(`- ⚠️ **Exceções:** ${m.excecoes}`);
        add('');
      }

      if (m.regras_temporais)      add(`**Regras Temporais:** ${m.regras_temporais}`, '');
      if (m.regra_negocio)         add(`**Regra de Negócio:** ${m.regra_negocio}`, '');
      if (m.limitacoes_conhecidas) add(`**Limitações:** ${m.limitacoes_conhecidas}`, '');
      if (m.observacoes)           add(`**Observações:** ${m.observacoes}`, '');
    });
  }

  // ── Páginas e Componentes ─────────────────────────────────────────────────────

  if (paginas.length > 0 || componentes.length > 0) {
    add('---', '');
    add(anchorTag('sec-paginas'));
    add('## 📄 Páginas e Componentes', '');

    const renderComponente = (c: LSComponent) => {
      add(anchorTag(anchorComp(c)));
      const tipoLabel = c.tipo === 'outro' && c.tipo_outro
        ? c.tipo_outro
        : (LABELS_TIPO_COMPONENTE_LS[c.tipo] ?? prettify(c.tipo));

      add(`##### ${c.nome}`, '');
      add(`**Tipo:** ${tipoLabel}`, '');
      if (c.titulo_exibido) add(`**Título exibido:** ${c.titulo_exibido}`, '');
      if (c.objetivo)       add(`**Objetivo:** ${c.objetivo}`, '');
      if (c.descricao)      add('', c.descricao, '');
      if (c.captura?.caminho) add('', `![${c.nome}](${c.captura.caminho})`, '');

      if (c.fontes_dados_ids.length > 0) {
        const nomes = c.fontes_dados_ids.map((id) => fonteById.get(id) ?? id).join(', ');
        add(`**Fontes:** ${nomes}`, '');
      }

      if (c.dimensoes.length > 0)         add(`**Dimensões:** ${c.dimensoes.map((d) => `\`${d}\``).join(', ')}`, '');
      if (c.metricas.length > 0)          add(`**Métricas:** ${c.metricas.map((m) => `\`${m}\``).join(', ')}`, '');

      if (c.campos_calculados.length > 0) {
        add('**Campos calculados:**');
        c.campos_calculados.forEach((cc) => add(`- \`${cc.nome}\` — \`${cc.formula}\``));
        add('');
      }

      if (c.filtros_aplicados.length > 0) {
        add('**Filtros aplicados:**');
        c.filtros_aplicados.forEach((f) => add(`- ${f}`));
        add('');
      }

      if (c.ordenacao)             add(`**Ordenação:** ${c.ordenacao}`, '');
      if (c.formato_numerico)      add(`**Formato numérico:** ${c.formato_numerico}`, '');
      if (c.periodo_comparacao)    add(`**Período de comparação:** ${c.periodo_comparacao}`, '');
      if (c.comportamento_esperado)add(`**Comportamento esperado:** ${c.comportamento_esperado}`, '');
      if (c.observacoes)           add(`**Observações:** ${c.observacoes}`, '');
      add('');
    };

    paginasOrdenadas.forEach((p) => {
      add(anchorTag(anchorPagina(p)));
      const prefixo = p.ordem != null ? `${p.ordem}. ` : '';
      add(`### ${prefixo}${p.titulo}`, '');
      if (p.objetivo)  add(`**Objetivo:** ${p.objetivo}`, '');
      if (p.descricao) add('', p.descricao, '');
      if (p.captura?.caminho) add('', `![${p.titulo}](${p.captura.caminho})`, '');
      if (p.filtros_globais.length > 0) {
        add('**Filtros globais:**');
        p.filtros_globais.forEach((f) => add(`- ${f}`));
        add('');
      }

      const compsNaPagina = componentes.filter((c) => c.pagina_id === p.id);
      if (compsNaPagina.length > 0) {
        add(`#### Componentes (${compsNaPagina.length})`, '');
        compsNaPagina.forEach(renderComponente);
      }
    });

    const semPagina = componentes.filter((c) => !c.pagina_id);
    if (semPagina.length > 0) {
      add(anchorTag('sec-sem-pagina'));
      add('### Componentes sem página associada', '');
      semPagina.forEach(renderComponente);
    }
  }

  // ── Glossário ─────────────────────────────────────────────────────────────────

  if (glossario.length > 0) {
    add('---', '');
    add(anchorTag('sec-glossario'));
    add(`## 📖 Glossário (${glossario.length})`, '');
    [...glossario]
      .sort((a, b) => a.termo.localeCompare(b.termo, 'pt-BR'))
      .forEach((g) => add(`**${g.termo}:** ${g.definicao}`, ''));
  }

  // ── Rodapé ────────────────────────────────────────────────────────────────────

  add('---', '');
  add(`*Documentado por: ${metadados.documentado_por || 'BI Documentation Studio'}*  `);
  add(`*Última revisão: ${new Date(metadados.ultima_revisao).toLocaleDateString('pt-BR')}*  `);
  add(`*Plataforma: Looker Studio*`);

  return L.join('\n');
}