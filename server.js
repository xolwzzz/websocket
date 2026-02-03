const express = require('express');
const app = express();

// IMPORTANT: Parse JSON bodies
app.use(express.json());

let users = {};

// Homepage
app.get('/', (req, res) => {
  const now = Date.now();
  Object.keys(users).forEach(id => {
    if (now - users[id].lastSeen > 10000) {
      delete users[id];
    }
  });
  
  res.send('Roblox WebSocket Server is Running! Users online: ' + Object.keys(users).length);
});

// Update user position
app.post('/update', (req, res) => {
  console.log('Received POST /update');
  console.log('Body:', req.body);
  
  try {
    const { userId, username, position } = req.body;
    
    if (!userId || !username) {
      console.log('ERROR: Missing userId or username');
      return res.status(400).json({ error: 'Missing userId or username' });
    }
    
    users[userId] = { 
      username: username, 
      position: position || [0, 0, 0], 
      lastSeen: Date.now() 
    };
    
    // Clean old users
    const now = Date.now();
    Object.keys(users).forEach(id => {
      if (now - users[id].lastSeen > 10000) {
        delete users[id];
      }
    });
    
    console.log(`User ${username} registered. Total: ${Object.keys(users).length}`);
    
    // IMPORTANT: Send response
    res.status(200).json({ 
      success: true, 
      totalUsers: Object.keys(users).length 
    });
  } catch (error) {
    console.error('ERROR in /update:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Get all users
app.get('/users', (req, res) => {
  const now = Date.now();
  Object.keys(users).forEach(id => {
    if (now - users[id].lastSeen > 10000) {
      delete users[id];
    }
  });
  
  console.log('GET /users - Total users:', Object.keys(users).length);
  res.json(users);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
