# 📊 Relatório de Vendas Regional

> **Área:** Comercial · **Responsável:** Rodrigo Analista · **Criação:** 01/2025 · **Última atualização:** 06/2025

---

## 1. Visão Geral do Projeto

| Campo | Descrição |
|---|---|
| **Nome do relatório** | Relatório de Vendas Regional |
| **Área / Departamento** | Comercial |
| **Responsável** | Rodrigo Analista |
| **Data de criação** | 01/2025 |
| **Última atualização** | 06/2025 |
| **Fontes de dados** | SQL Server — Base de Vendas · Excel — Planilha de Metas · API — CRM Salesforce |

### Objetivo

Monitorar o desempenho comercial por região, acompanhar o atingimento de metas mensais e identificar oportunidades e desvios de performance. Público-alvo: diretores comerciais e gerentes regionais. Apoia decisões de redistribuição de metas, ações corretivas e planejamento de campanhas.

### Observações Gerais

- Atualização automática agendada para todos os dias às 06h00 via Gateway On-Premises.
- Dados históricos disponíveis a partir de janeiro de 2022.
- Devoluções e cancelamentos são excluídos de todos os indicadores de faturamento.

---

## 2. KPIs

### KPI 1 — Total de Vendas

| Campo | Valor |
|---|---|
| **Tipo de visual** | Cartão (Card) |
| **O que mede** | Soma do faturamento bruto de todas as vendas aprovadas no período |
| **Objetivo / Meta** | Monitorar a receita total versus a meta mensal estabelecida |

**Regras de negócio:**
- Considera apenas vendas com `Status = 'Aprovado'`
- Exclui devoluções e notas de crédito
- Filtro de data aplicado pelo slicer de período

**Observações:** Exibe variação percentual em relação ao mês anterior. Cor vermelha quando abaixo de 90% da meta.

---

### KPI 2 — Ticket Médio

| Campo | Valor |
|---|---|
| **Tipo de visual** | Cartão (Card) |
| **O que mede** | Valor médio por pedido aprovado no período |
| **Objetivo / Meta** | Acompanhar a evolução do valor médio para identificar mix de produtos |

**Regras de negócio:**
- Calculado como `Total Vendas / Qtd Pedidos`
- Pedidos cancelados não entram no denominador

**Observações:** Alerta visual em amarelo quando ticket médio cair mais de 15% versus o período anterior.

---

### KPI 3 — % Atingimento de Meta

| Campo | Valor |
|---|---|
| **Tipo de visual** | Medidor (Gauge) |
| **O que mede** | Percentual de atingimento da meta mensal de vendas |
| **Objetivo / Meta** | Sinalizar visualmente se a equipe está no caminho certo para fechar o mês |

**Regras de negócio:**
- Calculado como `Total Vendas / Meta do Mês`
- Meta carregada da tabela `dMetas` com granularidade mensal por região

**Observações:** Gauge com três faixas — vermelho (< 70%), amarelo (70–99%), verde (≥ 100%).

---

## 3. Queries / Tabelas

### Query 1 — fVendas

| Campo | Valor |
|---|---|
| **Fonte de dados** | SQL Server |
| **Descrição** | Tabela fato de vendas com granularidade por linha de pedido |

```sql
SELECT
    v.NrPedido         AS IDPedido,
    v.DtEmissao        AS Data,
    v.CdCliente        AS IDCliente,
    v.CdVendedor       AS IDVendedor,
    v.CdRegiao         AS IDRegiao,
    v.CdProduto        AS IDProduto,
    v.VlBruto          AS ValorBruto,
    v.VlDesconto       AS Desconto,
    v.VlBruto - v.VlDesconto AS ValorLiquido,
    v.QtdPedido        AS Quantidade,
    v.StPedido         AS Status
FROM dbo.PEDIDOS v
WHERE v.DtEmissao >= '2022-01-01'
  AND v.StPedido IN ('A', 'F')  -- Aprovado e Faturado
```

**Transformações Power Query:**
- Renomeação de colunas para padrão em português
- Coluna `Data` convertida para tipo `Date`
- Filtro `Status <> 'C'` (Cancelados) aplicado na origem
- Coluna `ValorLiquido` criada como coluna calculada no Power Query

**Colunas principais:**

| Coluna | Tipo | Descrição |
|---|---|---|
| IDPedido | Texto | Chave do pedido |
| Data | Data | Data de emissão |
| IDCliente | Inteiro | FK para dClientes |
| IDVendedor | Inteiro | FK para dVendedores |
| IDRegiao | Texto | FK para dRegiao |
| ValorLiquido | Decimal | Valor após descontos |
| Status | Texto | A = Aprovado, F = Faturado |

