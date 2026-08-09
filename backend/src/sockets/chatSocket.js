const Message = require('../models/Message');
const inMemoryMessages = require('../models/inMemoryMessages');
const { isDBConnected } = require('../config/database');

const onlineSocketIds = new Set();

const chatSocket = (io) => {
  io.on('connection', (socket) => {
    onlineSocketIds.add(socket.id);
    console.log(`User connected: ${socket.id} (Total: ${onlineSocketIds.size})`);
    io.emit('online_users', onlineSocketIds.size);

    socket.on('join_chat', (username) => {
      console.log(`${username} joined the chat`);
      socket.username = username;
      io.emit('online_users', onlineSocketIds.size);
    });

    socket.on('send_message', async (data) => {
      try {
        const { username, text } = data;

        if (!username || !text || !username.trim() || !text.trim()) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        const trimmedUsername = username.trim();
        const trimmedText = text.trim();

        if (trimmedUsername.length > 30 || trimmedText.length > 1000) {
          socket.emit('error', { message: 'Message data too long' });
          return;
        }

        let message;
        if (isDBConnected()) {
          message = await Message.create({
            username: trimmedUsername,
            text: trimmedText,
          });
        } else {
          message = await inMemoryMessages.create({
            username: trimmedUsername,
            text: trimmedText,
          });
        }

        io.emit('receive_message', message);
      } catch (error) {
        console.error('Error saving message:', error.message);
        socket.emit('error', { message: 'Failed to save message' });
      }
    });

    socket.on('typing_start', () => {
      if (socket.username) {
        socket.broadcast.emit('typing_start', { username: socket.username });
      }
    });

    socket.on('typing_stop', () => {
      if (socket.username) {
        socket.broadcast.emit('typing_stop', { username: socket.username });
      }
    });

    socket.on('disconnect', () => {
      onlineSocketIds.delete(socket.id);
      console.log(`User disconnected: ${socket.id} (Total: ${onlineSocketIds.size})`);
      io.emit('online_users', onlineSocketIds.size);
    });
  });
};

module.exports = chatSocket;
