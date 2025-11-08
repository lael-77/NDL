import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Socket.io authentication middleware
const authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      // Allow anonymous connections but mark them
      socket.user = null;
      return next();
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        // Allow connection but without user data
        socket.user = null;
        return next();
      }
      socket.user = decoded;
      next();
    });
  } catch (error) {
    // Allow connection but without user data
    socket.user = null;
    next();
  }
};

let io = null;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:8080",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}${socket.user ? ` (User: ${socket.user.email || socket.user.id})` : ' (Anonymous)'}`);

    // Join user to their role-specific room
    if (socket.user) {
      socket.join(`user:${socket.user.id}`);
      if (socket.user.role) {
        socket.join(`role:${socket.user.role}`);
      }
    }

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket disconnected: ${socket.id} (${reason})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });

    // Join match room
    socket.on('join:match', (matchId) => {
      socket.join(`match:${matchId}`);
      console.log(`Socket ${socket.id} joined match:${matchId}`);
    });

    // Leave match room
    socket.on('leave:match', (matchId) => {
      socket.leave(`match:${matchId}`);
      console.log(`Socket ${socket.id} left match:${matchId}`);
    });

    // Join leaderboard room
    socket.on('join:leaderboard', () => {
      socket.join('leaderboard');
      console.log(`Socket ${socket.id} joined leaderboard`);
    });
  });

  return io;
};

// Helper functions to emit events
export const emitMatchUpdate = (matchId, matchData) => {
  if (io) {
    io.to(`match:${matchId}`).emit('match:update', {
      matchId,
      match: matchData,
      message: `Match ${matchId} has been updated`,
    });
    // Also emit to all connected clients
    io.emit('match:update', {
      matchId,
      match: matchData,
      message: `Match ${matchId} has been updated`,
    });
  }
};

export const emitMatchLive = (matchId, matchData) => {
  if (io) {
    io.to(`match:${matchId}`).emit('match:live', {
      matchId,
      match: matchData,
      message: `Match ${matchId} is now live`,
    });
    io.emit('match:live', {
      matchId,
      match: matchData,
      message: `Match ${matchId} is now live`,
    });
  }
};

export const emitLeaderboardUpdate = (leaderboardData) => {
  if (io) {
    io.to('leaderboard').emit('leaderboard:update', {
      leaderboard: leaderboardData,
      message: 'Leaderboard has been updated',
    });
    // Also emit to all connected clients
    io.emit('leaderboard:update', {
      leaderboard: leaderboardData,
      message: 'Leaderboard has been updated',
    });
  }
};

export const emitTeamUpdate = (teamId, teamData) => {
  if (io) {
    io.emit('team:update', {
      teamId,
      team: teamData,
      message: `Team ${teamId} has been updated`,
    });
  }
};

export const getIO = () => {
  return io;
};

export default io;

