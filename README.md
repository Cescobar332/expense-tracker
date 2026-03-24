# FinanceApp - Personal Finance Tracker

A full-stack personal finance management application built with modern web technologies. Track your income, expenses, budgets, and savings goals with a beautiful, responsive interface.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-11-red?style=flat-square&logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=flat-square&logo=tailwind-css)

## Features

- **Transaction Management**: Track income and expenses with categories
- **Budget Control**: Set spending limits per category with alerts
- **Savings Goals**: Create and track progress toward financial goals
- **Reports & Analytics**: Visualize spending patterns with charts
- **Multi-language Support**: English, Spanish, Portuguese, French
- **Dark/Light Theme**: System-aware theme switching
- **Responsive Design**: Works on desktop and mobile
- **Email Verification**: Secure account verification flow
- **Password Recovery**: Self-service password reset

## Tech Stack

### Frontend (`apps/web`)

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.7
- **Styling**: TailwindCSS 4
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend (`apps/api`)

- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (Access + Refresh tokens)
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Email**: Nodemailer

### Infrastructure

- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway
- **Database**: Supabase (PostgreSQL)
- **Monorepo**: pnpm workspaces

## Project Structure

```
presupuesto-app/
├── apps/
│   ├── api/                 # NestJS backend
│   │   ├── prisma/          # Database schema & migrations
│   │   └── src/
│   │       ├── modules/     # Feature modules (auth, users, transactions, etc.)
│   │       ├── shared/      # Shared services & utilities
│   │       └── config/      # Environment configuration
│   │
│   └── web/                 # Next.js frontend
│       └── src/
│           ├── app/         # App Router pages
│           ├── components/  # React components
│           └── lib/         # Utilities, stores, API clients
│
├── package.json             # Root package.json
└── pnpm-workspace.yaml      # Workspace configuration
```

## Prerequisites

- **Node.js** 20+
- **pnpm** 8+
- **PostgreSQL** 16+ (or use Docker)
- **Git**

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Cescobar332/expense-tracker.git
cd expense-tracker
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

#### Backend (`apps/api/.env`)

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/financeapp?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/financeapp?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# App
PORT=3001
FRONTEND_URL=http://localhost:3000

# Email (optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="FinanceApp" <noreply@financeapp.com>
```

#### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4. Set up the database

```bash
# Start PostgreSQL (if using Docker)
docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=financeapp -p 5432:5432 -d postgres:16

# Run migrations
cd apps/api
npx prisma migrate dev
```

### 5. Start development servers

```bash
# Terminal 1 - Backend
cd apps/api
pnpm run start:dev

# Terminal 2 - Frontend
cd apps/web
pnpm run dev
```

The app will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

## Available Scripts

### Root

```bash
pnpm install          # Install all dependencies
```

### Backend (`apps/api`)

```bash
pnpm run start:dev    # Start in development mode (hot reload)
pnpm run start:prod   # Start in production mode
pnpm run build        # Build for production
pnpm run test         # Run tests
pnpm run lint         # Run ESLint
```

### Frontend (`apps/web`)

```bash
pnpm run dev          # Start in development mode
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
```

### Prisma

```bash
npx prisma migrate dev      # Create and apply migrations
npx prisma migrate deploy   # Apply migrations (production)
npx prisma generate         # Generate Prisma Client
npx prisma studio           # Open database GUI
```

## Deployment

### Backend (Railway)

1. Create a new project in [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set root directory to `apps/api`
4. Add environment variables (see above)
5. Deploy

### Frontend (Vercel)

1. Import project in [Vercel](https://vercel.com)
2. Set root directory to `apps/web`
3. Add `NEXT_PUBLIC_API_URL` pointing to your Railway backend
4. Deploy

### Database (Supabase)

1. Create a project in [Supabase](https://supabase.com)
2. Copy the connection strings (use pooler URLs for IPv4 compatibility)
3. Update `DATABASE_URL` and `DIRECT_URL` in Railway

## API Documentation

Once the backend is running, visit `/api/docs` for the interactive Swagger documentation.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and not licensed for public use.
