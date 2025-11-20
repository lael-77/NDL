# School Admin Dashboard System - Complete Implementation Guide

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Local Development Setup

1. **Clone and navigate to project**
```bash
cd NDL-main
```

2. **Start services with Docker**
```bash
docker-compose up -d
```

3. **Run database migrations**
```bash
cd server
npm install
npm run migrate  # Or: psql -U ndl_user -d ndl_db -f ../database/schema.sql
```

4. **Seed database**
```bash
psql -U ndl_user -d ndl_db -f ../database/seed.sql
# Or use the seed script
npm run seed
```

5. **Start backend**
```bash
cd server
npm run dev
```

6. **Start frontend**
```bash
cd client
npm install
npm run dev
```

7. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## 📁 Project Structure

```
NDL-main/
├── database/
│   ├── schema.sql          # Complete database schema with constraints
│   └── seed.sql            # Sample data (2 schools, 20 students, 4 teams)
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── schoolAdminController.ts
│   │   ├── services/
│   │   │   ├── teamService.ts      # Team management with 4-member constraint
│   │   │   └── scoringService.ts   # AI + Human scoring (60/40)
│   │   ├── algorithms/
│   │   │   └── mentorMatching.ts   # Greedy mentor matching
│   │   ├── routes/
│   │   │   └── schoolAdmin.ts
│   │   └── middleware/
│   │       ├── auth.js
│   │       └── rbac.js
│   └── prisma/
│       └── schema.prisma
├── client/
│   └── src/
│       ├── pages/
│       │   ├── SchoolAdminDashboard.tsx
│       │   └── SchoolAdminStudents.tsx
│       └── api/
│           └── schoolAdmin.ts
└── docker-compose.yml
```

## 🔐 Authentication & Authorization

### Roles
- **school_admin**: Manage own school (students, teams)
- **league_admin**: Manage leagues, fixtures, judges
- **teacher**: View assigned students
- **judge**: Score matches
- **student**: View own dashboard, submit solutions
- **mentor**: View mentees

### JWT Token Structure
```json
{
  "userId": "uuid",
  "email": "admin@school.com",
  "role": "school_admin",
  "schoolId": "uuid",
  "permissions": ["view_students", "create_students", "manage_teams"]
}
```

## 📊 Database Constraints

### 1. Unlimited Students Per School
- Schools can now have unlimited students
- New students automatically become reserve players when all teams are full (4 players per team)
- Reserve players can be swapped into teams as needed
- No limit on total number of students per school

### 2. 4 Active Members Per Team
Enforced via trigger and application logic:
```typescript
// In teamService.ts - uses transaction with row-level locking
const activeCount = await tx.teamMembers.count({
  where: { teamId, isActive: true }
});
if (isActive && activeCount >= 4) {
  throw new Error('Team has reached maximum active member limit of 4');
}
```

## 🧮 Algorithms

### Scoring Algorithm
```typescript
// AI Score (0-100)
const aiScore = correctness * 0.40 + efficiency * 0.20 + 
                originality * 0.20 + docsAndTests * 0.20;

// Final Score (60% AI + 40% Human)
const finalScore = (aiScore * 0.6) + (humanScore * 0.4);
```

### Team Formation
- Auto-groups by skill tags
- Balances by age/grade
- Ensures exactly 4 per team
- Assigns roles (Developer, Designer, Strategist, Captain)

### Mentor Matching
- Tag similarity (Jaccard)
- Proximity (same school preferred)
- Capacity constraints
- Load balancing

## 🔌 API Endpoints

### School Admin Endpoints

**GET /api/school-admin/schools/:schoolId/dashboard**
- Returns: Stats, upcoming matches, recent submissions

**GET /api/school-admin/schools/:schoolId/students**
- Query params: `page`, `limit`, `search`, `filter`
- Returns: Paginated student list

**POST /api/school-admin/schools/:schoolId/students**
- Body: `{ email, password, fullName, age, grade, studentNumber }`
- Enforces: 20 student limit
- Returns: Created student

**GET /api/school-admin/students/:studentId**
- Returns: Full student profile

**GET /api/school-admin/schools/:schoolId/teams**
- Returns: All teams with members

**POST /api/school-admin/schools/:schoolId/teams**
- Body: `{ name, description }`
- Returns: Created team

**POST /api/school-admin/teams/:teamId/members**
- Body: `{ studentId, role, isActive, isCaptain }`
- Enforces: 4 active members limit
- Returns: Added member

## 🔄 Real-time WebSocket Events

### Client → Server
- `join:school:{schoolId}` - Join school room
- `join:team:{teamId}` - Join team room
- `join:match:{matchId}` - Join match room

### Server → Client
- `match:update` - `{ matchId, status, scores, timestamp }`
- `team:update` - `{ teamId, members, status }`
- `student:submission` - `{ studentId, submissionId, status }`
- `notification` - `{ type, message, data, timestamp }`
- `score:update` - `{ matchId, teamId, aiScore, humanScore, finalScore }`

## 🧪 Testing

### Unit Tests
```bash
cd server
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 📝 Seed Data

The seed script creates:
- 2 schools (Kigali International School, Butare Academy)
- 2 school admins (one per school)
- 20 students (10 per school)
- 4 teams (2 per school, 4 active members each)
- 1 league with sample match

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Access PostgreSQL
docker exec -it ndl-postgres psql -U ndl_user -d ndl_db
```

## 🔒 Security Checklist

- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Password hashing (bcrypt/argon2)
- ✅ SQL injection prevention (Prisma parameterized queries)
- ✅ XSS prevention (React auto-escaping)
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Input validation (Zod schemas)
- ✅ Audit logging

## 📈 Performance Considerations

- Database indexes on frequently queried columns
- Redis caching for dashboard stats
- Pagination for large lists
- WebSocket rooms for targeted updates
- Connection pooling for PostgreSQL

## 🚢 Deployment

### Production Environment Variables
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/ndl_db
REDIS_URL=redis://host:6379
JWT_SECRET=your-secure-secret-key
PORT=3001
```

### CI/CD Pipeline (GitHub Actions)
See `.github/workflows/deploy.yml` for example pipeline.

## 📚 Additional Documentation

- [System Architecture](./SCHOOL_ADMIN_SYSTEM_SPEC.md)
- [API Documentation](./docs/api_endpoints.md)
- [Database Schema](./database/schema.sql)

## ✅ Acceptance Criteria Status

- ✅ SchoolAdmin can list all school students
- ✅ Backend enforces 20 students per school (DB constraint + app logic)
- ✅ Backend enforces 4 active members per team (DB trigger + transactional)
- ✅ LeagueAdmin can create fixtures
- ✅ Real-time match updates work (WebSocket)
- ✅ AI + Human scoring (60/40) works
- ✅ Seed data creates 2 schools, 10 students each, 2 teams each

## 🆘 Troubleshooting

### Database connection issues
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
psql -U ndl_user -d ndl_db -h localhost
```

### Redis connection issues
```bash
# Check Redis is running
docker ps | grep redis

# Test connection
redis-cli ping
```

### Port conflicts
Update ports in `docker-compose.yml` if 3000, 3001, 5432, or 6379 are in use.

## 📞 Support

For issues or questions, refer to:
- System Specification: `SCHOOL_ADMIN_SYSTEM_SPEC.md`
- Database Schema: `database/schema.sql`
- API Routes: `server/src/routes/schoolAdmin.ts`

---

**Built with ❤️ for NDL (National Debate League)**

