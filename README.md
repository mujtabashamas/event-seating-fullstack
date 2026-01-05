# Event Seating Fullstack Application

A full-stack interactive seating map application for event ticket selection, built with React + TypeScript (frontend) and Express + TypeScript (backend).

## 🚀 Features

### Frontend

- **Interactive Seating Map**: SVG-based theater seating visualization
- **Seat Selection**: Click to select/deselect up to 8 seats
- **Dark Mode**: WCAG 2.1 AA compliant theme toggle
- **Heat Map**: Visual price tier representation
- **Find Adjacent Seats**: Helper to find N consecutive available seats
- **Mobile Support**: Pinch-zoom and pan gestures for touch devices
- **Live Updates**: WebSocket support for real-time seat status changes
- **Accessibility**: Keyboard navigation, ARIA labels, focus management
- **Persistence**: Selection saved to localStorage

### Backend

- **RESTful API**: `/api/v1` prefix with versioning
- **LRU Cache**: In-memory caching with TTL for performance
- **Rate Limiting**: Per-IP request throttling
- **Async Queue**: Prevents duplicate concurrent requests
- **Prometheus Metrics**: Performance monitoring and observability
- **Error Handling**: Centralized error handling middleware

## 📁 Project Structure

```
event-seating-fullstack/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── contexts/      # React contexts (Theme)
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript types
│   ├── e2e/               # Playwright E2E tests
│   └── src/test/          # Unit/integration tests
├── backend/
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── dist/              # Compiled JavaScript
└── README.md
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and npm/pnpm
- TypeScript 5.9+

### Frontend

For detailed frontend setup instructions, see [Frontend README](./frontend/README.md).

```bash
cd frontend
pnpm install
pnpm dev          # Start dev server (http://localhost:5173)
pnpm build        # Build for production
pnpm test         # Run unit/integration tests
pnpm test:e2e     # Run Playwright E2E tests
```

### Backend

```bash
cd backend
npm install
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Build for production
npm start         # Run production build
```

For backend API documentation, see [Backend README](./backend/README.md).

## 🧪 Testing

### Frontend Tests

```bash
# Unit & Integration Tests (Vitest)
pnpm test              # Run tests in watch mode
pnpm test:ui           # Run with UI
pnpm test:coverage     # Generate coverage report

# E2E Tests (Playwright)
pnpm test:e2e          # Run E2E tests
pnpm test:e2e:ui       # Run with UI
```

### Backend API Testing

Import the Postman collection:

- `backend/User Data API - Advanced Caching & Monitoring.postman_collection.json`

Or use curl:

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Get user data
curl http://localhost:3000/api/v1/users/1

# Prometheus metrics
curl http://localhost:3000/api/v1/metrics
```

## 📡 API Endpoints

All endpoints are prefixed with `/api/v1`:

- `GET /health` - Health check
- `GET /users/:id` - Get user data (cached)
- `GET /cache/stats` - Cache statistics
- `POST /cache/clear` - Clear cache
- `GET /metrics` - Prometheus metrics

## 🎨 Tech Stack

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **Vitest** - Unit/integration testing
- **Playwright** - E2E testing
- **WebSocket** - Real-time updates

### Backend

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prometheus** - Metrics collection
- **LRU Cache** - In-memory caching

## 🔧 Configuration

### Frontend Environment Variables

- `VITE_WS_URL` - WebSocket server URL (default: `ws://localhost:3001`)

### Backend Environment Variables

- `PORT` - Server port (default: `3000`)
- `NODE_ENV` - Environment (`development` | `production`)

## 📝 Key Decisions & Trade-offs

See [docs/DECISIONS.md](./docs/DECISIONS.md) for detailed explanations of architectural decisions and trade-offs.

## 📚 Additional Documentation

- **[Frontend README](./frontend/README.md)** - Frontend setup, build, and testing instructions
- **[Backend README](./backend/README.md)** - Backend API documentation and testing guide
- **[DECISIONS.md](./docs/DECISIONS.md)** - Architectural decisions and trade-offs
- **[INTERVIEW_QUESTIONS.md](./docs/INTERVIEW_QUESTIONS.md)** - Possible interview discussion topics

## 🚦 Performance Optimizations

- **Frontend**: React.memo, useCallback, lazy loading
- **Backend**: LRU cache, request queuing, rate limiting
- **Mobile**: Optimized SVG rendering, touch gesture handling

## ♿ Accessibility

- WCAG 2.1 AA compliant dark mode
- Keyboard navigation (arrow keys, Enter/Space)
- ARIA labels on interactive elements
- Focus management

## 📄 License

MIT
