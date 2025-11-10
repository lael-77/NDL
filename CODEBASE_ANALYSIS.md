# NDL (National Development League) - Complete Codebase Analysis

## 📋 Project Overview

**NDL (National Development League)** is a full-stack competitive coding league platform designed for high schools. Teams compete in matches, solve coding challenges, and progress through competitive tiers. The platform supports multiple user roles (players, coaches, judges, admins, school admins, sponsors) with role-based access control.

---

## 🛠️ Technologies Used

### **Frontend Technologies:**
1. **React 18.3.1** - Modern UI library for building user interfaces
2. **TypeScript 5.8.3** - Type-safe JavaScript for better code quality
3. **Vite 5.4.19** - Fast build tool and development server
4. **Tailwind CSS 3.4.17** - Utility-first CSS framework for styling
5. **shadcn/ui** - High-quality React component library (built on Radix UI)
6. **React Router DOM 6.30.1** - Client-side routing
7. **Zustand 5.0.1** - Lightweight state management library
8. **Axios 1.7.7** - HTTP client for API requests
9. **React Query (@tanstack/react-query) 5.83.0** - Server state management and caching
10. **Socket.io Client 4.8.1** - Real-time bidirectional communication
11. **Framer Motion 12.23.24** - Animation library for React
12. **Zod 3.25.76** - TypeScript-first schema validation
13. **React Hook Form 7.61.1** - Form state management
14. **Recharts 2.15.4** - Charting library for data visualization

### **Backend Technologies:**
1. **Node.js** - JavaScript runtime environment
2. **Express 4.21.1** - Web application framework
3. **Prisma 5.19.0** - Next-generation ORM for database management
4. **MySQL** - Relational database (via Prisma)
5. **JWT (jsonwebtoken 9.0.2)** - Authentication tokens
6. **bcryptjs 2.4.3** - Password hashing
7. **Socket.io 4.8.1** - Real-time WebSocket server
8. **CORS 2.8.5** - Cross-origin resource sharing middleware
9. **dotenv 16.4.5** - Environment variable management

### **Development Tools:**
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **TypeScript ESLint** - TypeScript-specific linting
- **Docker** - Containerization (optional)

---

## 🏗️ Architecture Overview

### **Project Structure:**
```
NDL-main/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── api/        # API client functions (Axios)
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components (routes)
│   │   ├── store/      # Zustand state management
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions
│   │   └── App.tsx     # Main app component
│   └── package.json
│
├── server/              # Backend Node.js/Express application
│   ├── src/
│   │   ├── controllers/ # Business logic
│   │   ├── routes/     # API route definitions
│   │   ├── middleware/ # Express middleware (auth, RBAC)
│   │   ├── services/   # Helper services (socket, scoring)
│   │   └── index.js    # Server entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
│
└── docs/               # Documentation
```

---

## 🎨 Frontend Architecture

### **1. Entry Point (`main.tsx`)**
- Uses React 18's `createRoot` API
- Renders the main `App` component
- Imports global CSS styles

### **2. App Component (`App.tsx`)**
**Purpose:** Main application router and provider setup

**Key Features:**
- **React Query Provider:** Sets up data fetching with automatic refetching every 30 seconds
- **React Router:** Defines all application routes
- **Toast Providers:** Handles notifications (Toaster, Sonner)
- **Tooltip Provider:** Global tooltip configuration

**Routes Defined:**
- `/` - Home page
- `/auth` - Authentication (login/register)
- `/dashboard` - Main dashboard
- `/player`, `/coach`, `/school-admin`, `/admin`, `/judge`, `/sponsor` - Role-specific dashboards
- `/leaderboard` - Global leaderboard
- `/matches`, `/matches/:id` - Match listings and details
- `/teams`, `/teams/:id` - Team listings and details
- `/fixtures` - Match fixtures
- `/league` - League information
- `/academy` - Learning academy
- `/archive` - Historical data
- `/contact` - Contact page
- `/reset-password` - Password reset

### **3. State Management (`store/useAuthStore.js`)**
**Technology:** Zustand

**State:**
- `user` - Current authenticated user object
- `token` - JWT authentication token
- `isAuthenticated` - Boolean authentication status
- `loading` - Loading state for async operations
- `error` - Error messages

