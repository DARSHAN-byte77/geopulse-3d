import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Simulated major global tech/financial hubs
const CITIES = [
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 }
];

function generateEvent() {
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  return {
    id: Math.random().toString(36).substring(2, 9),
    city: city.name,
    lat: city.lat + (Math.random() - 0.5) * 5,
    lng: city.lng + (Math.random() - 0.5) * 5,
    value: (Math.random() * 5000 + 100).toFixed(2),
    severity: Math.random() > 0.85 ? 'CRITICAL' : 'NORMAL',
    timestamp: Date.now()
  };
}

wss.on('connection', (ws) => {
  console.log('⚡ Client connected to real-time event stream');

  // Broadcast event every 20ms = ~50 events per second
  const interval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(generateEvent()));
    }
  }, 20);

  ws.on('close', () => {
    console.log('❌ Client disconnected');
    clearInterval(interval);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 GeoPulse 3D running at http://localhost:${PORT}`);
});