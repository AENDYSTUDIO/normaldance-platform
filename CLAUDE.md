# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev           # Start development server on port 3000
npm run build         # Production build with optimized chunks
npm run preview       # Preview production build locally
npm run typecheck     # TypeScript strict type checking
```

### Code Quality
```bash
npm run lint          # ESLint checking for .ts and .tsx files
npm run lint:fix      # Auto-fix ESLint issues
npm run format        # Format code with Prettier
```

### Testing
```bash
npm run test          # Run all tests once
npm run test:watch    # Run tests in watch mode for development
```

### Bundle Analysis
```bash
npm run analyze       # Generate bundle analysis (opens stats.html)
ANALYZE=true npm run build  # Alternative way to generate analysis
```

## Architecture Overview

### Core Structure
This is a **Web3 music streaming platform** called "Normal Dance" built with React 18, TypeScript, and modern web technologies. The application follows a component-based architecture with centralized state management using Zustand.

### Key Architectural Patterns

1. **State Management**: Zustand stores with persistence middleware
   - `useTracksStore`: Track management and CRUD operations with LocalStorage persistence
   - `usePlayerStore`: Global audio player state, playlist management, playback controls
   - `useAuthStore`: User authentication state (email/social/Web3)
   - `useToastStore`: Global notification system for user feedback
   - `useSocialStore`: Social features and user interactions

2. **Data Layer**: Dual storage approach with graceful fallbacks
   - **Primary**: LocalStorage through `services/db.ts` for offline functionality
   - **Secondary**: Supabase integration for cloud features (if env vars configured)
   - **Mock Data**: Fallback track data in `services/mockData.ts`

3. **Routing Architecture**: Protected routes with lazy loading
   - Routes defined in `routes/AppRoutes.tsx` with Suspense boundaries
   - Page components in `pages/` directory for route-level components
   - `ProtectedRoute` wrapper for authentication-gated content
   - Lazy loading for all page components to reduce initial bundle size

4. **Component Architecture**:
   - Reusable components in `components/` following glass morphism design
   - **Core Components**: `AudioPlayer.tsx` (singleton global audio player), `Layout.tsx` (main shell), `PlayerBar.tsx` (bottom controls), `Toaster.tsx` (global notifications)
   - **Audio Enhancement**: `AudioVisualizer.tsx` (FFT frequency visualization), `AudioEffects.tsx` (5-band equalizer, reverb, echo)
   - **Performance**: `PerformanceDashboard.tsx` (real-time Core Web Vitals monitoring)
   - **Social Features**: `PlaylistGrid.tsx`, `PlaylistModal.tsx`, `FilterPanel.tsx`, `SearchModal.tsx`
   - **Animation**: `AnimatedCard.tsx`, `AnimatedMotion.tsx` for enhanced UI transitions
   - **Telegram Integration**: `TelegramUserCard.tsx`, `TelegramMainButton.tsx`, `TelegramShareButton.tsx`
   - **Debug Utilities**: `UDebugger.tsx` for development debugging

### Service Layer Architecture

- **`services/db.ts`**: LocalStorage abstraction with SSR-safe operations using `isBrowser()` guards
- **`services/supabase.ts`**: Optional Supabase client with graceful fallback handling
- **`services/web3.ts`**: MetaMask and Web3 wallet integration using Ethers.js
- **`services/performance.ts`**: Performance monitoring with Core Web Vitals tracking
- **`utils/helpers.ts`**: Browser environment detection, formatting utilities, debouncing

### Audio System Design

Professional-grade audio system built on Web Audio API and HTML5 Audio:
- **Core Player**: Global HTML5 Audio API with centralized state via `usePlayerStore`
- **Playlist Management**: Shuffle, repeat modes, track progression with gapless playback
- **Audio Visualization** (`AudioVisualizer.tsx`):
  - Real-time FFT frequency spectrum analysis with 256-point FFT
  - Canvas-based rendering with gradient colors and smooth animations
  - Frequency indicators (20Hz, 500Hz, 2kHz, 8kHz, 16kHz)
  - High-DPI rendering optimized for performance
- **Audio Effects** (`AudioEffects.tsx`):
  - 5-band parametric equalizer (60Hz, 250Hz, 1kHz, 4kHz, 12kHz)
  - Professional audio effects (reverb, echo, bass boost)
  - Visual feedback with colored gain indicators
  - Real-time parameter adjustment
- **Advanced Features**:
  - Cross-browser compatibility through Audio API abstractions
  - Lazy loading of audio files for performance optimization
  - Smooth transition animations using Framer Motion
  - Memory-efficient audio context management
  - Browser compatibility with graceful fallbacks

### Performance Monitoring System

Real-time performance tracking with:
- Core Web Vitals monitoring (LCP, FID, CLS, FCP, TBT)
- Real-time performance metrics dashboard
- Bundle size analysis and optimization tools
- Chrome DevTools integration for performance insights
- Automatic performance reporting and recommendations

### Web3 & Blockchain Integration

- Multi-wallet support (MetaMask) through `services/web3.ts`
- Ethers.js for Ethereum, Polygon, BSC network interactions
- NFT minting capabilities with IPFS integration for decentralized storage
- Smart contract integration for music NFTs
- Progressive enhancement - core features work without Web3

### Social Features Architecture

Comprehensive social functionality built on Zustand state management:
- **Playlist Management**: Create, update, delete playlists with track organization and cover art
- **Track Interactions**: Like/unlike tracks with timestamp tracking and statistics
- **Comments System**: Add, update, delete comments on tracks with user mentions
- **User Following**: Follow/unfollow other users with follower/following counts
- **Listening History**: Comprehensive playback history with completion status and timestamps
- **Search & Discovery**: Multi-content search across tracks, playlists, and users
- **Recommendations**: AI-powered content discovery based on user preferences
- **User Statistics**: Performance metrics and engagement analytics
- **Persistence**: User-specific data persisted to localStorage with partial sync strategy

### Telegram WebApp Integration

Complete Telegram Mini App integration providing native mobile app experience:
- **Core Components**:
  - `TelegramUserCard.tsx`: Rich profile display with avatar, username, premium status, and user statistics
  - `TelegramMainButton.tsx`: Simplified API for Telegram's main button with multiple modes (default, upload, create, action)
  - `TelegramShareButton.tsx`: Native sharing functionality with graceful fallbacks
- **WebApp API Coverage** (`utils/telegram.ts`):
  - `initTelegramWebApp()`: Initializes the Telegram WebApp environment
  - `getTelegramUser()`: Retrieves authenticated user data
  - `shareToTelegram()`, `shareTrackToTelegram()`, `sharePlaylistToTelegram()`: Specialized content sharing
  - Haptic feedback system (light, medium, heavy, success, error, selection)
  - Cloud storage integration for data persistence
  - Theme detection and adaptation (dark/light mode)
  - Biometric authentication support
- **Development Patterns**:
  - All features work outside Telegram with browser fallbacks
  - Automatic theme adaptation based on Telegram's settings
  - Leverages Telegram's native authentication system
  - Cloud storage for cross-device data synchronization

### Testing Strategy

Comprehensive testing setup using Vitest with multiple testing layers:
- **Unit Tests**: Zustand stores, utility functions, service integrations
- **Component Tests**: React components with React Testing Library
- **Integration Tests**: Player transitions, route protection, user flows
- **E2E Testing with MCP Chrome DevTools** (`tests/mcp-chrome-test.js`):
  - Automated browser testing across multiple viewports (mobile, tablet, desktop)
  - Application load testing and route validation (10+ endpoints)
  - Audio player functionality validation
  - Web3 feature testing (wallet integration, NFT minting)
  - Advanced audio features testing (visualizer, effects)
  - Responsive design validation
  - Console error detection and TypeScript build validation
- **Test Environment**: jsdom with comprehensive mocks:
  - Full localStorage and sessionStorage API simulation
  - Web Audio API mocking (AudioContext, AnalyserNode, BiquadFilter)
  - HTMLMediaElement method mocking for audio tests
  - Comprehensive cleanup between test runs
- **Coverage**: V8 provider with detailed HTML reports
- **Test Files**: Organized by feature/domain in `tests/` directory

### Browser Testing and Automation
- **MCP Chrome DevTools**: Automated browser testing and performance analysis
- **Real device testing**: Chrome DevTools integration for cross-browser validation
- **Performance profiling**: Built-in performance metrics and Core Web Vitals tracking
- **Visual regression**: Automated screenshot comparisons for UI consistency

## Environment Setup

### Required Environment Variables
```bash
# Copy example environment file
cp .env.local.example .env.local
```

**Supabase (Required for backend features)**:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Authentication (Required)**:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-key
```

