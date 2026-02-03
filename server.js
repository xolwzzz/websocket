const express = require('express');
const app = express();

app.use(express.json());

let users = {};

// Homepage - shows server is running
app.get('/', (req, res) => {
  res.send('Roblox WebSocket Server is Running! Users online: ' + Object.keys(users).length);
});

// Update user position
app.post('/update', (req, res) => {
  const { userId, username, position } = req.body;
  users[userId] = { username, position, lastSeen: Date.now() };
  
  // Remove inactive users (not seen in 10 seconds)
  Object.keys(users).forEach(id => {
    if (Date.now() - users[id].lastSeen > 10000) {
      delete users[id];
    }
  });
  
  res.json({ success: true, totalUsers: Object.keys(users).length });
});

// Get all active users
app.get('/users', (req, res) => {
  res.json(users);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
