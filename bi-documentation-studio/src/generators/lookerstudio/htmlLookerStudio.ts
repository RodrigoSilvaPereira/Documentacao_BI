import type { Documentacao } from '@models/schema';
import type {
  LookerStudioData, BigQuerySource, LSDataSource,
  LSCombinacao, LSParametro, LSMetric, LSPage, LSComponent,
} from '@models/schema.lookerstudio';
import {
  LABELS_TIPO_COMPONENTE_LS, LABELS_TIPO_CONECTOR_LS, LABELS_TIPO_JOIN,
} from '@models/schema.lookerstudio';
import { GENERATOR_CSS, GENERATOR_JS } from '@generators/htmlGenerator';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function esc(s: string | null | undefined): string {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escNl(s: string | null | undefined): string {
  return esc(s).replace(/\n/g, '<br>');
}
function badge(text: string, cls = 'bd-slate'): string {
  return `<span class="badge ${cls}">${text}</span>`;
}
function codeBlock(code: string, lang = ''): string {
  return `<pre><code class="lang-${lang}">${esc(code)}</code></pre>`;
}
function collapsible(summary: string, content: string): string {
  return `<details class="collapsible" open><summary>${summary}</summary>${content}</details>`;
}
function imgSrc(caminho: string, imageMap?: Map<string, string>): string {
  return esc(imageMap?.get(caminho) ?? caminho);
}
function prettify(value?: string | null): string {
  if (!value) return '—';
  const s = value.replace(/_/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// CSS override — tema verde para Looker Studio
const LS_THEME_OVERRIDE = `
<style>
  :root {
    --pri:#16a34a;--pri-dark:#15803d;--pri-light:#f0fdf4;--pri-border:#bbf7d0;
    --sb-bg:#052e16;--sb-border:#14532d;
  }
  .s-n{background:#14532d;color:#86efac}
  .sl.active{color:#86efac;border-left-color:#16a34a;background:#0b3d1e}
  .sec-h{border-bottom-color:#bbf7d0}
  .sec-count{background:#f0fdf4;color:#16a34a}
</style>`;

// ─── Sidebar LS ───────────────────────────────────────────────────────────────

function buildSidebarLS(doc: Documentacao, lsData: LookerStudioData): string {
  const { bigquery_sources, fontes_dados, combinacoes, parametros, metricas, paginas, componentes, dashboard } = lsData;
  const { glossario } = doc;
  const paginasOrdenadas = [...paginas].sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));

  const bqLinks = bigquery_sources.map((b) =>
    `<a class="sl sl-sub" href="#bq-${b.id.slice(0,8)}">${esc(b.nome)}</a>`).join('');
  const fonteLinks = fontes_dados.map((f) =>
    `<a class="sl sl-sub" href="#fonte-${f.id.slice(0,8)}">${esc(f.nome)}</a>`).join('');
  const combLinks = combinacoes.map((c) =>
    `<a class="sl sl-sub" href="#comb-${c.id.slice(0,8)}">${esc(c.nome)}</a>`).join('');
  const paramLinks = parametros.map((p) =>
    `<a class="sl sl-sub" href="#param-${p.id.slice(0,8)}"><code>${esc(p.nome)}</code></a>`).join('');
  const metricaLinks = metricas.map((m) =>
    `<a class="sl sl-sub" href="#metrica-${m.id.slice(0,8)}">${esc(m.nome)}</a>`).join('');
  const paginaLinks = paginasOrdenadas.map((p) => {
    const comps = componentes.filter((c) => c.pagina_id === p.id);
    const compLinks = comps.map((c) =>
      `<a class="sl sl-sub" style="padding-left:3rem;font-size:.7rem" href="#comp-${c.id.slice(0,8)}">${esc(c.nome)}</a>`).join('');
    return `<a class="sl sl-sub" href="#pag-${p.id.slice(0,8)}">${p.ordem != null ? `${p.ordem}. ` : ''}${esc(p.titulo)}</a>${compLinks}`;
  }).join('');

  return `<nav id="sb">
  <div class="s-logo">
    <div class="s-logo-icon" style="background:#16a34a">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5" height="6" rx="1" fill="white"/>
        <rect x="9" y="2" width="5" height="3" rx="1" fill="white"/>
        <rect x="9" y="7" width="5" height="7" rx="1" fill="white"/>
        <rect x="2" y="10" width="5" height="4" rx="1" fill="white"/>
      </svg>
    </div>
    <div>
      <div class="s-logo-text">${esc(dashboard.nome || doc.projeto.titulo_relatorio || 'Looker Studio')}</div>
      <div class="s-logo-sub">BI Documentation Studio · Looker Studio</div>
    </div>
  </div>

  <a class="sl sl-top" href="#sec-projeto">📋 Projeto</a>
  <a class="sl sl-top" href="#sec-dashboard">📊 Dashboard</a>

  ${bigquery_sources.length ? `<details class="sx" open>
    <summary>☁️ BigQuery <span class="s-n">${bigquery_sources.length}</span></summary>
    ${bqLinks}
  </details>` : ''}

  ${fontes_dados.length ? `<details class="sx">
    <summary>🗄️ Fontes de Dados <span class="s-n">${fontes_dados.length}</span></summary>
    ${fonteLinks}
  </details>` : ''}

  ${combinacoes.length ? `<details class="sx">
    <summary>🔗 Combinações <span class="s-n">${combinacoes.length}</span></summary>
    ${combLinks}
  </details>` : ''}

  ${parametros.length ? `<details class="sx">
    <summary>⚙️ Parâmetros <span class="s-n">${parametros.length}</span></summary>
    ${paramLinks}
  </details>` : ''}

  ${metricas.length ? `<details class="sx">
    <summary>📐 Métricas <span class="s-n">${metricas.length}</span></summary>
    ${metricaLinks}
  </details>` : ''}

  ${paginas.length ? `<details class="sx">
    <summary>📄 Páginas <span class="s-n">${paginas.length}</span></summary>
    ${paginaLinks}
  </details>` : ''}

  ${glossario.length ? `<a class="sl sl-top" href="#sec-glossario">📖 Glossário</a>` : ''}
</nav>`;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function buildStatsLS(doc: Documentacao, lsData: LookerStudioData): string {
  const { glossario } = doc;
  const items = [
    { l: 'BigQuery', n: lsData.bigquery_sources.length },
    { l: 'Fontes',   n: lsData.fontes_dados.length     },
    { l: 'Combinações',n: lsData.combinacoes.length    },
    { l: 'Parâmetros', n: lsData.parametros.length     },
    { l: 'Métricas', n: lsData.metricas.length          },
    { l: 'Páginas',  n: lsData.paginas.length           },
    { l: 'Componentes',n: lsData.componentes.length     },
    { l: 'Glossário',n: glossario.length                 },
  ];
  return `<div class="stats">
  ${items.map((i) => `<div class="stat"><div class="stat-n">${i.n}</div><div class="stat-l">${i.l}</div></div>`).join('')}
</div>`;
}

// ─── Projeto ──────────────────────────────────────────────────────────────────

function buildProjetoLS(doc: Documentacao): string {
  const p = doc.projeto;
  const rows = [
    ['Área / Departamento', p.area_departamento],
    ['Responsável',         p.responsavel],
    ['Data de Criação',     p.data_criacao],
    ['Última Atualização',  p.ultima_atualizacao],
  ].filter(([, v]) => v);

  return `<section id="sec-projeto">
  <h2 class="sec-h">📋 Projeto</h2>
  <div class="card">
    ${rows.length ? `<table class="it">${rows.map(([l, v]) => `<tr><td class="l">${l}</td><td>${esc(v)}</td></tr>`).join('')}</table>` : ''}
    ${p.objetivo        ? `<hr class="sep"><p><strong>Objetivo</strong></p><p>${escNl(p.objetivo)}</p>` : ''}
    ${p.descricao_geral ? `<p class="mt"><strong>Descrição Geral</strong></p><p>${escNl(p.descricao_geral)}</p>` : ''}
    ${p.observacoes_gerais ? `<p class="mt"><strong>Observações Gerais</strong></p><p>${escNl(p.observacoes_gerais)}</p>` : ''}
    ${p.melhorias_futuras?.length ? `
    <div style="margin-top:1.25rem;padding:1rem 1.25rem;background:#f0fdf4;border:1px solid #bbf7d0;border-left:3px solid #16a34a;border-radius:0 8px 8px 0">
      <p style="font-weight:700;color:#15803d;margin-bottom:.5rem">💡 Possíveis Melhorias / Atualizações Futuras</p>
      <ul class="rl">${p.melhorias_futuras.map((m) => `<li>${escNl(m)}</li>`).join('')}</ul>
    </div>` : ''}
  </div>
</section>`;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function buildDashboardLS(lsData: LookerStudioData): string {
  const db  = lsData.dashboard;
  const seg = lsData.seguranca;

  const rows = [
    ['Status',              prettify(db.status)],
    ['Versão',              db.versao],
    ['Ambiente',            db.ambiente],
    ['Área de Negócio',     db.area_negocio],
    ['Proprietário',        db.proprietario],
    ['Responsável Técnico', db.responsavel_tecnico],
    ['Data de Criação',     db.data_criacao],
    ['Última Atualização',  db.data_ultima_atualizacao],
    ['Nível de Acesso',     prettify(db.nivel_acesso)],
    ['Template Visual',     db.template_visual],
  ].filter(([, v]) => v);

  return `<section id="sec-dashboard">
  <h2 class="sec-h">📊 Dashboard</h2>
  <div class="mc" style="border-left:3px solid #16a34a">
    ${db.link_relatorio ? `<p style="margin-bottom:.75rem">🔗 <a href="${esc(db.link_relatorio)}" target="_blank" style="color:#16a34a">${esc(db.link_relatorio)}</a></p>` : ''}
    ${rows.length ? `<table class="it">${rows.map(([l, v]) => `<tr><td class="l">${l}</td><td>${esc(v ?? '')}</td></tr>`).join('')}</table>` : ''}
    ${db.objetivo ? `<p class="mt"><strong>Objetivo</strong></p><p>${escNl(db.objetivo)}</p>` : ''}
    ${db.descricao ? `<p class="mt"><strong>Descrição</strong></p><p>${escNl(db.descricao)}</p>` : ''}
    ${db.responsaveis_funcionais?.length ? `<p class="mt"><strong>Responsáveis Funcionais</strong></p><ul class="rl">${db.responsaveis_funcionais.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
    ${db.observacoes_gerais ? `<p class="mt"><strong>Observações Gerais</strong></p><p>${escNl(db.observacoes_gerais)}</p>` : ''}
  </div>
  ${seg ? `
  <h3 style="margin-top:1.5rem;font-size:.9rem;font-weight:700;color:var(--tx);display:flex;align-items:center;gap:.5rem">
    🔒 Segurança e Acesso
  </h3>
  <div class="mc" style="margin-top:.75rem">
    <table class="it">
      ${seg.nivel_permissao ? `<tr><td class="l">Permissão padrão</td><td>${prettify(seg.nivel_permissao)}</td></tr>` : ''}
      ${seg.tipo_credencial ? `<tr><td class="l">Tipo de credencial</td><td>${prettify(seg.tipo_credencial)}</td></tr>` : ''}
      ${seg.proprietario_relatorio ? `<tr><td class="l">Proprietário</td><td>${esc(seg.proprietario_relatorio)}</td></tr>` : ''}
      ${seg.escopo_por_area ? `<tr><td class="l">Escopo por área</td><td>${esc(seg.escopo_por_area)}</td></tr>` : ''}
    </table>
    ${seg.grupos_acesso.length ? `<p class="mt"><strong>Grupos com acesso:</strong></p><ul class="rl">${seg.grupos_acesso.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>` : ''}
    ${seg.dados_sensiveis_apresentados.length ? `<p class="mt"><strong>Dados sensíveis apresentados:</strong></p><ul class="rl">${seg.dados_sensiveis_apresentados.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
    ${seg.restricoes ? `<p class="mt"><strong>Restrições:</strong> ${escNl(seg.restricoes)}</p>` : ''}
    ${seg.politica_compartilhamento ? `<p class="mt"><strong>Política de compartilhamento:</strong> ${escNl(seg.politica_compartilhamento)}</p>` : ''}
  </div>` : ''}
</section>`;
}

// ─── BigQuery ─────────────────────────────────────────────────────────────────

function buildBigQueryLS(lsData: LookerStudioData, imageMap?: Map<string, string>): string {
  if (!lsData.bigquery_sources.length) return '';

  const cards = lsData.bigquery_sources.map((b) => {
    const metricas  = b.colunas.filter((c) => c.eh_metrica).length;
    const dimensoes = b.colunas.filter((c) => c.eh_dimensao).length;

    return `<div class="qc" id="bq-${b.id.slice(0,8)}">
  <div class="qc-head">
    <div class="qc-name">${esc(b.projeto_gcp)}<span style="color:#94a3b8">.</span>${esc(b.dataset)}<span style="color:#94a3b8">.</span>${esc(b.nome)}</div>
    ${badge(prettify(b.tipo), 'bd-blue')}
  </div>
  <div class="qc-body">
    ${b.descricao ? `<p>${escNl(b.descricao)}</p>` : ''}
    <table class="it mt">
      ${b.responsavel ? `<tr><td class="l">Responsável</td><td>${esc(b.responsavel)}</td></tr>` : ''}
      ${b.dominio_negocio ? `<tr><td class="l">Domínio</td><td>${esc(b.dominio_negocio)}</td></tr>` : ''}
      ${b.granularidade ? `<tr><td class="l">Granularidade</td><td>${esc(b.granularidade)}</td></tr>` : ''}
      ${b.frequencia_atualizacao ? `<tr><td class="l">Atualização</td><td>${esc(b.frequencia_atualizacao)}</td></tr>` : ''}
      ${b.volume_estimado ? `<tr><td class="l">Volume</td><td>${esc(b.volume_estimado)}</td></tr>` : ''}
      ${b.particionamento ? `<tr><td class="l">Particionamento</td><td>${esc(b.particionamento)}</td></tr>` : ''}
      ${b.clusterizacao ? `<tr><td class="l">Clusterização</td><td>${esc(b.clusterizacao)}</td></tr>` : ''}
    </table>
    ${b.sql_query ? collapsible('📄 Ver SQL / código', codeBlock(b.sql_query, 'sql')) : ''}
    ${b.colunas.length ? `
    <p class="mt"><strong>Colunas (${b.colunas.length}):</strong></p>
    <table class="dt">
      <thead><tr><th>Coluna</th><th>Tipo</th><th>M</th><th>D</th><th>Descrição</th></tr></thead>
      <tbody>${b.colunas.map((c) => `<tr>
        <td><code>${esc(c.nome)}</code>${c.calculada ? ' <span style="color:#7c3aed;font-size:.65rem;font-weight:700">CALC</span>' : ''}</td>
        <td><code style="font-size:.7rem;background:#f1f5f9;color:#1e293b;padding:.1rem .3rem;border-radius:3px">${esc(c.tipo)}</code></td>
        <td style="text-align:center">${c.eh_metrica ? '✅' : ''}</td>
        <td style="text-align:center">${c.eh_dimensao ? '✅' : ''}</td>
        <td>${escNl(c.descricao)}</td>
      </tr>`).join('')}</tbody>
    </table>` : ''}
    ${b.observacoes ? `<p class="mt"><strong>Observações:</strong> ${escNl(b.observacoes)}</p>` : ''}
    ${(metricas > 0 || dimensoes > 0) ? `<div class="fw mt">
      ${metricas > 0  ? badge(`${metricas} Métricas`, 'bd-blue') : ''}
      ${dimensoes > 0 ? badge(`${dimensoes} Dimensões`, 'bd-green') : ''}
    </div>` : ''}
  </div>
</div>`;
  }).join('');

  return `<section id="sec-bigquery">
  <h2 class="sec-h">☁️ BigQuery <span class="sec-count">${lsData.bigquery_sources.length}</span></h2>
  ${cards}
</section>`;
}

// ─── Fontes de Dados ──────────────────────────────────────────────────────────

function buildFontesLS(lsData: LookerStudioData): string {
  if (!lsData.fontes_dados.length) return '';

  const bqById = new Map(lsData.bigquery_sources.map((b) => [b.id, b]));

  const cards = lsData.fontes_dados.map((f) => {
    const conector = f.tipo_conector === 'outro' && f.tipo_conector_outro
      ? esc(f.tipo_conector_outro)
      : esc(LABELS_TIPO_CONECTOR_LS[f.tipo_conector] ?? f.tipo_conector);

    const bqSource = f.bigquery_source_id ? bqById.get(f.bigquery_source_id) : null;
    const calculados = f.campos.filter((c) => c.calculado).length;

    return `<div class="mc" id="fonte-${f.id.slice(0,8)}">
  <div class="mc-name">${esc(f.nome)}</div>
  <div class="mc-table">${badge(conector, 'bd-slate')}</div>
  ${f.descricao ? `<p>${escNl(f.descricao)}</p>` : ''}
  ${bqSource ? `<p class="mt-sm"><strong>Objeto BigQuery:</strong> <code>${esc(bqSource.projeto_gcp)}.${esc(bqSource.dataset)}.${esc(bqSource.nome)}</code></p>` : ''}
  ${f.proprietario_credencial ? `<p class="mt-sm"><strong>Credencial:</strong> ${esc(f.proprietario_credencial)}</p>` : ''}
  ${f.tipo_credencial ? `<p class="mt-sm"><strong>Tipo:</strong> ${prettify(f.tipo_credencial)}</p>` : ''}
  ${f.frequencia_atualizacao ? `<p class="mt-sm"><strong>Atualização:</strong> ${esc(f.frequencia_atualizacao)}</p>` : ''}
  ${f.campos.length ? `
  <p class="mt"><strong>Campos (${f.campos.length}):</strong></p>
  <table class="dt">
    <thead><tr><th>Campo</th><th>Tipo</th><th>Calc.</th><th>Descrição</th></tr></thead>
    <tbody>${f.campos.map((c) => `<tr>
      <td><code>${esc(c.nome)}</code>${c.nome_original && c.nome_original !== c.nome ? `<br><span style="font-size:.65rem;color:#94a3b8">← ${esc(c.nome_original)}</span>` : ''}</td>
      <td>${badge(prettify(c.tipo), c.tipo === 'metrica' ? 'bd-blue' : c.tipo === 'dimensao' ? 'bd-green' : 'bd-slate')}</td>
      <td style="text-align:center">${c.calculado ? '⚡' : ''}</td>
      <td>${escNl(c.descricao ?? '')}</td>
    </tr>`).join('')}</tbody>
  </table>` : ''}
  ${calculados > 0 ? `<div class="ref-list mt">${badge(`${calculados} campos calculados`, 'bd-purple')}</div>` : ''}
  ${f.observacoes ? `<p class="mt"><strong>Observações:</strong> ${escNl(f.observacoes)}</p>` : ''}
</div>`;
  }).join('');

  return `<section id="sec-fontes">
  <h2 class="sec-h">🗄️ Fontes de Dados <span class="sec-count">${lsData.fontes_dados.length}</span></h2>
  ${cards}
</section>`;
}

// ─── Combinações ──────────────────────────────────────────────────────────────

function buildCombinacoesLS(lsData: LookerStudioData): string {
  if (!lsData.combinacoes.length) return '';

  const fonteById = new Map([
    ...lsData.fontes_dados.map((f) => [f.id, f.nome] as [string, string]),
    ...lsData.combinacoes.map((c) => [c.id, c.nome]  as [string, string]),
  ]);

  const cards = lsData.combinacoes.map((c) => {
    const nomeFontes = c.fontes
      .map((f) => fonteById.get(f.fonte_dados_id) ?? f.fonte_dados_id)
      .join(' + ');

    return `<div class="mc" id="comb-${c.id.slice(0,8)}">
  <div class="mc-name">${esc(c.nome)}</div>
  <div class="mc-table">${badge(LABELS_TIPO_JOIN[c.tipo_join], 'bd-purple')} <span style="font-size:.75rem;color:#64748b;margin-left:.5rem">${esc(nomeFontes)}</span></div>
  ${c.descricao ? `<p>${escNl(c.descricao)}</p>` : ''}
  ${c.fontes.length ? `
  <p class="mt"><strong>Fontes utilizadas:</strong></p>
  <ul class="rl">${c.fontes.map((f) => {
    const nome   = fonteById.get(f.fonte_dados_id) ?? f.fonte_dados_id;
    const campos = f.campos_usados.length > 0 ? ` <span style="color:#94a3b8;font-size:.75rem">(${f.campos_usados.join(', ')})</span>` : '';
    return `<li>${esc(nome)}${campos}</li>`;
  }).join('')}</ul>` : ''}
  ${c.chaves_join.length ? `
  <p class="mt"><strong>Chaves de join:</strong></p>
  <table class="dt">
    <thead><tr><th>Campo Fonte A</th><th>Campo Fonte B</th></tr></thead>
    <tbody>${c.chaves_join.map((k) => `<tr><td><code>${esc(k.campo_fonte_a)}</code></td><td><code>${esc(k.campo_fonte_b)}</code></td></tr>`).join('')}</tbody>
  </table>` : ''}
  ${c.campos_resultantes.length ? `
  <p class="mt"><strong>Campos resultantes:</strong></p>
  <div class="ref-list">${c.campos_resultantes.map((cf) => badge(cf.nome, cf.tipo === 'metrica' ? 'bd-blue' : 'bd-green')).join('')}</div>` : ''}
  ${c.observacoes ? `<p class="mt"><strong>Observações:</strong> ${escNl(c.observacoes)}</p>` : ''}
</div>`;
  }).join('');

  return `<section id="sec-combinacoes">
  <h2 class="sec-h">🔗 Combinações de Dados <span class="sec-count">${lsData.combinacoes.length}</span></h2>
  ${cards}
</section>`;
}

// ─── Parâmetros ───────────────────────────────────────────────────────────────

function buildParametrosLS(lsData: LookerStudioData): string {
  if (!lsData.parametros.length) return '';

  const cards = lsData.parametros.map((p) => `<div class="mc" id="param-${p.id.slice(0,8)}">
  <div class="mc-name"><code>${esc(p.nome)}</code></div>
  <div class="mc-table">
    ${badge(prettify(p.tipo), p.tipo === 'numero' ? 'bd-blue' : p.tipo === 'booleano' ? 'bd-green' : 'bd-slate')}
    ${p.visivel_viewer ? badge('Visível ao visualizador', 'bd-green') : ''}
    ${p.valor_padrao ? `<span style="font-size:.75rem;color:#64748b;margin-left:.5rem">Padrão: <code>${esc(p.valor_padrao)}</code></span>` : ''}
  </div>
  ${p.descricao ? `<p>${escNl(p.descricao)}</p>` : ''}
  ${p.usado_em.length ? `<p class="mt-sm"><strong>Utilizado em:</strong></p><ul class="rl">${p.usado_em.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>` : ''}
  ${p.observacoes ? `<p class="mt"><strong>Observações:</strong> ${escNl(p.observacoes)}</p>` : ''}
</div>`).join('');

  return `<section id="sec-parametros">
  <h2 class="sec-h">⚙️ Parâmetros <span class="sec-count">${lsData.parametros.length}</span></h2>
  ${cards}
</section>`;
}

// ─── Métricas ─────────────────────────────────────────────────────────────────

function buildMetricasLS(lsData: LookerStudioData): string {
  if (!lsData.metricas.length) return '';

  const fonteById = new Map([
    ...lsData.fontes_dados.map((f) => [f.id, f.nome] as [string, string]),
    ...lsData.combinacoes.map((c) => [c.id, c.nome]  as [string, string]),
  ]);

  const cards = lsData.metricas.map((m) => {
    const fonteNome = m.fonte_dados_id ? (fonteById.get(m.fonte_dados_id) ?? m.fonte_dados_id) : null;
    const formulaPreview = m.formula?.split('\n').find((l) => l.trim() !== '') ?? '';
    const temEscopo = m.o_que_entra || m.o_que_nao_entra || m.excecoes;

    return `<div class="mc" id="metrica-${m.id.slice(0,8)}">
  <div class="mc-name">${esc(m.nome)}</div>
  ${(fonteNome || m.campo_origem) ? `<div class="mc-table" style="font-family:monospace;font-size:.75rem">${fonteNome ? esc(fonteNome) : ''}${fonteNome && m.campo_origem ? '<span style="color:#94a3b8"> › </span>' : ''}${m.campo_origem ? esc(m.campo_origem) : ''}</div>` : ''}
  ${m.descricao ? `<p>${escNl(m.descricao)}</p>` : ''}
  ${formulaPreview ? collapsible('📐 Ver fórmula', codeBlock(m.formula!, 'sql')) : ''}
  ${(m.unidade || m.formato || m.granularidade || m.responsavel_validacao) ? `
  <table class="it mt">
    ${m.unidade ? `<tr><td class="l">Unidade</td><td>${esc(m.unidade)}</td></tr>` : ''}
    ${m.formato ? `<tr><td class="l">Formato</td><td>${esc(m.formato)}</td></tr>` : ''}
    ${m.granularidade ? `<tr><td class="l">Granularidade</td><td>${esc(m.granularidade)}</td></tr>` : ''}
    ${m.responsavel_validacao ? `<tr><td class="l">Responsável</td><td>${esc(m.responsavel_validacao)}</td></tr>` : ''}
  </table>` : ''}
  ${temEscopo ? `<div class="mt-sm">
    ${m.o_que_entra    ? `<div class="scope scope-in"><span class="sc-lbl">✅ O que entra:</span>${escNl(m.o_que_entra)}</div>` : ''}
    ${m.o_que_nao_entra ? `<div class="scope scope-out"><span class="sc-lbl">❌ O que não entra:</span>${escNl(m.o_que_nao_entra)}</div>` : ''}
    ${m.excecoes ? `<div class="scope scope-exc"><span class="sc-lbl">⚠️ Exceções:</span>${escNl(m.excecoes)}</div>` : ''}
  </div>` : ''}
  ${m.regras_temporais ? `<p class="mt"><strong>Regras Temporais:</strong> ${escNl(m.regras_temporais)}</p>` : ''}
  ${m.regra_negocio ? `<p class="mt"><strong>Regra de Negócio:</strong> ${escNl(m.regra_negocio)}</p>` : ''}
  ${m.limitacoes_conhecidas ? `<p class="mt"><strong>Limitações:</strong> ${escNl(m.limitacoes_conhecidas)}</p>` : ''}
  ${m.observacoes ? `<p class="mt"><strong>Observações:</strong> ${escNl(m.observacoes)}</p>` : ''}
</div>`;
  }).join('');

  return `<section id="sec-metricas">
  <h2 class="sec-h">📐 Métricas <span class="sec-count">${lsData.metricas.length}</span></h2>
  ${cards}
</section>`;
}

// ─── Páginas e Componentes ────────────────────────────────────────────────────

function buildPaginasComponentesLS(lsData: LookerStudioData, imageMap?: Map<string, string>): string {
  if (!lsData.paginas.length && !lsData.componentes.length) return '';

  const paginasOrdenadas = [...lsData.paginas].sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));

  const fonteById = new Map([
    ...lsData.fontes_dados.map((f) => [f.id, f.nome] as [string, string]),
    ...lsData.combinacoes.map((c) => [c.id, c.nome]  as [string, string]),
  ]);

  const renderComponente = (c: LSComponent) => {
    const tipoLabel = c.tipo === 'outro' && c.tipo_outro
      ? esc(c.tipo_outro)
      : esc(LABELS_TIPO_COMPONENTE_LS[c.tipo] ?? c.tipo);

    const fontesNomes = c.fontes_dados_ids
      .map((id) => fonteById.get(id) ?? id)
      .map((n) => badge(n, 'bd-slate')).join('');

    const cSrc = c.captura?.caminho ? imgSrc(c.captura.caminho, imageMap) : null;

    return `<div class="vc" id="comp-${c.id.slice(0,8)}">
  <div class="vc-name">${esc(c.nome)} ${badge(tipoLabel, 'bd-slate')}${c.titulo_exibido ? `<span style="font-size:.7rem;color:#94a3b8;font-style:italic">"${esc(c.titulo_exibido)}"</span>` : ''}</div>
  ${c.objetivo  ? `<p><strong>Objetivo:</strong> ${esc(c.objetivo)}</p>` : ''}
  ${c.descricao ? `<p>${escNl(c.descricao)}</p>` : ''}
  ${cSrc ? `<img class="vs-img" src="${cSrc}" alt="${esc(c.nome)}" loading="lazy">` : ''}
  ${fontesNomes ? `<p class="mt-sm"><strong>Fontes:</strong></p><div class="ref-list">${fontesNomes}</div>` : ''}
  ${c.dimensoes.length ? `<p class="mt-sm"><strong>Dimensões:</strong></p><div class="fw">${c.dimensoes.map((d) => `<code>${esc(d)}</code>`).join('')}</div>` : ''}
  ${c.metricas.length  ? `<p class="mt-sm"><strong>Métricas:</strong></p><div class="fw">${c.metricas.map((m) => badge(m, 'bd-blue')).join('')}</div>` : ''}
  ${c.campos_calculados.length ? `<p class="mt-sm"><strong>Campos calculados:</strong></p><div class="ref-list">${c.campos_calculados.map((cc) => badge(`⚡ ${cc.nome}`, 'bd-purple')).join('')}</div>` : ''}
  ${c.filtros_aplicados.length ? `<p class="mt-sm"><strong>Filtros:</strong></p><ul class="rl">${c.filtros_aplicados.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
  ${(c.ordenacao || c.formato_numerico || c.periodo_comparacao) ? `<table class="it mt">
    ${c.ordenacao ? `<tr><td class="l">Ordenação</td><td>${esc(c.ordenacao)}</td></tr>` : ''}
    ${c.formato_numerico ? `<tr><td class="l">Formato</td><td>${esc(c.formato_numerico)}</td></tr>` : ''}
    ${c.periodo_comparacao ? `<tr><td class="l">Comparação</td><td>${esc(c.periodo_comparacao)}</td></tr>` : ''}
  </table>` : ''}
  ${c.comportamento_esperado ? `<p class="mt"><strong>Comportamento esperado:</strong> ${escNl(c.comportamento_esperado)}</p>` : ''}
  ${c.observacoes ? `<p class="mt"><strong>Observações:</strong> ${escNl(c.observacoes)}</p>` : ''}
</div>`;
  };

  const paginasHtml = paginasOrdenadas.map((p) => {
    const pSrc     = p.captura?.caminho ? imgSrc(p.captura.caminho, imageMap) : null;
    const comps    = lsData.componentes.filter((c) => c.pagina_id === p.id);
    const prefixo  = p.ordem != null ? `${p.ordem}. ` : '';

    return `<div class="pagina" id="pag-${p.id.slice(0,8)}">
  <div class="pag-head">
    <div class="pag-title">📄 ${esc(prefixo + p.titulo)}</div>
    ${p.objetivo ? `<p style="font-size:.825rem;color:var(--tx-m);margin-top:.375rem">${esc(p.objetivo)}</p>` : ''}
  </div>
  <div class="pag-body">
    ${p.descricao ? `<p>${escNl(p.descricao)}</p>` : ''}
    ${pSrc ? `<img class="pg-img" src="${pSrc}" alt="${esc(p.titulo)}" loading="lazy">` : ''}
    ${p.filtros_globais.length ? `<p class="mt"><strong>Filtros globais:</strong></p><ul class="rl">${p.filtros_globais.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
    ${comps.length ? `<p class="mt"><strong>Componentes (${comps.length}):</strong></p>${comps.map(renderComponente).join('')}` : ''}
  </div>
</div>`;
  }).join('');

  const semPagina = lsData.componentes.filter((c) => !c.pagina_id);
  const semPaginaHtml = semPagina.length ? `
<div style="margin-top:2rem">
  <h3 style="font-size:.95rem;font-weight:700;color:#64748b;margin-bottom:1rem">Componentes sem página associada</h3>
  ${semPagina.map(renderComponente).join('')}
</div>` : '';

  return `<section id="sec-paginas">
  <h2 class="sec-h">📄 Páginas e Componentes <span class="sec-count">${lsData.paginas.length} páginas · ${lsData.componentes.length} componentes</span></h2>
  ${paginasHtml}
  ${semPaginaHtml}
</section>`;
}

// ─── Glossário ────────────────────────────────────────────────────────────────

function buildGlossarioLS(doc: Documentacao): string {
  if (!doc.glossario.length) return '';
  const sorted = [...doc.glossario].sort((a, b) => a.termo.localeCompare(b.termo, 'pt-BR'));
  return `<section id="sec-glossario">
  <h2 class="sec-h">📖 Glossário <span class="sec-count">${doc.glossario.length}</span></h2>
  <div class="card">
    ${sorted.map((g) => `<div class="gi"><span class="gt">${esc(g.termo)}:</span> <span class="gd">${escNl(g.definicao)}</span></div>`).join('')}
  </div>
</section>`;
}

// ─── Gerador principal ────────────────────────────────────────────────────────

export function gerarHtmlLookerStudio(
  doc:       Documentacao,
  lsData:    LookerStudioData,
  imageMap?: Map<string, string>,
): string {
  const titulo     = lsData.dashboard.nome || doc.projeto.titulo_relatorio || 'Dashboard Looker Studio';
  const dataExport = new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' });

  const content = [
    `<div class="doc-header">
      <h1 class="doc-title">${esc(titulo)}</h1>
      <p class="doc-meta">Documentação técnica gerada por <strong>BI Documentation Studio</strong> · Looker Studio · ${dataExport}</p>
    </div>`,
    buildStatsLS(doc, lsData),
    buildProjetoLS(doc),
    buildDashboardLS(lsData),
    buildBigQueryLS(lsData, imageMap),
    buildFontesLS(lsData),
    buildCombinacoesLS(lsData),
    buildParametrosLS(lsData),
    buildMetricasLS(lsData),
    buildPaginasComponentesLS(lsData, imageMap),
    buildGlossarioLS(doc),
    `<footer>
      <p>Documentado por: <strong>${esc(doc.metadados.documentado_por || 'BI Documentation Studio')}</strong></p>
      <p>Última revisão: ${new Date(doc.metadados.ultima_revisao).toLocaleDateString('pt-BR', { dateStyle: 'long' })}</p>
      <p>Plataforma: Looker Studio</p>
    </footer>`,
  ].filter(Boolean).join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(titulo)} — Documentação BI</title>
  <style>${GENERATOR_CSS}</style>
  ${LS_THEME_OVERRIDE}
</head>
<body>
${buildSidebarLS(doc, lsData)}
<main id="content">
${content}
</main>
<button class="fab" onclick="window.print()" title="Exportar como PDF">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
  </svg>
  Imprimir / Exportar PDF
</button>
<script>${GENERATOR_JS}</script>
</body>
</html>`;
}