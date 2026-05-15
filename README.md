# Minha Saude Feminina

Minha Saude Feminina e um aplicativo mobile/web feito com Expo e Expo Router para organizar e exibir conteudos informativos sobre saude da mulher. O projeto consome uma API REST real para listar artigos, categorias e detalhes de conteudo, oferecendo uma experiencia simples de leitura sem exigir cadastro ou login no MVP.

## Objetivo

O objetivo do projeto e facilitar o acesso a informacoes de saude feminina em linguagem clara, organizada por temas de cuidado e fases da vida. A aplicacao funciona como uma vitrine de conteudos confiaveis, com busca, navegacao por categorias e leitura completa de artigos com fontes quando fornecidas pela API.

Este projeto tambem inclui uma area administrativa simples para gerenciar categorias. Essa area usa chave de API e deve ser tratada como recurso interno ou temporario enquanto nao houver uma camada server-side dedicada para proteger credenciais em produção.

## O que o app faz hoje

- Exibe uma tela inicial com destaque, categorias e ultimos conteudos.
- Lista categorias cadastradas na API.
- Mostra artigos filtrados por categoria.
- Permite buscar artigos por palavra-chave ou tema.
- Abre a pagina de detalhe de um artigo, incluindo resumo, conteudo e fontes.
- Possui uma tela estatica de perfil explicando que a leitura nao exige autenticacao no MVP.
- Permite criar, editar e excluir categorias na tela de gerenciamento, usando uma chave administrativa.

## Tecnologias

- Expo SDK 54
- React 19
- React Native 0.81
- Expo Router 6
- TypeScript
- Fetch API para comunicacao HTTP
- ESLint com configuracao Expo

## Requisitos

- Node.js instalado
- npm instalado
- Expo CLI via `npx expo`

## Configuracao

Crie um arquivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Variavel obrigatoria:

```env
EXPO_PUBLIC_API_BASE_URL=https://fastify-production-62e2.up.railway.app/api/v1/
```

A URL da API e lida em `config/env.ts` e usada pela camada HTTP em `lib/http/api-client.ts`.

### Chave administrativa

As leituras publicas (`GET`) nao exigem chave. As mutacoes administrativas (`POST`, `PATCH`, `DELETE`) usam `admin: true` nos services e enviam `x-api-key` pela camada HTTP.

Para usar a tela de gerenciamento de categorias, configure:

```env
EXPO_PUBLIC_ADMIN_API_KEY=sua-chave-admin
```

Importante: variaveis `EXPO_PUBLIC_*` ficam visiveis no bundle entregue ao usuario no Expo/browser. Use essa chave apenas em ambiente interno, desenvolvimento ou painel temporario. Para producao publica, mantenha a chave em uma camada server-side, como BFF, API route ou backend administrativo.

## Como rodar

Instale as dependencias:

```bash
npm install
```

Rode no navegador:

```bash
npm run web
```

Rode com Expo Go:

```bash
npx expo start
```

Outros scripts disponiveis:

```bash
npm run android
npm run ios
npm run lint
```

## Estrutura do projeto

```text
app/                  Rotas e telas com Expo Router
app/(tabs)/           Abas principais: inicio, categorias, busca e perfil
app/artigo/[id].tsx   Detalhe de artigo
app/categoria/[id].tsx Detalhe de categoria com lista de artigos
components/           Componentes reutilizaveis de interface
config/               Configuracao de ambiente
constants/            Tema visual e constantes de UI
hooks/                Hooks de dados, estados de carregamento, erro e mutacoes
lib/http/             Cliente HTTP, token opcional e tratamento de erros
services/             Services por dominio da API
types/                Tipos TypeScript de artigos, categorias e respostas da API
assets/               Icones, splash screen e imagens do app
```

## Rotas principais

- `/`: inicio com destaque, categorias e ultimos artigos.
- `/categorias`: lista de categorias.
- `/categoria/[id]`: detalhe de uma categoria e seus artigos.
- `/buscar`: busca de artigos com debounce.
- `/perfil`: informacoes basicas do MVP e acesso ao gerenciamento.
- `/artigo/[id]`: leitura completa de um artigo.
- `/gerenciar-categorias`: criacao, edicao e remocao de categorias.

## Camada de API

A comunicacao com o backend fica centralizada em `lib/http/api-client.ts`. Os services usam esse cliente para manter as chamadas separadas por dominio:

- `services/article-service.ts`: listagem e detalhe de artigos.
- `services/category-service.ts`: listagem, detalhe e mutacoes de categorias.
- `services/author-service.ts`: chamadas relacionadas a autores.

O tratamento de erros da API e padronizado pela classe `ApiError`, e os hooks transformam os retornos em estados de tela como carregando, erro, vazio e sucesso.

## Verificacao

Execute o lint antes de publicar alterações:

```bash
npm run lint
```
