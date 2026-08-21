# PulseChat

A full-featured real-time chat application with emoji support, image sharing, message reactions, reply, edit & delete — built with React, Socket.io, and MongoDB.

**Live Demo (Frontend):** https://frontend-nu-eight-hh362h7zgx.vercel.app  
**Backend API:** https://pulsechat-backend-production-f957.up.railway.app

---

## Features

- Real-time messaging powered by Socket.io
- **Emoji Picker** — 1000+ emojis with search (emoji-picker-react)
- **Image Sharing** — Upload and share images in chat
- **Message Reactions** — Like, Love, Laugh, Sad, Angry on any message
- **Reply to Message** — Quote-reply with visual block
- **Edit Messages** — Edit your own messages inline
- **Delete Messages** — Soft delete your own messages
- Typing indicators with auto-timeout
- Online user count tracking
- Connection status indicator (Connected / Connecting / Disconnected)
- Auto-reconnection on network loss
- Username-based login with validation
- Responsive design (Desktop, Tablet, Mobile)
- REST APIs for message CRUD + image upload
- In-memory fallback when MongoDB is unavailable
- Clean, professional gradient-based UI

## Tech Stack

### Frontend
- **React 18** with Vite
- **Socket.io-client** for real-time communication
- **Axios** for REST API calls
- **emoji-picker-react** for emoji picker
- **Modern CSS** (Flexbox, Grid, CSS Variables, Animations)

### Backend
- **Node.js** + **Express.js**
- **Socket.io** for WebSocket communication
- **MongoDB** with **Mongoose** for data persistence
- **Multer** for file upload handling
- **CORS** configured for cross-origin requests

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (local install or MongoDB Atlas)

## Quick Start

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The server starts on `http://localhost:5000`.

If MongoDB is not configured, the backend automatically falls back to in-memory storage. Messages will still work but will NOT persist after server restart.

### Frontend Setup

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
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend REST API base URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Backend Socket.io URL | `http://localhost:5000` |

## API Documentation

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
Content-Type: application/json

{ "username": "Aakash", "text": "Hello" }
```

### Upload Image
```
POST /api/messages/upload
Content-Type: multipart/form-data

Form field: image (jpg, png, gif, webp, max 5MB)
```

## Socket.io Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `send_message` | Client -> Server | `{ username, text, type, imageUrl, replyTo }` | Send message |
| `receive_message` | Server -> All | full message object | Broadcast message |
| `edit_message` | Client -> Server | `{ messageId, username, newText }` | Edit own message |
| `message_edited` | Server -> All | updated message | Broadcast edit |
| `delete_message` | Client -> Server | `{ messageId, username }` | Soft delete message |
| `message_deleted` | Server -> All | updated message | Broadcast deletion |
| `toggle_reaction` | Client -> Server | `{ messageId, username, emoji }` | Add/remove reaction |
| `reaction_toggled` | Server -> All | updated message | Broadcast reaction |
| `typing_start` | Client -> Server | - | User started typing |
| `typing_stop` | Client -> Server | - | User stopped typing |
| `online_users` | Server -> All | count | Online user count |

**Valid reaction emojis:** like, love, laugh, sad, angry

## Message Schema

```javascript
{
  username: String,
  text: String,
  type: String,           // 'text' or 'image'
  imageUrl: String,
  replyTo: { _id, username, text, type, imageUrl },
  reactions: Map,         // { "username": "like"|"love"|"laugh"|"sad"|"angry" }
  edited: Boolean,
  deleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import repository on vercel.com
3. Set root directory to `frontend`
4. Add environment variables and deploy

### Backend (Railway / Render)
1. Push code to GitHub
2. Create new project on railway.app or render.com
3. Set root directory to `backend`
4. Add environment variables and deploy

## Author

Aakash Patel
