# Requirements: Minha Saude Feminina Mobile App

## Introduction

Minha Saude Feminina is an Expo mobile-first application for accessible women's health education. This specification defines the requirements to replace the current starter experience with the MVP screens, navigation, data loading, forms, and API integration needed to consume the documented real API while preserving the existing project structure and TypeScript contracts.

The implementation must keep the app simple, organized, and compatible with the current Expo Router setup. API access must be centralized, typed, configurable by environment variable, and resilient to loading, empty, success, and error states. The app must follow the product direction from the PRD and the visual principles from the design materials: calm, welcoming, trustworthy, readable, and accessible.

## Requirements

### Requirement 1

**User Story:** As a mobile user, I want the app to load API data from a configurable base URL, so that the same build can run against different API environments without code changes.

#### Acceptance Criteria

1. WHEN the app initializes its API layer, THEN the system SHALL read the API base URL from `EXPO_PUBLIC_API_BASE_URL`.
2. IF `EXPO_PUBLIC_API_BASE_URL` is missing or empty, THEN the system SHALL fail with a clear configuration error during API usage.
3. WHEN the API base URL is read, THEN the system SHALL normalize trailing slashes to prevent duplicated slashes in request URLs.
4. WHERE API requests are implemented, THEN the system SHALL NOT hardcode the production API URL inside screens, hooks, or UI components.
5. WHEN documenting local setup, THEN the system SHALL provide an environment example using `https://fastify-production-62e2.up.railway.app/api/v1/`.

### Requirement 2

**User Story:** As a developer, I want a centralized HTTP service layer, so that API behavior is consistent and components stay focused on UI state.

#### Acceptance Criteria

1. WHEN a request is sent, THEN the system SHALL use a shared `fetch`-based API client rather than direct fetch calls from screens.
2. WHEN a request expects JSON, THEN the system SHALL send `Accept: application/json`.
3. IF a request includes a JSON body, THEN the system SHALL send `Content-Type: application/json` and serialize the body once in the API client.
4. IF a request does not include a body, THEN the system SHALL NOT send unnecessary `Content-Type`.
5. WHEN a response has status `204`, THEN the system SHALL treat it as success without attempting to parse JSON.
6. IF a response is not successful, THEN the system SHALL throw a typed API error containing `status`, `code`, `message`, and optional `details`.
7. WHERE services are defined, THEN the system SHALL separate them by API domain and keep visual concerns such as loading, toast, and navigation outside the services.

### Requirement 3

**User Story:** As a developer, I want TypeScript request and response contracts for the real API, so that data access is predictable and contract changes are easier to catch.

#### Acceptance Criteria

1. WHEN implementing API domains, THEN the system SHALL define TypeScript types for each request payload and response payload used by the app.
2. WHEN implementing list endpoints, THEN the system SHALL support the documented `data: T[]` response shape.
3. WHEN implementing paginated endpoints, THEN the system SHALL support `data` plus `pagination` with `page`, `pageSize`, `total`, and `totalPages`.
4. WHEN implementing single-resource endpoints, THEN the system SHALL support direct resource response bodies.
5. IF the API returns an error body, THEN the system SHALL handle the documented `{ error: true, message: string, code: string }` shape.
6. WHERE endpoint examples are placeholders in steering documentation, THEN the system SHALL use only endpoints confirmed by the API contract or steering documentation.

### Requirement 4

**User Story:** As a visitor, I want a welcoming home screen with featured content, categories, and recent articles, so that I can quickly find reliable women's health information.

#### Acceptance Criteria

1. WHEN the user opens the root route, THEN the system SHALL display the Home screen as the initial app experience.
2. WHEN categories are loading, THEN the system SHALL show a non-blocking loading state.
3. WHEN featured or recent articles are loading, THEN the system SHALL show a loading state appropriate to the content area.
4. IF no categories are returned, THEN the system SHALL show an empty state with a clear message.
5. IF no recent articles are returned, THEN the system SHALL show an empty state without treating it as an error.
6. IF a request fails, THEN the system SHALL show a friendly error message and a retry action where retry is useful.
7. WHEN category or article items are visible, THEN the system SHALL allow navigation to the relevant category or article detail route.