**Methods:**
- `login(email, password)` - Authenticates user and stores token
- `register(email, password, fullName, role, schoolId)` - Creates new user account
- `logout()` - Clears authentication data
- `initialize()` - Restores auth state from localStorage
- `updateProfile(data)` - Updates user profile information

**Persistence:** Uses `localStorage` to persist authentication state across page refreshes

### **4. API Client (`api/axios.js`)**
**Purpose:** Centralized HTTP client configuration

**Features:**
- **Base URL:** Configurable via `VITE_API_BASE_URL` environment variable
- **Request Interceptor:** Automatically adds JWT token to all requests from localStorage
- **Response Interceptor:** Handles 401 errors by clearing token and redirecting to login

**Usage:** All API calls go through this configured Axios instance

### **5. API Modules (`api/`)**
Separate modules for different API endpoints:
- `auth.js` - Authentication endpoints
- `admin.js` - Admin operations
- `dashboard.js` - Dashboard data
- `leaderboard.js` - Leaderboard data
- `matches.js` - Match operations
- `teams.js` - Team operations

### **6. Key Components**

#### **ParticleBackground.tsx** (Currently Open File)
**Purpose:** Animated background particle effect

**Technology:** React + HTML5 Canvas API

**How It Works:**
1. Creates a canvas element that covers the entire viewport
2. Generates 50 particles with random positions, velocities, and colors
3. Uses NDL tier colors (Beginner Green, Intermediate Yellow, Advanced Blue, National Crimson, Tech Blue)
4. Animates particles using `requestAnimationFrame`
5. Draws connections between nearby particles (within 150px)
6. Wraps particles around screen edges for continuous animation
7. Adjusts canvas size on window resize

**Technical Details:**
- Uses React refs to access canvas DOM element
- Stores particles in a ref to persist across renders
- Cleans up animation frame and event listeners on unmount
- Opacity set to 0.3 for subtle background effect
- Pointer events disabled so it doesn't interfere with UI

#### **Navbar.tsx**
**Purpose:** Main navigation bar

**Features:**
- Fixed position at top of page
- Logo with Trophy icon
- Navigation links (Home, League, Matches, Leaderboard, Academy, Archive, Dashboard)
- Authentication state display
- Notification bell component
- Logout functionality
- Responsive design (hides some links on mobile)

#### **Home.tsx**
**Purpose:** Landing page

**Features:**
- Fetches leaderboard data using React Query
- Sorts teams by tier and points
- Initializes Socket.io connection for authenticated users
- Composes multiple sections:
  - HeroSection
  - AnimatedTicker
  - StandingsSection
  - UpcomingArenas
  - AcademySpotlight
  - HallOfFame
  - SponsorsCarousel
  - Footer

### **7. Styling System**
- **Tailwind CSS:** Utility-first CSS framework
- **Custom Theme:** Extended with NDL brand colors
- **shadcn/ui:** Pre-built accessible components
- **CSS Variables:** For theme customization (dark mode support)

---

## ⚙️ Backend Architecture

### **1. Server Entry Point (`server/src/index.js`)**
**Purpose:** Main Express server setup

**Features:**
- Creates HTTP server (required for Socket.io)
- Initializes Socket.io for real-time communication
- Configures CORS for frontend communication
- Sets up JSON body parsing middleware
- Defines API routes
- Error handling middleware
- 404 handler for undefined routes
- Health check endpoint (`/health`)

**Port:** 3001 (configurable via `PORT` environment variable)

### **2. Authentication System**

#### **Middleware (`middleware/auth.js`)**
- `authenticateToken` - Verifies JWT tokens from Authorization header
- `requireRole(...roles)` - Checks if user has required role

#### **Controller (`controllers/authController.js`)**
**Functions:**
1. **register** - Creates new user account
   - Validates role (prevents admin creation via signup)
   - Hashes password with bcrypt
   - Creates Profile record
   - Creates Coach record if role is coach
   - Returns JWT token

2. **login** - Authenticates user
   - Finds user by email
   - Verifies password with bcrypt
   - Handles legacy accounts without passwords (migration support)
   - Returns JWT token

3. **getProfile** - Retrieves authenticated user's profile

4. **updateProfile** - Updates user profile information

