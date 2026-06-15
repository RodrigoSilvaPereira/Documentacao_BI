import type {
  Documentacao, KPI, MedidaDAX, Query, Pagina, Visual,
} from '@models/schema';
import { LABELS_CARDINALIDADE, LABELS_DIRECAO, LABELS_FONTE_DADOS } from '@models/enums';

// ════════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════════

/** Remove acentos e caracteres especiais para gerar âncoras estáveis em qualquer visualizador. */
function slugify(text: string): string {
  return text
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Âncoras determinísticas — combinam slug do nome + 8 primeiros chars do ID,
// garantindo unicidade mesmo quando duas entidades têm o mesmo nome
// (ex: KPI "Turnover" e Medida "Turnover").
const anchorKpi    = (k: KPI)       => `kpi-${slugify(k.nome)}-${k.id.slice(0, 8)}`;
const anchorMedida = (m: MedidaDAX) => `medida-${slugify(m.nome)}-${m.id.slice(0, 8)}`;
const anchorQuery  = (q: Query)     => `query-${slugify(q.nome)}-${q.id.slice(0, 8)}`;
const anchorPagina = (p: Pagina)    => `pagina-${slugify(p.titulo)}-${p.id.slice(0, 8)}`;
const anchorVisual = (v: Visual)    => `visual-${slugify(v.nome)}-${v.id.slice(0, 8)}`;

/** Link markdown para uma âncora interna. */
function link(label: string, anchor: string): string {
  return `[${label}](#${anchor})`;
}

/** Âncora HTML invisível, posicionada imediatamente antes de um heading. */
function anchorTag(id: string): string {
  return `<a id="${id}"></a>`;
}

/** Sanitiza texto para uso seguro dentro de células de tabela markdown. */
function cell(text?: string | null): string {
  if (!text) return '';
  return text.replace(/\|/g, '\\|').replace(/\r?\n+/g, '<br>');
}

/** Converte valores de enum em texto legível, mesmo quando não há label mapeada. */
function prettify(value?: string | null): string {
  if (!value) return '—';
  const spaced = value.replace(/_/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Transforma um texto multilinha em blockquote markdown (`> linha`). */
function blockquote(text: string): string {
  return text.split('\n').map((l) => `> ${l}`).join('\n');
}

// ════════════════════════════════════════════════════════════════════════
// Gerador principal
// ════════════════════════════════════════════════════════════════════════

export function gerarMarkdown(doc: Documentacao): string {
  const { projeto, kpis, queries, relacionamentos, medidas_dax, paginas, glossario, metadados } = doc;
  const L: string[] = [];
  const add = (...linhas: string[]) => L.push(...linhas);

  // ── Lookups por ID ───────────────────────────────────────────────────
  const kpiById     = new Map(kpis.map((k) => [k.id, k]));
  const medidaById  = new Map(medidas_dax.map((m) => [m.id, m]));
  const queryById   = new Map(queries.map((q) => [q.id, q]));
  const queryByNome = new Map(queries.map((q) => [q.nome.toLowerCase(), q]));

  // ── Agrupamento de queries por prefixo (Fato / Dimensão / Outras) ────
  const fatosQ     = queries.filter((q) => /^ft/i.test(q.nome));
  const dimensoesQ = queries.filter((q) => /^dim/i.test(q.nome));
  const outrasQ    = queries.filter((q) => !fatosQ.includes(q) && !dimensoesQ.includes(q));

  // ── Referências cruzadas reversas ────────────────────────────────────

  // Medidas que citam cada KPI em kpis_relacionados
  const medidasPorKpi = new Map<string, MedidaDAX[]>();
  medidas_dax.forEach((m) => m.kpis_relacionados.forEach((id) => {
    if (!medidasPorKpi.has(id)) medidasPorKpi.set(id, []);
    medidasPorKpi.get(id)!.push(m);
  }));

  // Medidas que dependem de cada medida (uso reverso de "dependencias")
  const dependentesPorMedida = new Map<string, MedidaDAX[]>();
  medidas_dax.forEach((m) => m.dependencias.forEach((id) => {
    if (!dependentesPorMedida.has(id)) dependentesPorMedida.set(id, []);
    dependentesPorMedida.get(id)!.push(m);
  }));

  // Visuais que utilizam cada KPI / Medida / Query, com referência à página
  interface UsoVisual { pagina: Pagina; visual: Visual; }
  const visuaisPorKpi    = new Map<string, UsoVisual[]>();
  const visuaisPorMedida = new Map<string, UsoVisual[]>();
  const visuaisPorQuery  = new Map<string, UsoVisual[]>();
  const registrarUso = (mapa: Map<string, UsoVisual[]>, id: string, uso: UsoVisual) => {
    if (!mapa.has(id)) mapa.set(id, []);
    mapa.get(id)!.push(uso);
  };
  paginas.forEach((p) => p.visuais.forEach((v) => {
    v.kpis_ids.forEach((id) => registrarUso(visuaisPorKpi, id, { pagina: p, visual: v }));
    v.medidas_ids.forEach((id) => registrarUso(visuaisPorMedida, id, { pagina: p, visual: v }));
    v.tabelas_ids.forEach((id) => registrarUso(visuaisPorQuery, id, { pagina: p, visual: v }));
  }));

  // ── Helpers de link que dependem dos lookups acima ───────────────────
  const kpiLink    = (id: string) => { const k = kpiById.get(id);    return k ? link(k.nome, anchorKpi(k)) : `\`${id}\``; };
  const medidaLink = (id: string) => {
    const m = medidaById.get(id);
    return m ? link(m.tabela ? `${m.tabela}[${m.nome}]` : m.nome, anchorMedida(m)) : `\`${id}\``;
  };
  const queryLink  = (id: string) => { const q = queryById.get(id);  return q ? link(q.nome, anchorQuery(q)) : `\`${id}\``; };
  const tabelaLink = (nome: string) => {
    const q = queryByNome.get(nome.toLowerCase());
    return q ? link(`\`${nome}\``, anchorQuery(q)) : `\`${nome}\``;
  };
  const visualUsoLink = (uso: UsoVisual) =>
    `${link(uso.visual.nome, anchorVisual(uso.visual))} _(página ${link(uso.pagina.titulo, anchorPagina(uso.pagina))})_`;

  // ════════════════════════════════════════════════════════════════════
  // Cabeçalho + Estatísticas
  // ════════════════════════════════════════════════════════════════════

  add(`# ${projeto.titulo_relatorio || 'Projeto BI'}`, '');
  add('> 📘 Documentação técnica gerada automaticamente pelo **BI Documentation Studio**', '');

  const totalVisuais = paginas.reduce((acc, p) => acc + p.visuais.length, 0);
  const totalFiltros = paginas.reduce((acc, p) => acc + p.filtros.length, 0);

  add('| Indicador | Qtd. | Indicador | Qtd. |');
  add('|---|---|---|---|');
  add(`| KPIs | ${kpis.length} | Medidas DAX | ${medidas_dax.length} |`);
  add(`| Queries | ${queries.length} | Relacionamentos | ${relacionamentos.length} |`);
  add(`| Páginas | ${paginas.length} | Visuais | ${totalVisuais} |`);
  add(`| Filtros | ${totalFiltros} | Termos no Glossário | ${glossario.length} |`);
  add('');

  // ════════════════════════════════════════════════════════════════════
  // Sumário
  // ════════════════════════════════════════════════════════════════════

  add('## 📑 Sumário', '');
  add(`- ${link('📋 Projeto', 'projeto')}`);

  if (kpis.length > 0) {
    add(`- ${link('📊 KPIs', 'kpis')}`);
    kpis.forEach((k) => add(`  - ${link(k.nome, anchorKpi(k))}`));
  }

  if (queries.length > 0) {
    add(`- ${link('🗄️ Queries', 'queries')}`);
    if (fatosQ.length > 0)     { add(`  - ${link('Tabelas Fato', 'queries-fato')}`);      fatosQ.forEach((q)     => add(`    - ${link(q.nome, anchorQuery(q))}`)); }
    if (dimensoesQ.length > 0) { add(`  - ${link('Tabelas Dimensão', 'queries-dimensao')}`); dimensoesQ.forEach((q) => add(`    - ${link(q.nome, anchorQuery(q))}`)); }
    if (outrasQ.length > 0)    { add(`  - ${link('Outras', 'queries-outras')}`);          outrasQ.forEach((q)    => add(`    - ${link(q.nome, anchorQuery(q))}`)); }
  }

  if (relacionamentos.length > 0) add(`- ${link('🔗 Relacionamentos', 'relacionamentos')}`);

  if (medidas_dax.length > 0) {
    add(`- ${link('📐 Medidas DAX', 'medidas-dax')}`);
    medidas_dax.forEach((m) => add(`  - ${link(m.tabela ? `${m.tabela}[${m.nome}]` : m.nome, anchorMedida(m))}`));
  }

  if (paginas.length > 0) {
    add(`- ${link('📄 Páginas', 'paginas')}`);
    paginas.forEach((p) => add(`  - ${link(p.titulo, anchorPagina(p))}`));
  }

  if (glossario.length > 0) add(`- ${link('📖 Glossário', 'glossario')}`);
  add('');

  // ════════════════════════════════════════════════════════════════════
  // Projeto
  // ════════════════════════════════════════════════════════════════════

  add('---', '');
  add(anchorTag('projeto'));
  add('## 📋 Projeto', '');
  add('| Campo | Valor |', '|---|---|');
  add(`| **Nome do Relatório** | ${projeto.titulo_relatorio || '—'} |`);
  add(`| **Área / Departamento** | ${projeto.area_departamento || '—'} |`);
  add(`| **Responsável** | ${projeto.responsavel || '—'} |`);
  add(`| **Data de Criação** | ${projeto.data_criacao || '—'} |`);
  add(`| **Última Atualização** | ${projeto.ultima_atualizacao || '—'} |`);
  add(`| **Versão do Schema** | ${doc.versao_schema || '—'} |`);
  add('');

  if (projeto.objetivo)        add('### Objetivo', '', projeto.objetivo, '');
  if (projeto.descricao_geral) add('### Descrição Geral', '', projeto.descricao_geral, '');
  if (projeto.fontes_dados.length > 0) {
    add('### Fontes de Dados', '');
    projeto.fontes_dados.forEach((f) => add(`- **${f.tipo}** — ${f.descricao}`));
    add('');
  }
  if (projeto.observacoes_gerais) add('### Observações Gerais', '', projeto.observacoes_gerais, '');

  // ════════════════════════════════════════════════════════════════════
  // KPIs
  // ════════════════════════════════════════════════════════════════════

  if (kpis.length > 0) {
    add('---', '');
    add(anchorTag('kpis'));
    add(`## 📊 KPIs (${kpis.length})`, '');

    kpis.forEach((kpi) => {
      add(anchorTag(anchorKpi(kpi)));
      const tipoLabel = kpi.tipo_visual === 'outro' && kpi.tipo_outro ? kpi.tipo_outro : prettify(kpi.tipo_visual);

      add(`### ${kpi.nome}`, '');
      add(`**Tipo de visual:** ${tipoLabel}`, '');

      if (kpi.o_que_mede)    add(`**O que mede:** ${kpi.o_que_mede}`, '');
      if (kpi.objetivo_meta) add(`**Objetivo / Meta:** ${kpi.objetivo_meta}`, '');

      if (kpi.formula) {
        add('**Fórmula:**', '');
        add(blockquote(kpi.formula), '');
      }

      if (kpi.o_que_entra || kpi.o_que_nao_entra || kpi.excecoes) {
        add('#### Escopo do Cálculo', '');
        if (kpi.o_que_entra)     add(`- ✅ **O que entra:** ${kpi.o_que_entra}`);
        if (kpi.o_que_nao_entra) add(`- ❌ **O que não entra:** ${kpi.o_que_nao_entra}`);
        if (kpi.excecoes)        add(`- ⚠️ **Exceções:** ${kpi.excecoes}`);
        add('');
      }

      if (kpi.regras_temporais) add(`**Regras Temporais:** ${kpi.regras_temporais}`, '');

      if (kpi.fonte_dados_kpi || kpi.responsavel_validacao) {
        add('| | |', '|---|---|');
        if (kpi.fonte_dados_kpi)       add(`| **Fonte dos Dados** | ${cell(kpi.fonte_dados_kpi)} |`);
        if (kpi.responsavel_validacao) add(`| **Responsável pela Validação** | ${cell(kpi.responsavel_validacao)} |`);
        add('');
      }

      if (kpi.regras_negocio.length > 0) {
        add('**Regras de Negócio:**');
        kpi.regras_negocio.forEach((r) => add(`- ${r}`));
        add('');
      }

      if (kpi.observacoes) add(`**Observações:** ${kpi.observacoes}`, '');

      // Referências cruzadas (medidas que o calculam, visuais que o exibem)
      const medidasRel  = medidasPorKpi.get(kpi.id) ?? [];
      const usosVisuais = visuaisPorKpi.get(kpi.id) ?? [];
      if (medidasRel.length > 0 || usosVisuais.length > 0) {
        add('<details>', '<summary>🔗 Referências</summary>', '');
        if (medidasRel.length > 0) {
          add('**Medidas DAX relacionadas:**');
          medidasRel.forEach((m) => add(`- ${link(m.tabela ? `${m.tabela}[${m.nome}]` : m.nome, anchorMedida(m))}`));
          add('');
        }
        if (usosVisuais.length > 0) {
          add('**Utilizado nos visuais:**');
          usosVisuais.forEach((u) => add(`- ${visualUsoLink(u)}`));
          add('');
        }
        add('</details>', '');
      }
    });
  }

  // ════════════════════════════════════════════════════════════════════
  // Queries (agrupadas em Fato / Dimensão / Outras)
  // ════════════════════════════════════════════════════════════════════

  if (queries.length > 0) {
    add('---', '');
    add(anchorTag('queries'));
    add(`## 🗄️ Queries / Tabelas (${queries.length})`, '');

    const renderQuery = (q: Query) => {
      add(anchorTag(anchorQuery(q)));
      const fonteLabel = q.fonte_dados === 'outro' && q.fonte_dados_outro
        ? q.fonte_dados_outro
        : (LABELS_FONTE_DADOS[q.fonte_dados] ?? prettify(q.fonte_dados));

      add(`#### ${q.nome}`, '');
      add(`**Fonte:** ${fonteLabel}`, '');
      if (q.descricao) add('', q.descricao, '');

      if (q.codigo) {
        add('', '<details>', '<summary>📄 Ver código (SQL / M)</summary>', '');
        add('```sql', q.codigo, '```', '');
        add('</details>', '');
      }

      if (q.transformacoes.length > 0) {
        add('**Transformações Power Query:**');
        q.transformacoes.forEach((t) => add(`- ${t}`));
        add('');
      }

      if (q.colunas.length > 0) {
        add('**Colunas Principais:**', '');
        add('| Coluna | Tipo | Descrição |', '|---|---|---|');
        q.colunas.forEach((c) => add(`| \`${c.nome}\` | ${cell(c.tipo)} | ${cell(c.descricao)} |`));
        add('');
      }

      if (q.observacoes) add(`**Observações:** ${q.observacoes}`, '');

      const usosVisuais = visuaisPorQuery.get(q.id) ?? [];
      if (usosVisuais.length > 0) {
        add('<details>', '<summary>🔗 Utilizado nos visuais</summary>', '');
        usosVisuais.forEach((u) => add(`- ${visualUsoLink(u)}`));
        add('', '</details>', '');
      }
    };

    if (fatosQ.length > 0) {
      add(anchorTag('queries-fato'));
      add('### 🟦 Tabelas Fato', '');
      fatosQ.forEach(renderQuery);
    }
    if (dimensoesQ.length > 0) {
      add(anchorTag('queries-dimensao'));
      add('### 🟩 Tabelas Dimensão', '');
      dimensoesQ.forEach(renderQuery);
    }
    if (outrasQ.length > 0) {
      add(anchorTag('queries-outras'));
      add('### ⬜ Outras Tabelas', '');
      outrasQ.forEach(renderQuery);
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // Relacionamentos
  // ════════════════════════════════════════════════════════════════════

  if (relacionamentos.length > 0) {
    add('---', '');
    add(anchorTag('relacionamentos'));
    add(`## 🔗 Relacionamentos (${relacionamentos.length})`, '');
    add('| Origem | Destino | Col. Origem | Col. Destino | Cardinalidade | Direção | Ativo | Temp. | Observações |');
    add('|---|---|---|---|---|---|---|---|---|');
    relacionamentos.forEach((r) => add(
      `| ${tabelaLink(r.tabela_origem)} | ${tabelaLink(r.tabela_destino)} | \`${r.coluna_origem}\` | \`${r.coluna_destino}\` | `
      + `${LABELS_CARDINALIDADE[r.cardinalidade] ?? prettify(r.cardinalidade)} | ${LABELS_DIRECAO[r.direcao] ?? prettify(r.direcao)} | `
      + `${r.ativo ? '✅' : '❌'} | ${r.temporario ? '⚡' : '—'} | ${cell(r.observacoes)} |`,
    ));
    add('');

    if (relacionamentos.some((r) => r.temporario)) {
      add('> ⚡ **Relacionamentos temporários** são ativados via `USERELATIONSHIP()` em medidas DAX específicas e não estão ativos no modelo por padrão.', '');
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // Medidas DAX
  // ════════════════════════════════════════════════════════════════════

  if (medidas_dax.length > 0) {
    add('---', '');
    add(anchorTag('medidas-dax'));
    add(`## 📐 Medidas DAX (${medidas_dax.length})`, '');

    medidas_dax.forEach((m) => {
      add(anchorTag(anchorMedida(m)));
      add(`### ${m.tabela ? `${m.tabela}[${m.nome}]` : m.nome}`, '');
      if (m.descricao) add(m.descricao, '');
      if (m.formula)   add('', '```dax', m.formula, '```', '');

      if (m.dependencias.length > 0) {
        add('**Dependências:**');
        m.dependencias.forEach((id) => add(`- ${medidaLink(id)}`));
        add('');
      }

      if (m.kpis_relacionados.length > 0) {
        add('**KPIs relacionados:**');
        m.kpis_relacionados.forEach((id) => add(`- ${kpiLink(id)}`));
        add('');
      }

      if (m.comportamento_esperado) add(`**Como validar:** ${m.comportamento_esperado}`, '');

      if (m.query_validacao) {
        add('<details>', '<summary>🧪 Query de Validação</summary>', '');
        add('```sql', m.query_validacao, '```', '');
        add('</details>', '');
      }

      const dependentes = dependentesPorMedida.get(m.id) ?? [];
      const usosVisuais = visuaisPorMedida.get(m.id) ?? [];
      if (dependentes.length > 0 || usosVisuais.length > 0) {
        add('<details>', '<summary>🔗 Referências</summary>', '');
        if (dependentes.length > 0) {
          add('**Utilizada por outras medidas:**');
          dependentes.forEach((d) => add(`- ${link(d.tabela ? `${d.tabela}[${d.nome}]` : d.nome, anchorMedida(d))}`));
          add('');
        }
        if (usosVisuais.length > 0) {
          add('**Utilizada nos visuais:**');
          usosVisuais.forEach((u) => add(`- ${visualUsoLink(u)}`));
          add('');
        }
        add('</details>', '');
      }
    });
  }

  // ════════════════════════════════════════════════════════════════════
  // Páginas
  // ════════════════════════════════════════════════════════════════════

  if (paginas.length > 0) {
    add('---', '');
    add(anchorTag('paginas'));
    add(`## 📄 Páginas (${paginas.length})`, '');

    paginas.forEach((p) => {
      add(anchorTag(anchorPagina(p)));
      add(`### ${p.titulo}`, '');
      if (p.objetivo)  add(`**Objetivo:** ${p.objetivo}`, '');
      if (p.descricao) add('', p.descricao, '');
      if (p.captura?.caminho) add('', `![${p.titulo}](${p.captura.caminho})`, '');

      const filtrosGlobais = p.filtros.filter((f) => f.tipo === 'filtro_relatorio');
      const filtrosPagina  = p.filtros.filter((f) => f.tipo !== 'filtro_relatorio');

      if (filtrosGlobais.length > 0) {
        add('#### 🌐 Filtros de Relatório (todas as páginas)', '');
        add('| Filtro | Campo | Descrição |', '|---|---|---|');
        filtrosGlobais.forEach((f) => add(`| ${f.nome} | \`${f.campo}\` | ${cell(f.descricao)} |`));
        add('');
      }

      if (p.visuais.length > 0) {
        add(`#### Visuais (${p.visuais.length})`, '');
        p.visuais.forEach((v) => {
          add(anchorTag(anchorVisual(v)));
          const tipoLabel = v.tipo === 'outro' && v.tipo_outro ? v.tipo_outro : prettify(v.tipo);

          add(`##### ${v.nome}`, '');
          add(`**Tipo:** ${tipoLabel}`, '');
          if (v.objetivo)  add(`**Objetivo:** ${v.objetivo}`, '');
          if (v.descricao) add('', v.descricao, '');
          if (v.captura?.caminho) add('', `![${v.nome}](${v.captura.caminho})`, '');

          if (v.kpis_ids.length > 0)    add('', `**KPIs:** ${v.kpis_ids.map(kpiLink).join(', ')}`);
          if (v.medidas_ids.length > 0) add('', `**Medidas:** ${v.medidas_ids.map(medidaLink).join(', ')}`);
          if (v.tabelas_ids.length > 0) add('', `**Tabelas:** ${v.tabelas_ids.map(queryLink).join(', ')}`);
          if (v.campos.length > 0)      add('', `**Campos:** ${v.campos.map((c) => `\`${c}\``).join(', ')}`);
          if (v.observacoes)            add('', `**Observações:** ${v.observacoes}`);
          add('');
        });
      }

      if (filtrosPagina.length > 0) {
        add(`#### Filtros de Página (${filtrosPagina.length})`, '');
        add('| Filtro | Tipo | Campo | Descrição |', '|---|---|---|---|');
        filtrosPagina.forEach((f) => add(`| ${f.nome} | ${prettify(f.tipo)} | \`${f.campo}\` | ${cell(f.descricao)} |`));
        add('');
      }
    });
  }

  // ════════════════════════════════════════════════════════════════════
  // Glossário (ordenado alfabeticamente)
  // ════════════════════════════════════════════════════════════════════

  if (glossario.length > 0) {
    add('---', '');
    add(anchorTag('glossario'));
    add(`## 📖 Glossário (${glossario.length})`, '');
    [...glossario]
      .sort((a, b) => a.termo.localeCompare(b.termo, 'pt-BR'))
      .forEach((g) => add(`**${g.termo}:** ${g.definicao}`, ''));
  }

  // ════════════════════════════════════════════════════════════════════
  // Rodapé
  // ════════════════════════════════════════════════════════════════════

  add('---', '');
  add(`*Documentado por: ${metadados.documentado_por || 'BI Documentation Studio'}*  `);
  add(`*Última revisão: ${new Date(metadados.ultima_revisao).toLocaleDateString('pt-BR')}*`);

  return L.join('\n');
}