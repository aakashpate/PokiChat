const express = require('express');
const { getMessages, createMessage, uploadImage } = require('../controllers/messageController');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/messages', getMessages);
router.post('/messages', createMessage);
router.post('/messages/upload', upload.single('image'), uploadImage);

module.exports = router;