5. **createAdmin** - Creates admin account (admin-only)

6. **forgotPassword** - Generates password reset token
   - Creates secure random token
   - Sets expiry (1 hour)
   - Returns reset link (in development mode)

7. **resetPassword** - Resets password using token
   - Validates token and expiry
   - Updates password
   - Clears reset token

### **3. Role-Based Access Control (`middleware/rbac.js`)**
**Purpose:** Hierarchical permission system

**Authority Levels:**
1. **League Admin (`requireLeagueAdmin`)**
   - Full access to all resources
   - Can manage all schools, teams, students, coaches

2. **School Admin (`requireSchoolAdmin`)**
   - Manages resources within their school
   - Can manage coaches, students, sponsors in their school
   - League admin has access to all schools

3. **Coach (`requireCoach`)**
   - Manages students in their school
   - League admin and school admin have access

**Helper Functions:**
- `canAccessSchool(userId, targetSchoolId)` - Checks school access
- `getManagedStudents(userId)` - Gets students user can manage
- `getManagedCoaches(userId)` - Gets coaches user can manage

### **4. Real-Time Communication (`services/socket.js`)**
**Technology:** Socket.io

**Features:**
- JWT authentication for socket connections
- Anonymous connections allowed (marked as such)
- Room-based messaging:
  - `user:{userId}` - User-specific room
  - `role:{role}` - Role-specific room
  - `match:{matchId}` - Match-specific room
  - `leaderboard` - Leaderboard updates room

**Events:**
- `join:match` - Join match room
- `leave:match` - Leave match room
- `join:leaderboard` - Join leaderboard room

**Emission Functions:**
- `emitMatchUpdate(matchId, matchData)` - Broadcasts match updates
- `emitMatchLive(matchId, matchData)` - Broadcasts live match status
- `emitLeaderboardUpdate(leaderboardData)` - Broadcasts leaderboard changes
- `emitTeamUpdate(teamId, teamData)` - Broadcasts team updates

### **5. API Routes (`routes/`)**
Organized by feature:
- `auth.js` - Authentication endpoints
- `matches.js` - Match CRUD operations
- `teams.js` - Team CRUD operations
- `leaderboard.js` - Leaderboard queries
- `dashboard.js` - Dashboard data aggregation
- `admin.js` - Admin operations
- `management.js` - User/resource management
- `permissions.js` - Permission queries

### **6. Controllers (`controllers/`)**
Business logic separated from routes:
- `authController.js` - Authentication logic
- `matchController.js` - Match operations
- `teamController.js` - Team operations
- `leaderboardController.js` - Leaderboard calculations
- `dashboardController.js` - Dashboard aggregations
- `adminController.js` - Admin operations
- `managementController.js` - Resource management

---

## 🗄️ Database Schema (Prisma)

### **Models:**

#### **1. Profile (Users)**
- **Fields:** id, email (unique), password (hashed), fullName, role, avatarUrl
- **Password Reset:** resetToken, resetTokenExpiry
- **Student Fields:** studentRole, age, grade, xp
- **Relationships:**
  - Can be captain of teams
  - Can be team member
  - Can be coach (Coach model)
  - Can be school admin (School relationship)
  - Can be student (StudentSchool relationship)
  - Has notifications, messages, academy progress, challenge submissions

#### **2. School**
- **Fields:** id, name, location, tier, motto, sponsor
- **Relationships:**
  - Has teams
  - Has coaches
  - Has arenas
  - Has school admins
  - Has students

#### **3. Team**
- **Fields:** id, name, schoolId, tier, captainId, logoUrl, points, wins, draws, losses
- **Relationships:**
  - Belongs to school
  - Has captain (Profile)
  - Has members (TeamMember)
  - Has matches (home/away)
  - Can be match winner
  - Has challenge submissions

#### **4. TeamMember**
- **Fields:** id, teamId, playerId, joinedAt
- **Purpose:** Many-to-many relationship between Teams and Profiles
- **Unique Constraint:** One player can only be in a team once

#### **5. Match**
- **Fields:** id, homeTeamId, awayTeamId, arenaId, scheduledAt, status, homeScore, awayScore, winnerId
- **Status Enum:** scheduled, in_progress, completed, cancelled
- **Relationships:**
  - Home team, away team
  - Winner team
  - Arena (optional)

