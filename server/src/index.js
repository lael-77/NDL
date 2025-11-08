import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import matchesRoutes from './routes/matches.js';
import teamsRoutes from './routes/teams.js';
import leaderboardRoutes from './routes/leaderboard.js';
import authRoutes from './routes/auth.js';
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'NDL Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

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

