# School Admin Dashboard System - Complete Specification

## Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Database Schema](#database-schema)
3. [API Specifications](#api-specifications)
4. [Real-time WebSocket Events](#real-time-websocket-events)
5. [Algorithms](#algorithms)
6. [Security & RBAC](#security--rbac)
7. [UI/UX Component Specifications](#uiux-component-specifications)
8. [Deployment Guide](#deployment-guide)

---

## High-Level Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ School Admin │  │ League Admin │  │   Student    │         │
│  │  Dashboard   │  │   Dashboard  │  │  Dashboard   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘         │
│         │                 │                  │                   │
│  ┌──────┴─────────────────┴─────────────────┴────────┐        │
│  │         React/Next.js + Tailwind + Socket.IO       │        │
│  └──────────────────────┬─────────────────────────────┘        │
└──────────────────────────┼─────────────────────────────────────┘
                           │ HTTPS/WSS
┌──────────────────────────┼─────────────────────────────────────┐
│                    API Gateway Layer                             │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Express.js/Fastify + JWT Auth + Rate Limiting      │       │
│  └──────────────────────┬───────────────────────────────┘       │
└──────────────────────────┼─────────────────────────────────────┘
                           │
┌──────────────────────────┼─────────────────────────────────────┐
│                    Business Logic Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   School     │  │    League    │  │   Scoring    │        │
│  │  Management  │  │  Management │  │   Engine     │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘        │
│         │                 │                  │                  │
│  ┌──────┴─────────────────┴──────────────────┴────────┐       │
│  │         Team Formation │ Mentor Matching            │       │
│  └──────────────────────────────────────────────────────┘       │
└──────────────────────────┼─────────────────────────────────────┘
                           │
┌──────────────────────────┼─────────────────────────────────────┐
│                    Real-time Layer                              │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Socket.IO Server + Redis Adapter (Pub/Sub)          │      │
│  │  Rooms: school:{id}, team:{id}, match:{id}           │      │
│  └──────────────────────┬───────────────────────────────┘      │
└──────────────────────────┼─────────────────────────────────────┘
                           │
┌──────────────────────────┼─────────────────────────────────────┐
│                    Data Layer                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  PostgreSQL  │  │    Redis     │  │   File       │         │
│  │  (Primary)   │  │  (Cache/Pub) │  │   Storage    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼─────────────────────────────────────┐
│                    External Services                            │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │  AI Scoring │  │   Email       │                          │
│  │  Service    │  │   Service    │                          │
│  └──────────────┘  └──────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14+ (React 18+)
- TypeScript
- Tailwind CSS
- React Query (TanStack Query)
- Socket.IO Client
- Zustand (State Management)
- React Hook Form + Zod (Validation)

**Backend:**
- Node.js 20+
- Express.js / Fastify
- TypeScript
- Prisma ORM
- Socket.IO Server
- Redis (Pub/Sub + Cache)
- JWT (jsonwebtoken)
- Bcrypt/Argon2

**Database:**
- PostgreSQL 15+
- Redis 7+

**DevOps:**
- Docker & Docker Compose
- GitHub Actions
- Nginx (Reverse Proxy)

---

## Database Schema

### Core Tables

See `database/schema.sql` for complete SQL with constraints.

### Key Constraints

1. **Unlimited Students per School:**
   - Schools can have unlimited students
   - New students automatically become reserve players when all teams are full
   - Reserve players can be swapped into teams as needed
   - Teams are limited to 4 active players each

2. **4 Active Members per Team:**
```sql
CREATE UNIQUE INDEX team_active_members_limit ON team_members(team_id)
WHERE is_active = true
AND (
  SELECT COUNT(*) FROM team_members 
  WHERE team_id = team_members.team_id AND is_active = true
) >= 4;
```

3. **Transactional Team Member Addition:**
See `backend/src/services/teamService.ts` for implementation.

---

## API Specifications

### Authentication Endpoints

**POST /api/auth/login**
```json
Request:
{
  "email": "admin@school.com",
  "password": "securePassword123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@school.com",
    "role": "school_admin",
    "schoolId": "uuid"
  }
}
```

**POST /api/auth/refresh**
```json
Request:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### School Admin Endpoints

**GET /api/schools/:schoolId/students**
- Query params: `page`, `limit`, `filter`, `search`
- Auth: SchoolAdmin (must own school)
- Response: Paginated student list

**POST /api/schools/:schoolId/students**
- Body: `{ email, fullName, age, grade, studentNumber }`
- Auth: SchoolAdmin
- Enforces: 20 student limit
- Response: Created student

**GET /api/students/:studentId**
- Auth: SchoolAdmin (own school) OR Student (own profile)
- Response: Full student profile with progress, team, submissions

**POST /api/schools/:schoolId/teams**
- Body: `{ name, description }`
- Auth: SchoolAdmin
- Response: Created team

**POST /api/teams/:teamId/members**
- Body: `{ studentId, role, isActive }`
- Auth: SchoolAdmin
- Enforces: 4 active members max (transactional)
- Response: Added member

**GET /api/schools/:schoolId/teams**
- Auth: SchoolAdmin
- Response: All teams with members

### League Admin Endpoints

**POST /api/leagues/:leagueId/fixtures**
- Body: `{ teamAId, teamBId, scheduledAt, arenaId }`
- Auth: LeagueAdmin
- Response: Created fixture

**GET /api/matches/:matchId**
- Auth: Based on role
- Response: Match details with live scores

**POST /api/matches/:matchId/ai-score**
- Body: `{ submissionId, scores: { correctness, efficiency, originality, docs } }`
- Auth: System/Internal
- Response: AI score calculated

**POST /api/matches/:matchId/human-score**
- Body: `{ judgeId, scores: { ... }, comments }`
- Auth: Judge
- Response: Human score recorded

### Real-time WebSocket Events

**Client → Server:**
- `join:school:{schoolId}` - Join school room
- `join:team:{teamId}` - Join team room
- `join:match:{matchId}` - Join match room
- `leave:school:{schoolId}` - Leave school room

**Server → Client:**
- `match:update` - `{ matchId, status, scores, timestamp }`
- `team:update` - `{ teamId, members, status }`
- `student:submission` - `{ studentId, submissionId, status }`
- `notification` - `{ type, message, data, timestamp }`
- `score:update` - `{ matchId, teamId, aiScore, humanScore, finalScore }`

---

## Algorithms

### Team Formation Algorithm

See `backend/src/algorithms/teamFormation.ts`

**Auto-Grouping Logic:**
1. Filter students by availability
2. Group by skill tags (similarity matching)
3. Balance by age/grade
4. Ensure 4 per team
5. Assign roles (Developer, Designer, Strategist)

### Scoring Algorithm

```typescript
// AI Score (0-100)
const aiScore = (
  correctness * 0.40 +
  efficiency * 0.20 +
  originality * 0.20 +
  (docs + tests) * 0.20
);

// Human Score (0-100)
const humanScore = judgeProvidedScore;

// Final Score (60% AI + 40% Human)
const finalScore = Math.round((aiScore * 0.6) + (humanScore * 0.4) * 100) / 100;
```

### Mentor Matching Algorithm

See `backend/src/algorithms/mentorMatching.ts`

**Greedy Matching:**
1. Calculate tag similarity between student and mentor
2. Check mentor capacity (max mentees)
3. Consider proximity (same school preferred)
4. Assign best match
5. Load balance across mentors

---

## Security & RBAC

### Role Definitions

- **SchoolAdmin**: Manage own school (students, teams, teachers)
- **LeagueAdmin**: Manage leagues, fixtures, judges, override scores
- **Teacher**: View assigned students, provide feedback
- **Judge**: Score matches, provide feedback
- **Student**: View own dashboard, submit solutions
- **Mentor**: View mentees, provide guidance

### Permission Matrix

| Action | SchoolAdmin | LeagueAdmin | Teacher | Judge | Student |
|--------|-------------|-------------|---------|-------|---------|
| View own school students | ✅ | ❌ | ✅ (assigned) | ❌ | ❌ |
| Create student | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create team | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create fixture | ❌ | ✅ | ❌ | ❌ | ❌ |
| Score match | ❌ | ✅ (override) | ❌ | ✅ | ❌ |
| View own profile | ✅ | ✅ | ✅ | ✅ | ✅ |

### JWT Claims

```typescript
{
  userId: string;
  email: string;
  role: string;
  schoolId?: string;
  permissions: string[];
  iat: number;
  exp: number;
}
```

---

## UI/UX Component Specifications

### School Admin Dashboard Pages

1. **Dashboard Home**
   - Stats widgets (students, teams, matches)
   - Upcoming fixtures
   - At-risk students alert
   - Quick actions

2. **Students List**
   - Table with filters
   - Bulk actions
   - Export CSV
   - Add student button

3. **Student Profile**
   - Tabs: Overview, Courses, Submissions, Team, Progress
   - Real-time activity feed
   - Mentor assignment

4. **Teams Management**
   - Team cards with drag-drop
   - Member list with roles
   - Create/Edit team modal
   - Enforce 4-member limit UI

5. **League View**
   - Fixtures calendar
   - Live scoreboard
   - Team standings
   - Match history

### Component Library

See `frontend/src/components/` for implementations:
- `DataTable` - Sortable, filterable table
- `StudentCard` - Student profile card
- `TeamCard` - Team with members
- `MatchCard` - Match fixture card
- `RealTimeScoreboard` - Live score updates
- `NotificationCenter` - Real-time notifications

---

## Deployment Guide

### Local Development

```bash
# Start all services
docker-compose up -d

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

### Environment Variables

See `.env.example` files in each directory.

### Production Deployment

1. Build Docker images
2. Push to registry
3. Deploy via CI/CD
4. Run migrations
5. Health checks

---

## Testing

### Unit Tests
- Scoring algorithm
- Team formation logic
- Constraint enforcement

### Integration Tests
- Add team member (concurrency)
- Student creation (20 limit)
- Authentication flows

### E2E Tests
- Complete school setup flow
- Match submission and scoring
- Real-time updates

---

## Acceptance Criteria

✅ SchoolAdmin can list all school students  
✅ Backend enforces 20 students per school  
✅ Backend enforces 4 active members per team  
✅ LeagueAdmin can create fixtures  
✅ Real-time match updates work  
✅ AI + Human scoring (60/40) works  
✅ Seed data creates 2 schools, 10 students each, 2 teams each  

---

## Next Steps

1. Review architecture
2. Set up local environment
3. Run seed script
4. Test constraints
5. Verify real-time updates

