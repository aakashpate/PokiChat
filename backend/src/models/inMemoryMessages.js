let messages = [];
let idCounter = 0;

const inMemoryMessages = {
  async find() {
    return [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  async findById(id) {
    return messages.find((m) => m._id === id) || null;
  },

  async create(data) {
    idCounter++;
    const message = {
      _id: `mem_${idCounter}_${Date.now()}`,
      username: data.username,
      text: data.text || '',
      type: data.type || 'text',
      imageUrl: data.imageUrl || null,
      replyTo: data.replyTo || null,
      reactions: data.reactions || {},
      edited: false,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    messages.push(message);
    return message;
  },

  async findByIdAndUpdate(id, update) {
    const index = messages.findIndex((m) => m._id === id);
    if (index === -1) return null;
    const msg = messages[index];
    if (update.$set) {
      Object.assign(msg, update.$set);
    }
    msg.updatedAt = new Date().toISOString();
    messages[index] = msg;
    return msg;
  },

  async findByIdAndDelete(id) {
    const index = messages.findIndex((m) => m._id === id);
    if (index === -1) return null;
    const [removed] = messages.splice(index, 1);
    return removed;
  },
};

module.exports = inMemoryMessages;
