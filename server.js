const express = require('express');
const app = express();

app.use(express.json());

let users = {};

// Homepage - shows server is running
app.get('/', (req, res) => {
  // Clean up old users first
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
  try {
    const { userId, username, position } = req.body;
    
    if (!userId || !username) {
      return res.status(400).json({ error: 'Missing userId or username' });
    }
    
    users[userId] = { 
      username: username, 
      position: position || [0, 0, 0], 
      lastSeen: Date.now() 
    };
    
    // Remove inactive users (not seen in 10 seconds)
    const now = Date.now();
    Object.keys(users).forEach(id => {
      if (now - users[id].lastSeen > 10000) {
        delete users[id];
      }
    });
    
    res.json({ 
      success: true, 
      totalUsers: Object.keys(users).length 
    });
  } catch (error) {
    console.error('Error in /update:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all active users
app.get('/users', (req, res) => {
  // Clean up old users first
  const now = Date.now();
  Object.keys(users).forEach(id => {
    if (now - users[id].lastSeen > 10000) {
      delete users[id];
    }
  });
  
  res.json(users);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
