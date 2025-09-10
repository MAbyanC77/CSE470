const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting - more permissive for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit for development
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for local development
    return process.env.NODE_ENV !== 'production' && 
           (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1');
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduglobalbd', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
  
  // Initialize deadline alert system
  if (process.env.NODE_ENV !== 'test') {
    require('./scripts/deadlineAlerts');
    console.log('📅 Deadline alert system initialized');
  }
})
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api', require('./routes/profile'));
app.use('/api/universities', require('./routes/universities'));
app.use('/api/scholarships', require('./routes/scholarships'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/deadlines', require('./routes/deadlines'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/resources', require('./routes/resources'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;