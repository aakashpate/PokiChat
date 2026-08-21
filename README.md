# PulseChat

A production-quality real-time chat application with MongoDB persistence, typing indicators, online user tracking, and a modern responsive UI.

**Live Demo (Frontend):** https://frontend-nu-eight-hh362h7zgx.vercel.app  
**Backend API:** https://pulsechat-backend-production-f957.up.railway.app

---

## Features

- Real-time messaging powered by Socket.io
- Chat history persisted in MongoDB (survives page refresh)
- Typing indicators with auto-timeout
- Online user count tracking
- Connection status indicator (Connected / Connecting / Disconnected)
- Auto-reconnection on network loss
- Username-based login with validation
- Responsive design (Desktop, Tablet, Mobile)
- REST APIs for message CRUD
- In-memory fallback when MongoDB is unavailable
- Clean, professional gradient-based UI

## Tech Stack

### Frontend
- **React 18** with Vite
- **Socket.io-client** for real-time communication
- **Axios** for REST API calls
- **Modern CSS** (Flexbox, Grid, CSS Variables, Animations)

### Backend
- **Node.js** + **Express.js**
- **Socket.io** for WebSocket communication
- **MongoDB** with **Mongoose** for data persistence
- **CORS** configured for cross-origin requests

## Project Structure

```
PulseChat/
├── README.md
├── render.yaml
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env
│   ├── .env.example
│   ├── vercel.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── components/
│       │   ├── Login.jsx / Login.css
│       │   ├── Header.jsx / Header.css
│       │   ├── MessageList.jsx / MessageList.css
│       │   ├── MessageComposer.jsx / MessageComposer.css
│       │   └── TypingIndicator.jsx / TypingIndicator.css
│       ├── hooks/
│       │   └── useChat.js
│       └── services/
│           ├── api.js
│           └── socket.js
└── backend/
    ├── package.json
    ├── .env
    ├── .env.example
    └── src/
        ├── server.js
        ├── app.js
        ├── config/
        │   └── database.js
        ├── models/
        │   ├── Message.js
        │   └── inMemoryMessages.js
        ├── controllers/
        │   └── messageController.js
        ├── routes/
        │   └── messageRoutes.js
        ├── sockets/
        │   └── chatSocket.js
        └── middleware/
            └── errorHandler.js
```

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (local install or MongoDB Atlas)

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

The server starts on `http://localhost:5000`.

If MongoDB is not configured, the backend automatically falls back to in-memory storage. Messages will still work but will NOT persist after server restart.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/pulsechat` |
| `CLIENT_URL` | Frontend URL for CORS (comma-separated for multiple) | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend REST API base URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Backend Socket.io URL | `http://localhost:5000` |

## MongoDB Setup

### Option 1: Local MongoDB

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start the MongoDB service
3. The backend connects to `mongodb://localhost:27017/pulsechat` by default

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Click "Connect" > "Connect your application"
4. Copy the connection string
5. Replace `<username>` and `<password>` with your database user credentials
6. Set `MONGODB_URI` in `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pulsechat?retryWrites=true&w=majority
   ```

## API Documentation

### Health Check

```
GET /api/health
```

**Response (200):**
```json
{
  "success": true,
  "message": "PulseChat API is running"
}
```

### Get Messages

```
GET /api/messages
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "Aakash",
      "text": "Hello!",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

Messages are sorted oldest to newest.

### Create Message

```
POST /api/messages
Content-Type: application/json

{
  "username": "Aakash",
  "text": "Hello"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "username": "Aakash",
    "text": "Hello",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Username and text are required"
}
```

## Socket.io Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `connection` | Client -> Server | - | User connects to server |
| `disconnect` | Client -> Server | - | User disconnects |
| `join_chat` | Client -> Server | `username` (string) | Register username on connection |
| `send_message` | Client -> Server | `{ username, text }` | Send a chat message |
| `receive_message` | Server -> All | `{ _id, username, text, createdAt }` | Broadcast saved message to all clients |
| `typing_start` | Client -> Server | - | User started typing |
| `typing_stop` | Client -> Server | - | User stopped typing |
| `online_users` | Server -> All | `count` (number) | Broadcast online user count |
| `error` | Server -> Client | `{ message }` | Error notification |

## Design Decisions

- **React + Vite**: Fast development experience with instant HMR and optimized builds
- **Socket.io**: Reliable real-time bidirectional communication with automatic reconnection
- **Express.js**: Lightweight, flexible Node.js framework perfect for REST APIs + WebSocket server
- **MongoDB + Mongoose**: Schema-based data modeling with built-in validation
- **Custom Hook (useChat)**: Centralizes all socket logic and state management in one reusable hook
- **In-Memory Fallback**: Graceful degradation when MongoDB is unavailable - the app still works

## Assumptions

- No authentication system (username-based identification only)
- No message editing or deletion
- No file/image upload
- Messages are broadcast to all connected users (no private/room chats)
- Online user count tracks socket connections, not unique usernames
- MongoDB Atlas free tier is sufficient for development/testing

## Testing

### Real-Time Messaging Test

1. Start the backend:
   ```bash
   cd backend && npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend && npm run dev
   ```

3. Open **two browser windows** (or two different browsers)

4. **Tab 1**: Enter username `Aakash`, click "Join Chat"
5. **Tab 2**: Enter username `TestUser`, click "Join Chat"

6. Both tabs should show **2 online** in the header

7. In Tab 1, type a message and send
8. The message should appear in **both tabs instantly** without refresh

### Verify Typing Indicator

1. In Tab 1, start typing (don't send)
2. Tab 2 should show "Aakash is typing..."
3. Stop typing for 2 seconds
4. The typing indicator should disappear

### Verify Persistence

1. Send a few messages
2. Refresh the browser
3. All previous messages should still be visible

### Verify Reconnection

1. Stop the backend server (Ctrl+C)
2. Frontend should show "Disconnected" status
3. Restart the backend
4. Frontend should automatically reconnect and show "Connected"

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import repository on [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variables:
   - `VITE_API_URL` = your backend API URL + `/api`
   - `VITE_SOCKET_URL` = your backend URL
5. Deploy

### Backend (Railway / Render)

1. Push code to GitHub
2. Create a new project on [railway.app](https://railway.app) or [render.com](https://render.com)
3. Set root directory to `backend`
4. Add environment variables:
   - `PORT` = `5000`
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `CLIENT_URL` = your Vercel frontend URL
5. Deploy

### MongoDB (Atlas)

1. Create cluster on [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for all)
4. Get connection string and set as `MONGODB_URI`

## Submission Checklist

- [x] GitHub repository
- [x] Working frontend (React + Vite)
- [x] Working backend (Express + Socket.io)
- [x] MongoDB persistence (with in-memory fallback)
- [x] REST APIs (health, GET messages, POST messages)
- [x] Socket.io real-time messaging
- [x] Typing indicators
- [x] Online user count
- [x] Connection status
- [x] Responsive UI
- [x] Error handling
- [x] Environment variables
- [x] README documentation

## Author

Aakash Patel
