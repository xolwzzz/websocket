const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let clients = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'register') {
        clients.set(ws, {
          username: data.username,
          userId: data.userId
        });
        console.log(`User registered: ${data.username}`);
      }
      
      // Broadcast to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  });
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});