### Requirement 5

**User Story:** As a visitor, I want to browse health categories, so that I can explore content by phase of life or care topic.

#### Acceptance Criteria

1. WHEN the user opens the categories route, THEN the system SHALL list all categories returned by the API.
2. WHEN the user selects a category, THEN the system SHALL navigate to a category detail route using the category identifier or slug supported by the API.
3. WHEN a category detail route loads, THEN the system SHALL display the category title, description, and related articles.
4. IF the category is not found, THEN the system SHALL show a not-found or empty state rather than crashing.
5. IF the related article list is empty, THEN the system SHALL show an empty state explaining that no articles are available for that category yet.
6. WHERE categories are displayed, THEN the system SHALL use calm, readable card styling aligned with the app design language.

### Requirement 6

**User Story:** As a visitor, I want to read article details with source attribution, so that I can understand the content and trust where it came from.

#### Acceptance Criteria

1. WHEN the user opens an article route, THEN the system SHALL load the article from the API using the route identifier supported by the contract.
2. WHEN article content is available, THEN the system SHALL display the title, summary, full content, category context, and available source or attribution data.
3. IF source data is returned by the API, THEN the system SHALL display it clearly at the end of the article.
4. IF source data is unavailable, THEN the system SHALL still render the article and avoid displaying misleading attribution.
5. WHEN article data is loading, THEN the system SHALL show a loading state.
6. IF the article is not found, THEN the system SHALL show an appropriate not-found state.
7. WHEN the user wants to leave the article, THEN the system SHALL support the native back behavior.

### Requirement 7

**User Story:** As a visitor, I want to search health content, so that I can find articles by words I already know.

#### Acceptance Criteria

1. WHEN the user opens the search route, THEN the system SHALL display a search input and an initial empty or suggested state.
2. WHEN the user enters a search term, THEN the system SHALL search using the endpoint or query parameters documented by the API contract.
3. IF the search term is empty, THEN the system SHALL avoid unnecessary search requests and show the initial state.
4. WHEN search results are loading, THEN the system SHALL display a loading state without clearing usable previous results unnecessarily.
5. IF the search returns no results, THEN the system SHALL show an empty state specific to the search term.
6. IF the search request fails, THEN the system SHALL show a friendly error and allow retry.
7. WHEN the user selects a search result, THEN the system SHALL navigate to the article detail route.

### Requirement 8

**User Story:** As a user, I want persistent bottom navigation across the MVP screens, so that I can move predictably between the main areas of the app.

#### Acceptance Criteria

1. WHEN the app renders the main experience, THEN the system SHALL provide bottom navigation for Início, Categorias, Buscar, and Perfil.
2. WHEN the user taps a bottom navigation item, THEN the system SHALL navigate to the matching Expo Router route.
3. WHEN the current route corresponds to a bottom navigation item, THEN the system SHALL visually indicate the active item.
4. WHERE nested detail screens are displayed, THEN the system SHALL preserve native stack navigation behavior.
5. WHEN defining routes, THEN the system SHALL keep route files in `app/` and keep shared components, services, hooks, and types outside `app/`.

### Requirement 9

**User Story:** As a user, I want forms to validate required data before submission, so that I can correct mistakes without avoidable API errors.

#### Acceptance Criteria

1. WHEN a create or update form is shown for a supported API resource, THEN the system SHALL validate required fields before submitting.
2. IF a required field is empty, THEN the system SHALL show an inline validation message and SHALL NOT send the request.
3. IF a field has a known format constraint from the API contract, THEN the system SHALL validate that format before submission.
4. WHEN a form request is pending, THEN the system SHALL disable duplicate submission.
5. IF the API returns a validation or semantic error, THEN the system SHALL show a friendly message and preserve the user's entered values.
6. WHEN a create or update succeeds, THEN the system SHALL show success feedback and refresh or invalidate the affected list data.

### Requirement 10

**User Story:** As a curator or authorized user, I want to create, update, and delete records when the API contract supports it, so that app content can be managed through the real backend.

