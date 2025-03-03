const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Message Schema
const messageSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Routes
app.post('/submit-message', async (req, res) => {
  try {
    const { fullname, email, message } = req.body;
    const newMessage = new Message({ fullname, email, message });
    await newMessage.save();
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
});

// Comments section route
app.get('/commentsection', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }); // Get all messages, newest first
    res.sendFile(path.join(__dirname, 'comments.html'));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// API endpoint to get messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 