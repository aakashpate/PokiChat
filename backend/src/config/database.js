const mongoose = require('mongoose');

const isProduction = () => process.env.NODE_ENV === 'production';

const connectMemory = async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  console.warn('WARNING: MongoDB Memory Server active (development).');
  console.warn('WARNING: Messages will NOT survive a server restart.');
  console.warn('WARNING: Set MONGODB_URI (see backend/.env.example) for real persistence.');
};

const connectDB = async () => {
  const uri = (process.env.MONGODB_URI || '').trim();
  const wantsMemory = !uri || uri.toLowerCase() === 'memory';
  const allowMemory = process.env.ALLOW_MEMORY_DB === 'true';

  if (wantsMemory) {
    if (isProduction()) {
      if (!allowMemory) {
        throw new Error(
          'MONGODB_URI is not set. Provide your MongoDB connection string in the server environment (see backend/.env.example), or set ALLOW_MEMORY_DB=true to run without persistence.'
        );
      }

      console.warn('WARNING: ALLOW_MEMORY_DB=true — running WITHOUT a database.');
      console.warn('WARNING: Messages will NOT survive a server restart.');
      console.warn('WARNING: Set MONGODB_URI for real persistence.');
      return;
    }

    await connectMemory();
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

const isDBConnected = () => mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.isDBConnected = isDBConnected;
