const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Use in-memory database instead of MongoDB
const memoryDB = require('./db-memory');

const authRoutes = require('./routes/auth-memory');
const recipeRoutes = require('./routes/recipes-memory');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting with trust proxy disabled
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mock database connection
console.log('Using in-memory database for testing');
console.log('Sample users created:');
console.log('- Admin: admin@recipeapp.com / admin123');
console.log('- User: user@recipeapp.com / user123');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Stub routes for other endpoints
app.use('/api/users', (req, res) => res.json({ message: 'Users endpoint - in development' }));
app.use('/api/ingredients', (req, res) => res.json({ message: 'Ingredients endpoint - in development', ingredients: [] }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: 'In-Memory',
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log('Database: In-Memory (for testing)');
});