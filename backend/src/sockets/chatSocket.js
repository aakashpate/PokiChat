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
        const { username, text, type, imageUrl, replyTo } = data;

        if (!username || !username.trim()) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        const trimmedUsername = username.trim();
        const trimmedText = (text || '').trim();

        if (trimmedUsername.length > 30) {
          socket.emit('error', { message: 'Username too long' });
          return;
        }

        if (trimmedText.length > 1000) {
          socket.emit('error', { message: 'Message too long' });
          return;
        }

        if (type === 'image' && !imageUrl) {
          socket.emit('error', { message: 'Image URL is required for image messages' });
          return;
        }

        const messageData = {
          username: trimmedUsername,
          text: trimmedText,
          type: type || 'text',
          imageUrl: imageUrl || null,
          replyTo: replyTo || null,
        };

        let message;
        if (isDBConnected()) {
          message = await Message.create(messageData);
        } else {
          message = await inMemoryMessages.create(messageData);
        }

        io.emit('receive_message', message);
      } catch (error) {
        console.error('Error saving message:', error.message);
        socket.emit('error', { message: 'Failed to save message' });
      }
    });

    socket.on('edit_message', async (data) => {
      try {
        const { messageId, username, newText } = data;

        if (!messageId || !newText || !newText.trim()) {
          socket.emit('error', { message: 'Invalid edit data' });
          return;
        }

        const trimmedText = newText.trim();
        if (trimmedText.length > 1000) {
          socket.emit('error', { message: 'Message too long' });
          return;
        }

        let updated;
        if (isDBConnected()) {
          updated = await Message.findOneAndUpdate(
            { _id: messageId, username: username },
            { $set: { text: trimmedText, edited: true } },
            { new: true }
          );
        } else {
          const msg = await inMemoryMessages.findById(messageId);
          if (!msg || msg.username !== username) {
            socket.emit('error', { message: 'Cannot edit this message' });
            return;
          }
          updated = await inMemoryMessages.findByIdAndUpdate(messageId, {
            $set: { text: trimmedText, edited: true },
          });
        }

        if (!updated) {
          socket.emit('error', { message: 'Message not found or not authorized' });
          return;
        }

        io.emit('message_edited', updated);
      } catch (error) {
        console.error('Error editing message:', error.message);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    socket.on('delete_message', async (data) => {
      try {
        const { messageId, username } = data;

        if (!messageId) {
          socket.emit('error', { message: 'Invalid delete data' });
          return;
        }

        let updated;
        if (isDBConnected()) {
          updated = await Message.findOneAndUpdate(
            { _id: messageId, username: username },
            { $set: { deleted: true, text: '', imageUrl: null } },
            { new: true }
          );
        } else {
          const msg = await inMemoryMessages.findById(messageId);
          if (!msg || msg.username !== username) {
            socket.emit('error', { message: 'Cannot delete this message' });
            return;
          }
          updated = await inMemoryMessages.findByIdAndUpdate(messageId, {
            $set: { deleted: true, text: '', imageUrl: null },
          });
        }

        if (!updated) {
          socket.emit('error', { message: 'Message not found or not authorized' });
          return;
        }

        io.emit('message_deleted', updated);
      } catch (error) {
        console.error('Error deleting message:', error.message);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    socket.on('toggle_reaction', async (data) => {
      try {
        const { messageId, username, emoji } = data;

        if (!messageId || !username || !emoji) {
          socket.emit('error', { message: 'Invalid reaction data' });
          return;
        }

        const validEmojis = ['like', 'love', 'laugh', 'sad', 'angry'];
        if (!validEmojis.includes(emoji)) {
          socket.emit('error', { message: 'Invalid emoji type' });
          return;
        }

        let updated;
        if (isDBConnected()) {
          const msg = await Message.findById(messageId);
          if (!msg) {
            socket.emit('error', { message: 'Message not found' });
            return;
          }

          const reactions = msg.reactions || {};
          if (reactions[username] === emoji) {
            delete reactions[username];
          } else {
            reactions[username] = emoji;
          }

          updated = await Message.findByIdAndUpdate(
            messageId,
            { $set: { reactions } },
            { new: true }
          );
        } else {
          const msg = await inMemoryMessages.findById(messageId);
          if (!msg) {
            socket.emit('error', { message: 'Message not found' });
            return;
          }

          const reactions = msg.reactions || {};
          if (reactions[username] === emoji) {
            delete reactions[username];
          } else {
            reactions[username] = emoji;
          }

          updated = await inMemoryMessages.findByIdAndUpdate(messageId, {
            $set: { reactions },
          });
        }

        if (!updated) {
          socket.emit('error', { message: 'Failed to update reaction' });
          return;
        }

        io.emit('reaction_toggled', updated);
      } catch (error) {
        console.error('Error toggling reaction:', error.message);
        socket.emit('error', { message: 'Failed to update reaction' });
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