**Observações:** Carga incremental configurada com base na coluna `DtEmissao`. Janela de atualização: últimos 90 dias.

---

### Query 2 — dClientes

| Campo | Valor |
|---|---|
| **Fonte de dados** | SQL Server |
| **Descrição** | Dimensão de clientes com dados cadastrais e segmentação |

```sql
SELECT
    c.CdCliente     AS IDCliente,
    c.NmCliente     AS NomeCliente,
    c.CdRegiao      AS IDRegiao,
    c.DsSegmento    AS Segmento,
    c.DsPorte       AS Porte,
    c.DsUF          AS UF
FROM dbo.CLIENTES c
WHERE c.StAtivo = 1
```

**Colunas principais:** IDCliente, NomeCliente, IDRegiao, Segmento, Porte, UF

**Observações:** Carga completa a cada atualização (tabela pequena, ~12 mil registros).

---

### Query 3 — dMetas

| Campo | Valor |
|---|---|
| **Fonte de dados** | Excel / CSV |
| **Descrição** | Tabela de metas mensais por região, carregada manualmente pela equipe comercial |

**Transformações Power Query:**
- Cabeçalho promovido da primeira linha
- Coluna `Mes` convertida para tipo `Date` (formato MM/YYYY → primeiro dia do mês)
- Linhas em branco removidas
- Coluna `Regiao` normalizada para maiúsculas com `Text.Upper()`

**Colunas principais:** Mes, IDRegiao, MetaValor

**Observações:** Arquivo hospedado em SharePoint. Equipe comercial atualiza até o dia 25 de cada mês.

---

### Query 4 — dCalendario

| Campo | Valor |
|---|---|
| **Fonte de dados** | Power Query (gerada internamente) |
| **Descrição** | Tabela de datas gerada via M, cobrindo o período 2022–2030 |

```m
let
    DataInicio = #date(2022, 1, 1),
    DataFim    = #date(2030, 12, 31),
    Dias       = Duration.Days(DataFim - DataInicio) + 1,
    Lista      = List.Dates(DataInicio, Dias, #duration(1,0,0,0)),
    Tabela     = Table.FromList(Lista, Splitter.SplitByNothing(), {"Data"}),
    TipoData   = Table.TransformColumnTypes(Tabela, {{"Data", type date}}),
    Ano        = Table.AddColumn(TipoData,  "Ano",        each Date.Year([Data]),          Int64.Type),
    Mes        = Table.AddColumn(Ano,       "Mes",        each Date.Month([Data]),         Int64.Type),
    NomeMes    = Table.AddColumn(Mes,       "NomeMes",    each Date.ToText([Data], "MMMM", "pt-BR"), type text),
    Trimestre  = Table.AddColumn(NomeMes,  "Trimestre",  each "T" & Text.From(Date.QuarterOfYear([Data])), type text),
    Semana     = Table.AddColumn(Trimestre,"Semana",      each Date.WeekOfYear([Data]),    Int64.Type),
    DiaSemana  = Table.AddColumn(Semana,   "DiaSemana",  each Date.ToText([Data], "dddd", "pt-BR"), type text)
in
    DiaSemana
```

**Colunas principais:** Data, Ano, Mes, NomeMes, Trimestre, Semana, DiaSemana

---

## 4. Relacionamentos

| Origem | Destino | Coluna Origem | Coluna Destino | Cardinalidade | Direção | Ativo |
|---|---|---|---|---|---|---|
| fVendas | dClientes | IDCliente | IDCliente | *:1 | Única (→) | Sim |
| fVendas | dVendedores | IDVendedor | IDVendedor | *:1 | Única (→) | Sim |
| fVendas | dRegiao | IDRegiao | IDRegiao | *:1 | Única (→) | Sim |
| fVendas | dCalendario | Data | Data | *:1 | Única (→) | Sim |
| dMetas | dCalendario | Mes | Data | *:1 | Única (→) | Sim |
| dMetas | dRegiao | IDRegiao | IDRegiao | *:1 | Única (→) | Sim |

> **Obs. Relacionamento dMetas → dCalendario:** A coluna `Mes` em `dMetas` armazena o primeiro dia do mês (`date`), permitindo o relacionamento direto com `dCalendario[Data]`. Filtros de período via slicer propagam corretamente para a tabela de metas.

