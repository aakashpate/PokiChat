let messages = [];
let idCounter = 0;

const inMemoryMessages = {
  async find() {
    return [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  async create(data) {
    idCounter++;
    const message = {
      _id: `mem_${idCounter}_${Date.now()}`,
      username: data.username,
      text: data.text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    messages.push(message);
    return message;
  },
};

module.exports = inMemoryMessages;
