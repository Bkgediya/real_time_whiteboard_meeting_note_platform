# Collaborative Real-Time Whiteboard & Meeting Notes Platform

A Miro-style real-time collaborative whiteboard and side-by-side meeting notes platform built with Node.js, Express, TypeScript, Socket.IO, Redis, MongoDB, React 18, Vite, TailwindCSS, React-Konva, Zustand, and Yjs CRDT.

## 🚀 Key Features

1. **Authentication & Security**:
   - JWT access token + httpOnly refresh cookie flow.
   - Password hashing via `bcryptjs`.
   - Email verification token logic.
   - Role-Based Access Control (RBAC: `owner`, `editor`, `viewer`) on REST endpoints & WebSocket events.

2. **Real-Time Collaborative Whiteboard**:
   - Multi-tool canvas powered by `React-Konva` (Pen, Eraser, Rectangle, Circle, Text, Sticky Notes).
   - Socket.IO gateway with Redis Adapter for horizontal pub/sub scaling.
   - Real-time cursor presence tracking showing live collaborator names & positions.

3. **Collaborative Meeting Notes**:
   - Side-by-side rich-text meeting notes editor with real-time sync.

4. **Version History & Export**:
   - Granular operations log (`BoardOps`) and per-board snapshot restore capabilities.
   - Server-side PDF export combining board title, date, element count, and meeting notes summary.
   - Vector canvas snapshot JSON export.
   - Public view-only share links with expiration.

5. **Offline Support**:
   - IndexedDB queue (`idb`) capturing offline drawing operations and flushing upon network reconnection.

---

## 📁 Repository Directory Structure

```
f:\opash/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment, MongoDB & Redis connectors
│   │   ├── controllers/     # REST request controllers
│   │   ├── middlewares/     # JWT Auth, RBAC & Validation middlewares
│   │   ├── models/          # Mongoose Schemas (User, Workspace, Board, BoardOp, Note, Invitation)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic layer
│   │   ├── socket/          # Socket.IO gateway & event handlers
│   │   ├── utils/           # JWT, PDF generator & Seed script
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Server entrypoint
│   ├── tests/               # Jest & Supertest API tests
│   ├── Dockerfile
│   ├── postman_collection.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client with automatic JWT token refresh
│   │   ├── components/      # React components (Canvas, Toolbar, PresenceLayer, NotesPanel, Modals)
│   │   ├── hooks/           # Custom hooks (useSocket, useOfflineQueue)
│   │   ├── pages/           # Pages (LoginPage, RegisterPage, DashboardPage, BoardPage, PublicBoardPage)
│   │   ├── store/           # Zustand stores (useAuthStore, useWorkspaceStore, useBoardStore)
│   │   └── utils/           # IndexedDB offline storage helper
│   ├── Dockerfile
│   ├── index.html
│   └── package.json
│
└── docker-compose.yml
```

---

## 🛠 Getting Started & Setup

### Option 1: Running with Docker Compose

```bash
# Clone repository and navigate to root
cd f:\opash

# Build and start all services (MongoDB, Redis, Backend, Frontend)
docker-compose up --build
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`

---

### Option 2: Running Locally (Development Mode)

#### Prerequisites
- Node.js (v18+)
- MongoDB running on `mongodb://127.0.0.1:27017`
- Redis running on `redis://127.0.0.1:6379`

#### 1. Backend Setup
```bash
cd f:\opash\backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Seed database with demo data
npm run seed

# Start development server
npm run dev
```

#### 2. Frontend Setup
```bash
cd f:\opash\frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

---

## 🧪 Testing

### Backend Unit & Integration Tests
```bash
cd f:\opash\backend
npm run test
```
