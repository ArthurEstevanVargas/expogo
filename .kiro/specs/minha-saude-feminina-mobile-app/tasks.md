# Implementation Plan

- [x] 1. Prepare project configuration, theme, and API foundation
  - Add `.env.example` in `minha-saude-feminina/` with `EXPO_PUBLIC_API_BASE_URL=https://fastify-production-62e2.up.railway.app/api/v1/`.
  - Document optional `EXPO_PUBLIC_ADMIN_API_KEY` only for temporary internal admin usage because it is exposed in frontend bundles.
  - Create `config/env.ts` to read and normalize `process.env.EXPO_PUBLIC_API_BASE_URL`.
  - Add centralized admin key lookup for `admin: true` requests.
  - Create `types/api.ts` with list, pagination, error, request option, and async resource types.
  - Create `lib/http/auth-token.ts` with centralized optional token helpers.
  - Create `lib/http/api-client.ts` with centralized `fetch`, JSON parsing, `204` handling, headers, token support, and typed `ApiError`.
  - Ensure `api-client.ts` sends `x-api-key` only for `admin: true` requests and fails clearly when the admin key is missing.
  - Create `lib/http/api-error.ts` with user-facing error message mapping by status and code.
  - Update `constants/theme.ts` from starter colors to Minha Saude Feminina semantic colors and keep platform font helpers.
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.2, 3.3, 3.4, 3.5, 11.5, 11.6, 13.3, 14.3, 14.5_

- [x] 2. Define domain contracts and API services
  - Create `types/category.ts` with `Category`, `CreateCategoryRequest`, and `UpdateCategoryRequest`.
  - Create `types/article.ts` with `Article`, `ArticleAuthor`, `ArticleSource`, and `ListArticlesParams`.
  - Create `types/author.ts` with the `Author` contract.
  - Create `services/category-service.ts` for `GET /categories`, `GET /categories/:idOrSlug`, `POST /categories`, `PATCH /categories/:id`, and `DELETE /categories/:id`.
  - Mark category `POST`, `PATCH`, and `DELETE` calls with `admin: true`.
  - Create `services/article-service.ts` for `GET /articles` with query params and `GET /articles/:id`.
  - Create `services/author-service.ts` for `GET /authors`.
  - Ensure no unconfirmed source, auth, article mutation, or profile persistence endpoints are implemented.
  - _Requirements: 2.7, 3.1, 3.2, 3.3, 3.4, 3.6, 6.1, 6.3, 6.4, 7.2, 10.1, 10.2, 10.3, 10.4, 12.2, 12.4, 14.3, 14.5_

- [x] 3. Implement reusable data hooks
  - Create `hooks/use-categories.ts` with loading, success, empty, error, and retry state.
  - Create `hooks/use-category.ts` to load a single category by id or slug and map not-found to a stable empty/not-found state.
  - Create `hooks/use-articles.ts` for paginated article lists, category filtering, search query params, empty state, and retry.
  - Create `hooks/use-article.ts` for article detail loading, not-found handling, and retry.
  - Create `hooks/use-authors.ts` for future/profile support without blocking the MVP.
  - Create `hooks/use-category-mutations.ts` for create, update, delete, pending state, success feedback, error feedback, and refresh hooks for affected data.
  - Ensure hooks call services only and do not assemble absolute API URLs or headers.
  - _Requirements: 2.1, 2.7, 4.2, 4.3, 4.4, 4.5, 4.6, 5.3, 5.4, 5.5, 6.5, 6.6, 7.3, 7.4, 7.5, 7.6, 9.6, 11.1, 11.2, 11.3, 11.4, 14.3, 14.5_

- [x] 4. Build shared UI components and form primitives
  - Create `components/app-screen.tsx` using `ScrollView` with automatic content inset and consistent mobile-first spacing.
  - Create `components/section-header.tsx` for compact section titles and optional actions.
  - Create `components/state-view.tsx` for loading, empty, error, and retry presentations.
  - Create `components/feedback-banner.tsx` for success and error feedback.
  - Create `components/category-card.tsx` with category accent styling and navigation affordance.
  - Create `components/featured-card.tsx` for the Home featured content area.
  - Create `components/article-list-item.tsx` for title, summary, category label, and article navigation.
  - Create `components/category-form.tsx` with required-field validation, slug validation, display-order validation, inline errors, and pending-submit state.
  - Expand `components/ui/icon-symbol.tsx` and `.ios.tsx` mappings for Home, categories, search, profile, article, edit, delete, add, and chevron icons.
  - Keep reusable components outside `app/` and use semantic colors from `constants/theme.ts`.
  - _Requirements: 5.6, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 11.1, 11.2, 11.3, 11.4, 11.5, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 14.2, 14.5_

- [x] 5. Replace starter navigation with the MVP route structure
  - Update `app/_layout.tsx` to remove the starter modal route and register stack detail routes for tabs, category detail, article detail, and category management.
  - Update `app/(tabs)/_layout.tsx` to define four tabs: Início, Categorias, Buscar, and Perfil.
  - Remove starter-only `app/(tabs)/explore.tsx`.
  - Remove starter-only `app/modal.tsx`.
  - Ensure the initial `/` route maps to the Home tab and detail routes preserve native back behavior.
  - _Requirements: 4.1, 6.7, 8.1, 8.2, 8.3, 8.4, 8.5, 14.1, 14.4_

