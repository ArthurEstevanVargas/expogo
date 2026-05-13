# Minha Saude Feminina

Aplicativo mobile Expo para leitura de conteudos de saude feminina consumindo a API real documentada no projeto.

## Configuracao

Crie um arquivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Variavel obrigatoria:

```env
EXPO_PUBLIC_API_BASE_URL=https://fastify-production-62e2.up.railway.app/api/v1/
```

A URL e lida somente pela camada HTTP em `config/env.ts` e normalizada para evitar barras duplicadas.

## Rotas administrativas

Leituras publicas (`GET`) nao exigem chave. Mutacoes administrativas (`POST`, `PATCH`, `DELETE`) usam `admin: true` nos services e enviam `x-api-key` pela camada HTTP.

No Expo/browser, uma variavel `EXPO_PUBLIC_ADMIN_API_KEY` fica visivel no bundle entregue ao usuario. Use-a apenas em painel interno temporario. Para producao publica, mantenha a chave em uma camada server-side, como BFF, API route ou backend admin.

```env
EXPO_PUBLIC_ADMIN_API_KEY=sua-chave-admin
```

## Rodar

```bash
npm install
npm run web
```

Para Expo Go:

```bash
npx expo start
```

## Estrutura

- `app/`: rotas Expo Router.
- `components/`: componentes reutilizaveis de UI.
- `config/`: configuracao de ambiente.
- `lib/http/`: cliente HTTP, token opcional e tratamento de erros.
- `services/`: services por dominio da API.
- `hooks/`: hooks de carregamento, erro, empty state, retry e mutacoes.
- `types/`: contratos TypeScript de requests e responses.

## Verificacao

```bash
npm run lint
```
