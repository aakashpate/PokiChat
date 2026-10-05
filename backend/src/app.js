const express = require('express');
const cors = require('cors');
const path = require('path');
const messageRoutes = require('./routes/messageRoutes');
const errorHandler = require('./middleware/errorHandler');
const { expressCorsOptions } = require('./config/cors');

const app = express();

app.set('trust proxy', 1);

app.use(cors(expressCorsOptions));

app.use(express.json());

app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'), {
    maxAge: '365d',
    immutable: true,
  })
);

app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'PokiChat API',
    health: '/api/health',
    messages: '/api/messages',
  });
});

app.use('/api', messageRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
