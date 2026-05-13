# Technical Design: Minha Saude Feminina Mobile App

## Architectural Overview

The app will replace the current Expo starter screens with a small Expo Router mobile application for Minha Saude Feminina. The implementation stays inside the existing `minha-saude-feminina/` project and keeps route files in `app/`, while shared UI, hooks, services, configuration, and TypeScript contracts live outside `app/`.

The app is a reader-first MVP with four bottom tabs:

- `/(tabs)` -> Início
- `/(tabs)/categorias` -> Categorias
- `/(tabs)/buscar` -> Buscar
- `/(tabs)/perfil` -> Perfil

Detail and management routes sit in the root stack:

- `/categoria/[id]` -> category detail by id or slug
- `/artigo/[id]` -> article detail by id
- `/gerenciar-categorias` -> minimal category CRUD surface because category create/update/delete is documented in steering

The HTTP layer uses `fetch` through a single `apiRequest` helper. Screens never assemble absolute URLs or headers. Domain services expose API operations, hooks own screen state, and components render loading, empty, error, success, and form states.

The published API checked during design supports:

- `GET /categories`
- `GET /categories/:idOrSlug`
- `GET /articles`
- `GET /articles/:id`
- `GET /authors`

The steering file also documents category mutations:

- `POST /categories`
- `PATCH /categories/:id`
- `DELETE /categories/:id`

Article mutation, auth, user profile, and source-list routes are not designed as implemented features until their contracts are confirmed. Article source or attribution will be rendered only when included in an article response.

No backend or database changes are required. This design only consumes the existing API.

## Data Flow Diagram

```mermaid
flowchart TD
  Env[EXPO_PUBLIC_API_BASE_URL] --> ApiClient[lib/http/api-client.ts]
  Token[auth-token.ts optional token storage] --> ApiClient

  ApiClient --> CategoryService[services/category-service.ts]
  ApiClient --> ArticleService[services/article-service.ts]
  ApiClient --> AuthorService[services/author-service.ts]

  CategoryService --> UseCategories[hooks/use-categories.ts]
  CategoryService --> UseCategory[hooks/use-category.ts]
  CategoryService --> UseCategoryMutations[hooks/use-category-mutations.ts]
  ArticleService --> UseArticles[hooks/use-articles.ts]
  ArticleService --> UseArticle[hooks/use-article.ts]
  AuthorService --> UseAuthors[hooks/use-authors.ts]

  UseCategories --> Home[app/(tabs)/index.tsx]
  UseArticles --> Home
  UseCategories --> Categories[app/(tabs)/categorias.tsx]
  UseCategory --> CategoryDetail[app/categoria/[id].tsx]
  UseArticles --> CategoryDetail
  UseArticle --> ArticleDetail[app/artigo/[id].tsx]
  UseArticles --> Search[app/(tabs)/buscar.tsx]
  UseCategoryMutations --> ManageCategories[app/gerenciar-categorias.tsx]

  Home --> UI[components/*]
  Categories --> UI
  CategoryDetail --> UI
  ArticleDetail --> UI
  Search --> UI
  Profile[app/(tabs)/perfil.tsx] --> UI
  ManageCategories --> UI
```

## Component & Interface Definitions

### File Structure

```text
minha-saude-feminina/
  app/
    _layout.tsx
    (tabs)/
      _layout.tsx
      index.tsx
      categorias.tsx
      buscar.tsx
      perfil.tsx
    categoria/
      [id].tsx
    artigo/
      [id].tsx
    gerenciar-categorias.tsx
  components/
    app-screen.tsx
    section-header.tsx
    category-card.tsx
    article-list-item.tsx
    featured-card.tsx
    state-view.tsx
    feedback-banner.tsx
    category-form.tsx
    ui/
      icon-symbol.tsx
      icon-symbol.ios.tsx
  config/
    env.ts
  constants/
    theme.ts
  hooks/
    use-articles.ts
    use-article.ts
    use-categories.ts
    use-category.ts
    use-category-mutations.ts
    use-authors.ts
  lib/
    http/
      api-client.ts
      api-error.ts
      auth-token.ts
  services/
    article-service.ts
    author-service.ts
    category-service.ts
  types/
    api.ts
    article.ts
    author.ts
    category.ts
```

The starter route `app/(tabs)/explore.tsx` and `app/modal.tsx` will be removed because they are template-only surfaces.

### API Types

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
};

export type AsyncResource<T> =
  | { status: 'idle'; data: T }
  | { status: 'loading'; data: T }
  | { status: 'success'; data: T }
  | { status: 'empty'; data: T }
  | { status: 'error'; data: T; message: string };
```

### Domain Types

```ts
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
```

```ts
export type ArticleSource = {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
};

export type ArticleAuthor = {
  id: string;
  name: string;
  institution?: string;
  bio?: string;
};

