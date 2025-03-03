const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['https://xulaixu.com', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'],
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB connection with timeout and better error handling
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Message Schema
const messageSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

// Routes
app.post('/submit-message', async (req, res) => {
  console.log('=== Received message submission ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  // Check MongoDB connection
  if (mongoose.connection.readyState !== 1) {
    console.error('MongoDB not connected');
    return res.status(500).json({ error: 'Database connection error' });
  }

  try {
    const { fullname, email, message } = req.body;
    
    // Validate input
    if (!fullname || !email || !message) {
      console.error('Missing required fields:', { fullname, email, message });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    console.log('Creating new message document...');
    const newMessage = new Message({ fullname, email, message });
    
    // Add timeout to save operation
    const savePromise = newMessage.save();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Save operation timed out')), 5000)
    );
    
    const savedMessage = await Promise.race([savePromise, timeoutPromise]);
    console.log('Message saved successfully:', savedMessage);
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error in /submit-message:', error);
    res.status(500).json({ error: 'Error sending message: ' + error.message });
  }
});

// Comments section route
app.get('/commentsection', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }); // Get all messages, newest first
    res.sendFile(path.join(__dirname, 'comments.html'));
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// API endpoint to get messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('CORS enabled for:', corsOptions.origin);
}); 