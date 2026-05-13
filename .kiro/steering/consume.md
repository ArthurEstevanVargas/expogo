# Consumo da API no Frontend

Este documento define um padrão recomendado para o frontend consumir a API publicada.
Ele não implementa código no frontend; os exemplos servem como referência técnica em
TypeScript e devem ser ajustados ao framework usado pela aplicação.

## URL Base

API publicada:

```text
https://fastify-production-62e2.up.railway.app/api/v1/
```

Use a URL base sempre por variável de ambiente. Não espalhe a URL da API em
componentes, hooks ou services.

Exemplos por ferramenta:

```env
# Vite
VITE_API_BASE_URL=https://fastify-production-62e2.up.railway.app/api/v1

# Next.js, para uso no browser
NEXT_PUBLIC_API_BASE_URL=https://fastify-production-62e2.up.railway.app/api/v1

# Create React App
REACT_APP_API_BASE_URL=https://fastify-production-62e2.up.railway.app/api/v1
```

Para rotas administrativas (`POST`, `PATCH` e `DELETE`), a API exige
`ADMIN_API_KEY` configurada no backend. Essa chave deve existir no ambiente da
API no Railway e ter pelo menos 32 caracteres.

Se o frontend rodar no browser, variáveis como `VITE_ADMIN_API_KEY`,
`NEXT_PUBLIC_ADMIN_API_KEY` e `REACT_APP_ADMIN_API_KEY` ficam visíveis no bundle
entregue ao usuário. Use isso apenas em painel interno temporário e não em
frontend público. O padrão mais seguro é manter a chave somente em código
server-side, como uma API route do Next.js, BFF ou backend admin.

No frontend, normalize a URL para evitar barras duplicadas:

```ts
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL não configurada');
}
```

Se o projeto usar Next.js, substitua `import.meta.env.VITE_API_BASE_URL` por
`process.env.NEXT_PUBLIC_API_BASE_URL`.

## Swagger/OpenAPI

No estado atual do repositório, não foi localizada configuração Swagger/OpenAPI
ativa. O arquivo [README da API](./README.md) registra que não há pacotes
`@fastify/swagger` ou `@fastify/swagger-ui` configurados no projeto.

Enquanto uma documentação OpenAPI pública não existir, use como referência:

- [Rotas da API](./routes.md)
- [Exemplos de consumo](./examples.md)
- [Erros da API](./errors.md)

Se Swagger/OpenAPI for publicado futuramente, ele deve ser a fonte de verdade
para paths, payloads, parâmetros, status codes e schemas.

## Organização Recomendada

Uma estrutura simples e sustentável para o frontend:

```text
src/
  config/
    env.ts
  lib/
    http/
      apiClient.ts
      apiError.ts
      authToken.ts
  services/
    authService.ts
    userService.ts
    transactionService.ts
    categoryService.ts
    accountService.ts
  hooks/
    useAuth.ts
    useTransactions.ts
    useCategories.ts
    useAccounts.ts
  types/
    api.ts
    auth.ts
    user.ts
    transaction.ts
    category.ts
    account.ts
```

Os nomes acima são exemplos por domínio. Ajuste os services aos domínios reais
expostos pela API. Neste repositório, a documentação atual cita recursos como
categorias, autores, artigos e fontes de artigos.

## Cliente HTTP

Como este repositório não define padrão de frontend nem dependência Axios, o
exemplo recomendado usa `fetch`, disponível nativamente no browser.

### Tipos Base

```ts
export type ApiListResponse<T> = {
  data: T[];
};

export type ApiPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ApiPaginatedResponse<T> = {
  data: T[];
  pagination: ApiPagination;
};

export type ApiErrorBody = {
  error: true;
  message: string;
  code: string;
};

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
  admin?: boolean;
};
```

### Token de Autenticação

As rotas públicas de leitura não exigem autenticação. Rotas administrativas de
escrita exigem `ADMIN_API_KEY`, conforme a seção "Rotas Administrativas com
ADMIN_API_KEY". Caso a API passe a usar JWT para usuários, use Bearer Token no
header `Authorization`.