export type Article = {
  id: string;
  title: string;
  summary: string;
  content: string;
  categoryId: string;
  slug?: string;
  authorId?: string;
  author?: ArticleAuthor;
  sources?: ArticleSource[];
  createdAt?: string;
  updatedAt?: string;
};

export type ListArticlesParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  search?: string;
  categoryId?: string;
};
```

```ts
export type Author = {
  id: string;
  name: string;
  institution?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

### HTTP Client Interfaces

```ts
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
}

export function getApiBaseUrl(): string;

export async function apiRequest<T>(
  path: string,
  options?: ApiRequestOptions
): Promise<T>;

export function getUserFacingErrorMessage(error: unknown): string;
```

Behavior:

- `getApiBaseUrl` reads `process.env.EXPO_PUBLIC_API_BASE_URL`.
- Missing env throws `EXPO_PUBLIC_API_BASE_URL nao configurada`.
- `apiRequest` always sets `Accept: application/json`.
- `Content-Type: application/json` is set only when `body !== undefined`.
- `Authorization` is sent only if a token exists and `auth !== false`.
- `204` returns `undefined as T`.
- Non-2xx responses become `ApiError`.
- `401` clears token storage if token support is present.

### Services

```ts
export const categoryService = {
  list(): Promise<ApiListResponse<Category>>;
  getByIdOrSlug(idOrSlug: string): Promise<Category>;
  create(payload: CreateCategoryRequest): Promise<Category>;
  update(id: string, payload: UpdateCategoryRequest): Promise<Category>;
  remove(id: string): Promise<void>;
};
```

```ts
export const articleService = {
  list(params?: ListArticlesParams): Promise<ApiPaginatedResponse<Article>>;
  getById(id: string): Promise<Article>;
};
```

```ts
export const authorService = {
  list(): Promise<ApiListResponse<Author>>;
};
```

No source service is planned because `GET /sources` returned `404` and is not confirmed by steering. Source rendering remains a property of the article payload.

### Hooks

```ts
export function useCategories(): AsyncResource<Category[]> & {
  retry: () => Promise<void>;
};

export function useCategory(idOrSlug: string): AsyncResource<Category | null> & {
  retry: () => Promise<void>;
};

export function useArticles(params?: ListArticlesParams): AsyncResource<Article[]> & {
  pagination: ApiPagination | null;
  retry: () => Promise<void>;
};

export function useArticle(id: string): AsyncResource<Article | null> & {
  retry: () => Promise<void>;
};

export function useCategoryMutations(): {
  createCategory(payload: CreateCategoryRequest): Promise<Category>;
  updateCategory(id: string, payload: UpdateCategoryRequest): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  pending: boolean;
  message: string | null;
  error: string | null;
  resetFeedback(): void;
};
```

Hooks use `useCallback` and `useEffect` for loading. Search uses a small debounce in the screen before passing `q` to `useArticles`, and skips requests for blank queries.

### UI Components

```ts
export type AppScreenProps = {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};
```

`AppScreen` wraps screen content in `ScrollView` with `contentInsetAdjustmentBehavior="automatic"` and consistent padding.

```ts
export type StateViewProps = {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};
```

`StateView` renders loading, empty, and error messages in a reusable layout.

```ts
export type CategoryCardProps = {
  category: Category;
  href: Href;
};
```

`CategoryCard` renders category name, description, semantic accent color, and a right chevron.

```ts
export type ArticleListItemProps = {
  article: Article;
  category?: Category;
  href: Href;
};
```

`ArticleListItem` renders title, summary, optional category label, and navigation affordance.

```ts
export type CategoryFormProps = {
  initialValue?: Partial<CreateCategoryRequest>;
  submitLabel: string;
  pending?: boolean;
  onSubmit(payload: CreateCategoryRequest | UpdateCategoryRequest): Promise<void>;
};
```

`CategoryForm` validates:

- `name` required
- `slug` required and URL-safe lowercase slug
- `description` required
- `displayOrder` optional positive integer

### Theme

`constants/theme.ts` will be updated from starter colors to semantic tokens:

```ts
export const AppColors = {
  background: '#FFF8F5',
  surface: '#FFFFFF',
  text: '#302A2C',
  mutedText: '#6F6267',
  border: '#EBDDD8',
  primary: '#B85C72',
  primaryForeground: '#FFFFFF',
  coral: '#D96C75',
  peach: '#E9A37E',
  lavender: '#8E79B8',
  sage: '#6F9A83',
  accent: '#C58A4B',
  danger: '#B42318',
  success: '#26734D',
};
```

The implementation will keep platform system serif/sans fonts from the current `Fonts` helper. Text in important data and error states should use `selectable` where practical.

## API Endpoint Definitions

Base URL:

```text
EXPO_PUBLIC_API_BASE_URL=https://fastify-production-62e2.up.railway.app/api/v1/
```

### List Categories

- Method: `GET`
- Path: `/categories`
- Request body: none
- Success `200`:

```ts
type Response = ApiListResponse<Category>;
```

- Empty success:

```json
{ "data": [] }
```

### Get Category

- Method: `GET`
- Path: `/categories/:idOrSlug`
- Request body: none
- Success `200`:

```ts
type Response = Category;
```

- Error example:

```ts
type ErrorResponse = ApiErrorBody;
```

### Create Category

- Method: `POST`
- Path: `/categories`
- Request body:

```ts
type Body = CreateCategoryRequest;
```

- Success `200` or `201`:

```ts
type Response = Category;
```

- Error cases: `400`, `409`, `422`, `500` with API error body when provided.

### Update Category

- Method: `PATCH`
- Path: `/categories/:id`
- Request body:

```ts
type Body = UpdateCategoryRequest;
```

- Success `200`:

```ts
type Response = Category;
```

- Error cases: `400`, `404`, `409`, `422`, `500`.

### Delete Category

- Method: `DELETE`
- Path: `/categories/:id`
- Request body: none
- Success `200` or `204`:

```ts
type Response = void;
```

- Error cases: `404`, `409`, `500`.

### List Articles

- Method: `GET`
- Path: `/articles`
- Query parameters:

```ts
type Query = {
  page?: number;
  pageSize?: number;
  q?: string;
  search?: string;
  categoryId?: string;
};
```

- Success `200`:

```ts
type Response = ApiPaginatedResponse<Article>;
```

The published API returns paginated shape. Current production data may be empty:

```json
{ "data": [], "pagination": { "page": 1, "pageSize": 20, "total": 0, "totalPages": 0 } }
```

### Get Article

- Method: `GET`
- Path: `/articles/:id`
- Request body: none
- Success `200`:

```ts
type Response = Article;
```

- Not found `404`:

```json
{ "error": true, "message": "Artigo não encontrado", "code": "ARTICLE_NOT_FOUND" }
```

### List Authors

- Method: `GET`
- Path: `/authors`
- Request body: none
- Success `200`:

```ts
type Response = ApiListResponse<Author>;
```

### Error Normalization

Some Fastify not-found responses may use `{ message, error, statusCode }` instead of the documented `{ error: true, message, code }`. The client will normalize missing `code` to `HTTP_ERROR` and missing `message` to `Nao foi possivel completar a solicitacao.`.

## Database Schema Changes

No database schema changes are required.

This feature is a mobile frontend implementation against an existing API. The app will not add SQL migrations, ORM models, server-side tables, or seed data. If backend content-management requirements expand later, they must be specified in a separate backend spec.

## Security Considerations

- API base URL is public Expo configuration, so it must not contain secrets.
- Components will not log tokens, stack traces, raw SQL messages, or sensitive payload details.
- The HTTP layer centralizes headers to reduce inconsistent auth behavior.
- Bearer token support remains optional because current documented routes do not require authentication.
- If token support is used later, token access must stay centralized in `auth-token.ts`; `401` clears local token state.
- Category create/update/delete forms must validate required fields before requests.
- API validation remains authoritative; frontend validation is only a usability layer.
- Destructive delete requires confirmation before calling the service.
- The app must not implement unconfirmed endpoints by guessing, especially for article deletion, source management, login, or user profile persistence.
- Health content will avoid alarmist wording and will include source attribution only when the API payload supports it, avoiding false medical attribution.

## Test Strategy

### Unit Tests

- `getApiBaseUrl` normalizes trailing slash and throws when missing.
- `apiRequest` sets `Accept`, conditionally sets `Content-Type`, serializes JSON body, handles `204`, and converts errors to `ApiError`.
- `getUserFacingErrorMessage` maps `400`, `401`, `403`, `404`, `409`, `422`, `500`, and fallback errors.
- `categoryService`, `articleService`, and `authorService` call expected paths and methods with mocked `apiRequest`.
- `CategoryForm` validation rejects blank required fields and invalid slug.

### Integration Tests

- Home renders loading, category success, recent article empty, and API error states with mocked services.
- Categories tab lists API categories and links to category detail.
- Category detail loads category by slug/id and filters articles by `categoryId`.
- Search skips blank requests, queries articles, renders empty search state, and links to article detail.
- Category management can create, update, and delete with mocked service success and failure.

### End-to-End Tests

- Start Expo web with `EXPO_PUBLIC_API_BASE_URL` set and verify the four tab routes render.
- Navigate Home -> Categoria -> Artigo not-found or article detail depending on seeded API data.
- Navigate Buscar, enter a query, and verify empty or result state.
- Navigate Perfil -> Gerenciar categorias and verify form validation prevents an empty submit.

### Manual Verification

- Run `npm run lint` in `minha-saude-feminina`.
- Run `npm run web` or `npx expo start` and verify mobile-width layout around 390x844.
- Verify production API empty article list does not show as an error.
- Verify missing `EXPO_PUBLIC_API_BASE_URL` produces a clear API configuration error.
