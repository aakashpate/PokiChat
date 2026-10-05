const mongoose = require('mongoose');

const isProduction = () => process.env.NODE_ENV === 'production';

const connectDB = async () => {
  const uri = (process.env.MONGODB_URI || '').trim();
  const wantsMemory = !uri || uri.toLowerCase() === 'memory';

  if (wantsMemory) {
    if (isProduction()) {
      throw new Error(
        'MONGODB_URI is not set. Provide your MongoDB connection string in the server environment (see backend/.env.example).'
      );
    }

    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('MongoDB Memory Server connected (development fallback, data is not persisted)');
    return;
  }

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

  mongoose.connection.on('error', (error) => {
    console.error(`MongoDB error: ${error.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Waiting for reconnection...');
  });
};

module.exports = connectDB;