#### Acceptance Criteria

1. WHEN the API contract exposes a `POST` endpoint for a resource used by the app, THEN the system SHALL provide a typed service method and a matching form flow where that operation belongs in the MVP.
2. WHEN the API contract exposes a `PATCH` or `PUT` endpoint for a resource used by the app, THEN the system SHALL provide a typed service method and an update flow where that operation belongs in the MVP.
3. WHEN the API contract exposes a `DELETE` endpoint for a resource used by the app, THEN the system SHALL provide a typed service method and a deletion flow with user confirmation before removal.
4. IF the API contract does not expose deletion for a resource, THEN the system SHALL NOT implement a fake delete action for that resource.
5. WHEN create, update, or delete succeeds, THEN the system SHALL provide visible success feedback.
6. IF create, update, or delete fails, THEN the system SHALL provide visible error feedback using the standardized error message mapping.

### Requirement 11

**User Story:** As a user, I want consistent feedback for loading, empty, success, and error states, so that I always understand what the app is doing.

#### Acceptance Criteria

1. WHEN a screen performs an initial data load, THEN the system SHALL show a loading state.
2. WHEN a list endpoint returns `data: []`, THEN the system SHALL show an empty state rather than an error state.
3. WHEN a transient request fails, THEN the system SHALL show a retry action where retry is appropriate.
4. WHEN a user action succeeds, THEN the system SHALL show visual success feedback.
5. WHEN a user action fails, THEN the system SHALL show visual error feedback without exposing stack traces, SQL, tokens, or sensitive payload details.
6. IF the API returns status `401`, THEN the system SHALL clear any stored token if token support exists and SHALL guide the user to authentication only if authentication is part of the implemented contract.

### Requirement 12

**User Story:** As a user, I want a simple profile screen, so that the MVP includes a consistent personal area without requiring authentication unless the API supports it.

#### Acceptance Criteria

1. WHEN the user opens the profile route, THEN the system SHALL display a profile-oriented screen consistent with the MVP.
2. IF authentication endpoints are not part of the confirmed API contract, THEN the system SHALL NOT require login to use the MVP reading experience.
3. IF user profile endpoints are confirmed by the API contract, THEN the system SHALL load and display profile data through typed services.
4. IF profile data is unavailable or not part of the contract, THEN the system SHALL display a static MVP profile state without claiming real account persistence.
5. WHEN profile-related data fails to load, THEN the system SHALL show a friendly error message.

### Requirement 13

**User Story:** As a mobile user, I want the interface to feel calm, accessible, and trustworthy, so that health information is comfortable to read.

#### Acceptance Criteria

1. WHEN implementing screens, THEN the system SHALL use a mobile-first layout appropriate for common phone widths.
2. WHERE text content is displayed, THEN the system SHALL prioritize readable typography, clear hierarchy, and sufficient spacing.
3. WHERE colors are used, THEN the system SHALL use semantic design tokens or centralized theme values rather than scattered raw colors.
4. WHEN touchable controls are rendered, THEN the system SHALL provide touch targets of at least 44px where practical.
5. WHEN content changes between loading, error, empty, and success states, THEN the system SHALL avoid flicker and preserve layout stability where practical.
6. WHEN health guidance is displayed, THEN the system SHALL use an informative and non-alarmist tone.

### Requirement 14

**User Story:** As a developer, I want the implementation to respect the current project structure, so that future maintenance remains straightforward.

#### Acceptance Criteria

1. WHEN adding screens, THEN the system SHALL use Expo Router files under the existing `minha-saude-feminina/app/` structure.
2. WHEN adding reusable UI, THEN the system SHALL place components outside `app/`.
3. WHEN adding API code, THEN the system SHALL place configuration, HTTP client, services, hooks, and types in organized directories outside route files.
4. WHEN editing the starter project, THEN the system SHALL remove or replace template starter content that is no longer part of Minha Saude Feminina.
5. WHEN adding TypeScript code, THEN the system SHALL preserve strict TypeScript compatibility.
6. WHEN implementation is complete, THEN the system SHALL pass the available lint or type checks unless blocked by pre-existing project issues.
