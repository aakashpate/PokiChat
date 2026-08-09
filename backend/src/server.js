require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/database');
const chatSocket = require('./sockets/chatSocket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

chatSocket(io);

const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected - messages will persist');
  } catch (err) {
    console.warn('MongoDB not available - using in-memory storage');
    console.warn('Messages will NOT persist after restart');
    console.warn('Install MongoDB or set MONGODB_URI in .env for persistence');
  }

  server.listen(PORT, () => {
    console.log(`PulseChat server running on port ${PORT}`);
  });
};

startServer();
