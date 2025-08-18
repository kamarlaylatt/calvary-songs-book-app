Calvary Songs App — Code Architecture and Conventions

Overview
This document describes the refactoring, patterns, and conventions adopted to keep the codebase maintainable, testable, and clear over the long term.

Goals
- Centralize domain types to avoid duplication and drift
- Standardize API access through a single HTTP client
- Reduce UI duplication and improve theming consistency
- Encapsulate cross-screen state in Context providers
- Make dependency directions explicit to prevent spaghetti
- Prefer composition and small focused utilities

High-level structure
- app/ — screens and layout entries for Expo Router
- components/ — reusable UI components
- contexts/ — React Context providers for cross-cutting state (theme, favorites)
- services/ — API client, SQLite persistence, and HTTP layer
- theme/ — theme tokens and builder
- types/ — domain models (framework-agnostic)
- *.md — documentation

Dependency rules
- components → contexts → services → http
- components → types (allowed)
- contexts → types (allowed)
- services → types (allowed)
- services → http (for network calls)
- types is leaf-only (no imports back into UI)

Centralized domain models
Shared models are defined in [types/models.ts](types/models.ts). These types are UI-framework-agnostic and represent the application domain entities.

- Song, SongDetail, Category, Style, SongLanguage
- PaginatedResponse, FetchSongsParams
- SearchFilters
- ListResponse<T> (generic helper)

HTTP client wrapper
All HTTP requests go through a single axios instance:

- File: [services/http.ts](services/http.ts)
- Base URL: EXPO_PUBLIC_API_BASE_URL (fallback included)
- Reasoning:
  - Consistent headers, timeouts, logging
  - Interceptors for centralized error handling
  - Swappable backend URL via environment

Environment
- Define EXPO_PUBLIC_API_BASE_URL for runtime config (local and builds)
- Local dev example:
  - Unix/macOS: export EXPO_PUBLIC_API_BASE_URL=https://calvary-api.laravel.cloud/api
  - Windows (PowerShell): $env:EXPO_PUBLIC_API_BASE_URL="https://calvary-api.laravel.cloud/api"

API services
The API access layer uses the shared types and the shared HTTP client.

Key functions
- fetchSongs() [services/api.ts:36]
- fetchSongBySlug() [services/api.ts:72]
- fetchSearchFilters() [services/api.ts:98]

Design notes:
- A private mapper (mapSong) normalizes song payloads to strong types
- Functions reconcile both paginated and non-paginated data
- Errors are surfaced and logged via the HTTP interceptor and local try/catch

React Query usage
- A stable QueryClient instance is provided at the root to cache server data
- See: [app/_layout.tsx](app/_layout.tsx) for stable client creation and providers order

App providers and layout order
Providers should be composed in this order:
1) QueryClientProvider — networking cache/sync layer
2) GestureHandlerRootView — wrapper required by react-native-gesture-handler
3) ThemeProvider — manages Paper theme and persistence
4) PaperProvider — injected inside AppContent with the current theme
5) FavoritesProvider — cross-screen favorites state

See provider composition at:
- Root: [app/_layout.tsx](app/_layout.tsx)
- Theme and Paper bridging inside AppContent

Theming
- Theme state is managed in [contexts/ThemeContext.tsx](contexts/ThemeContext.tsx)
- ThemeContext:
  - MD3Theme typed correctly
  - Persisted using AsyncStorage
  - getTheme() from theme/index composes dark/light tokens

Usage
- Access current theme via useThemeContext() from anywhere under ThemeProvider
- React Native Paper components automatically consume PaperProvider's theme
- Prefer theme-aware styles (via useMemo + StyleSheet.create) to avoid inline object churn

Favorites persistence (SQLite)
- All favorites operations are encapsulated in [services/favorites.ts](services/favorites.ts)
- Exposed APIs: initializeFavoritesDatabase, addSongToFavorites, removeSongFromFavorites, getFavoriteSongs, isSongInFavorites, getFavoritesCount, clearFavorites
- A single DB initialization flow is safeguarded with a promise to avoid race conditions

Favorites Context
- [contexts/FavoritesContext.tsx](contexts/FavoritesContext.tsx)
- Responsibilities:
  - favoriteStatus map: slug → boolean
  - toggleFavorite(song): keeps UI responsive, then refreshes from DB for consistency
  - refreshFavorites(): builds status map from DB
  - checkFavoriteStatus(slug): on-demand verification
