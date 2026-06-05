# 📊 [Título do Relatório]

> **Área:** [Área] · **Responsável:** [Responsável] · **Criação:** [MM/AAAA] · **Última atualização:** [MM/AAAA] · **Fontes de dados:** [Fontes]

---

## 1. Visão Geral do Projeto

| Campo | Descrição |
|---|---|
| **Nome do relatório** | [Nome do Relatório] |
| **Área / Departamento** | [Área / Departamento] |
| **Responsável** | [Responsável] |
| **Data de criação** | [MM/AAAA] |
| **Última atualização** | [MM/AAAA] |
| **Fontes de dados** | [Fontes de dados] |

### Objetivo

[Descrição do objetivo do relatório, público-alvo e principais decisões que ele deve suportar]

### Observações Gerais

- [Observação 1]
- [Observação 2]
- [Observação 3]

---

## 2. KPIs

### KPI 1 — [Título]

| Campo | Valor |
|---|---|
| **Tipo de visual** | [Cartão (Card) / Medidor (Gauge) / KPI Nativo / Outro] |
| **O que mede** | [Descrição do que o KPI mede] |
| **Objetivo / Meta** | [Objetivo ou meta associada] |

**Regras de negócio:**
- [Regra 1]
- [Regra 2]
- [Regra 3]

**Observações:** [Observações específicas sobre o KPI, como alertas visuais, condicionais de cor, limites, etc.]

---

## 3. Queries / Tabelas

### Query 1 — [Título]

| Campo | Valor |
|---|---|
| **Fonte de dados** | [Fonte de dados] |
| **Descrição** | [Descrição da tabela ou query] |

```sql
[Código SQL ou M da query]
```

**Transformações Power Query:**
- [Transformação 1]
- [Transformação 2]
- [Transformação 3]

**Colunas principais:**

| Coluna | Tipo | Descrição |
|---|---|---|
| [Coluna 1] | [Tipo] | [Descrição] |
| [Coluna 2] | [Tipo] | [Descrição] |
| [Coluna 3] | [Tipo] | [Descrição] |

**Observações:** [Observações sobre a query, como volume de dados, periodicidade de carga, estratégia incremental, etc.]

---

## 4. Relacionamentos

| Origem | Destino | Coluna Origem | Coluna Destino | Cardinalidade | Direção | Ativo |
|---|---|---|---|---|---|---|
| [Tabela Origem] | [Tabela Destino] | [Coluna Origem] | [Coluna Destino] | [*:1 / 1:* / 1:1 / *:*] | [Única (→) / Bidirecional (↔)] | [Sim / Não] |

> **Obs. [Tabela Origem] → [Tabela Destino]:** [Observações específicas sobre o relacionamento]

---

## 5. Medidas DAX

### [Nome da Medida]

**Tabela:** `[Nome da tabela onde a medida está criada]`

[Descrição do que a medida calcula, quais filtros aplica e qual o comportamento esperado em diferentes contextos de filtro]

```dax
[Fórmula DAX]
```

**Dependências:** [Medidas ou colunas que esta medida utiliza]
**KPIs relacionados:** [KPIs que utilizam esta medida]
**Comportamento esperado:** [O que a medida retorna quando não há dados, ou quando um filtro específico é aplicado]

---

## 6. Páginas do Relatório

### Página 1 — [Título da Página]

**Objetivo:** [Descrição do objetivo da página e público-alvo]

**Descrição:** [Descrição geral da página, principais elementos e sua finalidade]

![Página — [Título da Página]]([caminho-do-arquivo]/[nome-do-arquivo].png)

#### Visuais

---

**Visual 1 — [Nome do Visual]**

![Visual — [Nome do Visual]]([caminho-do-arquivo]/[nome-do-arquivo].png)

| Campo | Valor |
|---|---|
| **Tipo** | [Tipo de Visual] |
| **Medidas utilizadas** | `[Medida 1]`, `[Medida 2]` |
| **Campos** | `[Tabela[Coluna]]` |

**Observações:** [Formatação condicional, ordenação, interações habilitadas, etc.]

---

**Visual 2 — [Nome do Visual]**

![Visual — [Nome do Visual]]([caminho-do-arquivo]/[nome-do-arquivo].png)

| Campo | Valor |
|---|---|
| **Tipo** | [Tipo de Visual] |
| **Medidas utilizadas** | `[Medida 1]`, `[Medida 2]` |
| **Campos** | `[Tabela[Coluna]]` |

**Observações:** [Formatação condicional, ordenação, interações habilitadas, etc.]

---

#### Filtros

| Filtro | Tipo | Campo | Descrição |
|---|---|---|---|
| [Nome do Filtro] | [Segmentação de Dados / Filtro de Página / Filtro de Relatório / Filtro de Visual] | `[Tabela[Coluna]]` | [Descrição do filtro e visuais afetados] |

---

## 7. Glossário

| Termo | Definição |
|---|---|
| **[Termo 1]** | [Definição] |
| **[Termo 2]** | [Definição] |
| **[Termo 3]** | [Definição] |

---

*Documentado por: [Responsável] · Última revisão: [MM/AAAA]*