Para SPAs, uma implementação comum é guardar o access token em memória ou em
`localStorage`. `localStorage` é simples, mas aumenta a exposição em caso de XSS.
Quando possível, prefira cookies `HttpOnly` emitidos pelo backend. Se a API
retornar somente token para o browser, centralize o acesso:

```ts
const ACCESS_TOKEN_KEY = 'access_token';

export function getAccessToken(): string | null {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}
```

### Cliente com Fetch

```ts
import { clearAccessToken, getAccessToken } from './authToken';
import type { ApiErrorBody, ApiRequestOptions } from '../../types/api';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
const adminApiKey = import.meta.env.VITE_ADMIN_API_KEY;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(params: {
    status: number;
    code: string;
    message: string;
    details?: unknown;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
  }
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL não configurada');
  }

  const token = options.auth === false ? null : getAccessToken();
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.admin) {
    if (!adminApiKey) {
      throw new Error('VITE_ADMIN_API_KEY não configurada');
    }

    headers.set('x-api-key', adminApiKey);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    const errorPayload = payload as Partial<ApiErrorBody> | undefined;

    if (response.status === 401) {
      clearAccessToken();
    }

    throw new ApiError({
      status: response.status,
      code: errorPayload?.code ?? 'HTTP_ERROR',
      message: errorPayload?.message ?? 'Não foi possível completar a solicitação.',
      details: payload
    });
  }

  return payload as T;
}
```

## Headers

Headers padrão:

```text
Accept: application/json
Content-Type: application/json
Authorization: Bearer <token>
x-api-key: <admin-api-key>
```

Regras:

- Envie `Accept: application/json` em todas as chamadas.
- Envie `Content-Type: application/json` apenas quando houver body JSON.
- Envie `Authorization` somente quando a rota exigir autenticação.
- Envie `x-api-key` somente para rotas administrativas mutáveis (`POST`, `PATCH`, `DELETE`) quando estiver usando o mecanismo temporário de `ADMIN_API_KEY`.
- Não monte headers manualmente em componentes; centralize no cliente HTTP.
- Para upload de arquivo com `FormData`, não defina `Content-Type` manualmente.

## Rotas Administrativas com ADMIN_API_KEY

No estado atual da API, leituras públicas continuam sem chave:

- `GET /categories`
- `GET /authors`
- `GET /articles`
- `GET /article-sources`

As rotas de escrita exigem a chave administrativa:

- `POST`, `PATCH` e `DELETE` em `/categories`
- `POST`, `PATCH` e `DELETE` em `/authors`
- `POST`, `PATCH` e `DELETE` em `/articles`
- `POST`, `PATCH` e `DELETE` em `/article-sources`

Envie a chave por um destes headers:

```text
x-api-key: <admin-api-key>
```

ou:

```text
Authorization: Bearer <admin-api-key>
```

Use `x-api-key` no cliente HTTP para não confundir essa chave administrativa com
um futuro JWT de usuário.

Exemplo direto:

```ts
await apiRequest<Category>('/categories', {
  method: 'POST',
  admin: true,
  body: {
    name: 'Saúde Menstrual',
    slug: 'saude-menstrual',
    description: 'Conteúdos sobre ciclo menstrual.'
  }
});
```

Respostas esperadas:

- `401 UNAUTHORIZED`: chave ausente ou incorreta.
- `503 ADMIN_API_KEY_NOT_CONFIGURED`: `ADMIN_API_KEY` não foi configurada na API.

Para produção, prefira um fluxo server-side:

```ts
// Exemplo em código server-side. Não use NEXT_PUBLIC_ para a chave admin.
const response = await fetch(`${process.env.API_BASE_URL}/categories`, {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-api-key': process.env.ADMIN_API_KEY ?? ''
  },
  body: JSON.stringify(payload)
});
```

## Services por Domínio

