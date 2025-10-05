# TraWell - AI Travel Planning Application

## Overview

TraWell is a modern, AI-powered travel planning web application built with React and TypeScript. The app helps users plan trips through an interactive chat-based interface, providing personalized destination recommendations, attraction suggestions, and comprehensive travel information. It features a responsive design with a warm ocean/sunset gradient theme and full accessibility support.

The application follows a progressive user journey: onboarding → brainstorming/project creation → trip planning → detailed itinerary with live chat support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Core Framework:**
- React 18 with TypeScript for type safety
- Vite as the build tool and dev server
- React Router for client-side routing with protected routes based on onboarding status

**State Management Strategy:**
- TanStack Query (React Query) for server state management, data fetching, and caching
- Zustand for lightweight UI state (modals, sidebar, toasts)
- Local state (useState/useReducer) for component-specific interactions
- LocalStorage for persisting chat history and user sessions

**UI Component System:**
- shadcn/ui components built on Radix UI primitives for accessibility
- Tailwind CSS with custom design tokens (HSL color system)
- Custom gradient theme: warm-coral, warm-sand, warm-turquoise
- Responsive mobile-first design with breakpoint at 768px
- Custom fonts: Pacifico for branding, Poppins for body text

**Key Architectural Patterns:**
- Feature-based folder structure (pages, components, hooks, api)
- Path aliases (@/*) for clean imports
- Memo-ized components for performance (ChatMessage, ChatThread)
- Custom hooks for reusable logic (use-mobile, use-chat-pagination, use-pwa-*)
- Infinite query pattern for paginated chat messages

**Chat System Architecture:**
- Real-time streaming via WebSocket connections
- Token-by-token streaming for AI responses
- Message pagination with "Load More" pattern (10 messages initial, infinite scroll)
- LocalStorage persistence per chat entity (project/trip/session)
- Support for markdown rendering with remark-gfm
- Quick replies and UI hints system for interactive prompts

**PWA Implementation:**
- Vite PWA plugin with Workbox for service worker
- Auto-update functionality with user notification
- Offline-first caching strategy
- Installable with beforeinstallprompt handling
- Custom hooks: use-pwa-install, use-pwa-update

### Backend Architecture

**API Client Pattern:**
- Centralized apiClient in lib/api-client.ts
- Mock Service Worker (MSW) for development
- Seed data system with multiple user personas (Anna, John, Maria)
- RESTful endpoints with async/await pattern
- Error handling with custom ApiError class

**Key API Endpoints:**
- `/profiling/*` - Onboarding and user profiling
- `/brainstorm/*` - New brainstorm-based trip planning
- `/projects/*` - Legacy project-based planning
- `/trips/*` - Trip management and chat
- `/recommendations/*` - AI destination recommendations
- WebSocket endpoints for real-time streaming

**Data Flow:**
1. User queries managed by TanStack Query with query keys
2. Mutations update local cache optimistically
3. WebSocket messages append to local state
4. LocalStorage syncs for offline persistence

**Dual Planning Systems:**
The app currently supports two planning approaches:
- **Legacy System**: Projects → Trips (with share codes for collaboration)
- **New System**: Brainstorm Sessions → Recommendations → Trips
Both systems coexist with routing logic to determine which to use

### User Profiling System

**Profile Structure:**
- Preferences: traveler_type, activity_level, accommodation_style, environment, budget_sensitivity
- Constraints: dietary restrictions, mobility limitations, climate preferences, language preferences
- Experience: past destinations, wishlist regions
- Insights: AI-generated persona label and summary

**Profiling Flow:**
1. WebSocket-based onboarding with streaming questions
2. Progressive profile building (completeness tracking)
3. Skip logic if profile already complete
4. Profile reset capability for re-onboarding

### Authentication & User Management

**Current Implementation:**
- LocalStorage-based session management (mock auth)
- User object structure: id, email, name, onboardingCompleted
- Seed data provides test users (Anna, John, Maria)
- Login/Signup mutations update localStorage and query cache

**Route Protection:**
- Onboarding redirect logic in App.tsx
- Conditional navigation based on user.onboardingCompleted
- 404 handling with NotFound page

### Accessibility Features

**WCAG 2.2 AA Compliance:**
- Semantic HTML structure
- ARIA live regions for chat updates
- Keyboard navigation support (Tab, Enter, Escape)
- Focus management in modals and dialogs
- Screen reader friendly labels and descriptions
- Color contrast ratios meeting AA standards
- Skip links and landmark regions

**Implementation Details:**
- aria-live="polite" on chat containers
- Focus trap in Dialog/Modal components (Radix UI)
- Visible focus indicators with ring utilities
- Alt text for images and icons
- Form labels properly associated with inputs

## External Dependencies

**Core Libraries:**
- `react` ^18.3.1 & `react-dom` - UI framework
- `react-router-dom` ^6.x - Client-side routing
- `@tanstack/react-query` ^5.83.0 - Server state management
- `zustand` - Lightweight UI state
- `vite` - Build tool and dev server

**UI Components & Styling:**
- `@radix-ui/react-*` - Accessible component primitives (20+ packages)
- `tailwindcss` - Utility-first CSS
- `class-variance-authority` - Component variant system
- `clsx` & `tailwind-merge` - Conditional classes
- `lucide-react` ^0.462.0 - Icon library
- `next-themes` - Dark mode support (ready but not active)

**Form & Validation:**
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Validation resolvers
- `zod` - Schema validation (implied by resolvers)

**Markdown & Rich Text:**
- `react-markdown` - Markdown rendering
- `remark-gfm` - GitHub Flavored Markdown support

**PWA & Offline:**
- `vite-plugin-pwa` - Service worker generation
- `workbox-window` - Workbox client library

**Date Handling:**
- `date-fns` ^3.6.0 - Date utilities and formatting

**Development Tools:**
- `typescript` - Type safety
- `@typescript-eslint/*` - Linting
- `msw` - API mocking (implied by mock-data structure)
- `lovable-tagger` - Component tagging (development only)

**WebSocket Communication:**
- Native WebSocket API (no external library)
- Custom hooks wrapping WebSocket connections
- Base URL: `ws://localhost:8000` (configurable via VITE_WS_URL)

**API Endpoints (Backend Required):**
- Base URL configurable via environment (currently mock implementation)
- REST endpoints for CRUD operations
- WebSocket endpoints for streaming:
  - `/ws/profiling/{session_id}` - Onboarding chat
  - `/ws/brainstorm/{session_id}` - Brainstorm chat
  - `/ws/planning/{recommendation_id}` - Trip planning chat
  - `/ws/trip-chat/{trip_id}` - Trip conversation

**Future Database Integration:**
The codebase structure suggests future integration with a backend database (likely PostgreSQL with Drizzle ORM based on typical patterns), but currently uses in-memory mock data with localStorage persistence.