> **Obs. Relacionamento dClientes → dRegiao:** Existe um relacionamento inativo adicional entre `dClientes[IDRegiao]` e `dRegiao[IDRegiao]` para uso pontual com `USERELATIONSHIP()` em análises de clientes por região independente das vendas.

---

## 5. Medidas DAX

### [Total Vendas]

**Tabela:** `fVendas`

Soma o valor líquido de todas as vendas aprovadas ou faturadas considerando o contexto de filtro ativo (período, região, vendedor).

```dax
Total Vendas =
CALCULATE(
    SUM( fVendas[ValorLiquido] ),
    fVendas[Status] IN { "A", "F" }
)
```

**Dependências:** —
**KPIs relacionados:** Total de Vendas
**Comportamento esperado:** Retorna `BLANK()` quando não há vendas no contexto. Nunca retorna zero.

---

### [Qtd Pedidos]

**Tabela:** `fVendas`

Conta o número de pedidos distintos no contexto de filtro.

```dax
Qtd Pedidos =
DISTINCTCOUNT( fVendas[IDPedido] )
```

**Dependências:** —
**KPIs relacionados:** —
**Comportamento esperado:** Conta apenas pedidos únicos; linhas duplicadas por produto não inflam o contador.

---

### [Ticket Médio]

**Tabela:** `fVendas`

Calcula o valor médio por pedido no período. Depende das medidas `[Total Vendas]` e `[Qtd Pedidos]`.

```dax
Ticket Médio =
DIVIDE(
    [Total Vendas],
    [Qtd Pedidos],
    BLANK()
)
```

**Dependências:** `[Total Vendas]`, `[Qtd Pedidos]`
**KPIs relacionados:** Ticket Médio
**Comportamento esperado:** Retorna `BLANK()` se não houver pedidos, evitando divisão por zero.

---

### [Meta do Mês]

**Tabela:** `dMetas`

Retorna a soma das metas mensais considerando o contexto de filtro de data e região.

```dax
Meta do Mês =
SUM( dMetas[MetaValor] )
```

**Dependências:** —
**KPIs relacionados:** % Atingimento de Meta
**Comportamento esperado:** Quando nenhum período está selecionado, soma todas as metas disponíveis. Recomendado uso sempre com slicer de período ativo.

---

### [% Atingimento Meta]

**Tabela:** `fVendas`

Calcula o percentual de atingimento da meta no período selecionado.

```dax
% Atingimento Meta =
DIVIDE(
    [Total Vendas],
    [Meta do Mês],
    BLANK()
)
```

**Dependências:** `[Total Vendas]`, `[Meta do Mês]`
**KPIs relacionados:** % Atingimento de Meta
**Comportamento esperado:** Formatado como percentual. Retorna `BLANK()` quando não há meta cadastrada para o período.

---

### [Vendas Mês Anterior]

**Tabela:** `fVendas`

Desloca o contexto de tempo para o mês imediatamente anterior ao período selecionado.

```dax
Vendas Mês Anterior =
CALCULATE(
    [Total Vendas],
    DATEADD( dCalendario[Data], -1, MONTH )
)
```

**Dependências:** `[Total Vendas]`
**KPIs relacionados:** Total de Vendas (variação MoM)
**Comportamento esperado:** Requer tabela `dCalendario` marcada como tabela de datas. Retorna `BLANK()` no primeiro mês disponível.

---

### [Variação MoM %]

**Tabela:** `fVendas`

Calcula a variação percentual de vendas em relação ao mês anterior.

```dax
Variação MoM % =
DIVIDE(
    [Total Vendas] - [Vendas Mês Anterior],
    [Vendas Mês Anterior],
    BLANK()
)
```

**Dependências:** `[Total Vendas]`, `[Vendas Mês Anterior]`
**KPIs relacionados:** Total de Vendas
**Comportamento esperado:** Formatado como percentual com sinal. Positivo = crescimento, negativo = queda.

---

## 6. Páginas do Relatório

### Página 1 — Resumo Executivo

**Objetivo:** Visão consolidada dos principais indicadores para acompanhamento da diretoria.

Página inicial com os KPIs de Total de Vendas, Ticket Médio e % Atingimento de Meta em destaque, seguida de um gráfico de evolução mensal e ranking de regiões. Projetada para leitura rápida em reuniões executivas.

#### Visuais

| # | Nome | Tipo | Medidas utilizadas | Campos |
|---|---|---|---|---|
| 1 | Cards de KPIs | Cartão (Card) | `[Total Vendas]`, `[Ticket Médio]`, `[% Atingimento Meta]` | — |
| 2 | Evolução Mensal | Gráfico de Linhas | `[Total Vendas]`, `[Vendas Mês Anterior]` | `dCalendario[NomeMes]` |
| 3 | Vendas por Região | Gráfico de Barras | `[Total Vendas]` | `dRegiao[NomeRegiao]` |
| 4 | Gauge de Meta | Medidor (Gauge) | `[% Atingimento Meta]`, `[Meta do Mês]` | — |

