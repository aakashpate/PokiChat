const express = require('express');
const router = express.Router();
const {
  getHealth,
  getMessages,
  createMessage,
  uploadImage,
} = require('../controllers/messageController');
const upload = require('../middleware/upload');

router.get('/health', getHealth);
router.get('/messages', getMessages);
router.post('/messages/upload', upload.single('image'), uploadImage);
router.post('/messages', createMessage);

module.exports = router;
