const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Middleware
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Add request logging middleware
app.use((req, res, next) => {
  console.log('=== Incoming Request ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Database setup
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log // Enable query logging
});

// Message Model
const Message = sequelize.define('Message', {
  fullname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Initialize database
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync();
    console.log('Database synchronized');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

initDatabase();

// Routes
app.post('/submit-message', async (req, res) => {
  console.log('=== Received message submission ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  try {
    const { fullname, email, message } = req.body;
    
    // Validate input
    if (!fullname || !email || !message) {
      console.error('Missing required fields:', { fullname, email, message });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    console.log('Creating new message...');
    const newMessage = await Message.create({
      fullname,
      email,
      message
    });
    
    console.log('Message saved successfully:', newMessage.toJSON());
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error in /submit-message:', error);
    res.status(500).json({ error: 'Error sending message: ' + error.message });
  }
});

// Comments section route
app.get('/commentsection', async (req, res) => {
  try {
    const messages = await Message.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.sendFile(path.join(__dirname, 'comments.html'));
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// API endpoint to get messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('CORS enabled for all origins');
}); 