**Observações visuais:**
- Visual 2: Linhas com marcadores, eixo X com meses abreviados, sem legenda inline
- Visual 3: Ordenado decrescente por `[Total Vendas]`, barras com rótulo de valor

#### Filtros

| Filtro | Tipo | Campo | Descrição |
|---|---|---|---|
| Período | Segmentação de Dados (Slicer) | `dCalendario[Data]` | Seleção por intervalo de datas; afeta todos os visuais da página |
| Região | Segmentação de Dados (Slicer) | `dRegiao[NomeRegiao]` | Seleção múltipla habilitada |

---

### Página 2 — Análise por Vendedor

**Objetivo:** Acompanhar o desempenho individual dos vendedores e comparar com a equipe.

Página operacional para uso dos gerentes regionais. Apresenta ranking de vendedores, atingimento individual de meta e evolução mensal por vendedor selecionado.

#### Visuais

| # | Nome | Tipo | Medidas utilizadas | Campos |
|---|---|---|---|---|
| 1 | Ranking de Vendedores | Tabela | `[Total Vendas]`, `[Qtd Pedidos]`, `[Ticket Médio]`, `[% Atingimento Meta]` | `dVendedores[NomeVendedor]` |
| 2 | Evolução do Vendedor | Gráfico de Colunas | `[Total Vendas]`, `[Meta do Mês]` | `dCalendario[NomeMes]` |
| 3 | Dispersão Ticket x Volume | Gráfico de Dispersão | `[Ticket Médio]`, `[Qtd Pedidos]` | `dVendedores[NomeVendedor]` |

**Observações visuais:**
- Visual 1: Formatação condicional em `[% Atingimento Meta]` — vermelho < 70%, amarelo 70–99%, verde ≥ 100%
- Visual 2: Linha de meta sobreposta como linha de referência constante

#### Filtros

| Filtro | Tipo | Campo | Descrição |
|---|---|---|---|
| Período | Segmentação de Dados (Slicer) | `dCalendario[Data]` | Sincronizado com a Página 1 via sincronização de segmentações |
| Vendedor | Segmentação de Dados (Slicer) | `dVendedores[NomeVendedor]` | Seleção única — filtra o gráfico de evolução individual |
| Região | Filtro de Página | `dRegiao[NomeRegiao]` | Filtro no painel lateral; não visível como slicer |

---

### Página 3 — Detalhe de Pedidos

**Objetivo:** Permitir análise e drill-down ao nível de pedido individual para investigação operacional.

Página de consulta detalhada com tabela completa de pedidos, filtros avançados e possibilidade de exportação. Uso restrito a analistas e gerentes.

#### Visuais

| # | Nome | Tipo | Medidas utilizadas | Campos |
|---|---|---|---|---|
| 1 | Tabela de Pedidos | Tabela | `[Total Vendas]` | IDPedido, Data, NomeCliente, NomeVendedor, NomeRegiao, ValorLiquido, Status |

**Observações visuais:**
- Paginação habilitada (50 linhas por página)
- Exportação para CSV habilitada para usuários com permissão de exportação

#### Filtros

| Filtro | Tipo | Campo | Descrição |
|---|---|---|---|
| Período | Segmentação de Dados (Slicer) | `dCalendario[Data]` | Obrigatório selecionar para evitar timeout na consulta |
| Status do Pedido | Segmentação de Dados (Slicer) | `fVendas[Status]` | Seleção múltipla; padrão: A e F selecionados |
| Cliente | Segmentação de Dados (Slicer) | `dClientes[NomeCliente]` | Pesquisa por digitação habilitada |

---

## 7. Glossário

| Termo | Definição |
|---|---|
| **Faturamento Bruto** | Valor total dos pedidos antes de descontos |
| **Valor Líquido** | Faturamento bruto deduzido de descontos comerciais |
| **Status A** | Pedido Aprovado — aguardando faturamento |
| **Status F** | Pedido Faturado — NF emitida |
| **MoM** | Month over Month — variação em relação ao mês anterior |
| **Meta** | Objetivo mensal de vendas definido pela diretoria comercial por região |

---

*Documentado por: Rodrigo Analista · Última revisão: 06/2025*
*Gerado com Power BI Doc Builder*
