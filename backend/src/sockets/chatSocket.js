const { createMessage } = require('../store/messages');

const chatSocket = (io) => {
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_chat', (username) => {
      if (!username || !username.trim()) return;

      const trimmed = username.trim();
      connectedUsers.set(socket.id, trimmed);

      io.emit('online_users', connectedUsers.size);
      console.log(`${trimmed} joined. Online: ${connectedUsers.size}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { username, text } = data;

        if (!username || !text) return;

        const trimmedUsername = username.trim();
        const trimmedText = text.trim();

        if (!trimmedUsername || !trimmedText) return;
        if (trimmedUsername.length > 30 || trimmedText.length > 1000) return;

        const message = await createMessage({
          username: trimmedUsername,
          text: trimmedText,
        });

        io.emit('receive_message', {
          _id: message._id,
          username: message.username,
          text: message.text,
          createdAt: message.createdAt,
        });
      } catch (error) {
        console.error('Error saving message:', error.message);
        socket.emit('message_error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing_start', () => {
      const username = connectedUsers.get(socket.id);
      if (username) {
        socket.broadcast.emit('typing_start', { username });
      }
    });

    socket.on('typing_stop', () => {
      const username = connectedUsers.get(socket.id);
      if (username) {
        socket.broadcast.emit('typing_stop', { username });
      }
    });

    socket.on('disconnect', () => {
      const username = connectedUsers.get(socket.id);
      connectedUsers.delete(socket.id);

      if (username) {
        socket.broadcast.emit('typing_stop', { username });
      }

      io.emit('online_users', connectedUsers.size);
      console.log(`${username || socket.id} disconnected. Online: ${connectedUsers.size}`);
    });
  });
};

module.exports = chatSocket;
