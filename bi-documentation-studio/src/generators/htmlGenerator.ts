import type { Documentacao, KPI, MedidaDAX, Query, Pagina } from '@models/schema';
import { LABELS_CARDINALIDADE, LABELS_DIRECAO, LABELS_FONTE_DADOS } from '@models/enums';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function esc(s: string | null | undefined): string {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escNl(s: string | null | undefined): string {
  return esc(s).replace(/\n/g, '<br>');
}

const TIPO_LABEL: Record<string, string> = {
  card: 'Cartão', kpi_nativo: 'KPI Nativo', gauge: 'Gauge', cartao: 'Cartão',
  tabela: 'Tabela', matriz: 'Matriz', barras: 'Barras', colunas: 'Colunas',
  barrasClusterizado: 'Barras Clusterizado', colunasClusterizado: 'Colunas Clusterizado',
  colunasAgrupadasLinha: 'Colunas + Linha Agrupada', linhas: 'Linhas', area: 'Área',
  treemap: 'Treemap', pizza: 'Pizza', rosca: 'Rosca', mapa: 'Mapa',
  slicer: 'Slicer', filtro_pagina: 'Filtro de Página',
  filtro_relatorio: 'Filtro de Relatório', filtro_visual: 'Filtro de Visual',
  outro: 'Outro',
};
function tipoLabel(tipo: string, outro?: string | null): string {
  if (tipo === 'outro' && outro) return esc(outro);
  if (TIPO_LABEL[tipo]) return TIPO_LABEL[tipo];
  return tipo.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')
             .replace(/^\w/, (c) => c.toUpperCase());
}

function badge(text: string, cls = 'bd-slate'): string {
  return `<span class="badge ${cls}">${text}</span>`;
}
function codeBlock(code: string, lang = ''): string {
  return `<pre><code class="lang-${lang}">${esc(code)}</code></pre>`;
}

// Fix 1: todos os blocos colapsáveis agora abrem com `open` por padrão.
// Isso garante que o conteúdo apareça na exportação para PDF via impressão do browser.
function collapsible(summary: string, content: string): string {
  return `<details class="collapsible" open><summary>${summary}</summary>${content}</details>`;
}

// Resolve src de imagem: usa base64 do imageMap quando disponível,
// senão cai no caminho relativo (funciona em drive local).
function imgSrc(caminho: string, imageMap?: Map<string, string>): string {
  return esc(imageMap?.get(caminho) ?? caminho);
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
:root {
  --pri:#2563eb;--pri-dark:#1d4ed8;--pri-light:#eff6ff;--pri-border:#bfdbfe;
  --sb-bg:#0f172a;--sb-border:#1e293b;--sb-hover:rgba(255,255,255,.04);
  --tx:#1e293b;--tx-m:#64748b;--brd:#e2e8f0;--bg:#f8fafc;--card:#fff;
  --code-bg:#0f172a;--code-tx:#e2e8f0;
  --green:#16a34a;--red:#dc2626;--amber:#d97706;--purple:#7c3aed;
  --sw:262px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:.875rem;line-height:1.7;color:var(--tx);background:var(--bg)}

/* ── Sidebar ── */
#sb{position:fixed;top:0;left:0;width:var(--sw);height:100vh;background:var(--sb-bg);overflow-y:auto;overflow-x:hidden;z-index:100;border-right:1px solid var(--sb-border)}
#sb::-webkit-scrollbar{width:4px}
#sb::-webkit-scrollbar-thumb{background:#334155;border-radius:10px}
.s-logo{display:flex;align-items:center;gap:.65rem;padding:1.25rem;border-bottom:1px solid var(--sb-border)}
.s-logo-icon{width:30px;height:30px;background:var(--pri);border-radius:7px;flex-shrink:0;display:grid;place-items:center}
.s-logo-text{font-size:.75rem;font-weight:700;color:#e2e8f0;line-height:1.3}
.s-logo-sub{font-size:.6rem;color:#475569}
details.sx>summary{list-style:none;cursor:pointer;display:flex;align-items:center;padding:.35rem 1.25rem;font-size:.8rem;font-weight:600;color:#cbd5e1;user-select:none;transition:background .1s}
details.sx>summary:hover{background:var(--sb-hover)}
details.sx>summary::-webkit-details-marker{display:none}
details.sx>summary::after{content:'›';margin-left:auto;margin-right:.5rem;font-size:1rem;color:#475569;transition:transform .2s}
details.sx[open]>summary::after{transform:rotate(90deg)}
.s-n{font-size:.68rem;font-weight:700;background:#1e3a5f;color:#93c5fd;padding:.1rem .45rem;border-radius:10px;margin-left:auto;margin-right:.5rem}
.sl{display:block;padding:.3rem 1.25rem;font-size:.8rem;color:#64748b;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-left:2px solid transparent;transition:color .1s,background .1s}
.sl:hover{color:#94a3b8;background:var(--sb-hover)}
.sl.active{color:#93c5fd;border-left-color:var(--pri);background:#172033}
/* Fix 2: sl-top agora é flex para que .s-n com margin-left:auto funcione corretamente */
.sl-top{font-size:.8rem;font-weight:500;color:#94a3b8;padding:.3rem 1.25rem;display:flex;align-items:center;text-decoration:none;transition:color .1s}
.sl-top:hover{color:#e2e8f0}
.sl-sub{padding-left:2.25rem;font-size:.77rem}
.sl-sub-lbl{font-size:.63rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#334155;padding:.45rem 1.25rem .2rem 2rem}

/* ── Layout ── */
#content{margin-left:var(--sw);padding:2.5rem 3rem 5rem;max-width:calc(var(--sw) + 880px)}

/* ── FAB ── */
.fab{position:fixed;bottom:1.75rem;right:2rem;background:var(--pri);color:#fff;border:none;border-radius:50px;padding:.65rem 1.25rem;font-size:.8rem;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(37,99,235,.4);display:flex;align-items:center;gap:.5rem;z-index:200;transition:transform .15s,box-shadow .15s}
.fab:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(37,99,235,.5)}

/* ── Header ── */
.doc-header{margin-bottom:2.5rem}
.doc-title{font-size:1.75rem;font-weight:800;color:var(--tx);line-height:1.2}
.doc-meta{font-size:.78rem;color:var(--tx-m);margin-top:.375rem}

/* ── Stats ── */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem;margin-bottom:2.5rem}
.stat{background:var(--card);border:1px solid var(--brd);border-radius:10px;padding:1rem;text-align:center}
.stat-n{font-size:1.75rem;font-weight:800;color:var(--pri);line-height:1}
.stat-l{font-size:.63rem;text-transform:uppercase;letter-spacing:.07em;color:var(--tx-m);font-weight:600;margin-top:.4rem}

/* ── Sections ── */
section{margin-bottom:3rem}
.sec-h{display:flex;align-items:center;gap:.6rem;font-size:1.2rem;font-weight:700;color:var(--tx);padding-bottom:.875rem;border-bottom:2px solid var(--brd);margin-bottom:1.5rem}
.sec-count{font-size:.72rem;font-weight:700;background:var(--pri-light);color:var(--pri);padding:.15rem .5rem;border-radius:20px}

/* ── Info table ── */
.it{width:100%;font-size:.82rem}
.it td{padding:.4rem .25rem;vertical-align:top}
.it .l{font-weight:600;color:var(--tx-m);width:210px;padding-right:.875rem;white-space:nowrap}

/* ── Badge ── */
.badge{display:inline-flex;align-items:center;padding:.18rem .6rem;border-radius:20px;font-size:.68rem;font-weight:600;background:var(--bg);color:var(--tx-m);border:1px solid var(--brd);white-space:nowrap}
.bd-blue{background:#dbeafe;color:#1e40af;border-color:#bfdbfe}
.bd-green{background:#dcfce7;color:#166534;border-color:#bbf7d0}
.bd-red{background:#fee2e2;color:#991b1b;border-color:#fecaca}
.bd-amber{background:#fef3c7;color:#92400e;border-color:#fde68a}
.bd-purple{background:#f3e8ff;color:#6b21a8;border-color:#e9d5ff}
.bd-slate{background:#f1f5f9;color:#475569;border-color:#e2e8f0}

/* ── KPI Card ── */
.kc{background:var(--card);border:1px solid var(--brd);border-left:3px solid var(--pri);border-radius:12px;padding:1.5rem;margin-bottom:1.25rem}
.kc-name{font-size:1.05rem;font-weight:700;color:var(--tx);margin-bottom:.5rem;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.kc-formula{background:var(--bg);border:1px solid var(--brd);border-radius:8px;padding:.75rem 1rem;font-size:.8rem;font-style:italic;color:#334155;margin:.625rem 0}
.scope{border-radius:8px;padding:.6rem .875rem;font-size:.8rem;margin:.35rem 0;border-left:3px solid}
.scope-in{background:#f0fdf4;border-color:var(--green)}
.scope-out{background:#fef2f2;border-color:var(--red)}
.scope-exc{background:#fffbeb;border-color:var(--amber)}
.sc-lbl{font-weight:700;margin-right:.375rem}

/* ── Query Card ── */
.qc{background:var(--card);border:1px solid var(--brd);border-radius:12px;margin-bottom:.875rem;overflow:hidden}
.qc-head{padding:1rem 1.25rem;display:flex;align-items:center;gap:.75rem;border-bottom:1px solid var(--brd);background:var(--bg)}
.qc-name{font-size:.9rem;font-weight:700;font-family:'SF Mono',Consolas,monospace;color:var(--tx)}
.qc-body{padding:1.25rem}
.grp-lbl{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--tx-m);display:flex;align-items:center;gap:.75rem;margin:1.75rem 0 .875rem}
.grp-lbl::after{content:'';flex:1;height:1px;background:var(--brd)}

/* ── Code ── */
pre{background:var(--code-bg);color:var(--code-tx);border-radius:8px;padding:1rem 1.25rem;overflow-x:auto;font-size:.76rem;line-height:1.7;font-family:'SF Mono','Cascadia Code',Consolas,monospace;margin:.5rem 0}
code{font-family:'SF Mono',Consolas,monospace;font-size:.76rem;background:#f1f5f9;color:var(--pri);padding:.1rem .35rem;border-radius:4px}
pre code{background:none;color:inherit;padding:0}

/* ── Collapsible ── */
details.collapsible{border:1px solid var(--brd);border-radius:8px;margin:.5rem 0;overflow:hidden}
details.collapsible>summary{list-style:none;cursor:pointer;padding:.65rem 1rem;background:var(--bg);font-size:.775rem;font-weight:600;color:var(--tx-m);user-select:none;display:flex;align-items:center;gap:.5rem}
details.collapsible>summary::-webkit-details-marker{display:none}
details.collapsible>summary:hover{background:var(--brd)}
details.collapsible[open]>summary{border-bottom:1px solid var(--brd)}
details.collapsible pre{border-radius:0;margin:0}
details.collapsible .dc-body{padding:1rem}

/* ── Data Table ── */
.dt{width:100%;border-collapse:collapse;font-size:.8rem;margin:.75rem 0}
.dt th{background:var(--bg);padding:.5rem .875rem;text-align:left;font-size:.67rem;font-weight:700;color:var(--tx-m);text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--brd)}
.dt td{padding:.6rem .875rem;border-bottom:1px solid var(--brd);vertical-align:top}
.dt tr:last-child td{border-bottom:none}
.dt tr:hover td{background:#fafbfc}

/* ── Medida Card ── */
.mc{background:var(--card);border:1px solid var(--brd);border-radius:12px;padding:1.5rem;margin-bottom:.875rem}
.mc-name{font-family:'SF Mono',Consolas,monospace;font-size:.95rem;font-weight:700;color:var(--pri);margin-bottom:.2rem}
.mc-table{font-size:.75rem;color:var(--tx-m);margin-bottom:.5rem}
.ref-list{display:flex;flex-wrap:wrap;gap:.375rem;margin:.5rem 0}

/* ── Página ── */
.pagina{background:var(--card);border:1px solid var(--brd);border-radius:14px;overflow:hidden;margin-bottom:2rem}
.pag-head{padding:1.5rem;border-bottom:1px solid var(--brd)}
.pag-title{font-size:1.1rem;font-weight:700;color:var(--tx)}
.pag-body{padding:1.5rem}
img.pg-img{width:70%;display:block;margin:.875rem auto;object-fit:contain;border-radius:10px;border:1px solid var(--brd);background:var(--bg)}
img.vs-img{width:70%;display:block;margin:.625rem auto;object-fit:contain;border-radius:8px;border:1px solid var(--brd)}
.vc{background:var(--bg);border:1px solid var(--brd);border-radius:10px;padding:1.25rem;margin-bottom:.75rem}
.vc-name{font-size:.875rem;font-weight:700;color:var(--tx);display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem}
.filter-g{display:flex;align-items:flex-start;gap:.5rem;background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:.7rem 1rem;font-size:.8rem;margin-bottom:.5rem}
.filter-p{display:flex;align-items:flex-start;gap:.5rem;background:var(--bg);border:1px solid var(--brd);border-radius:8px;padding:.7rem 1rem;font-size:.8rem;margin-bottom:.5rem}
.filter-info{flex:1}
.filter-name{font-weight:700;color:var(--tx);margin-bottom:.2rem}
.filter-field{font-family:'SF Mono',Consolas,monospace;font-size:.75rem;color:var(--tx-m)}
.filter-desc{font-size:.775rem;color:var(--tx-m);margin-top:.2rem}

/* ── Gloss ── */
.gi{padding:.75rem 0;border-bottom:1px solid var(--brd);font-size:.875rem}
.gi:last-child{border-bottom:none}
.gt{font-weight:700;color:var(--tx)}
.gd{color:var(--tx-m)}

/* ── Utilities ── */
p{margin:.5rem 0}
.mt{margin-top:1rem}
.mt-sm{margin-top:.5rem}
.fw{display:flex;flex-wrap:wrap;gap:.375rem;margin:.5rem 0}
ul.rl{padding-left:1.25rem;margin:.5rem 0}
ul.rl li{margin:.2rem 0;font-size:.825rem}
footer{margin-top:4rem;padding:1.5rem 0 0;border-top:1px solid var(--brd);font-size:.75rem;color:var(--tx-m)}
.sep{margin:1.5rem 0;border:none;border-top:1px solid var(--brd)}

/* ── Print ── */
@media print {
  #sb,.fab{display:none!important}
  #content{margin-left:0!important;padding:1.25cm 1.5cm!important;max-width:none!important}
  body{background:#fff;font-size:11px}
  .doc-header{margin-bottom:1.5rem}
  section{break-before:page}
  section:first-of-type{break-before:auto}
  .doc-header,.stats{break-before:auto}
  .sec-h,h3,.kc-name,.qc-name,.mc-name,.pag-title,.vc-name{break-after:avoid}
  .kc,.qc,.mc,.vc{break-inside:avoid}
  .pagina{break-before:page}
  pre{white-space:pre-wrap;word-break:break-all;font-size:9px;border:1px solid #e2e8f0}
  details.collapsible{border:none}
  details.collapsible>summary{background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;margin-bottom:.25rem}
  a{color:inherit;text-decoration:none}
  code{background:#f1f5f9}
  .stats{grid-template-columns:repeat(4,1fr)}
  table{page-break-inside:auto}
  tr{break-inside:avoid}
  img{max-height:280px}
  .grp-lbl{break-after:avoid}
}
`;

// ─── JS (scrollspy) ───────────────────────────────────────────────────────────

const JS = `
const links = document.querySelectorAll('.sl[href^="#"]');
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = '#' + e.target.id;
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
    }
  });
}, { rootMargin: '-10% 0px -55% 0px', threshold: 0 });
document.querySelectorAll('[id]').forEach(el => {
  if (el.closest('#sb') || el.closest('.fab')) return;
  obs.observe(el);
});
`;

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function buildSidebar(doc: Documentacao): string {
  const { kpis, queries, relacionamentos, medidas_dax, paginas, glossario } = doc;
  const fatosQ = queries.filter((q) => /^ft/i.test(q.nome));
  const dimQ   = queries.filter((q) => /^dim/i.test(q.nome));
  const outQ   = queries.filter((q) => !fatosQ.includes(q) && !dimQ.includes(q));

  const kpiLinks = kpis.map((k) =>
    `<a class="sl sl-sub" href="#k-${k.id.slice(0,8)}">${esc(k.nome)}</a>`,
  ).join('');

  const qLinks = (qs: typeof queries) => qs.map((q) =>
    `<a class="sl sl-sub" href="#q-${q.id.slice(0,8)}">${esc(q.nome)}</a>`,
  ).join('');

  const mLinks = medidas_dax.map((m) =>
    `<a class="sl sl-sub" href="#m-${m.id.slice(0,8)}">${esc(m.tabela ? `${m.tabela}[${m.nome}]` : m.nome)}</a>`,
  ).join('');

  const pLinks = paginas.map((p) =>
    `<a class="sl sl-sub" href="#p-${p.id.slice(0,8)}">${esc(p.titulo)}</a>`,
  ).join('');

  return `<nav id="sb">
  <div class="s-logo">
    <div class="s-logo-icon">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5" height="6" rx="1" fill="white"/>
        <rect x="9" y="2" width="5" height="3" rx="1" fill="white"/>
        <rect x="9" y="7" width="5" height="7" rx="1" fill="white"/>
        <rect x="2" y="10" width="5" height="4" rx="1" fill="white"/>
      </svg>
    </div>
    <div>
      <div class="s-logo-text">${esc(doc.projeto.titulo_relatorio || 'Projeto BI')}</div>
      <div class="s-logo-sub">BI Documentation Studio</div>
    </div>
  </div>

  <a class="sl sl-top" href="#sec-projeto">📋 Projeto</a>

  ${kpis.length ? `<details class="sx" open>
    <summary>📊 KPIs <span class="s-n">${kpis.length}</span></summary>
    ${kpiLinks}
  </details>` : ''}

  ${queries.length ? `<details class="sx">
    <summary>🗄️ Queries <span class="s-n">${queries.length}</span></summary>
    ${fatosQ.length ? `<div class="sl-sub-lbl">Fato</div>${qLinks(fatosQ)}` : ''}
    ${dimQ.length   ? `<div class="sl-sub-lbl">Dimensão</div>${qLinks(dimQ)}` : ''}
    ${outQ.length   ? `<div class="sl-sub-lbl">Outras</div>${qLinks(outQ)}` : ''}
  </details>` : ''}

  ${relacionamentos.length
    /* Fix 2: usa .s-n igual aos outros itens da sidebar em vez de .badge com float */
    ? `<a class="sl sl-top" href="#sec-relacionamentos">🔗 Relacionamentos <span class="s-n">${relacionamentos.length}</span></a>`
    : ''}

  ${medidas_dax.length ? `<details class="sx">
    <summary>📐 Medidas DAX <span class="s-n">${medidas_dax.length}</span></summary>
    ${mLinks}
  </details>` : ''}

  ${paginas.length ? `<details class="sx">
    <summary>📄 Páginas <span class="s-n">${paginas.length}</span></summary>
    ${pLinks}
  </details>` : ''}

  ${glossario.length ? `<a class="sl sl-top" href="#sec-glossario">📖 Glossário</a>` : ''}
</nav>`;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function buildStats(doc: Documentacao): string {
  const { kpis, queries, relacionamentos, medidas_dax, paginas, glossario } = doc;
  const visuais = paginas.reduce((s, p) => s + p.visuais.length, 0);
  const filtros = paginas.reduce((s, p) => s + p.filtros.length, 0);
  const items = [
    { l: 'KPIs',            n: kpis.length            },
    { l: 'Queries',         n: queries.length          },
    { l: 'Relacionamentos', n: relacionamentos.length  },
    { l: 'Medidas DAX',     n: medidas_dax.length      },
    { l: 'Páginas',         n: paginas.length          },
    { l: 'Visuais',         n: visuais                 },
    { l: 'Filtros',         n: filtros                 },
    { l: 'Glossário',       n: glossario.length        },
  ];
  return `<div class="stats">
  ${items.map((i) => `<div class="stat"><div class="stat-n">${i.n}</div><div class="stat-l">${i.l}</div></div>`).join('')}
</div>`;
}

// ─── Projeto ──────────────────────────────────────────────────────────────────

function buildProjeto(doc: Documentacao): string {
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
    <table class="it">
      ${rows.map(([l, v]) => `<tr><td class="l">${l}</td><td>${esc(v)}</td></tr>`).join('')}
    </table>
    ${p.objetivo ? `<hr class="sep"><p><strong>Objetivo</strong></p><p>${escNl(p.objetivo)}</p>` : ''}
    ${p.descricao_geral ? `<p class="mt"><strong>Descrição Geral</strong></p><p>${escNl(p.descricao_geral)}</p>` : ''}
    ${p.fontes_dados.length ? `<p class="mt"><strong>Fontes de Dados</strong></p><ul class="rl">${p.fontes_dados.map((f) => `<li><strong>${esc(f.tipo)}</strong> — ${esc(f.descricao)}</li>`).join('')}</ul>` : ''}
    ${p.observacoes_gerais ? `<p class="mt"><strong>Observações Gerais</strong></p><p>${escNl(p.observacoes_gerais)}</p>` : ''}
    ${p.melhorias_futuras?.length ? `
    <div style="margin-top:1.25rem;padding:1rem 1.25rem;background:#f0fdf4;border:1px solid #bbf7d0;border-left:3px solid #16a34a;border-radius:0 8px 8px 0">
      <p style="font-weight:700;color:#15803d;margin-bottom:.5rem">💡 Possíveis Melhorias / Atualizações Futuras</p>
      <ul class="rl">${(p.melhorias_futuras ?? []).map((m) => `<li>${escNl(m)}</li>`).join('')}</ul>
    </div>` : ''}
  </div>
</section>`;
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────

function buildKpis(doc: Documentacao): string {
  if (!doc.kpis.length) return '';

  const cards = doc.kpis.map((k) => {
    const tipo = tipoLabel(k.tipo_visual, k.tipo_outro);
    const metaRows = [
      k.fonte_dados_kpi       ? `<tr><td class="l">Fonte dos Dados</td><td>${escNl(k.fonte_dados_kpi)}</td></tr>` : '',
      k.responsavel_validacao ? `<tr><td class="l">Responsável pela Validação</td><td>${esc(k.responsavel_validacao)}</td></tr>` : '',
    ].join('');

    return `<div class="kc" id="k-${k.id.slice(0,8)}">
  <div class="kc-name">${esc(k.nome)} ${badge(tipo, 'bd-blue')}</div>
  ${k.o_que_mede    ? `<p><strong>O que mede:</strong> ${escNl(k.o_que_mede)}</p>` : ''}
  ${k.objetivo_meta ? `<p><strong>Objetivo / Meta:</strong> ${escNl(k.objetivo_meta)}</p>` : ''}
  ${k.formula       ? `<div class="kc-formula">📐 ${escNl(k.formula)}</div>` : ''}
  ${(k.o_que_entra || k.o_que_nao_entra || k.excecoes) ? `
  <div class="mt-sm">
    ${k.o_que_entra    ? `<div class="scope scope-in"><span class="sc-lbl">✅ O que entra:</span>${escNl(k.o_que_entra)}</div>` : ''}
    ${k.o_que_nao_entra ? `<div class="scope scope-out"><span class="sc-lbl">❌ O que não entra:</span>${escNl(k.o_que_nao_entra)}</div>` : ''}
    ${k.excecoes       ? `<div class="scope scope-exc"><span class="sc-lbl">⚠️ Exceções:</span>${escNl(k.excecoes)}</div>` : ''}
  </div>` : ''}
  ${k.regras_temporais ? `<p class="mt"><strong>Regras Temporais:</strong> ${escNl(k.regras_temporais)}</p>` : ''}
  ${metaRows ? `<table class="it mt">${metaRows}</table>` : ''}
  ${k.regras_negocio.length ? `<p class="mt"><strong>Regras de Negócio:</strong></p><ul class="rl">${k.regras_negocio.map((r) => `<li>${escNl(r)}</li>`).join('')}</ul>` : ''}
  ${k.observacoes ? `<p class="mt"><strong>Observações:</strong> ${escNl(k.observacoes)}</p>` : ''}
</div>`;
  }).join('');

  return `<section id="sec-kpis">
  <h2 class="sec-h">📊 KPIs <span class="sec-count">${doc.kpis.length}</span></h2>
  ${cards}
</section>`;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

function buildQueryCard(q: Query, imageMap?: Map<string, string>): string {
  const fonte = q.fonte_dados === 'outro' && q.fonte_dados_outro
    ? esc(q.fonte_dados_outro)
    : esc(LABELS_FONTE_DADOS[q.fonte_dados] ?? q.fonte_dados);

  return `<div class="qc" id="q-${q.id.slice(0,8)}">
  <div class="qc-head">
    <div class="qc-name">${esc(q.nome)}</div>
    ${badge(fonte, 'bd-slate')}
  </div>
  <div class="qc-body">
    ${q.descricao ? `<p>${escNl(q.descricao)}</p>` : ''}
    ${q.codigo ? collapsible('📄 Ver código SQL / M', codeBlock(q.codigo, 'sql')) : ''}
    ${q.transformacoes.length ? `<p class="mt"><strong>Transformações Power Query:</strong></p><ul class="rl">${q.transformacoes.map((t) => `<li>${escNl(t)}</li>`).join('')}</ul>` : ''}
    ${q.colunas.length ? `
    <p class="mt"><strong>Colunas Principais:</strong></p>
    <table class="dt">
      <thead><tr><th>Coluna</th><th>Tipo</th><th>Descrição</th></tr></thead>
      <tbody>${q.colunas.map((c) => `<tr><td><code>${esc(c.nome)}</code></td><td>${esc(c.tipo)}</td><td>${escNl(c.descricao)}</td></tr>`).join('')}</tbody>
    </table>` : ''}
    ${q.observacoes ? `<p class="mt"><strong>Observações:</strong> ${escNl(q.observacoes)}</p>` : ''}
  </div>
</div>`;
}

function buildQueries(doc: Documentacao, imageMap?: Map<string, string>): string {
  if (!doc.queries.length) return '';
  const fatosQ = doc.queries.filter((q) => /^ft/i.test(q.nome));
  const dimQ   = doc.queries.filter((q) => /^dim/i.test(q.nome));
  const outQ   = doc.queries.filter((q) => !fatosQ.includes(q) && !dimQ.includes(q));

  return `<section id="sec-queries">
  <h2 class="sec-h">🗄️ Queries / Tabelas <span class="sec-count">${doc.queries.length}</span></h2>
  ${fatosQ.length ? `<div class="grp-lbl">🟦 Tabelas Fato</div>${fatosQ.map((q) => buildQueryCard(q, imageMap)).join('')}` : ''}
  ${dimQ.length   ? `<div class="grp-lbl">🟩 Tabelas Dimensão</div>${dimQ.map((q) => buildQueryCard(q, imageMap)).join('')}` : ''}
  ${outQ.length   ? `<div class="grp-lbl">⬜ Outras Tabelas</div>${outQ.map((q) => buildQueryCard(q, imageMap)).join('')}` : ''}
</section>`;
}

// ─── Relacionamentos ──────────────────────────────────────────────────────────

function buildRelacionamentos(doc: Documentacao): string {
  if (!doc.relacionamentos.length) return '';
  const temTemp = doc.relacionamentos.some((r) => r.temporario);

  return `<section id="sec-relacionamentos">
  <h2 class="sec-h">🔗 Relacionamentos <span class="sec-count">${doc.relacionamentos.length}</span></h2>
  <table class="dt">
    <thead>
      <tr><th>Origem</th><th>Destino</th><th>Col. Origem</th><th>Col. Destino</th><th>Cardinalidade</th><th>Direção</th><th>Ativo</th><th>Temp.</th></tr>
    </thead>
    <tbody>
      ${doc.relacionamentos.map((r) => `
      <tr>
        <td><code>${esc(r.tabela_origem)}</code></td>
        <td><code>${esc(r.tabela_destino)}</code></td>
        <td><code>${esc(r.coluna_origem)}</code></td>
        <td><code>${esc(r.coluna_destino)}</code></td>
        <td>${esc(LABELS_CARDINALIDADE[r.cardinalidade] ?? r.cardinalidade)}</td>
        <td>${esc(LABELS_DIRECAO[r.direcao] ?? r.direcao)}</td>
        <td style="text-align:center">${r.ativo ? '✅' : '❌'}</td>
        <td style="text-align:center">${r.temporario ? '⚡' : '—'}</td>
      </tr>`).join('')}
    </tbody>
  </table>
  ${temTemp ? `<p style="font-size:.78rem;color:var(--tx-m);margin-top:.5rem">⚡ Relacionamentos temporários são ativados via <code>USERELATIONSHIP()</code> em medidas DAX específicas e não estão ativos no modelo por padrão.</p>` : ''}
</section>`;
}

// ─── Medidas DAX ──────────────────────────────────────────────────────────────

function buildMedidas(doc: Documentacao): string {
  if (!doc.medidas_dax.length) return '';
  const kpiById    = new Map(doc.kpis.map((k) => [k.id, k]));
  const medidaById = new Map(doc.medidas_dax.map((m) => [m.id, m]));

  const cards = doc.medidas_dax.map((m) => {
    const depNames = m.dependencias
      .map((id) => medidaById.get(id))
      .filter(Boolean)
      .map((d) => badge(d!.tabela ? `${d!.tabela}[${d!.nome}]` : d!.nome, 'bd-purple'));

    const kpiNames = m.kpis_relacionados
      .map((id) => kpiById.get(id))
      .filter(Boolean)
      .map((k) => badge(k!.nome, 'bd-blue'));

    return `<div class="mc" id="m-${m.id.slice(0,8)}">
  <div class="mc-name">${esc(m.tabela ? `${m.tabela}[${m.nome}]` : m.nome)}</div>
  ${m.tabela ? `<div class="mc-table">Tabela: <code>${esc(m.tabela)}</code></div>` : ''}
  ${m.descricao ? `<p>${escNl(m.descricao)}</p>` : ''}
  ${m.formula ? collapsible('📐 Ver fórmula DAX', codeBlock(m.formula, 'dax')) : ''}
  ${depNames.length ? `<p class="mt-sm"><strong>Dependências:</strong></p><div class="ref-list">${depNames.join('')}</div>` : ''}
  ${kpiNames.length ? `<p class="mt-sm"><strong>KPIs relacionados:</strong></p><div class="ref-list">${kpiNames.join('')}</div>` : ''}
  ${m.comportamento_esperado ? `<p class="mt"><strong>Como validar:</strong> ${escNl(m.comportamento_esperado)}</p>` : ''}
  ${m.query_validacao ? collapsible('🧪 Query de Validação', codeBlock(m.query_validacao, 'sql')) : ''}
</div>`;
  }).join('');

  return `<section id="sec-medidas">
  <h2 class="sec-h">📐 Medidas DAX <span class="sec-count">${doc.medidas_dax.length}</span></h2>
  ${cards}
</section>`;
}

// ─── Páginas ─────────────────────────────────────────────────────────────────

function buildPaginas(doc: Documentacao, imageMap?: Map<string, string>): string {
  if (!doc.paginas.length) return '';
  const kpiById    = new Map(doc.kpis.map((k) => [k.id, k]));
  const medidaById = new Map(doc.medidas_dax.map((m) => [m.id, m]));
  const queryById  = new Map(doc.queries.map((q) => [q.id, q]));

  const pages = doc.paginas.map((p) => {
    const filtrosGlobal = p.filtros.filter((f) => f.tipo === 'filtro_relatorio');
    const filtrosPagina = p.filtros.filter((f) => f.tipo !== 'filtro_relatorio');

    const visuaisHtml = p.visuais.map((v) => {
      const kpiTags   = v.kpis_ids.map((id) => kpiById.get(id)).filter(Boolean).map((k) => badge(k!.nome, 'bd-blue'));
      const medTags   = v.medidas_ids.map((id) => medidaById.get(id)).filter(Boolean).map((m) => badge(m!.tabela ? `${m!.tabela}[${m!.nome}]` : m!.nome, 'bd-purple'));
      const tabTags   = v.tabelas_ids.map((id) => queryById.get(id)).filter(Boolean).map((q) => badge(q!.nome, 'bd-slate'));
      const campoTags = v.campos.map((c) => `<code>${esc(c)}</code>`);

      // Fix 3: usa base64 do imageMap quando disponível
      const vSrc = v.captura?.caminho ? imgSrc(v.captura.caminho, imageMap) : null;

      return `<div class="vc" id="v-${v.id.slice(0,8)}">
  <div class="vc-name">${esc(v.nome)} ${badge(tipoLabel(v.tipo, v.tipo_outro), 'bd-slate')}</div>
  ${v.objetivo  ? `<p><strong>Objetivo:</strong> ${esc(v.objetivo)}</p>` : ''}
  ${v.descricao ? `<p>${escNl(v.descricao)}</p>` : ''}
  ${vSrc ? `<img class="vs-img" src="${vSrc}" alt="${esc(v.nome)}" loading="lazy">` : ''}
  ${kpiTags.length   ? `<p class="mt-sm"><strong>KPIs:</strong></p><div class="ref-list">${kpiTags.join('')}</div>` : ''}
  ${medTags.length   ? `<p class="mt-sm"><strong>Medidas DAX:</strong></p><div class="ref-list">${medTags.join('')}</div>` : ''}
  ${tabTags.length   ? `<p class="mt-sm"><strong>Tabelas:</strong></p><div class="ref-list">${tabTags.join('')}</div>` : ''}
  ${campoTags.length ? `<p class="mt-sm"><strong>Campos:</strong></p><div class="fw">${campoTags.join('')}</div>` : ''}
  ${v.observacoes    ? `<p class="mt-sm"><strong>Observações:</strong> ${escNl(v.observacoes)}</p>` : ''}
</div>`;
    }).join('');

    const filtrosGlobalHtml = filtrosGlobal.map((f) => `
<div class="filter-g">
  <span>🌐</span>
  <div class="filter-info">
    <div class="filter-name">${esc(f.nome)} ${badge('Relatório', 'bd-purple')}</div>
    <div class="filter-field">${esc(f.campo)}</div>
    ${f.descricao ? `<div class="filter-desc">${esc(f.descricao)}</div>` : ''}
  </div>
</div>`).join('');

    const filtrosPaginaHtml = filtrosPagina.map((f) => `
<div class="filter-p">
  <span>🔍</span>
  <div class="filter-info">
    <div class="filter-name">${esc(f.nome)} ${badge(tipoLabel(f.tipo), 'bd-slate')}</div>
    <div class="filter-field">${esc(f.campo)}</div>
    ${f.descricao ? `<div class="filter-desc">${esc(f.descricao)}</div>` : ''}
    ${f.observacoes ? `<div class="filter-desc" style="color:var(--amber)">${esc(f.observacoes)}</div>` : ''}
  </div>
</div>`).join('');

    // Fix 3: usa base64 do imageMap quando disponível
    const pSrc = p.captura?.caminho ? imgSrc(p.captura.caminho, imageMap) : null;

    return `<div class="pagina" id="p-${p.id.slice(0,8)}">
  <div class="pag-head">
    <div class="pag-title">📄 ${esc(p.titulo)}</div>
    ${p.objetivo ? `<p style="font-size:.825rem;color:var(--tx-m);margin-top:.375rem">${esc(p.objetivo)}</p>` : ''}
  </div>
  <div class="pag-body">
    ${p.descricao ? `<p>${escNl(p.descricao)}</p>` : ''}
    ${pSrc ? `<img class="pg-img" src="${pSrc}" alt="${esc(p.titulo)}" loading="lazy">` : ''}
    ${filtrosGlobalHtml ? `<p class="mt"><strong>🌐 Filtros de Relatório (todas as páginas):</strong></p>${filtrosGlobalHtml}` : ''}
    ${visuaisHtml ? `<p class="mt"><strong>Visuais (${p.visuais.length}):</strong></p>${visuaisHtml}` : ''}
    ${filtrosPaginaHtml ? `<p class="mt"><strong>Filtros de Página (${filtrosPagina.length}):</strong></p>${filtrosPaginaHtml}` : ''}
  </div>
</div>`;
  }).join('');

  return `<section id="sec-paginas">
  <h2 class="sec-h">📄 Páginas <span class="sec-count">${doc.paginas.length}</span></h2>
  ${pages}
</section>`;
}

// ─── Glossário ────────────────────────────────────────────────────────────────

function buildGlossario(doc: Documentacao): string {
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

// Fix 3: aceita imageMap opcional com base64 data URIs para cada imagem.
// Quando presente, o HTML gerado é completamente autocontido (funciona em rede).
export function gerarHtml(doc: Documentacao, imageMap?: Map<string, string>): string {
  const titulo     = doc.projeto.titulo_relatorio || 'Projeto BI';
  const dataExport = new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' });

  const content = [
    `<div class="doc-header">
      <h1 class="doc-title">${esc(titulo)}</h1>
      <p class="doc-meta">Documentação técnica gerada por <strong>BI Documentation Studio</strong> · ${dataExport}</p>
    </div>`,
    buildStats(doc),
    buildProjeto(doc),
    buildKpis(doc),
    buildQueries(doc, imageMap),
    buildRelacionamentos(doc),
    buildMedidas(doc),
    buildPaginas(doc, imageMap),
    buildGlossario(doc),
    `<footer>
      <p>Documentado por: <strong>${esc(doc.metadados.documentado_por || 'BI Documentation Studio')}</strong></p>
      <p>Última revisão: ${new Date(doc.metadados.ultima_revisao).toLocaleDateString('pt-BR', { dateStyle: 'long' })}</p>
    </footer>`,
  ].filter(Boolean).join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(titulo)} — Documentação BI</title>
  <style>${CSS}</style>
</head>
<body>
${buildSidebar(doc)}
<main id="content">
${content}
</main>
<button class="fab" onclick="window.print()" title="Exportar como PDF via impressão do navegador">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
  </svg>
  Imprimir / Exportar PDF
</button>
<script>${JS}</script>
</body>
</html>`;
}