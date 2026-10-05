# PokiChat

A production-quality real-time chat application built with React, Node.js, Express, Socket.io, and MongoDB.

## Features

- Real-time messaging with Socket.io
- Persistent message history stored in MongoDB
- Online user count tracking
- Typing indicator
- Connection status display (Connected / Connecting / Disconnected)
- Username-based authentication
- Responsive design (Desktop, Tablet, Mobile)
- Auto-scroll to newest messages
- Empty state, loading state, and error state handling

## Tech Stack

**Frontend:**
- React.js with Vite
- Socket.io-client
- Axios
- Modern CSS (custom properties, flexbox, grid)

**Backend:**
- Node.js
- Express.js
- Socket.io
- MongoDB with Mongoose

## Project Structure

```
pokichat/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cors.js
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── messageController.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   └── Message.js
│   │   ├── routes/
│   │   │   └── messageRoutes.js
│   │   ├── sockets/
│   │   │   └── chatSocket.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── LoginScreen.jsx
│   │   │   ├── MessageComposer.jsx
│   │   │   ├── MessagesArea.jsx
│   │   │   └── TypingIndicator.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── config.js
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .github/workflows/deploy.yml
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- npm
- MongoDB (local installation or MongoDB Atlas)

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
npm run dev
```

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string (required in production) | - |
| `CLIENT_URL` | Frontend URL allowed by CORS (comma separated for more) | `https://aakashpate.github.io` |
| `CLIENT_URLS` | Optional extra CORS origins, comma separated | - |
| `HOST` | Interface to bind | `0.0.0.0` |

### Frontend (.env)

Values are baked in at **build time** by Vite. `npm run dev` falls back to `http://localhost:5000` when they are unset.

| Variable | Description | Production value |
|----------|-------------|------------------|
| `VITE_API_URL` | Backend API base URL | `https://YOUR-BACKEND-URL/api` |
| `VITE_SOCKET_URL` | Socket.io server URL | `https://YOUR-BACKEND-URL` |

## MongoDB Setup

### Option 1: Local MongoDB

1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start the MongoDB service
3. Use connection string: `mongodb://localhost:27017/pokichat`

### Option 2: MongoDB Atlas

1. Create a free account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Click "Connect" > "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Add the connection string to your `.env` file

## API Documentation

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "PokiChat API is running"
}
```

### Get Messages

```
GET /api/messages
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "username": "Aakash",
      "text": "Hello everyone!",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Message

```
POST /api/messages
Content-Type: application/json

{
  "username": "Aakash",
  "text": "Hello everyone!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "username": "Aakash",
    "text": "Hello everyone!",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Username and text are required"
}
```

## Socket.io Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `connection` | Client → Server | - | User connects |
| `disconnect` | Client → Server | - | User disconnects |
| `join_chat` | Client → Server | `username` | User joins chat |
| `send_message` | Client → Server | `{ username, text }` | Send a message |
| `receive_message` | Server → Client | `{ _id, username, text, createdAt }` | Receive a message |
| `typing_start` | Client → Server | - | User starts typing |
| `typing_stop` | Client → Server | - | User stops typing |
| `typing_start` | Server → Client | `{ username }` | Another user is typing |
| `typing_stop` | Server → Client | `{ username }` | Another user stopped typing |
| `online_users` | Server → Client | `count` | Updated online user count |
| `message_error` | Server → Client | `{ message }` | Message send failed |

## Design Decisions

- **React**: Component-based architecture for a modular, maintainable UI
- **Express**: Lightweight, flexible Node.js framework for REST APIs
- **Socket.io**: Built-in reconnection, room support, and fallback to polling
- **MongoDB**: Schema flexibility and excellent Node.js integration via Mongoose
- **Vite**: Fast development server and optimized production builds

## Assumptions

- No authentication/authorization system (username-only identification)
- Messages are broadcast to all connected users (no private messaging)
- No message editing or deletion
- No file/image sharing
- Maximum username length: 30 characters
- Maximum message length: 1000 characters

## Testing

### Real-Time Messaging Test

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Open two browser windows/tabs at `http://localhost:5173`
4. In Tab 1, enter username "Aakash"
5. In Tab 2, enter username "TestUser"
6. Send a message from Tab 1
7. The message should appear in both tabs instantly
8. Send a message from Tab 2
9. Verify it appears in both tabs without refresh

### Verify Features

- [ ] Messages persist after page refresh
- [ ] Online user count shows correct number
- [ ] Typing indicator appears when typing
- [ ] Connection status updates correctly
- [ ] Responsive layout works on mobile viewport

## Deployment

### Frontend (GitHub Pages)

The Vite `base` is `/PokiChat/` for production builds, so the site lives at
`https://aakashpate.github.io/PokiChat/`.

1. Push the code to `https://github.com/aakashpate/PokiChat`
2. Repo **Settings -> Pages -> Source**: choose **GitHub Actions**
3. Repo **Settings -> Secrets and variables -> Actions** and add:
   - `VITE_API_URL` = `https://YOUR-BACKEND-URL/api`
   - `VITE_SOCKET_URL` = `https://YOUR-BACKEND-URL`
4. Push to `main` (or `master`) - `.github/workflows/deploy.yml` builds `frontend/`
   and publishes `frontend/dist`
5. The site is then available at `https://aakashpate.github.io/PokiChat/`

Local check of the production build:

```bash
cd frontend
npm ci && npm run build && npm run preview
# open http://localhost:4173/PokiChat/
```

### Backend (Render / Railway)

1. Push code to GitHub
2. Create a new Web Service from the `backend/` directory
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `CLIENT_URL` = `https://aakashpate.github.io`
   - `NODE_ENV` = `production`
6. Copy the service URL (e.g. `https://pokichat-api.onrender.com`) into the frontend
   secrets as `VITE_API_URL` / `VITE_SOCKET_URL`, then redeploy the frontend
7. Verify `https://your-backend-url/api/health` returns
   `{"success":true,"message":"PokiChat API is running"}`

The server binds `0.0.0.0` and reads `process.env.PORT`, so Render/Railway work out
of the box. If `MONGODB_URI` is missing in production the process exits with a clear
`[FATAL]` message instead of silently using an in-memory database.

### MongoDB (Atlas)

1. Create a free cluster on MongoDB Atlas
2. Create a database user
3. Whitelist IP addresses (0.0.0.0/0 for all)
4. Get the connection string and add to backend `.env`

## License

MIT