Services devem representar casos de uso de API por domínio. Eles não devem
conhecer estado visual de componente, loading ou toast. Essas responsabilidades
ficam em hooks, stores ou componentes.

Use endpoints reais da documentação da API. Quando os exemplos abaixo usarem
paths como `/transactions` ou `/accounts`, trate-os como placeholders até serem
confirmados no Swagger/OpenAPI ou em `docs/api/routes.md`.

### Exemplo: categoryService

`/categories` é um recurso documentado neste repositório.

```ts
import { apiRequest } from '../lib/http/apiClient';
import type { ApiListResponse } from '../types/api';

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryRequest = {
  name: string;
  slug: string;
  description: string;
  displayOrder?: number;
};

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export const categoryService = {
  list(): Promise<ApiListResponse<Category>> {
    return apiRequest<ApiListResponse<Category>>('/categories');
  },

  getByIdOrSlug(idOrSlug: string): Promise<Category> {
    return apiRequest<Category>(`/categories/${idOrSlug}`);
  },

  create(payload: CreateCategoryRequest): Promise<Category> {
    return apiRequest<Category>('/categories', {
      method: 'POST',
      admin: true,
      body: payload
    });
  },

  update(id: string, payload: UpdateCategoryRequest): Promise<Category> {
    return apiRequest<Category>(`/categories/${id}`, {
      method: 'PATCH',
      admin: true,
      body: payload
    });
  },

  remove(id: string): Promise<void> {
    return apiRequest<void>(`/categories/${id}`, {
      method: 'DELETE',
      admin: true
    });
  }
};
```

### Exemplo: authService

Não há autenticação implementada nas rotas atuais documentadas neste repositório.
O exemplo abaixo mostra o padrão caso a API exponha login/refresh/logout via JWT.
Ajuste os paths conforme Swagger/OpenAPI antes de usar.

```ts
import { apiRequest } from '../lib/http/apiClient';

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export const authService = {
  login(payload: LoginRequest): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
      auth: false
    });
  },

  me(): Promise<AuthResponse['user']> {
    return apiRequest<AuthResponse['user']>('/auth/me');
  },

  refresh(refreshToken: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      auth: false
    });
  }
};
```

### Exemplo: transactionService

Use este padrão somente se a API expuser transações.

```ts
import { apiRequest } from '../lib/http/apiClient';
import type { ApiPaginatedResponse } from '../types/api';

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  categoryId: string;
  accountId: string;
};

export type CreateTransactionRequest = Omit<Transaction, 'id'>;
export type UpdateTransactionRequest = Partial<CreateTransactionRequest>;

export const transactionService = {
  list(params: { page?: number; pageSize?: number } = {}) {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', String(params.page));
    if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));

    const query = searchParams.toString();

    return apiRequest<ApiPaginatedResponse<Transaction>>(
      `/transactions${query ? `?${query}` : ''}`
    );
  },

  create(payload: CreateTransactionRequest): Promise<Transaction> {
    return apiRequest<Transaction>('/transactions', {
      method: 'POST',
      admin: true,
      body: payload
    });
  },

  update(id: string, payload: UpdateTransactionRequest): Promise<Transaction> {
    return apiRequest<Transaction>(`/transactions/${id}`, {
      method: 'PATCH',
      admin: true,
      body: payload
    });
  },

  remove(id: string): Promise<void> {
    return apiRequest<void>(`/transactions/${id}`, {
      method: 'DELETE',
      admin: true
    });
  }
};
```

### userService, accountService e demais services

Mantenha a mesma assinatura:

```ts
export const userService = {
  list() {},
  getById(id: string) {},
  create(payload: CreateUserRequest) {},
  update(id: string, payload: UpdateUserRequest) {},
  remove(id: string) {}
};

export const accountService = {
  list() {},
  getById(id: string) {},
  create(payload: CreateAccountRequest) {},
  update(id: string, payload: UpdateAccountRequest) {},
  remove(id: string) {}
};
```