- [x] 6. Implement the Home experience
  - Replace `app/(tabs)/index.tsx` starter content with the Minha Saude Feminina Home screen.
  - Load categories and recent articles through hooks.
  - Render a welcoming heading, a featured content card, category grid/list, and recent article list.
  - Render loading states for categories and articles without blocking unrelated content.
  - Render empty states for missing categories and empty recent articles separately.
  - Render friendly error states with retry actions for failed category or article requests.
  - Link category cards to `/categoria/[id]` using slug when available and article rows to `/artigo/[id]`.
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 8.2, 11.1, 11.2, 11.3, 13.1, 13.2, 13.6, 14.1, 14.4_

- [x] 7. Implement category browsing and category detail
  - Create `app/(tabs)/categorias.tsx` to list all API categories.
  - Render loading, empty, error, and retry states on the categories tab.
  - Create `app/categoria/[id].tsx` to load category detail by id or slug.
  - Load related articles with `categoryId` after resolving the category.
  - Render category title, description, and article list.
  - Render not-found and empty article states without crashing.
  - Link article rows to `/artigo/[id]`.
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 8.2, 8.4, 11.1, 11.2, 11.3, 13.1, 13.2, 14.1_

- [x] 8. Implement article reading
  - Create `app/artigo/[id].tsx` to load a single article by id.
  - Render title, summary, full content, category context where available, and source or attribution information only when present in the payload.
  - Render loading, retryable error, and not-found states.
  - Preserve native stack back behavior and avoid fake save/share features that are outside the implemented contract.
  - Use readable mobile-first text hierarchy and non-alarmist health wording for fallback messages.
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 8.4, 11.1, 11.3, 13.1, 13.2, 13.6, 14.1_

- [x] 9. Implement search
  - Create `app/(tabs)/buscar.tsx` with a search input and initial empty/suggested state.
  - Debounce non-empty search terms before requesting articles.
  - Query `articleService.list` with documented search parameters supported by the design.
  - Skip API requests for blank search terms.
  - Preserve usable previous results while a new search loads when practical.
  - Render no-results, error, retry, and result states.
  - Link each result to `/artigo/[id]`.
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.2, 11.1, 11.2, 11.3, 13.1, 13.2, 14.1_

- [x] 10. Implement profile and category management entry points
  - Create `app/(tabs)/perfil.tsx` as a static MVP profile screen that does not require authentication.
  - Clearly avoid claiming persisted account data when profile endpoints are not confirmed.
  - Add a profile action linking to `/gerenciar-categorias` for the documented category CRUD surface.
  - Render helpful static preferences or informational sections aligned with the MVP.
  - _Requirements: 8.1, 8.2, 12.1, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2, 13.6, 14.1_

- [x] 11. Implement category create, update, and delete flows
  - Create `app/gerenciar-categorias.tsx` with category list loading through `useCategories`.
  - Add create form using `CategoryForm` and `useCategoryMutations`.
  - Add edit flow for an existing category, reusing `CategoryForm` with initial values.
  - Add delete action only for categories, with confirmation before calling the API.
  - Disable duplicate submissions while requests are pending.
  - Preserve form values after validation or API errors.
  - Refresh the category list after successful create, update, or delete.
  - Show visible success and error feedback for all mutation outcomes.
  - Show a friendly error when the frontend is missing the temporary internal admin key.
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 11.4, 11.5, 14.1, 14.5_

- [x] 12. Polish starter cleanup, accessibility, and responsive behavior
  - Remove unused starter components only when they are no longer referenced by the implemented app.
  - Ensure important data and error text is selectable where practical.
  - Ensure touch targets for primary controls are at least 44px where practical.
  - Check text wrapping in buttons, cards, tabs, empty states, and form messages.
  - Verify colors use centralized semantic values and provide adequate contrast.
  - Ensure list empty states are distinct from error states throughout the app.
  - _Requirements: 11.1, 11.2, 11.5, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 14.2, 14.4, 14.5_

- [x] 13. Verify implementation and document usage
  - Run `npm run lint` in `minha-saude-feminina` and fix issues introduced by the implementation.
  - Run `npm run web` or `npx expo start` with `EXPO_PUBLIC_API_BASE_URL` configured and verify the four tabs render.
  - Manually verify Home, Categorias, Categoria detalhe, Artigo, Buscar, Perfil, and Gerenciar categorias states.
  - Verify the production API empty article list renders as an empty state, not an error.
  - Temporarily verify missing API URL produces a clear configuration error during API usage.
  - Update `minha-saude-feminina/README.md` with environment setup and run instructions.
  - Document the security caveat for `EXPO_PUBLIC_ADMIN_API_KEY` and recommend server-side admin flows for production.
  - _Requirements: 1.5, 4.6, 5.4, 5.5, 6.6, 7.5, 7.6, 11.1, 11.2, 11.3, 14.5, 14.6_