### Optional Web3 Features
**IPFS via Infura**:
```
VITE_IPFS_PROJECT_ID=your-infura-id
VITE_IPFS_PROJECT_SECRET=your-infura-secret
```

**IPFS via Pinata**:
```
VITE_PINATA_API_KEY=your-pinata-key
VITE_PINATA_SECRET_API_KEY=your-pinata-secret
```

## Critical Development Patterns

### Store Usage
```typescript
// Always use stores for state management
const { tracks, loadTracks, addTrack } = useTracksStore();
const { currentTrack, play, pause } = usePlayerStore();
```

### Browser Safety (Critical)
All browser APIs must be wrapped with `isBrowser()` checks from `utils/helpers.ts`:
```typescript
import { isBrowser } from '../utils/helpers';

if (isBrowser()) {
  // Browser-specific code (localStorage, Audio API, etc.)
}
```

### Service Error Handling
All services use safe storage operations with comprehensive try-catch blocks to prevent SSR failures and handle edge cases gracefully.

### Component Development Standards
- TypeScript interfaces for all props
- ARIA compliance and accessibility features (skip links, semantic HTML)
- Consistent glass morphism design patterns
- Framer Motion for animations with proper performance optimization
- Mobile-first responsive design

## Performance Optimizations

### Bundle Splitting
Manual chunk configuration in `vite.config.ts`:
- `vendor_react`: React ecosystem
- `vendor_motion`: Animation libraries
- `vendor_charts`: Visualization components
- `vendor_web3`: Blockchain libraries
- `vendor_state`: State management

