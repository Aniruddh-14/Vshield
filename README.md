# VShield — Background Verification Platform

A full-stack background verification platform for validating candidate identity documents (Aadhaar + PAN) with a clean professional UI.

## Tech Stack

| Layer      | Technology                                     |
|------------|------------------------------------------------|
| Frontend   | React 18, Vite, TypeScript, Tailwind CSS       |
| State      | Zustand (auth), React Hook Form (forms)        |
| Backend    | Node.js, Express, TypeScript                   |
| Database   | PostgreSQL via Prisma ORM                      |
| Auth       | JWT + bcrypt                                   |
| Security   | Helmet, CORS, rate limiting, input validation  |

---

## Project Structure

```
Vshield/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/      # auth, candidate, verification
│   │   ├── lib/              # Prisma client singleton
│   │   ├── middleware/       # JWT auth
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Verification logic (mock Aadhaar/PAN APIs)
│   │   ├── utils/            # JWT helpers, Aadhaar masking
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── api/              # Axios instance with auth interceptors
    │   ├── components/       # Layout, StatusBadge, ProtectedRoute
    │   ├── pages/            # Login, Register, Dashboard, Candidates, etc.
    │   ├── store/            # Zustand auth store
    │   ├── types/            # Shared TypeScript interfaces
    │   ├── App.tsx
    │   └── main.tsx
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL running locally
- npm or yarn

---

## Setup

### 1. Database

Create the PostgreSQL database:

```bash
psql -U postgres -c "CREATE DATABASE vshielddb;"
```

### 2. Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and a strong JWT_SECRET

# Run Prisma migration (creates tables)
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional — Vite proxy handles /api → localhost:5000)
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Reference

### Auth
| Method | Path                  | Description       |
|--------|-----------------------|-------------------|
| POST   | `/api/auth/register`  | Register new user |
| POST   | `/api/auth/login`     | Login             |
| GET    | `/api/auth/me`        | Get current user  |

### Candidates *(Bearer token required)*
| Method | Path                    | Description                       |
|--------|-------------------------|-----------------------------------|
| GET    | `/api/candidates/stats` | Dashboard stats + recent 5        |
| GET    | `/api/candidates`       | List (search, status, page, limit)|
| POST   | `/api/candidates`       | Create candidate                  |
| GET    | `/api/candidates/:id`   | Get with verification logs        |
| PUT    | `/api/candidates/:id`   | Update candidate                  |
| DELETE | `/api/candidates/:id`   | Delete candidate                  |

### Verification *(Bearer token required)*
| Method | Path                    | Description              |
|--------|-------------------------|--------------------------|
| POST   | `/api/verify/:id`       | Run Aadhaar + PAN checks |
| GET    | `/api/verify/:id/logs`  | Get verification logs    |

---

## Verification Logic

The mock service simulates government API calls:

**Aadhaar (UIDAI mock)**
- Must be exactly 12 digits
- Numbers ending in `0000` simulate "not found"

**PAN (Income Tax Dept. mock)**
- Must match format `ABCDE1234F` (5 letters, 4 digits, 1 letter, all uppercase)
- PANs starting with `ZZZZZ` simulate "not found"

**Final status matrix:**

| Aadhaar | PAN      | Final Status |
|---------|----------|--------------|
| VERIFIED | VERIFIED | VERIFIED    |
| FAILED  | FAILED   | FAILED       |
| Mixed   | Mixed    | PARTIAL      |

Aadhaar numbers are stored as-is but always returned masked as `XXXX-XXXX-1234`.

---

## Features

- JWT authentication with 7-day expiry, persistent via Zustand + localStorage
- Candidate CRUD with user-scoped data isolation
- Full-text search across name, email, PAN
- Status filtering (All / Pending / Verified / Failed / Partial)
- Paginated candidate list (10 per page)
- Real-time verification results with timeline on detail page
- Printable verification report (`Ctrl+P` or Print button)
- Dashboard with live stats cards and recent activity table
- Rate limiting: 200 req/15min general, 20 req/15min auth endpoints
- Input validation via Zod (backend) and React Hook Form (frontend)
- Responsive layout with mobile sidebar

---

## Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve the dist/ folder with nginx or any static hosting
```

---

## Environment Variables

**backend/.env**
```
DATABASE_URL="postgresql://postgres@localhost:5432/vshielddb"
JWT_SECRET="your_strong_secret_here"
PORT=5000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```
