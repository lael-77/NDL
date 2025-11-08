# Backend Specification

## Overview

The NDL backend is built with Node.js, Express, and Prisma ORM, connecting to a MySQL database using mysql2.

## Architecture

```
server/
├── src/
│   ├── controllers/    # Business logic handlers
│   ├── models/         # Data models (Prisma)
│   ├── routes/         # API endpoint definitions
│   ├── services/       # Helper services (scoring, auth)
│   ├── middleware/     # Express middleware (auth, validation)
│   └── index.js        # Server entry point
└── prisma/
    └── schema.prisma   # Database schema
```

## Database Schema

### Models

- **Profile**: User profiles (players, mentors, judges, admins)
- **School**: Schools with tier levels
- **Team**: Teams belonging to schools
- **TeamMember**: Junction table for team membership
- **Match**: Matches between teams
- **Challenge**: Coding challenges for competitions

### Enums

- **UserRole**: `player`, `mentor`, `judge`, `admin`
- **TierLevel**: `beginner`, `intermediate`, `advanced`, `regional`, `national`
- **MatchStatus**: `scheduled`, `in_progress`, `completed`, `cancelled`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Matches

- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get match by ID
- `POST /api/matches` - Create a new match (protected)
- `PUT /api/matches/:id` - Update a match (protected)
- `DELETE /api/matches/:id` - Delete a match (protected)

### Teams

- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID
- `POST /api/teams` - Create a new team (protected)
- `PUT /api/teams/:id` - Update a team (protected)
- `DELETE /api/teams/:id` - Delete a team (protected)

### Leaderboard

- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/leaderboard/:tier` - Get leaderboard by tier

## Services

### Scoring Service

- `calculateMatchPoints(match)` - Calculate and update team points after a match
- `updateTeamTier(teamId, newTier)` - Update team tier level
- `processTierPromotionRelegation(tier)` - Process tier promotions and relegations

## Authentication

JWT-based authentication is used. Tokens are included in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - MySQL connection string (mysql://user:password@localhost:3306/database)
- `JWT_SECRET` - Secret key for JWT token signing
- `NODE_ENV` - Environment (development/production)

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables (see `.env.example`)
3. Set up database: `npx prisma migrate dev`
4. Generate Prisma client: `npx prisma generate`
5. Start server: `npm run dev`

