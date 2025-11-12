import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import matchesRoutes from './routes/matches.js';
import teamsRoutes from './routes/teams.js';
import leaderboardRoutes from './routes/leaderboard.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import managementRoutes from './routes/management.js';
import permissionRoutes from './routes/permissions.js';
import judgeRoutes from './routes/judge.js';
import testDbRoutes from './routes/test-db.js';
import { initializeSocket } from './services/socket.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Middleware - CORS configuration
// Allow both localhost (development) and Vercel (production) origins
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development mode, allow all localhost origins
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - API information
app.get('/', (req, res) => {
  res.json({
    message: 'NDL (National Developers League) API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      matches: {
        getAll: 'GET /api/matches',
        getById: 'GET /api/matches/:id',
        create: 'POST /api/matches',
        update: 'PUT /api/matches/:id',
        delete: 'DELETE /api/matches/:id'
      },
      teams: {
        getAll: 'GET /api/teams',
        getById: 'GET /api/teams/:id',
        create: 'POST /api/teams',
        update: 'PUT /api/teams/:id',
        delete: 'DELETE /api/teams/:id'
      },
      leaderboard: {
        global: 'GET /api/leaderboard',
        byTier: 'GET /api/leaderboard?tier=BRONZE|SILVER|GOLD|PLATINUM|DIAMOND'
      },
      test: {
        db: 'GET /api/test-db',
        dbTable: 'GET /api/test-db/table/:tableName'
      }
    },
    socketio: 'ws://localhost:3001',
    documentation: 'See /health for server status'
  });
});

// Health check with database status
app.get('/health', async (req, res) => {
  try {
    const db = (await import('./services/database.js')).default;
    const health = await db.healthCheck();
    
    res.json({ 
      status: 'ok', 
      message: 'NDL Server is running',
      databases: health
    });
  } catch (error) {
    res.json({ 
      status: 'ok', 
      message: 'NDL Server is running',
      databases: { error: error.message }
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
console.log('✅ [Server] Dashboard routes mounted at /api/dashboard');
app.use('/api/admin', adminRoutes);
app.use('/api/management', managementRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/judge', judgeRoutes);
console.log('✅ [Server] Judge routes mounted at /api/judge');
app.use('/api/test-db', testDbRoutes);
console.log('✅ [Server] Test DB routes mounted at /api/test-db');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`🚀 NDL Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io server initialized`);
});

export default app;

