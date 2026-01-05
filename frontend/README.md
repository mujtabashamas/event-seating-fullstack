# Event Seating Frontend

Interactive seating map application built with React, TypeScript, and Vite.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Or with npm
npm install
```

### Development

```bash
# Start development server
pnpm dev

# Server will start at http://localhost:5173
```

The app will automatically reload when you make changes.

## 🏗️ Build

### Production Build

```bash
# Build for production
pnpm build

# Output will be in the `dist/` directory
```

### Preview Production Build

```bash
# Preview the production build locally
pnpm preview
```

## 🧪 Testing

### Unit & Integration Tests

```bash
# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

### End-to-End Tests (Playwright)

```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Install Playwright browsers (first time only)
npx playwright install
```

## 📁 Project Structure

```
src/
├── components/        # React components
│   ├── Seat/         # Individual seat component
│   ├── SeatingMap/    # Main seating map SVG
│   ├── SeatDetails/   # Seat information panel
│   ├── SelectionSummary/  # Selected seats summary
│   └── MapControls/   # Control buttons (dark mode, heat map, etc.)
├── hooks/            # Custom React hooks
│   ├── useSeatSelection.ts
│   ├── useTouchGestures.ts
│   └── useWebSocket.ts
├── contexts/         # React contexts
│   └── ThemeContext.tsx
├── services/         # Business logic
│   └── venue.service.ts
├── utils/            # Utility functions
│   ├── storage.ts
│   └── findAdjacentSeats.ts
├── types/            # TypeScript type definitions
└── test/             # Test setup files
```

## 🎨 Features

- **Interactive Seating Map**: SVG-based theater seating visualization
- **Seat Selection**: Select up to 8 seats with visual feedback
- **Dark Mode**: WCAG 2.1 AA compliant theme toggle
- **Heat Map**: Visual price tier representation
- **Find Adjacent Seats**: Helper to find N consecutive available seats
- **Mobile Support**: Pinch-zoom and pan gestures for touch devices
- **Live Updates**: WebSocket support (optional, disabled by default)
- **Accessibility**: Keyboard navigation, ARIA labels, focus management
- **Persistence**: Selection saved to localStorage

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# WebSocket server URL (optional)
VITE_WS_URL=ws://localhost:3001
```

### Tailwind CSS

The project uses Tailwind CSS v4 with CSS-based configuration. See `src/index.css` for theme customization.

## 📦 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm test` - Run unit/integration tests
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Generate coverage report
- `pnpm test:e2e` - Run E2E tests
- `pnpm test:e2e:ui` - Run E2E tests with UI

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Vitest** - Unit/integration testing framework
- **Playwright** - E2E testing framework
- **Testing Library** - Component testing utilities

## 📝 Notes

- The app works standalone without a backend
- WebSocket is disabled by default (enable in `src/App.tsx` if needed)
- Seat data is loaded from `public/venue.json`
- Selection persists in localStorage (24-hour expiry)
