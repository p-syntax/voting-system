import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
//connecting to the database 
import { connectDB,createAdmin } from './config/database.js';
// import routes 
import authRoutes from "./routes/authRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import voterRoutes from "./routes/voterRoutes.js"

// Load environment variables
dotenv.config();
// Create express app
const app = express();
//adding the cors configuration 
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];
app.use(
  cors({
    origin: function (origin, callback) {

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Allow JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// importing created routes 
app.use("/auth",authRoutes)
app.use("/admin",adminRoutes)
app.use("/voter",voterRoutes)
// Create HTTP server
const server = http.createServer(app);

// Get port
const PORT = process.env.PORT ;


// Security middleware
app.use(helmet());




// Generic error handler - ensure JSON responses for errors (prevents HTML error pages)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
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

export { app, server };