- Depends only on services/favorites and types/models

Song history (SQLite)
- [services/songHistory.ts](services/songHistory.ts)
- Similar structure to favorites: initialize, add/update, query, clear
- Keeps most recent entries and prunes extra records

Reusable components
AdvancedSearchFilters
- File: [components/AdvancedSearchFilters.tsx](components/AdvancedSearchFilters.tsx)
- Refactoring changes:
  - Extracted a reusable FilterMenu subcomponent to remove repeated Menu + Button logic
  - Centralized theme-aware styles using useMemo + StyleSheet.create
  - Removed duplication between inline and expanded modes by reusing FiltersCardContent
  - Disabled actions during loading
- Pattern guidance:
  - Keep state local and only emit necessary filter changes upward
  - Derive UI from state; avoid redundant states that can get out of sync

Drawer
- File: [components/Drawer.tsx](components/Drawer.tsx)
- Refactoring changes:
  - Memoized styles via useMemo for fewer recalculations on theme changes
  - Removed commented code
- Pattern guidance:
  - Avoid inline object styles in render paths to reduce re-renders

Patterns and best practices
- Use the @ alias path in imports
  - Configured in tsconfig.json paths
  - Example: import { fetchSongs } from '@/services/api'
- Avoid direct axios usage
  - Always import http from services/http
- Keep types separate from rendering logic
  - UI components should import types from types/models
- Theme-aware styles via useMemo + StyleSheet.create
  - Reduces object identity changes and improves performance
- Context for cross-cutting state only
  - Keep context values minimal and stable
- Small mappers for external → internal payloads
  - mapSong in the API layer normalizes external shapes
- Avoid duplication in UI
  - Extract small presentational components (like FilterMenu)

How to add a new feature
1) Define or reuse domain types
   - Add to [types/models.ts](types/models.ts) if needed
2) Add service functions
   - Create API calls in [services/api.ts](services/api.ts)
   - Use the shared http client
3) Wire state
   - If cross-screen or persistent state, consider a Context in contexts/
   - Otherwise manage locally with React Query or component state
4) Build UI
   - Create components in components/
   - Prefer composition and small subcomponents
5) Hook up theming
   - Use useTheme or useThemeContext
   - Create theme-aware styles with StyleSheet.create in useMemo
6) Navigation
   - Add route files in app/... for Expo Router
7) Testing/development tips
   - Use EXPO_PUBLIC_API_BASE_URL to point to staging/local
   - Inspect network errors via the HTTP interceptor logs

Notable references
- Stable Query Client creation: Root component in [app/_layout.tsx](app/_layout.tsx)
- API entry-points:
  - fetchSongs() [services/api.ts:36]
  - fetchSongBySlug() [services/api.ts:72]
  - fetchSearchFilters() [services/api.ts:98]
- Favorites context/provider: [contexts/FavoritesContext.tsx](contexts/FavoritesContext.tsx)
- Theme context/provider: [contexts/ThemeContext.tsx](contexts/ThemeContext.tsx)
- HTTP client: [services/http.ts](services/http.ts)
- Filters component: [components/AdvancedSearchFilters.tsx](components/AdvancedSearchFilters.tsx)

Code style checklist
- Use absolute imports via @ alias
- Type everything (no any in public APIs)
- Keep functions pure where possible; isolate side effects
- Use try/catch for service boundaries; rethrow for upstream handling
- Prefer named exports; use default exports for components/screens
- Ensure Context hooks are only called inside their Providers
- Log only essential info; avoid noisy logs in production paths

Changelog for this refactor
- Centralized models in [types/models.ts](types/models.ts)
- Introduced axios wrapper [services/http.ts](services/http.ts)
- Refactored API to use shared types and http (mapSong, stable response handling)
- Added stable QueryClient at root and improved provider composition [app/_layout.tsx](app/_layout.tsx)
- Typed ThemeContext theme with MD3Theme and minor cleanup [contexts/ThemeContext.tsx](contexts/ThemeContext.tsx)
- Implemented FavoritesContext refresh and consistency logic [contexts/FavoritesContext.tsx](contexts/FavoritesContext.tsx)
- Reduced duplication and improved structure in AdvancedSearchFilters [components/AdvancedSearchFilters.tsx](components/AdvancedSearchFilters.tsx)
- Drawer cleanup and memoized styles [components/Drawer.tsx](components/Drawer.tsx)