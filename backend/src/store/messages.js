const Message = require('../models/Message');
const { isDBConnected } = require('../config/database');

const memoryMessages = [];
let sequence = 0;

const createId = () => {
  sequence += 1;
  return `mem_${Date.now().toString(16)}${sequence.toString(16)}`;
};

const sortByCreatedAt = (list) =>
  [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

const listMessages = async () => {
  if (isDBConnected()) {
    return Message.find().sort({ createdAt: 1 });
  }

  return sortByCreatedAt(memoryMessages);
};

const createMessage = async ({ username, text }) => {
  if (isDBConnected()) {
    return Message.create({ username, text });
  }

  const now = new Date().toISOString();
  const message = {
    _id: createId(),
    username,
    text,
    createdAt: now,
    updatedAt: now,
  };

  memoryMessages.push(message);
  return message;
};

module.exports = { listMessages, createMessage };