Antes de implementar cada método, confirme o path, o método HTTP, o payload e a
resposta na documentação oficial da API.

## Exemplos por Método HTTP

Os exemplos abaixo usam paths genéricos. Substitua pelo endpoint real da API.

### GET

```ts
const response = await apiRequest<ApiListResponse<Category>>('/categories');
```

### POST

```ts
const category = await apiRequest<Category>('/categories', {
  method: 'POST',
  admin: true,
  body: {
    name: 'Saúde Menstrual',
    slug: 'saude-menstrual',
    description: 'Conteúdos sobre ciclo menstrual.'
  }
});
```

### PUT/PATCH

Prefira `PATCH` para atualização parcial quando a API suportar esse método.
Use `PUT` apenas quando a API exigir substituição completa do recurso.

```ts
const category = await apiRequest<Category>('/categories/category-id', {
  method: 'PATCH',
  admin: true,
  body: {
    description: 'Nova descrição.'
  }
});
```

### DELETE

```ts
await apiRequest<void>('/categories/category-id', {
  method: 'DELETE',
  admin: true
});
```

## Respostas de Sucesso

A documentação atual da API indica três formatos principais:

Lista simples:

```ts
type ListResponse<T> = {
  data: T[];
};
```

Lista paginada:

```ts
type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
```

Recurso individual:

```ts
type ResourceResponse<T> = T;
```

Para `204 No Content`, trate como sucesso sem corpo:

```ts
await categoryService.remove(categoryId);
```

## Tratamento de Erros

Erros tratados pela API seguem o formato documentado:

```ts
type ApiErrorBody = {
  error: true;
  message: string;
  code: string;
};
```

Padronize a conversão de erro técnico para mensagem exibível:

```ts
import { ApiError } from '../lib/http/apiClient';

export function getUserFacingErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível completar a solicitação. Tente novamente.';
  }

  switch (error.status) {
    case 400:
      return 'Verifique os dados informados e tente novamente.';
    case 401:
      return 'Sua sessão expirou. Faça login novamente.';
    case 403:
      return 'Você não tem permissão para executar esta ação.';
    case 404:
      return 'O recurso solicitado não foi encontrado.';
    case 409:
      return 'A operação conflita com dados já existentes.';
    case 422:
      return 'Alguns campos precisam ser corrigidos antes de continuar.';
    case 500:
      return 'Ocorreu um erro interno. Tente novamente em instantes.';
    case 503:
      return 'Serviço temporariamente indisponível. Tente novamente em instantes.';
    default:
      return error.message || 'Não foi possível completar a solicitação.';
  }
}
```

Tratamento recomendado por status:

| Status | Significado | Ação no frontend |
| --- | --- | --- |
| 400 | Requisição inválida | Revisar payload, query params ou campos obrigatórios. Exibir mensagem de validação. |
| 401 | Não autenticado | Limpar token, encerrar sessão local e redirecionar para login. |
| 403 | Sem permissão | Exibir bloqueio de permissão e não repetir automaticamente. |
| 404 | Recurso não encontrado | Exibir empty state ou página de não encontrado. |
| 409 | Conflito | Informar conflito, como slug/e-mail já existente ou recurso em uso. |
| 422 | Erro semântico de validação | Mapear erros por campo quando a API fornecer detalhes. |
| 500 | Erro interno | Exibir mensagem genérica e permitir retry quando fizer sentido. |
| 503 | Serviço indisponível | Verificar configuração da API, como `ADMIN_API_KEY` ou `DATABASE_URL`, e permitir retry quando fizer sentido. |

Sempre que existir `code`, prefira regras por `code` para casos específicos:

```ts
function getSpecificErrorMessage(error: ApiError): string {
  switch (error.code) {
    case 'SLUG_ALREADY_EXISTS':
      return 'Já existe um registro usando este slug.';
    case 'CATEGORY_NOT_FOUND':
      return 'Categoria não encontrada.';
    case 'VALIDATION_ERROR':
      return 'Os dados enviados são inválidos.';
    case 'ADMIN_API_KEY_NOT_CONFIGURED':
      return 'A chave administrativa não está configurada na API.';
    case 'UNAUTHORIZED':
      return 'Você não está autenticado para executar esta ação.';
    default:
      return getUserFacingErrorMessage(error);
  }
}
```

## Autenticação com Bearer Token

Caso a API use JWT:

1. O login retorna `accessToken` e, se aplicável, `refreshToken`.
2. O frontend salva o token de forma centralizada.
3. O cliente HTTP lê o token antes de cada request autenticada.
4. O cliente envia `Authorization: Bearer <accessToken>`.
5. Em `401`, o frontend limpa a sessão e redireciona para login ou tenta refresh.

Exemplo de uso após login:

```ts
import { authService } from '../services/authService';
import { setAccessToken } from '../lib/http/authToken';

async function login(email: string, password: string): Promise<void> {
  const response = await authService.login({ email, password });
  setAccessToken(response.accessToken);
}
```

Refresh token, se existir:

```ts
async function refreshSession(refreshToken: string): Promise<string | null> {
  try {
    const response = await authService.refresh(refreshToken);
    setAccessToken(response.accessToken);
    return response.accessToken;
  } catch {
    clearAccessToken();
    return null;
  }
}
```

Evite múltiplos refreshes simultâneos. Em aplicações maiores, controle uma única
promessa de refresh compartilhada para as requests que falharem com `401`.

## Hooks de Consumo

Hooks devem cuidar de estado de tela: loading, erro, dados, retry e atualização.
Eles chamam services; não montam URL nem headers.

### useCategories

```ts
import { useCallback, useEffect, useState } from 'react';
import { categoryService, type Category } from '../services/categoryService';
import { getUserFacingErrorMessage } from '../lib/http/apiError';

type UseCategoriesState =
  | { status: 'idle'; data: Category[] }
  | { status: 'loading'; data: Category[] }
  | { status: 'success'; data: Category[] }
  | { status: 'empty'; data: Category[] }
  | { status: 'error'; data: Category[]; message: string };

export function useCategories() {
  const [state, setState] = useState<UseCategoriesState>({
    status: 'idle',
    data: []
  });

  const load = useCallback(async () => {
    setState((current) => ({ status: 'loading', data: current.data }));

    try {
      const response = await categoryService.list();

      setState({
        status: response.data.length > 0 ? 'success' : 'empty',
        data: response.data
      });
    } catch (error) {
      setState({
        status: 'error',
        data: [],
        message: getUserFacingErrorMessage(error)
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    ...state,
    retry: load
  };
}
```

### useAuth

```ts
import { useState } from 'react';
import { authService, type AuthResponse } from '../services/authService';
import { clearAccessToken, setAccessToken } from '../lib/http/authToken';

type AuthUser = AuthResponse['user'];

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);

  async function login(email: string, password: string): Promise<void> {
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      setAccessToken(response.accessToken);
      setUser(response.user);
    } finally {
      setLoading(false);
    }
  }

  function logout(): void {
    clearAccessToken();
    setUser(null);
  }

  return {
    user,
    loading,
    isAuthenticated: user !== null,
    login,
    logout
  };
}
```

### useTransactions, useAccounts e useCategories

Para listagens paginadas:

- Exponha `data`, `pagination`, `loading`, `error`, `empty` e `retry`.
- Guarde filtros em estado ou receba filtros por parâmetro.
- Recarregue quando filtros, página ou tamanho da página mudarem.
- Cancele ou ignore responses antigas quando o usuário trocar filtros rapidamente.

Formato recomendado:

```ts
type UseResourceResult<T> = {
  data: T[];
  loading: boolean;
  empty: boolean;
  error: string | null;
  retry: () => Promise<void>;
};
```

## Uso em Componentes

Exemplo com hook:

