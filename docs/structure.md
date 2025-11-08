# Project Structure

## Overview

This document describes the complete structure of the NDL project after reorganization.

## Directory Structure

```
NDL/
├── client/                    # Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── api/               # Axios API calls to backend
│   │   │   ├── axios.js       # Axios instance configuration
│   │   │   ├── auth.js        # Authentication API
│   │   │   ├── matches.js     # Matches API
│   │   │   ├── teams.js       # Teams API
│   │   │   ├── leaderboard.js # Leaderboard API
│   │   │   └── index.js       # API exports
│   │   ├── components/        # React components
│   │   │   ├── Hero.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── NavLink.tsx
│   │   │   └── ui/            # shadcn/ui components
│   │   ├── pages/             # Page components
│   │   │   ├── Auth.tsx
│   │   │   ├── Index.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   └── NotFound.tsx
│   │   ├── store/             # Zustand state management
│   │   │   ├── useAuthStore.js
│   │   │   └── useMatchesStore.js
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/                # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── index.html
│
├── server/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/       # Business logic handlers
│   │   │   ├── authController.js
│   │   │   ├── matchController.js
│   │   │   ├── teamController.js
│   │   │   └── leaderboardController.js
│   │   ├── routes/            # API endpoint definitions
│   │   │   ├── auth.js
│   │   │   ├── matches.js
│   │   │   ├── teams.js
│   │   │   └── leaderboard.js
│   │   ├── services/          # Helper services
│   │   │   └── scoring.js     # Scoring and tier management
│   │   ├── middleware/        # Express middleware
│   │   │   └── auth.js        # JWT authentication
│   │   └── index.js           # Server entry point
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── package.json
│   └── Dockerfile
│
├── docs/                      # Technical documentation
│   ├── backend_spec.md        # Backend specification
│   ├── api_endpoints.md       # API endpoints documentation
│   └── structure.md           # This file
│
├── .env.example               # Environment variables template
├── docker-compose.yml         # Docker configuration
└── README.md                  # Main README
```

## Key Files

### Client
- `client/package.json` - Frontend dependencies (includes axios, zustand)
- `client/vite.config.ts` - Vite configuration
- `client/src/api/axios.js` - Axios instance with interceptors
- `client/src/store/` - Zustand stores for state management

### Server
- `server/package.json` - Backend dependencies (Express, Prisma, JWT)
- `server/src/index.js` - Express server setup
- `server/prisma/schema.prisma` - Prisma database schema
- `server/src/controllers/` - Request handlers
- `server/src/routes/` - API route definitions
- `server/src/services/` - Business logic services

### Configuration
- `.env.example` - Environment variables template
- `docker-compose.yml` - Docker setup for database and backend
- `README.md` - Project documentation

## API Structure

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get match by ID
- `POST /api/matches` - Create match
- `PUT /api/matches/:id` - Update match
- `DELETE /api/matches/:id` - Delete match

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Leaderboard
- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/leaderboard/:tier` - Get leaderboard by tier

## Database Schema

### Models
- **Profile** - User profiles (players, mentors, judges, admins)
- **School** - Schools with tier levels
- **Team** - Teams belonging to schools
- **TeamMember** - Team membership junction table
- **Match** - Matches between teams
- **Challenge** - Coding challenges

### Enums
- **UserRole**: `player`, `mentor`, `judge`, `admin`
- **TierLevel**: `beginner`, `intermediate`, `advanced`, `regional`, `national`
- **MatchStatus**: `scheduled`, `in_progress`, `completed`, `cancelled`

## State Management

### Zustand Stores
- `useAuthStore` - Authentication state (user, token, login/logout)
- `useMatchesStore` - Matches state (fetch, create, update)

## Next Steps

1. Install dependencies in both client and server
2. Set up environment variables
3. Run database migrations
4. Start development servers
5. Update client to use new API endpoints instead of Supabase

