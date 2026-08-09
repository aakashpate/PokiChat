# PulseChat

A real-time chat application built using React, Node.js, Express and Socket.io.

**Live Demo:** https://pulsechat-5lsk74ue2-aakash-8bba.vercel.app

**Backend API:** https://pulsechat-backend-production-f957.up.railway.app

## Features

- Real-time messaging with Socket.io
- Chat history with MongoDB persistence
- Message timestamps
- Username-based login
- Online user count
- Typing indicators
- Connection/disconnection status
- Auto-reconnection on network loss
- Responsive UI
- REST APIs

## Tech Stack

**Frontend:**
- React
- CSS
- Socket.io-client
- Axios

**Backend:**
- Node.js
- Express
- Socket.io
- MongoDB with Mongoose

## How to Run

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_URL` | Frontend URL for CORS |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL |
| `VITE_SOCKET_URL` | Backend Socket.io URL |

## API

### Health Check
```
GET /api/health
```

### Get Messages
```
GET /api/messages
```

### Create Message
```
POST /api/messages
Body: { "username": "Aakash", "text": "Hello" }
```

## Real-Time Events

| Event | Direction | Description |
|---|---|---|
| `connection` | Client → Server | User connects |
| `disconnect` | Client → Server | User disconnects |
| `join_chat` | Client → Server | Register username |
| `send_message` | Client → Server | Send a message |
| `receive_message` | Server → All | Broadcast message |
| `typing_start` | Client → Server | User typing |
| `typing_stop` | Client → Server | User stopped typing |
| `online_users` | Server → All | Online user count |

## Project Structure

```
pulsechat/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/
│   ├── src/
│   ├── package.json
│   └── ...
├── README.md
└── .gitignore
```

## Author

Aakash Patel
