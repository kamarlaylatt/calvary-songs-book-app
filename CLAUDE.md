# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Calvary Songs Book App is a React Native mobile application built with Expo, featuring a collection of gospel songs and Myanmar hymns. Users can browse, search, favorite songs, and suggest new songs.

**Tech Stack:** React Native, Expo Router (file-based routing), React Native Paper (Material Design 3), TanStack Query, SQLite, TypeScript

## Development Commands

```bash
# Start development server
npm start

# Run on specific platform
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web

# Lint code
npm run lint

# Reset project (moves starter code to app-example/)
npm run reset-project
```

**Environment Configuration:**
Set the API base URL via environment variable:
- Unix/macOS: `export EXPO_PUBLIC_API_BASE_URL=https://calvary-api.laravel.cloud/api`
- Windows (PowerShell): `$env:EXPO_PUBLIC_API_BASE_URL="https://calvary-api.laravel.cloud/api"`

## Architecture

### Dependency Rules
```
components -> contexts -> services -> http
components -> types (allowed)
contexts -> types (allowed)
services -> types (allowed)
types is leaf-only (no imports back into UI)
```

### Provider Composition Order (in app/_layout.tsx)
1. **QueryClientProvider** - TanStack Query cache layer
2. **GestureHandlerRootView** - Gesture handling wrapper
3. **ThemeProvider** - Theme state and persistence
4. **PaperProvider** - React Native Paper theme injection
5. **FavoritesProvider** - Cross-screen favorites state

### Directory Structure

| Directory | Purpose |
|-----------|---------|
| `app/` | Expo Router file-based routing (screens, layouts) |
| `components/` | Reusable UI components |
| `contexts/` | React Context providers (theme, favorites) |
| `services/` | API client, SQLite persistence, HTTP layer |
| `types/` | Domain models (framework-agnostic TypeScript interfaces) |
| `theme/` | Material Design 3 theme configuration |
| `hooks/` | Custom React hooks |

## Key Patterns

### Import Convention
Always use the `@/` path alias (configured in tsconfig.json):
```typescript
import { fetchSongs } from '@/services/api';
import { Song } from '@/types/models';
```

### HTTP Client
All HTTP requests go through the centralized axios instance in `services/http.ts`. Never import axios directly.

### API Services
- Define types in `types/models.ts` first
- Add API functions in `services/api.ts`
- Use the shared `http` client
- Map external payloads to internal types (see `mapSong` function)

### Theming
- Use `useTheme()` from React Native Paper or `useThemeContext()` for theme state
- Create theme-aware styles with `useMemo + StyleSheet.create` to avoid re-renders
- Never use hardcoded colors - always use theme colors
- See `THEME_USAGE_GUIDELINES.md` for semantic color usage

### SQLite Persistence
Favorites and song history use Expo SQLite. Database operations are encapsulated in `services/favorites.ts` and `services/songHistory.ts`. Access through Context providers, not directly.

### State Management
- Server state: TanStack Query (React Query)
- Cross-screen state: React Context (ThemeProvider, FavoritesProvider)
- Local state: React useState/useReducer

## Important Files

| File | Purpose |
|------|---------|
| `types/models.ts` | All domain types (Song, Hymn, Category, etc.) |
| `services/http.ts` | Centralized axios HTTP client |
| `services/api.ts` | All API functions (fetchSongs, fetchHymns, etc.) |
| `contexts/ThemeContext.tsx` | Theme state with light/dark mode |
| `contexts/FavoritesContext.tsx` | Favorites state management |
| `app/_layout.tsx` | Root layout with provider composition |

## Adding a New Feature

1. Add domain types to `types/models.ts` if needed
2. Add API functions in `services/api.ts` using the shared `http` client
3. If cross-screen state is needed, create a Context in `contexts/`
4. Build UI components in `components/` or screens in `app/`
5. Use theme-aware styles with `StyleSheet.create`

## API Endpoints Reference

Key endpoints (see `USER_API_DOCUMENTATION.MD` for full details):
- `GET /api/songs` - List songs (supports search, filters, pagination)
- `GET /api/songs/{slug}` - Get song by slug
- `GET /api/hymns` - List Myanmar hymns
- `GET /api/hymns/{id}` - Get hymn by ID
- `GET /api/search-filters` - Get search filters for songs
- `GET /api/hymn-filters` - Get search filters for hymns
- `POST /api/suggest-songs` - Submit song suggestion
- `POST /api/check-version` - Force update version check

## Code Style Notes

- Use named exports; default exports for components/screens only
- Type everything - no `any` in public APIs
- Keep functions pure where possible; isolate side effects
- Use try/catch at service boundaries
- Context hooks must only be called within their Providers
- Prefer composition and small focused utilities
