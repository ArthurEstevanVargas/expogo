# PRD — Minha Saúde Feminina

**Versão:** 1.0  
**Data:** 11 de maio de 2026  
**Status:** Protótipo (MVP navegável)  
**Responsável:** Equipe de Medicina — UNIFEBE

---

## 1. Visão Geral

**Minha Saúde Feminina** é um aplicativo mobile-first de educação em saúde da mulher. Reúne, em linguagem acessível, conteúdo elaborado por estudantes de Medicina da UNIFEBE com base em diretrizes do Ministério da Saúde e referências científicas confiáveis.

### 1.1 Problema
Mulheres têm dificuldade de encontrar informação confiável, organizada e em linguagem clara sobre temas íntimos de saúde (ciclo, gravidez, menopausa, prevenção). Conteúdo disperso na internet gera dúvida e desinformação.

### 1.2 Proposta de valor
- Conteúdo curado e revisado por estudantes de Medicina.
- Organização por **fases da vida** e **temas de cuidado**.
- Leitura rápida, design acolhedor, tom informativo e não-alarmista.

### 1.3 Público-alvo
- **Primário:** mulheres de 15 a 60 anos buscando informação confiável de saúde.
- **Secundário (futuro):** estudantes/curadores de Medicina que produzirão e revisarão o conteúdo.

---

## 2. Escopo

### 2.1 MVP (atual — protótipo navegável)
- Home com destaque, grid de categorias e últimos conteúdos.
- Navegação por 6 categorias temáticas.
- Leitura de artigos com fonte/atribuição.
- Busca textual.
- Tela de perfil (estática).
- Navegação inferior persistente.

### 2.2 Fora do escopo do MVP (roadmap)
- Autenticação de usuárias.
- Favoritar / salvar artigos.
- Compartilhamento nativo.
- Painel administrativo para curadores (estudantes de Medicina).
- Notificações, lembretes de ciclo, agenda de exames.
- Multi-idioma.

---

## 3. Personas

### 3.1 Usuária final — "Marina, 28"
Quer entender alterações do próprio ciclo sem precisar fazer login. Lê no transporte público, no celular. Valoriza confiança e linguagem clara.

### 3.2 Curadora — "Beatriz, estudante de Medicina" *(futuro)*
Precisa cadastrar/atualizar artigos, vincular fontes e categorizar conteúdo. Trabalha em desktop.

---

## 4. Entidades / Modelo de Dados

### 4.1 MVP (em código, `src/data/categories.tsx`)

**Category**
| Campo | Tipo | Descrição |
|---|---|---|
| id | string (slug) | Identificador único |
| title | string | Nome exibido |
| description | string | Descrição curta |
| icon | ReactNode | Ícone (lucide-react) |
| color | string (token) | Cor de texto/realce |
| bgColor | string (token) | Cor de fundo do card |
| articles | Article[] | Conteúdos associados |

**Article**
| Campo | Tipo | Descrição |
|---|---|---|
| id | string (slug) | Identificador único |
| title | string | Título do artigo |
| summary | string | Resumo (1–2 linhas) |
| content | string | Texto completo (parágrafos `\n`) |
| categoryId | string | FK → Category.id |

### 4.2 Categorias do MVP
1. Saúde Menstrual
2. Saúde Sexual
3. Gravidez
4. Pós-parto
5. Prevenção
6. Menopausa

### 4.3 Entidades futuras (roadmap)
- **User** (id, email, nome, criadoEm)
- **Bookmark** (userId, articleId, criadoEm)
- **Author** (id, nome, instituição, bio)
- **Role** (`reader` | `curator` | `admin`) — em tabela separada `user_roles`
- **Source** (id, articleId, url, descrição)
- **Revision** (id, articleId, autorId, status, data)

---

## 5. Telas e Fluxos

### 5.1 Mapa de telas

| Rota | Tela | Função |
|---|---|---|
| `/` | Home | Saudação, destaque, grid de categorias, últimos conteúdos |
| `/categorias` | Categorias | Lista completa das 6 categorias |
| `/categoria/:id` | Categoria | Cabeçalho da categoria + lista de artigos |
| `/artigo/:id` | Artigo | Leitura, atribuição da fonte, ações (salvar/compartilhar — visual) |
| `/buscar` | Buscar | Campo de busca + resultados em tempo real |
| `/perfil` | Perfil | Dados da usuária e preferências (estático no MVP) |

### 5.2 Fluxo principal
```
Home ──▶ Categoria ──▶ Artigo
  │           ▲
  ├──▶ Categorias ─────┘
  ├──▶ Buscar ──▶ Artigo
  └──▶ Perfil
```