```tsx
export function CategoriesList() {
  const categories = useCategories();

  if (categories.status === 'loading') {
    return <p>Carregando...</p>;
  }

  if (categories.status === 'error') {
    return (
      <div>
        <p>{categories.message}</p>
        <button type="button" onClick={() => void categories.retry()}>
          Tentar novamente
        </button>
      </div>
    );
  }

  if (categories.status === 'empty') {
    return <p>Nenhuma categoria encontrada.</p>;
  }

  return (
    <ul>
      {categories.data.map((category) => (
        <li key={category.id}>{category.name}</li>
      ))}
    </ul>
  );
}
```

## Boas Práticas

Loading:

- Mostre estado de carregamento em toda chamada que impacta a tela.
- Evite bloquear a tela inteira quando apenas uma área está recarregando.
- Em ações de formulário, desabilite o botão de submit enquanto a request roda.

Empty state:

- Diferencie lista vazia de erro.
- Mostre mensagem objetiva e, quando fizer sentido, uma ação primária.

Error state:

- Exiba mensagens amigáveis para usuário final.
- Registre detalhes técnicos apenas em logs ou ferramentas de observabilidade.
- Não exponha stack trace, SQL, tokens ou payloads sensíveis.

Retry:

- Ofereça retry para falhas transitórias, como rede ou `500`.
- Não faça retry automático para `400`, `401`, `403`, `404`, `409` ou `422`.
- Para `503`, permita retry quando for falha transitória; se o `code` for
  `ADMIN_API_KEY_NOT_CONFIGURED`, corrija a variável de ambiente na API.
- Use backoff em retries automáticos para evitar sobrecarga.

Refresh token:

- Só implemente se a API fornecer endpoint e contrato de refresh.
- Evite refresh em loop quando o refresh token também expirar.
- Depois de falha no refresh, limpe a sessão e envie o usuário ao login.

Logout automático:

- Em `401`, remova o token local.
- Limpe dados sensíveis em stores/cache.
- Redirecione para login preservando a rota de origem quando fizer sentido.

Cache e revalidação:

- Para dados raramente mutáveis, use cache com invalidação explícita.
- Após `POST`, `PATCH` ou `DELETE`, invalide ou recarregue a listagem afetada.
- Se usar React Query, SWR ou TanStack Query, mantenha services independentes da biblioteca.

Validação:

- Valide formulários no frontend antes de enviar.
- Trate validação da API como fonte definitiva.
- Se a API retornar erros por campo futuramente, normalize em uma estrutura única
  para os componentes de formulário.

## Checklist de Integração

- [ ] A URL base está configurada por variável de ambiente.
- [ ] Nenhum componente monta URL absoluta da API diretamente.
- [ ] O cliente HTTP centraliza `Accept`, `Content-Type` e `Authorization`.
- [ ] Chamadas `POST`, `PATCH` e `DELETE` para rotas administrativas usam `admin: true` ou adicionam `x-api-key` centralmente.
- [ ] `ADMIN_API_KEY` não é exposta em frontend público; quando necessário, ela fica em código server-side.
- [ ] O token, se usado, é salvo, recuperado e limpo por funções centralizadas.
- [ ] `401` limpa a sessão e aciona login ou refresh token.
- [ ] Services estão separados por domínio e não possuem estado visual.
- [ ] Hooks controlam loading, empty state, error state e retry.
- [ ] Tipos de request e response estão declarados em TypeScript.
- [ ] Listagens tratam `data: []`.
- [ ] Paginação usa `page`, `pageSize`, `total` e `totalPages` quando disponíveis.
- [ ] `204 No Content` é tratado como sucesso sem tentar ler JSON.
- [ ] Erros são tratados por `status` e, quando disponível, por `code`.
- [ ] Mensagens exibidas ao usuário são amigáveis e padronizadas.
- [ ] Endpoints usados no frontend foram conferidos em Swagger/OpenAPI ou em `docs/api/routes.md`.
- [ ] Nenhum endpoint genérico de exemplo foi copiado sem confirmação do contrato real.