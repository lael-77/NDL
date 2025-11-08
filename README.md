# NDL - National Development League

A competitive coding league platform for high schools where teams compete in matches, solve challenges, and rise through competitive tiers.

## Project Structure

```
NDL/
├── client/                    # Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── api/               # Axios API calls to backend
│   │   └── store/             # Zustand state management
│   └── package.json
│
├── server/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/       # Business logic (Matches, Teams, Leaderboard)
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Helper services (auth, scoring)
│   │   ├── middleware/        # Express middleware
│   │   └── index.js           # Server entry point
│   ├── prisma/                # ORM schema for MySQL
│   └── package.json
│
├── docs/                      # Technical documentation
│   ├── backend_spec.md        # Backend specification
│   └── api_endpoints.md       # API endpoints documentation
│
├── .env.example               # Environment variables template
├── docker-compose.yml         # Docker configuration for DB + backend
└── README.md                  # This file
```

## Technologies

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Zustand** - State management
- **Axios** - HTTP client
- **React Router** - Routing

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Prisma** - ORM
- **MySQL** - Database (mysql2)
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites

- Node.js (v20 or higher) - [Download](https://nodejs.org/)
- MySQL (v8.0 or higher) - See `INSTALL_MYSQL_WINDOWS.md` for installation
- npm or yarn

### Quick Start

**If you have XAMPP installed:**
```powershell
.\setup-xampp.ps1
```

**If you have MySQL installed:**
```powershell
.\setup-local.ps1
```

**Then start the servers:**
```powershell
.\start.ps1
```

See `QUICK_START.md` for a complete step-by-step guide.
See `SETUP_XAMPP.md` for XAMPP-specific setup instructions.

**Quick Setup:**
- Run `.\quick-start.ps1` for guided setup
- Or see `INSTALL_MYSQL_WINDOWS.md` for MySQL installation instructions

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NDL-main
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Install server dependencies**
   ```bash
   cd ../server
   npm install
   ```

5. **Set up database**
   
   **Option A: Using Docker (if installed)**
   ```bash
   # Start MySQL container
   docker compose up -d mysql
   # Or: docker-compose up -d mysql (older versions)
   ```
   
   **Option B: Using Local MySQL**
   ```bash
   # Install MySQL locally, then:
   # 1. Create database: CREATE DATABASE ndl_db;
   # 2. Create user: CREATE USER 'ndl_user'@'localhost' IDENTIFIED BY 'ndl_password';
   # 3. Grant privileges: GRANT ALL PRIVILEGES ON ndl_db.* TO 'ndl_user'@'localhost';
   # 4. Run setup script: .\setup-local.ps1
   ```
   
   **Then run migrations:**
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma generate
   ```
   
   See `SETUP_LOCAL.md` for detailed local MySQL setup instructions.

6. **Start the development servers**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```

### Using Docker

1. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Run database migrations**
   ```bash
   cd server
   npx prisma migrate dev
   ```

3. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001
   - Database: localhost:3306

## API Documentation

See [docs/api_endpoints.md](./docs/api_endpoints.md) for detailed API documentation.

## Backend Specification

See [docs/backend_spec.md](./docs/backend_spec.md) for backend architecture and implementation details.

## Features

- **User Authentication** - Register, login, and profile management
- **Team Management** - Create teams, manage members
- **Match System** - Schedule and track matches between teams
- **Leaderboard** - Global and tier-based leaderboards
- **Tier System** - 5 competitive tiers (Beginner to National)
- **Scoring System** - Automatic point calculation and tier promotions/relegations

## Development

### Client Development

```bash
cd client
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run linter
```

### Server Development

```bash
cd server
npm run dev              # Start development server with watch
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
```

## Database Schema

The database schema is defined in `server/prisma/schema.prisma`. Key models include:

- **Profile** - User profiles
- **School** - Schools with tier levels
- **Team** - Teams belonging to schools
- **Match** - Matches between teams
- **Challenge** - Coding challenges

## Environment Variables

See `.env.example` for required environment variables:

- `PORT` - Server port
- `DATABASE_URL` - MySQL connection string (mysql://user:password@localhost:3306/database)
- `JWT_SECRET` - JWT token secret
- `VITE_API_BASE_URL` - Backend API URL (for client)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions, please open an issue on GitHub.
