const express = require('express');
const router = express.Router();
const { getHealth, getMessages, createMessage } = require('../controllers/messageController');

router.get('/health', getHealth);
router.get('/messages', getMessages);
router.post('/messages', createMessage);

module.exports = router;
