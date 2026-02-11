import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
//connecting to the database 
import { connectDB,createAdmin } from './config/database.js';


// Load environment variables
dotenv.config();

// Create express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Get port
const PORT = process.env.PORT ;

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make socket.io globally accessible
global.io = io;

// Security middleware
app.use(helmet());

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  })
);

// Allow JSON request bodies
app.use(express.json());

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('subscribe:results', () => {
    socket.join('results-room');
    console.log(`Client ${socket.id} subscribed to results`);
  });

  socket.on('unsubscribe:results', () => {
    socket.leave('results-room');
    console.log(`Client ${socket.id} unsubscribed from results`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await createAdmin();

    server.listen(PORT, () => {
      console.log(`server running at port ${PORT}
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

// Run server
startServer();

export { app, server, io };