### 5.3 Navegação
**BottomNav** persistente com: Início · Categorias · Buscar · Perfil.

---

## 6. Requisitos

### 6.1 Funcionais (RF)
- **RF-01** Listar categorias e artigos (dados locais).
- **RF-02** Abrir artigo e exibir conteúdo, resumo e atribuição.
- **RF-03** Buscar artigos por título/resumo (case-insensitive, em tempo real).
- **RF-04** Navegação por bottom-nav e botão "voltar" no artigo.
- **RF-05** Animação de entrada suave entre telas (sem flicker).

### 6.2 Não funcionais (RNF)
- **RNF-01** Mobile-first (390×844 base, contêiner `max-w-md` centralizado).
- **RNF-02** Tempo de transição entre telas < 300 ms.
- **RNF-03** Acessibilidade: contraste AA, áreas de toque ≥ 44px, foco visível.
- **RNF-04** SEO: title < 60 chars, meta description < 160 chars, H1 único por tela.
- **RNF-05** PWA-ready (futuro): instalável e leitura offline.
- **RNF-06** Sem dependência de backend no MVP.

---

## 7. Design System

### 7.1 Princípios
- **Acolhedor** — paleta quente, formas arredondadas (`rounded-2xl`).
- **Confiável** — tipografia serif para títulos, sans para corpo.
- **Calmo** — animações sutis, sem ruído visual.

### 7.2 Tipografia
| Uso | Família | Peso |
|---|---|---|
| Títulos / H1–H2 | Serif (`font-serif`) | 400 |
| Corpo / UI | Sans (sistema) | 400/500 |
| Eyebrow / categoria | Sans uppercase tracking-wider | 600 |

### 7.3 Paleta (tokens semânticos HSL — `index.css` / `tailwind.config.ts`)
- `primary` / `primary-foreground` — destaque principal (botão hero)
- `coral` / `coral-light` — saúde menstrual, menopausa
- `peach` — saúde sexual
- `lavender` / `lavender-foreground` — gravidez
- `sage` / `sage-foreground` — pós-parto
- `accent` / `accent-foreground` — prevenção
- `background` · `foreground` · `muted` · `border` · `card`

> **Regra:** componentes nunca usam classes de cor cruas (`bg-white`, `text-black`). Sempre tokens semânticos.

### 7.4 Componentes-chave
- **CategoryCard** — card 2 col., ícone + título serif + descrição.
- **FeaturedCard** — bloco `bg-primary` com eyebrow "Destaque".
- **ArticleListItem** — card branco, borda sutil, título + resumo `line-clamp-2`.
- **StickyHeader (Artigo)** — `backdrop-blur-md`, voltar + ações.
- **BottomNav** — 4 itens, ícone + label.

### 7.5 Movimento
- `fade-in-up`: `translateY(6px) → 0`, `opacity 0 → 1`, **0.25s ease-out**.
- Aplicada **no contêiner pai** (não em itens individuais) para evitar pop-in escalonado.
- Press feedback: `active:scale-[0.97~0.98]`.

### 7.6 Tom & voz
- 2ª pessoa, acolhedor ("você pode…").
- Sem alarmismo. Quando aplicável: "procure orientação médica".
- Sempre creditar a fonte ao final do artigo.

---

## 8. Métricas de Sucesso

| Métrica | Alvo (3 meses pós-lançamento) |
|---|---|
| Sessões / usuária / semana | ≥ 2 |
| Leitura completa de artigo | ≥ 60% |
| Taxa de retorno em 7 dias | ≥ 35% |
| Tempo médio na tela de artigo | ≥ 90s |
| Buscas com resultado clicado | ≥ 50% |

---

## 9. Roadmap

### Curto prazo (1–2 sprints)

- Conteúdo: ampliar artigos por categoria (≥ 8 cada).
- SEO básico e PWA install.

### Médio prazo (3–6 sprints)

- Lovable Cloud: auth, favoritos, perfil real.
- Painel de curadoria para estudantes (CRUD de artigos com revisão).
- Compartilhamento nativo.

### Longo prazo

- Lembretes de ciclo / agenda de exames preventivos.
- Conteúdo em vídeo curto.
- Multi-idioma (PT/ES/EN).

---

## 10. Anexos

Screenshots do protótipo (gerados em sessão anterior, disponíveis em `/mnt/documents/`):

- `01_Home.png`
- `02_Categorias.png`
- `03_Categoria_Detalhe.png`
- `04_Artigo.png`
- `05_Buscar.png`
- `06_Perfil.png`

**Fonte de conteúdo:** elaborado por estudantes de Medicina da UNIFEBE com base em diretrizes do Ministério da Saúde e referências científicas confiáveis.
