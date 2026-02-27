require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const entryRoutes = require('./routes/entries');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { handleMulterError } = require('./middleware/upload');

/**
 * Create Express application
 */
const app = express();

/**
 * Middleware Configuration
 */

// Enable CORS for all origins (configure for production)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:19006', 'exp://192.168.1.100:8081'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GeoTag Photo Logger API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);

/**
 * Handle multer errors
 */
app.use(handleMulterError);

/**
 * 404 Handler - Must be before error handler
 */
app.use(notFound);

/**
 * Global Error Handler - Must be last middleware
 */
app.use(errorHandler);

/**
 * Database Connection
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('entries').createIndex({ user: 1, createdAt: -1 });
    await mongoose.connection.db.collection('entries').createIndex({ latitude: 1, longitude: 1 });
    
    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 GeoTag Photo Logger API running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
      console.log(`📸 Uploads directory: ${path.join(__dirname, 'uploads')}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🔄 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        mongoose.connection.close(false, () => {
          console.log('✅ Database connection closed');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', () => {
      console.log('🔄 SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        mongoose.connection.close(false, () => {
          console.log('✅ Database connection closed');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
