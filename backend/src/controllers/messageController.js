const Message = require('../models/Message');

exports.getHealth = (req, res) => {
  res.json({ success: true, message: 'PokiChat API is running' });
};

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

exports.createMessage = async (req, res, next) => {
  try {
    const { username, text } = req.body;

    if (!username || !text) {
      return res.status(400).json({
        success: false,
        message: 'Username and text are required',
      });
    }

    const trimmedUsername = username.trim();
    const trimmedText = text.trim();

    if (!trimmedUsername || !trimmedText) {
      return res.status(400).json({
        success: false,
        message: 'Username and text cannot be empty',
      });
    }

    if (trimmedUsername.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Username cannot exceed 30 characters',
      });
    }

    if (trimmedText.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 1000 characters',
      });
    }

    const message = await Message.create({
      username: trimmedUsername,
      text: trimmedText,
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};
