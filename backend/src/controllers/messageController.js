const Message = require('../models/Message');
const inMemoryMessages = require('../models/inMemoryMessages');
const { isDBConnected } = require('../config/database');

exports.getMessages = async (req, res, next) => {
  try {
    let messages;
    if (isDBConnected()) {
      messages = await Message.find().sort({ createdAt: 1 });
    } else {
      messages = await inMemoryMessages.find();
    }
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
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

    let message;
    if (isDBConnected()) {
      message = await Message.create({
        username: trimmedUsername,
        text: trimmedText,
      });
    } else {
      message = await inMemoryMessages.create({
        username: trimmedUsername,
        text: trimmedText,
      });
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    next(error);
  }
};

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      data: {
        imageUrl,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error.message);
    next(error);
  }
};
