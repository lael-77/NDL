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
import { initializeSocket } from './services/socket.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:8080",
  credentials: true,
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
      }
    },
    socketio: 'ws://localhost:3001',
    documentation: 'See /health for server status'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'NDL Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/management', managementRoutes);
app.use('/api/permissions', permissionRoutes);

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