### Lazy Loading Strategy
- All page components use React.lazy() with Suspense
- Route-level code splitting reduces initial bundle size
- Custom loading skeletons for better perceived performance

## File Organization Structure

```
├── components/          # Reusable UI components
│   ├── Core/           # Essential application components
│   │   ├── AudioPlayer.tsx      # Global singleton audio player
│   │   ├── Layout.tsx           # Main application shell
│   │   ├── PlayerBar.tsx        # Fixed bottom player controls
│   │   └── Toaster.tsx          # Global toast notifications
│   ├── Audio/          # Audio-specific components
│   │   ├── AudioVisualizer.tsx  # FFT frequency visualization
│   │   └── AudioEffects.tsx     # 5-band equalizer & effects
│   ├── Social/         # Social feature components
│   │   ├── PlaylistGrid.tsx     # Playlist display grid
│   │   ├── PlaylistModal.tsx    # Playlist management modal
│   │   ├── FilterPanel.tsx      # Advanced filtering interface
│   │   └── SearchModal.tsx      # Global search functionality
│   ├── Telegram/       # Telegram integration components
│   │   ├── TelegramUserCard.tsx     # User profile display
│   │   ├── TelegramMainButton.tsx   # Native main button
│   │   └── TelegramShareButton.tsx  # Native sharing
│   ├── Animation/      # Animation components
│   │   ├── AnimatedCard.tsx     # Animated card wrapper
│   │   └── AnimatedMotion.tsx   # Enhanced motion system
│   └── Utils/          # Utility components
│       ├── PerformanceDashboard.tsx  # Core Web Vitals dashboard
│       └── UDebugger.tsx            # Development debugging tools
├── pages/              # Route-level page components (lazy loaded)
│   ├── Core/           # Main application pages
│   │   ├── Feed.tsx           # Main content feed
│   │   ├── Explore.tsx        # Content discovery
│   │   ├── Library.tsx        # User library
│   │   └── Auth.tsx           # Authentication flow
│   ├── Web3/           # Blockchain-related pages
│   │   ├── Wallet.tsx         # Wallet management
│   │   ├── NFT.tsx            # NFT marketplace
│   │   └── Staking.tsx        # Token staking
│   ├── Social/         # Social feature pages
│   │   ├── Profile.tsx        # User profile with upload
│   │   ├── Playlists.tsx      # Playlist management
│   │   ├── Trends.tsx         # Trending content
│   │   └── Statistics.tsx     # User analytics
│   └── Upload/        # Content management
│       └── Upload.tsx         # File upload interface
├── services/           # External service integrations and APIs
│   ├── db.ts               # LocalStorage abstraction
│   ├── supabase.ts         # Supabase client
│   ├── web3.ts             # Web3 wallet integration
│   ├── performance.ts      # Core Web Vitals monitoring
│   └── ipfs.ts             # IPFS decentralized storage
├── stores/             # Zustand state management stores
│   ├── useAuthStore.ts     # Authentication state
│   ├── usePlayerStore.ts   # Audio player state
│   ├── useTracksStore.ts   # Track library management
│   ├── useToastStore.ts    # Global notifications
│   └── useSocialStore.ts   # Social features & interactions
├── types/              # TypeScript type definitions
│   ├── auth.ts             # Authentication types
│   ├── player.ts           # Audio player types
│   ├── social.ts           # Social feature types
│   └── web3.ts             # Blockchain types
├── utils/              # Utility functions and helpers
│   ├── helpers.ts          # Browser utilities & formatting
│   ├── telegram.ts         # Telegram WebApp API
│   └── [other utils]
├── routes/             # Route configuration and protection
│   └── AppRoutes.tsx       # Main routing with lazy loading
├── supabase/           # Database schemas and migrations
│   └── sql/               # SQL migration files
└── tests/              # Test files organized by feature
    ├── stores/             # Store unit tests
    ├── components/         # Component tests
    ├── integration/        # Integration tests
    └── mcp-chrome-test.js  # E2E browser automation
```