#### **6. Coach**
- **Fields:** id, profileId (unique), schoolId
- **Purpose:** Links Profile to School for coaches
- **Relationships:**
  - Belongs to Profile
  - Belongs to School

#### **7. Challenge**
- **Fields:** id, title, description, difficulty (TierLevel), points, releaseDate, deadline
- **Relationships:**
  - Has challenge submissions

#### **8. Notification**
- **Fields:** id, userId, title, message, type, read, link, createdAt
- **Purpose:** User notifications system

#### **9. Message**
- **Fields:** id, senderId, receiverId, subject, content, read, createdAt
- **Purpose:** Internal messaging system

#### **10. AcademyProgress**
- **Fields:** id, playerId, courseName, courseTier, progress (0-100), completed, enrolledAt, completedAt
- **Purpose:** Tracks player learning progress
- **Unique Constraint:** One enrollment per course per player

#### **11. ChallengeSubmission**
- **Fields:** id, challengeId, playerId, teamId (optional), submissionUrl, status, score, feedback, submittedAt, reviewedAt
- **Status:** pending, reviewed, approved, rejected
- **Purpose:** Tracks challenge submissions

#### **12. Arena**
- **Fields:** id, schoolId, name, capacity, facilities, tier, isActive
- **Purpose:** Physical/venue locations for matches
- **Relationships:**
  - Belongs to school
  - Has applications
  - Has matches

#### **13. ArenaApplication**
- **Fields:** id, arenaId, schoolId, status, message, appliedAt, reviewedAt
- **Status:** pending, approved, rejected
- **Purpose:** Schools can apply to use arenas

### **Enums:**
- **UserRole:** player, coach, judge, admin, school_admin, sponsor
- **TierLevel:** beginner, amateur, regular, professional, legendary, national
- **StudentRole:** Developer, Designer, Strategist
- **MatchStatus:** scheduled, in_progress, completed, cancelled

---

## 🔐 Security Features

1. **Password Hashing:** bcryptjs with salt rounds (10)
2. **JWT Authentication:** Secure token-based authentication
3. **Role-Based Access Control:** Hierarchical permission system
4. **CORS Protection:** Configured for specific origins
5. **Password Reset:** Secure token-based reset with expiry
6. **Input Validation:** Zod schemas (frontend), Prisma validation (backend)
7. **SQL Injection Protection:** Prisma ORM prevents SQL injection
8. **Token Expiry:** JWT tokens expire after 7 days

---

## 🚀 Key Features

### **1. Multi-Role System**
- Players, Coaches, Judges, Admins, School Admins, Sponsors
- Each role has specific permissions and dashboards

### **2. Tier System**
- 6 competitive tiers: Beginner → Amateur → Regular → Professional → Legendary → National
- Teams progress through tiers based on performance

### **3. Match System**
- Scheduled matches between teams
- Live match tracking
- Score tracking
- Winner determination
- Arena assignment

### **4. Leaderboard**
- Global leaderboard
- Tier-based leaderboards
- Real-time updates via Socket.io

### **5. Challenge System**
- Coding challenges with difficulty levels
- Team and individual submissions
- Review and scoring system

### **6. Academy**
- Learning courses
- Progress tracking
- Tier-based courses

### **7. Real-Time Updates**
- Socket.io integration
- Live match updates
- Leaderboard updates
- Team updates

### **8. Notification System**
- User notifications
- Match notifications
- Challenge notifications
- Award notifications

### **9. Messaging System**
- Internal messaging between users
- Read/unread status

### **10. Arena Management**
- Schools can create arenas
- Arena applications
- Match venue assignment

---

## 📁 File-by-File Breakdown

### **Frontend Files:**

#### **`client/src/main.tsx`**
- React 18 entry point
- Renders App component

#### **`client/src/App.tsx`**
- Main application component
- Sets up providers (Query, Router, Toast, Tooltip)
- Defines all routes

#### **`client/src/components/ParticleBackground.tsx`**
- Canvas-based particle animation
- NDL tier color scheme
- Connection lines between particles
- Responsive to window resize

#### **`client/src/store/useAuthStore.js`**
- Zustand store for authentication
- Persists to localStorage
- Login, register, logout, update profile

