const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

let users = {};

app.get('/', (req, res) => {
  const now = Date.now();
  Object.keys(users).forEach(id => {
    if (now - users[id].lastSeen > 10000) {
      delete users[id];
    }
  });
  
  res.send('Roblox WebSocket Server is Running! Users online: ' + Object.keys(users).length);
});

app.post('/update', (req, res) => {
  console.log('POST /update received');
  console.log('Body:', req.body);
  
  try {
    const { userId, username } = req.body;
    
    if (!userId || !username) {
      console.log('Missing data!');
      return res.status(400).json({ error: 'Missing data' });
    }
    
    // Store username and lastSeen (for cleanup), but don't show lastSeen
    users[userId] = { 
      username: username,
      lastSeen: Date.now() 
    };
    
    const now = Date.now();
    Object.keys(users).forEach(id => {
      if (now - users[id].lastSeen > 10000) {
        delete users[id];
      }
    });
    
    console.log(`✅ User ${username} updated! Total: ${Object.keys(users).length}`);
    
    res.status(200).json({ 
      success: true, 
      totalUsers: Object.keys(users).length 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/users', (req, res) => {
  const now = Date.now();
  
  // Clean up old users
  Object.keys(users).forEach(id => {
    if (now - users[id].lastSeen > 10000) {
      delete users[id];
    }
  });
  
  // Return ONLY username and userId (remove lastSeen from response)
  let cleanUsers = {};
  Object.keys(users).forEach(id => {
    cleanUsers[id] = {
      username: users[id].username
    };
  });
  
  res.json(cleanUsers);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});