## Common Development Workflows

### Adding New Pages
1. Create component in `pages/` with lazy export pattern
2. Add lazy import and route in `routes/AppRoutes.tsx`
3. Update `PageView` enum in `types.ts` for analytics tracking
4. Add corresponding tests in `tests/pages/` or `tests/integration/`
5. Ensure responsive design and accessibility compliance

### Modifying Audio Player
1. Update state logic in `usePlayerStore`
2. Modify UI/UX in `AudioPlayer.tsx` (singleton component)
3. Update controls in `PlayerBar.tsx`
4. Add comprehensive player transition tests in `tests/player/`
5. Test cross-browser Audio API compatibility

### Adding New State Stores
1. Create Zustand store in `stores/` with TypeScript interfaces
2. Add persistence middleware if state should survive reloads
3. Create comprehensive test file in `tests/stores/`
4. Update type definitions in `types/` as needed
5. Document store usage patterns in component READMEs

### Telegram Integration Development
1. Use `utils/telegram.ts` for WebApp initialization
2. Implement components with fallbacks for non-Telegram environments
3. Test with both Telegram WebApp and regular browser contexts
4. Ensure proper theme adaptation and haptic feedback
5. Verify cloud storage functionality for data persistence

## System Constraints & Requirements

- **Client-Side Only**: No SSR - all rendering happens in browser
- **LocalStorage Primary**: All data persists locally with optional cloud sync
- **Progressive Enhancement**: Core audio functionality works without Web3 features
- **Glass Morphism Design**: Maintain consistent dark theme with blur/frosted glass effects
- **Mobile Responsive**: All components must be touch-friendly and work on mobile devices
- **TypeScript Strict**: All code must pass strict type checking with no any types
- **Performance First**: Optimized bundle sizes, lazy loading, and smooth animations

## Documentation Resources

### Project Documentation
- **CLAUDE.md**: This file - comprehensive development guide for Claude Code
- **README_REFACTOR.md**: Complete project overview and setup instructions
- **QUICK_START.md**: Quick start guide for first-time setup
- **TELEGRAM_INTEGRATION.md**: Complete Telegram WebApp integration guide
- **DEPLOYMENT.md**: Production deployment and configuration guide
- **GEMINI.md**: Project context for Gemini CLI agent
- **supabase/README_SUPABASE.md**: Supabase backend setup and database schema

### Database Schema
- **supabase/sql/**: Database migrations and table definitions
- **04_tracks.sql**: Track table structure and indexing
- **05_playlists.sql**: Playlist and track relationships
- **06_user_interactions.sql**: User activity and engagement tracking

## Testing Specifics

### Test Environment Setup
The `vitest.setup.ts` file provides comprehensive mocks:
- Full localStorage and sessionStorage API simulation
- Web Audio API mocking (AudioContext, GainNode, Oscillator, etc.)
- HTMLMediaElement method mocking for audio tests
- Comprehensive cleanup between test runs

### Running Specific Tests
```bash
# Run single test file
npm run test stores/usePlayerStore.test.ts

# Run tests by pattern
npm run test -- --grep "player transitions"

# Run with coverage for specific files
npm run test -- --coverage stores/
```

### Test Coverage Requirements
- All stores: 100% line and branch coverage
- All utilities: 90%+ coverage
- Components: Critical path coverage (user interactions)
- Integration tests for key user flows (authentication, audio playback)