#### **`client/src/api/axios.js`**
- Axios instance configuration
- Request/response interceptors
- Automatic token injection
- 401 error handling

#### **`client/src/pages/Home.tsx`**
- Landing page
- Fetches leaderboard
- Initializes socket connection
- Composes multiple sections

### **Backend Files:**

#### **`server/src/index.js`**
- Express server setup
- Socket.io initialization
- Route mounting
- Error handling

#### **`server/src/middleware/auth.js`**
- JWT token verification
- Role checking middleware

#### **`server/src/middleware/rbac.js`**
- Role-based access control
- Hierarchical permissions
- School access checking
- Managed resources helpers

#### **`server/src/controllers/authController.js`**
- User registration
- User login
- Profile management
- Password reset flow
- Admin creation

#### **`server/src/services/socket.js`**
- Socket.io server setup
- JWT authentication for sockets
- Room management
- Event emission helpers

#### **`server/prisma/schema.prisma`**
- Database schema definition
- All models and relationships
- Enums
- Field constraints

---

## 🔄 Data Flow

### **Authentication Flow:**
1. User submits login form
2. Frontend calls `authApi.login()`
3. Axios interceptor adds token (if exists)
4. Backend verifies credentials
5. Backend returns JWT token
6. Frontend stores token in localStorage
7. Zustand store updates authentication state
8. User redirected to dashboard

### **API Request Flow:**
1. Component calls API function
2. API function uses `apiClient` (Axios)
3. Request interceptor adds JWT token
4. Request sent to backend
5. Backend middleware verifies token
6. Controller processes request
7. Prisma queries database
8. Response sent back
9. React Query caches response
10. Component updates with data

### **Real-Time Update Flow:**
1. Backend event occurs (match update, etc.)
2. Controller calls `emitMatchUpdate()` or similar
3. Socket.io emits to relevant rooms
4. Frontend socket client receives event
5. React Query invalidates cache
6. Component refetches data
7. UI updates automatically

---

## 🎯 Development Workflow

### **Starting Development:**
1. **Backend:** `cd server && npm run dev`
2. **Frontend:** `cd client && npm run dev`
3. **Database:** MySQL must be running
4. **Prisma:** Run migrations with `npx prisma migrate dev`

### **Environment Variables:**
- `PORT` - Backend server port (default: 3001)
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `CLIENT_URL` - Frontend URL for CORS
- `VITE_API_BASE_URL` - Backend API URL (frontend)

### **Database Management:**
- **Migrations:** `npx prisma migrate dev`
- **Studio:** `npx prisma studio` (GUI for database)
- **Generate Client:** `npx prisma generate`
- **Seed:** `npm run prisma:seed`

---

## 📊 Performance Optimizations

1. **React Query:** Automatic caching and refetching
2. **Code Splitting:** Vite handles automatic code splitting
3. **Canvas Animation:** Efficient requestAnimationFrame usage
4. **Socket.io Rooms:** Targeted event broadcasting
5. **Prisma:** Optimized database queries with includes
6. **Lazy Loading:** React Router lazy loading support

---

## 🧪 Testing & Quality

- **ESLint:** Code linting configured
- **TypeScript:** Type safety throughout frontend
- **Zod:** Runtime validation
- **Prisma:** Database schema validation

---

## 🚢 Deployment Considerations

1. **Environment Variables:** Must be set in production
2. **Database:** MySQL must be accessible
3. **CORS:** Must allow production frontend URL
4. **JWT Secret:** Must be strong and secure
5. **Password Reset:** Email service required for production
6. **HTTPS:** Required for secure JWT transmission
7. **Docker:** Optional containerization support

---

## 📝 Summary

This is a **sophisticated full-stack application** with:
- **Modern frontend** using React, TypeScript, and Tailwind
- **RESTful API** backend with Express and Prisma
- **Real-time features** via Socket.io
- **Comprehensive authentication** and authorization
- **Rich database schema** supporting complex relationships
- **Role-based access control** with hierarchical permissions
- **Beautiful UI** with animations and modern design
- **Scalable architecture** with separation of concerns

The codebase is well-organized, follows modern best practices, and is production-ready with proper security measures in place.

